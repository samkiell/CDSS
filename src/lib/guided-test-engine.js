import testFlowGraphs from './decision-engine/test-flow-graphs.json';

/**
 * TEST STATE SCHEMA (ENHANCED FOR FLOWCHART)
 * =========================================
 * {
 *   assessmentId: string,
 *   therapistId: string,
 *   region: string,
 *   currentNodeId: string,       // Port of the graph we are currently at
 *   graph: Object,               // The decision graph for this region
 *   completedTests: [],          // Path taken through the graph
 *   isComplete: boolean,
 *   terminalNode: Object,        // The final diagnosis/conclusion node
 *   startedAt: string,
 * }
 */

/**
 * Initialize the guided test engine state using clinical flowcharts
 */
export function initializeGuidedTestEngine({
  assessmentId,
  therapistId,
  region,
}) {
  const regionKey = region?.toLowerCase().includes('lumbar') ? 'lumbar' : 
                   region?.toLowerCase().includes('shoulder') ? 'shoulder' : null;
  
  const graph = testFlowGraphs[regionKey] || null;
  const startNodeId = graph?.startNode || null;

  return {
    assessmentId,
    therapistId,
    region,
    graph,
    currentNodeId: startNodeId,
    completedTests: [],
    isComplete: false,
    terminalNode: null,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Get the current test to perform from the decision graph
 */
export function getCurrentTest(state) {
  if (state.isComplete || !state.graph || !state.currentNodeId) {
    return null;
  }

  const node = state.graph.nodes[state.currentNodeId];
  if (!node || node.isTerminal) {
    return null;
  }

  return {
    id: node.id,
    name: node.name,
    instruction: node.instruction,
    testNumber: state.completedTests.length + 1,
    isObservation: node.isObservation || false,
    source: 'Flowchart'
  };
}

/**
 * Record a test result and advance the state through the flowchart
 */
export function recordTestResult(state, testId, result, notes = '') {
  if (state.isComplete || !state.graph || !state.currentNodeId) {
    return state;
  }

  const currentNode = state.graph.nodes[state.currentNodeId];
  if (!currentNode || currentNode.id !== testId) {
    console.warn(`Node mismatch: Expected ${state.currentNodeId}, got ${testId}`);
    return state;
  }

  // Record the path entry
  const pathEntry = {
    testId: currentNode.id,
    testName: currentNode.name,
    result, // 'positive' or 'negative'
    notes,
    timestamp: new Date().toISOString(),
  };

  const newCompletedTests = [...state.completedTests, pathEntry];

  // Determine next node
  const nextNodeId = result === 'positive' ? currentNode.onPositive : currentNode.onNegative;
  const nextNode = state.graph.nodes[nextNodeId];

  let isComplete = false;
  let terminalNode = null;

  if (!nextNode || nextNode.isTerminal) {
    isComplete = true;
    terminalNode = nextNode || null;
  }

  return {
    ...state,
    currentNodeId: nextNodeId,
    completedTests: newCompletedTests,
    isComplete,
    terminalNode,
    completionReason: isComplete ? (terminalNode ? 'terminal_node_reached' : 'flow_ended') : null,
  };
}

/**
 * REMOVED: skipTest - As per "No test skipping" requirement.
 */

/**
 * Generate the refined diagnosis summary from the flowchart path
 */
export function generateRefinedDiagnosis(state) {
  if (!state.isComplete) return null;

  const finalDiagnosis = state.terminalNode?.diagnosisMapping || 'Differential Narrowed';

  return {
    label: 'Flowchart-Driven Clinical Outcome',
    finalSuspectedCondition: {
      name: finalDiagnosis,
      instruction: state.terminalNode?.instruction || 'End of clinical sequence reached.'
    },
    pathTaken: state.completedTests.map(t => `${t.testName} (${t.result})`),
    testsPerformed: state.completedTests,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    supportingEvidence: state.completedTests
      .filter((t) => t.result === 'positive')
      .map((t) => ({
        test: t.testName,
        result: 'Positive',
        timestamp: t.timestamp,
      })),
    contraryEvidence: state.completedTests
      .filter((t) => t.result === 'negative')
      .map((t) => ({
        test: t.testName,
        result: 'Negative',
        timestamp: t.timestamp,
      })),
  };
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
