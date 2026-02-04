/**
 * GUIDED DIAGNOSIS TEST ENGINE
 * =============================
 * Implements therapist-guided physical testing for diagnosis refinement.
 *
 * BEHAVIOR:
 * - Loads recommended tests based on temporal diagnosis and region
 * - Presents tests one at a time
 * - Records positive/negative results
 * - Rules in or rules out conditions based on results
 * - Generates refined diagnosis when clarity threshold reached
 *
 * IMPORTANT:
 * - All medical logic comes from JSON rules only
 * - Do NOT invent test interpretations
 * - Results are immutable once saved
 * - All actions are fully traceable
 *
 * @module GuidedTestEngine
 */

/**
 * TEST STATE SCHEMA
 * ==================
 * {
 *   assessmentId: string,
 *   therapistId: string,
 *   region: string,
 *   temporalDiagnosis: string,
 *   suspectedConditions: [],     // From temporal diagnosis
 *   availableTests: [],          // All tests for this region/conditions
 *   completedTests: [],          // Tests already performed
 *   currentTestIndex: number,
 *   conditionStates: {},         // Current likelihood per condition
 *   isComplete: boolean,
 *   completionReason: string,
 *   startedAt: string,
 * }
 */

/**
 * Extract recommended tests from rules JSON for given conditions
 * @param {Object} rulesJson - Region-specific rules JSON
 * @param {Array} suspectedConditions - List of suspected condition names
 * @returns {Array} List of recommended tests with metadata
 */
export function extractRecommendedTests(rulesJson, suspectedConditions) {
  if (!rulesJson || !rulesJson.conditions) {
    return [];
  }

  const tests = [];
  const addedTestNames = new Set();

  rulesJson.conditions.forEach((condition) => {
    // Check if this condition is suspected
    const isSuspected = suspectedConditions.some(
      (sc) =>
        condition.name.toLowerCase().includes(sc.toLowerCase()) ||
        sc.toLowerCase().includes(condition.name.toLowerCase())
    );

    if (!isSuspected && suspectedConditions.length > 0) {
      // Only extract tests for suspected conditions if we have any
      // If no suspected conditions, extract all tests
      return;
    }

    // Extract recommended_tests
    if (condition.recommended_tests && condition.recommended_tests.length > 0) {
      condition.recommended_tests.forEach((testText) => {
        // Parse test name and instruction from text
        const colonIndex = testText.indexOf(':');
        let testName = testText;
        let instruction = '';
        let positiveImplication = '';
        let negativeImplication = '';

        if (colonIndex > 0) {
          testName = testText.substring(0, colonIndex).trim();
          instruction = testText.substring(colonIndex + 1).trim();
        }

        // Extract positive/negative implications if present
        const positiveMatch = instruction.match(/positive[:\s]+([^.]+)/i);
        const negativeMatch = instruction.match(/negative[:\s]+([^.]+)/i);

        if (positiveMatch) {
          positiveImplication = positiveMatch[1].trim();
        }
        if (negativeMatch) {
          negativeImplication = negativeMatch[1].trim();
        }

        // Avoid duplicates
        if (!addedTestNames.has(testName.toLowerCase())) {
          addedTestNames.add(testName.toLowerCase());
          tests.push({
            id: `test_${tests.length + 1}`,
            name: testName,
            instruction: instruction || 'Perform test as per clinical protocol.',
            positiveImplication:
              positiveImplication || `Supports presence of ${condition.name}`,
            negativeImplication:
              negativeImplication || `Reduces likelihood of ${condition.name}`,
            associatedConditions: [condition.name],
            source: 'JSON rules',
          });
        } else {
          // Add condition to existing test
          const existingTest = tests.find(
            (t) => t.name.toLowerCase() === testName.toLowerCase()
          );
          if (
            existingTest &&
            !existingTest.associatedConditions.includes(condition.name)
          ) {
            existingTest.associatedConditions.push(condition.name);
          }
        }
      });
    }

    // Also extract observations as potential tests
    if (condition.observations && condition.observations.length > 0) {
      condition.observations.forEach((obsText) => {
        const obsName = obsText.replace(/^Check\s+(if|for)\s+/i, '').trim();

        if (!addedTestNames.has(obsName.toLowerCase())) {
          addedTestNames.add(obsName.toLowerCase());
          tests.push({
            id: `obs_${tests.length + 1}`,
            name: `Observe: ${obsName}`,
            instruction: obsText,
            positiveImplication: `Finding present, supports ${condition.name}`,
            negativeImplication: `Finding absent`,
            associatedConditions: [condition.name],
            source: 'JSON rules (observation)',
            isObservation: true,
          });
        }
      });
    }
  });

  return tests;
}

/**
 * Initialize the guided test engine state
 * @param {Object} params - Initialization parameters
 * @returns {Object} Initial engine state
 */
export function initializeGuidedTestEngine({
  assessmentId,
  therapistId,
  region,
  temporalDiagnosis,
  suspectedConditions,
  differentialDiagnoses,
  rulesJson,
}) {
  // Get all suspected conditions including differentials
  const allSuspected = [
    ...(suspectedConditions || []),
    ...(differentialDiagnoses || []),
  ].filter(Boolean);

  // Extract all applicable tests
  const availableTests = extractRecommendedTests(rulesJson, allSuspected);

  // Initialize condition states
  const conditionStates = {};
  allSuspected.forEach((condition, index) => {
    conditionStates[condition] = {
      likelihood: index === 0 ? 70 : 50 - index * 5, // Primary gets higher likelihood
      supportingTests: [],
      contraryTests: [],
      status: 'investigating', // investigating | ruled_out | confirmed
    };
  });

  return {
    assessmentId,
    therapistId,
    region,
    temporalDiagnosis,
    suspectedConditions: allSuspected,
    availableTests,
    completedTests: [],
    currentTestIndex: 0,
    conditionStates,
    isComplete: false,
    completionReason: null,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Get the current test to perform
 * @param {Object} state - Current engine state
 * @returns {Object|null} Current test or null if complete
 */
export function getCurrentTest(state) {
  if (state.isComplete) {
    return null;
  }

  // Get next test that hasn't been completed
  const remainingTests = state.availableTests.filter(
    (test) => !state.completedTests.some((ct) => ct.testId === test.id)
  );

  if (remainingTests.length === 0) {
    return null;
  }

  return {
    ...remainingTests[0],
    testNumber: state.completedTests.length + 1,
    totalTests: state.availableTests.length,
    remainingTests: remainingTests.length,
  };
}

/**
 * Record a test result and update condition states
 * @param {Object} state - Current engine state
 * @param {string} testId - ID of the test being recorded
 * @param {string} result - 'positive' or 'negative'
 * @param {string} [notes] - Optional therapist notes
 * @returns {Object} Updated engine state
 */
export function recordTestResult(state, testId, result, notes = '') {
  const test = state.availableTests.find((t) => t.id === testId);
  if (!test) {
    console.warn(`Test not found: ${testId}`);
    return state;
  }

  // Record the completed test
  const testResult = {
    testId: test.id,
    testName: test.name,
    result, // 'positive' or 'negative'
    notes,
    timestamp: new Date().toISOString(),
    associatedConditions: test.associatedConditions,
  };

  const newCompletedTests = [...state.completedTests, testResult];

  // Update condition states based on result
  const newConditionStates = { ...state.conditionStates };

  test.associatedConditions.forEach((conditionName) => {
    if (!newConditionStates[conditionName]) {
      newConditionStates[conditionName] = {
        likelihood: 50,
        supportingTests: [],
        contraryTests: [],
        status: 'investigating',
      };
    }

    const conditionState = { ...newConditionStates[conditionName] };

    if (result === 'positive') {
      // Positive result supports this condition
      conditionState.supportingTests = [...conditionState.supportingTests, test.name];
      conditionState.likelihood = Math.min(100, conditionState.likelihood + 15);
    } else {
      // Negative result reduces likelihood
      conditionState.contraryTests = [...conditionState.contraryTests, test.name];
      conditionState.likelihood = Math.max(0, conditionState.likelihood - 20);
    }

    // Check if condition should be ruled out
    if (conditionState.likelihood < 20 && conditionState.contraryTests.length >= 2) {
      conditionState.status = 'ruled_out';
    }

    // Check if condition is highly likely
    if (conditionState.likelihood >= 85 && conditionState.supportingTests.length >= 2) {
      conditionState.status = 'confirmed';
    }

    newConditionStates[conditionName] = conditionState;
  });

  // Check for completion conditions
  let isComplete = false;
  let completionReason = null;

  // Check if any condition is confirmed
  const confirmedConditions = Object.entries(newConditionStates).filter(
    ([_, cs]) => cs.status === 'confirmed'
  );

  if (confirmedConditions.length > 0) {
    isComplete = true;
    completionReason = 'condition_confirmed';
  }

  // Check if all conditions ruled out except one
  const activeConditions = Object.entries(newConditionStates).filter(
    ([_, cs]) => cs.status !== 'ruled_out'
  );

  if (activeConditions.length === 1 && newCompletedTests.length >= 2) {
    isComplete = true;
    completionReason = 'single_condition_remaining';
  }

  // Check if no more tests available
  const remainingTests = state.availableTests.filter(
    (t) => !newCompletedTests.some((ct) => ct.testId === t.id)
  );

  if (remainingTests.length === 0) {
    isComplete = true;
    completionReason = 'all_tests_completed';
  }

  return {
    ...state,
    completedTests: newCompletedTests,
    conditionStates: newConditionStates,
    isComplete,
    completionReason,
  };
}

/**
 * Skip a test (mark as not performed)
 * @param {Object} state - Current engine state
 * @param {string} testId - ID of the test to skip
 * @param {string} reason - Reason for skipping
 * @returns {Object} Updated engine state
 */
export function skipTest(state, testId, reason = 'Skipped by therapist') {
  const test = state.availableTests.find((t) => t.id === testId);
  if (!test) {
    return state;
  }

  const skipResult = {
    testId: test.id,
    testName: test.name,
    result: 'skipped',
    notes: reason,
    timestamp: new Date().toISOString(),
    associatedConditions: test.associatedConditions,
  };

  const newCompletedTests = [...state.completedTests, skipResult];

  // Check if no more tests
  const remainingTests = state.availableTests.filter(
    (t) => !newCompletedTests.some((ct) => ct.testId === t.id)
  );

  return {
    ...state,
    completedTests: newCompletedTests,
    isComplete: remainingTests.length === 0,
    completionReason: remainingTests.length === 0 ? 'all_tests_completed' : null,
  };
}

/**
 * Complete the guided test flow manually
 * @param {Object} state - Current engine state
 * @param {string} reason - Reason for manual completion
 * @returns {Object} Completed state with summary
 */
export function completeGuidedTest(state, reason = 'Manually completed by therapist') {
  return {
    ...state,
    isComplete: true,
    completionReason: reason,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Generate the refined diagnosis summary
 * @param {Object} state - Completed engine state
 * @returns {Object} Refined diagnosis summary
 */
export function generateRefinedDiagnosis(state) {
  // Rank conditions by likelihood
  const rankedConditions = Object.entries(state.conditionStates)
    .sort((a, b) => b[1].likelihood - a[1].likelihood)
    .map(([name, cs]) => ({
      name,
      likelihood: cs.likelihood,
      status: cs.status,
      supportingTests: cs.supportingTests,
      contraryTests: cs.contraryTests,
    }));

  // Separate by status
  const confirmedConditions = rankedConditions.filter((c) => c.status === 'confirmed');
  const ruledOutConditions = rankedConditions.filter((c) => c.status === 'ruled_out');
  const investigatingConditions = rankedConditions.filter(
    (c) => c.status === 'investigating'
  );

  // Determine final suspected condition
  const finalSuspectedCondition =
    confirmedConditions.length > 0
      ? confirmedConditions[0]
      : investigatingConditions.length > 0
        ? investigatingConditions[0]
        : rankedConditions[0];

  return {
    /**
     * CLINICIAN-GUIDED DIAGNOSTIC OUTCOME
     * =====================================
     * This represents the refined diagnosis after physical testing.
     * It coexists with the AI temporal diagnosis - neither overwrites the other.
     */
    label: 'Clinician-Guided Diagnostic Outcome',
    finalSuspectedCondition,
    confirmedConditions,
    ruledOutConditions,
    remainingDifferentials: investigatingConditions.filter(
      (c) => c.name !== finalSuspectedCondition?.name
    ),
    testsPerformed: state.completedTests.filter((t) => t.result !== 'skipped'),
    testsSkipped: state.completedTests.filter((t) => t.result === 'skipped'),
    completionReason: state.completionReason,
    startedAt: state.startedAt,
    completedAt: state.completedAt || new Date().toISOString(),
    /**
     * SUPPORTING EVIDENCE
     * ====================
     * List of test results that support the final diagnosis.
     */
    supportingEvidence: state.completedTests
      .filter((t) => t.result === 'positive')
      .map((t) => ({
        test: t.testName,
        result: 'Positive',
        timestamp: t.timestamp,
      })),
    /**
     * CONTRARY EVIDENCE
     * ==================
     * List of test results that ruled out conditions.
     */
    contraryEvidence: state.completedTests
      .filter((t) => t.result === 'negative')
      .map((t) => ({
        test: t.testName,
        result: 'Negative',
        timestamp: t.timestamp,
      })),
  };
}

/**
 * Prepare test results for database persistence
 * @param {Object} state - Engine state
 * @param {string} therapistId - ID of the performing therapist
 * @returns {Object} Data formatted for DiagnosisSession.guidedTestResults
 */
export function prepareForPersistence(state, therapistId) {
  const refinedDiagnosis = generateRefinedDiagnosis(state);

  return {
    /**
     * GUIDED TEST RESULTS
     * ====================
     * Immutable record of all tests performed during guided diagnosis.
     * Stored with DiagnosisSession for full traceability.
     */
    therapistId,
    performedAt: state.startedAt,
    completedAt: refinedDiagnosis.completedAt,
    tests: state.completedTests.map((t) => ({
      testName: t.testName,
      result: t.result,
      notes: t.notes,
      timestamp: t.timestamp,
    })),
    refinedDiagnosis: {
      finalSuspectedCondition: refinedDiagnosis.finalSuspectedCondition?.name || null,
      confirmedConditions: refinedDiagnosis.confirmedConditions.map((c) => c.name),
      ruledOutConditions: refinedDiagnosis.ruledOutConditions.map((c) => c.name),
      remainingDifferentials: refinedDiagnosis.remainingDifferentials.map((c) => c.name),
      completionReason: refinedDiagnosis.completionReason,
    },
    /**
     * LOCK FLAG
     * ==========
     * Once saved, guided tests are locked for this assessment.
     * TODO: Admin reset capability to allow re-running tests.
     */
    isLocked: true,
  };
}
