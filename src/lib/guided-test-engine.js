import testFlowGraphs from './decision-engine/test-flow-graphs.json';

/**
 * GUIDED DIAGNOSIS TEST ENGINE (FLOWCHART DRIVEN)
 * =============================================
 * Implements therapist-guided physical testing using a state-driven decision graph.
 *
 * Clinical Flow:
 * 1. Initialize with region-specific graph.
 * 2. currentNodeId points to the starting physical test.
 * 3. Outcome (Positive/Negative) determines explicitly the nextNodeId.
 * 4. TERMINAL nodes represent the conclusion (Refined Diagnosis).
 */

/**
 * Initialize the guided test engine state
 */
export function initializeGuidedTestEngine({ assessmentId, therapistId, region }) {
  const regionKey = region?.toLowerCase().includes('lumbar')
    ? 'lumbar'
    : region?.toLowerCase().includes('shoulder')
      ? 'shoulder'
      : null;

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
 * Get the current test to perform
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
    source: 'Flowchart',
  };
}

/**
 * Record a test result and advance via graph matching
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

  // Record path taken
  const pathEntry = {
    testId: currentNode.id,
    testName: currentNode.name,
    result, // 'positive' or 'negative'
    notes,
    timestamp: new Date().toISOString(),
  };

  const newCompletedTests = [...state.completedTests, pathEntry];

  // Logic: Each outcome determines next node
  const nextNodeId =
    result === 'positive' ? currentNode.onPositive : currentNode.onNegative;
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
    completedAt: isComplete ? new Date().toISOString() : null,
    completionReason: isComplete
      ? terminalNode
        ? 'terminal_node_reached'
        : 'flow_ended'
      : null,
  };
}

/**
 * Generate refined diagnosis from terminal node
 */
export function generateRefinedDiagnosis(state) {
  if (!state.isComplete) return null;

  const finalDiagnosis = state.terminalNode?.diagnosisMapping || 'Differential Narrowed';

  return {
    label: 'Clinician-Guided Diagnostic Outcome',
    finalSuspectedCondition: {
      name: finalDiagnosis,
      instruction: state.terminalNode?.instruction || 'Clinical sequence completed.',
    },
    pathTaken: state.completedTests.map((t) => `${t.testName} (${t.result})`),
    testsPerformed: state.completedTests,
    startedAt: state.startedAt,
    completedAt: state.completedAt || new Date().toISOString(),
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

/**
 * Prepare for persistence (matches DiagnosisSession schema)
 */
export function prepareForPersistence(state, therapistId) {
  const refined = generateRefinedDiagnosis(state);

  return {
    therapistId,
    performedAt: state.startedAt,
    completedAt: refined?.completedAt,
    tests: state.completedTests.map((t) => ({
      testName: t.testName,
      result: t.result,
      notes: t.notes,
      timestamp: t.timestamp,
    })),
    refinedDiagnosis: {
      finalSuspectedCondition: refined?.finalSuspectedCondition?.name || null,
      confirmedConditions: refined?.finalSuspectedCondition?.name
        ? [refined.finalSuspectedCondition.name]
        : [],
      ruledOutConditions: state.completedTests
        .filter((t) => t.result === 'negative')
        .map((t) => `Condition associated with ${t.testName}`),
      remainingDifferentials: [],
      completionReason: state.completionReason,
    },
    isLocked: true,
  };
}

const clinicalFallbackTests = {
  'lumbar disc herniation': [
    {
      name: 'Straight Leg Raise (SLR)',
      instruction:
        'Patient supine, examiner raises leg with knee extended until pain is felt.',
      positiveImplication: 'Pain between 30-70° indicates nerve root irritation (L4-S1).',
      negativeImplication:
        'Unlikely to have significant disc herniation with nerve tension.',
    },
    {
      name: 'Slump Test',
      instruction:
        'Patient seated slumps forward, head flexed, knee extended, dorsiflexion.',
      positiveImplication: 'Increased neural tension strongly suggests disc pathology.',
      negativeImplication: 'Mechanical pain without neural component.',
    },
  ],
  sciatica: [
    {
      name: 'Straight Leg Raise (SLR)',
      instruction: 'Raise leg while patient is supine. Note angle of pain reproduction.',
      positiveImplication: 'Confirms sciatic nerve involvement.',
      negativeImplication: 'Pain may be muscular or joint-related rather than neural.',
    },
  ],
  'rotator cuff tear': [
    {
      name: 'Empty Can Test (Jobe)',
      instruction:
        'Arm at 90° abduction, 30° horizontal flexion, internal rotation. Resist downward pressure.',
      positiveImplication: 'Pain or weakness indicates supraspinatus involvement.',
      negativeImplication: 'Supraspinatus tendon likely intact.',
    },
    {
      name: 'Drop Arm Sign',
      instruction: 'Passively abduct arm to 90°, ask patient to lower it slowly.',
      positiveImplication:
        'Inability to lower arm smoothly indicates large/full cuff tear.',
      negativeImplication: 'No full-thickness tear detected.',
    },
  ],
  'impingement syndrome': [
    {
      name: 'Hawkins-Kennedy Test',
      instruction: 'Shoulder and elbow flexed to 90°, examiner forces internal rotation.',
      positiveImplication: 'Pain indicates subacromial impingement.',
      negativeImplication: 'Low likelihood of subacromial impingement.',
    },
    {
      name: 'Painful Arc',
      instruction: 'Ask patient to actively abduct arm.',
      positiveImplication: 'Pain between 60° and 120° suggests impingement.',
      negativeImplication: 'Non-impingement pattern of movement.',
    },
  ],
  'cervical radiculopathy': [
    {
      name: "Spurling's Test",
      instruction: 'Side-flex head and apply downward pressure.',
      positiveImplication: 'Radiating pain confirms nerve root compression.',
      negativeImplication: 'Unlikely to be foraminal compression.',
    },
  ],
  'ankle sprain': [
    {
      name: 'Anterior Drawer Test',
      instruction: 'Pull heel forward while stabilizing tibia.',
      positiveImplication: 'Excessive laxity indicates ATFL tear.',
      negativeImplication: 'ATFL is likely stable.',
    },
  ],
};

/**
 * Extract recommended physical tests based on suspected conditions
 * Used during assessment submission to pre-populate guided test recommendations.
 */
export function extractRecommendedTests(rulesJson, suspectedConditions) {
  if (!suspectedConditions || !Array.isArray(suspectedConditions)) {
    return [];
  }

  const recommendations = [];
  const normalizedSuspected = suspectedConditions.map((c) => c.toLowerCase());

  // Helper to add test if not duplicate
  const addTest = (test, conditionName, source) => {
    const testName = typeof test === 'string' ? test : test.name;
    const existing = recommendations.find((r) => r.name === testName);

    if (!existing) {
      recommendations.push({
        name: testName,
        instruction:
          test.instruction ||
          (typeof test === 'string' ? 'Perform as per clinical protocol.' : null),
        positiveImplication: test.positiveImplication || 'Supports suspected condition.',
        negativeImplication:
          test.negativeImplication || 'Decreases likelihood of condition.',
        associatedConditions: [conditionName],
        source: source,
      });
    } else {
      if (!existing.associatedConditions.includes(conditionName)) {
        existing.associatedConditions.push(conditionName);
      }
    }
  };

  // 1. Try to extract from Rules JSON if available
  if (rulesJson && rulesJson.conditions) {
    rulesJson.conditions.forEach((condition) => {
      const isSuspected = normalizedSuspected.some(
        (s) =>
          condition.name.toLowerCase().includes(s) ||
          s.includes(condition.name.toLowerCase())
      );

      if (isSuspected && condition.tests && Array.isArray(condition.tests)) {
        condition.tests.forEach((test) =>
          addTest(test, condition.name, 'Heuristic Match')
        );
      }
    });
  }

  // 2. Add Clinical Fallbacks if recommendations are sparse or for specific conditions
  normalizedSuspected.forEach((suspect) => {
    Object.keys(clinicalFallbackTests).forEach((key) => {
      if (suspect.includes(key) || key.includes(suspect)) {
        clinicalFallbackTests[key].forEach((test) =>
          addTest(test, suspect, 'Clinical Guideline Pattern')
        );
      }
    });
  });

  return recommendations;
}
