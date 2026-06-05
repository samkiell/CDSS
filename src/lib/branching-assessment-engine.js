/**
 * DYNAMIC BRANCHING ASSESSMENT ENGINE V2
 * =======================================
 * A state-driven, rule-based clinical assessment engine that implements
 * conditional question branching for musculoskeletal diagnosis.
 *
 * CORE PRINCIPLES:
 * 1. Questions are conditional - shown only when relevant
 * 2. Answers can skip to different questions, trigger conditions, or rule out conditions
 * 3. Ruled-out conditions have ALL their questions skipped
 * 4. State tracks: answered questions, ruled-out conditions, suspected conditions
 * 5. Questions are resolved dynamically - never pre-rendered
 *
 * QUESTION STRUCTURE (V2):
 * {
 *   id: string,
 *   question: string,
 *   condition: string | null,       // Which condition this investigates
 *   category: string,
 *   answers: [{
 *     value: string,
 *     effects: {
 *       nextQuestionId: string | null,    // Jump to specific question
 *       skipToQuestionId: string | null,  // Skip intervening questions
 *       triggeredConditions: string[],    // Start investigating these
 *       excludedConditions: string[],     // Rule out these entirely
 *       increaseLikelihood: string[],     // Increase likelihood for these
 *       decreaseLikelihood: string[],     // Decrease likelihood for these
 *       redFlag: boolean,
 *       redFlagText: string | null,
 *       terminateAssessment: boolean,     // End assessment early if true
 *     }
 *   }],
 *   requiredConditions: string[],   // Only show if these are active/suspected
 *   excludedIfConditions: string[], // Skip if any of these are ruled out
 *   isGating: boolean,              // If true, non-affirmative answer rules out parent condition
 * }
 *
 * STATE SCHEMA:
 * {
 *   region: string,
 *   conditions: [...],              // All condition definitions from JSON
 *   questionsMap: Map<id, question>,// Quick lookup
 *   questionOrder: string[],        // Default traversal order
 *   currentQuestionId: string | null,
 *   answeredQuestions: [{           // Full Q&A log
 *     questionId, question, answer, effects, timestamp, conditionContext
 *   }],
 *   ruledOutConditions: Set<string>,// Conditions that should be skipped entirely
 *   suspectedConditions: Map<string, { likelihood, reasons, triggerAnswers }>,
 *   redFlags: [],
 *   isComplete: boolean,
 *   completionReason: string,
 *   startedAt: string,
 * }
 *
 * @module BranchingAssessmentEngine
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const LIKELIHOOD_INCREMENT = 15;
const LIKELIHOOD_DECREMENT = 15;
const INITIAL_LIKELIHOOD = 50;
const HIGH_CONFIDENCE_THRESHOLD = 85;
const LOW_CONFIDENCE_THRESHOLD = 20;

// ============================================================================
// ENGINE INITIALIZATION
// ============================================================================

/**
 * Initialize a new assessment engine state from JSON rules
 * @param {Object} rulesJson - The loaded JSON rules for the region
 * @returns {Object} Initial engine state
 */
export function initializeEngine(rulesJson) {
  if (!rulesJson || !rulesJson.conditions) {
    throw new Error('Invalid rules JSON: missing conditions array');
  }

  // Build questions map and order for efficient lookup
  const questionsMap = new Map();
  const questionOrder = [];
  const conditionQuestions = new Map(); // Track which questions belong to which condition

  rulesJson.conditions.forEach((condition) => {
    const conditionName = condition.name;
    conditionQuestions.set(conditionName, []);

    (condition.questions || []).forEach((q) => {
      // Normalize question structure
      const normalizedQuestion = normalizeQuestion(q, conditionName);
      questionsMap.set(normalizedQuestion.id, normalizedQuestion);
      questionOrder.push(normalizedQuestion.id);
      conditionQuestions.get(conditionName).push(normalizedQuestion.id);
    });
  });

  // Initialize suspected conditions tracking
  const suspectedConditions = new Map();
  rulesJson.conditions.forEach((condition) => {
    // General Assessment is always active
    if (condition.name === 'General Assessment' || condition.is_general) {
      suspectedConditions.set(condition.name, {
        likelihood: INITIAL_LIKELIHOOD,
        reasons: [],
        triggerAnswers: [],
        questionCount: condition.questions?.length || 0,
        isGeneral: true,
      });
    } else {
      // Other conditions start as potential (not yet suspected)
      suspectedConditions.set(condition.name, {
        likelihood: INITIAL_LIKELIHOOD,
        reasons: [],
        triggerAnswers: [],
        questionCount: condition.questions?.length || 0,
        isGeneral: false,
        active: false, // Not yet being investigated
      });
    }
  });

  return {
    region: rulesJson.region,
    title: rulesJson.title,
    conditions: rulesJson.conditions,
    questionsMap,
    questionOrder,
    conditionQuestions,
    currentQuestionId: questionOrder[0] || null,
    answeredQuestions: [],
    ruledOutConditions: new Set(),
    suspectedConditions,
    redFlags: [],
    isComplete: false,
    completionReason: null,
    startedAt: new Date().toISOString(),
    // Branching state
    pendingJump: null, // If set, next question will be this ID
    skippedQuestions: new Set(), // Questions that have been skipped
  };
}

/**
 * Normalize a question to ensure consistent structure
 */
function normalizeQuestion(rawQuestion, conditionName) {
  const answers = (rawQuestion.options || rawQuestion.answers || []).map((a) => ({
    value: a.value,
    effects: {
      nextQuestionId: a.effects?.nextQuestionId || a.effects?.next_question_id || null,
      skipToQuestionId:
        a.effects?.skipToQuestionId || a.effects?.skip_to_question_id || null,
      triggeredConditions:
        a.effects?.triggeredConditions || a.effects?.triggered_conditions || [],
      excludedConditions:
        a.effects?.excludedConditions ||
        a.effects?.excluded_conditions ||
        // Map legacy rule_out to excludedConditions for backward compatibility
        a.effects?.rule_out ||
        [],
      increaseLikelihood:
        a.effects?.increaseLikelihood || a.effects?.increase_likelihood || [],
      decreaseLikelihood:
        a.effects?.decreaseLikelihood || a.effects?.decrease_likelihood || [],
      redFlag: a.effects?.red_flag || a.effects?.redFlag || false,
      redFlagText: a.effects?.red_flag_text || a.effects?.redFlagText || null,
      terminateAssessment:
        a.effects?.terminateAssessment || a.effects?.terminate_assessment || false,
    },
  }));

  return {
    id: rawQuestion.id,
    question: rawQuestion.questionText || rawQuestion.question,
    condition: conditionName,
    category: rawQuestion.category || 'general',
    answers,
    requiredConditions:
      rawQuestion.requiredConditions || rawQuestion.required_conditions || [],
    excludedIfConditions:
      rawQuestion.excludedIfConditions || rawQuestion.excluded_if_conditions || [],
    isGating: rawQuestion.isGating || rawQuestion.is_gating || false,
    metadata: rawQuestion.metadata || {},
    inputType: rawQuestion.inputType || 'select',
    sourceLine: rawQuestion.source_line,
  };
}

// ============================================================================
// QUESTION RESOLUTION
// ============================================================================

/**
 * Get the next valid question to display based on current state
 * This is the core branching logic
 * @param {Object} state - Current engine state
 * @returns {Object|null} Next question object or null if complete
 */
export function getCurrentQuestion(state) {
  if (state.isComplete) {
    return null;
  }

  // If there's a pending jump (from a previous answer), use that
  if (state.pendingJump) {
    const jumpQuestion = state.questionsMap.get(state.pendingJump);
    if (jumpQuestion && canShowQuestion(state, jumpQuestion)) {
      return formatQuestionForDisplay(state, jumpQuestion);
    }
    // If jump target is invalid or ruled out, continue with normal flow
  }

  // Find next valid question from current position
  const currentIndex = state.currentQuestionId
    ? state.questionOrder.indexOf(state.currentQuestionId)
    : 0;

  for (let i = currentIndex; i < state.questionOrder.length; i++) {
    const questionId = state.questionOrder[i];

    // Skip already answered questions
    if (state.answeredQuestions.some((aq) => aq.questionId === questionId)) {
      continue;
    }

    // Skip explicitly skipped questions
    if (state.skippedQuestions.has(questionId)) {
      continue;
    }

    const question = state.questionsMap.get(questionId);
    if (question && canShowQuestion(state, question)) {
      return formatQuestionForDisplay(state, question);
    }
  }

  // No more questions available
  return null;
}

/**
 * Determine if a question should be shown based on current state
 * @param {Object} state - Current engine state
 * @param {Object} question - Question to evaluate
 * @returns {boolean} Whether question should be shown
 */
function canShowQuestion(state, question) {
  // 1. Check if question's condition is ruled out
  if (question.condition && state.ruledOutConditions.has(question.condition)) {
    return false;
  }

  // 2. Check excludedIfConditions - skip if any listed condition is ruled out
  if (question.excludedIfConditions && question.excludedIfConditions.length > 0) {
    for (const excludedCond of question.excludedIfConditions) {
      if (state.ruledOutConditions.has(excludedCond)) {
        return false;
      }
    }
  }

  // 3. Check requiredConditions - only show if ALL listed conditions are active/suspected
  if (question.requiredConditions && question.requiredConditions.length > 0) {
    for (const reqCond of question.requiredConditions) {
      const condState = state.suspectedConditions.get(reqCond);
      // Condition must be suspected (active) and not ruled out
      if (!condState || !condState.active || state.ruledOutConditions.has(reqCond)) {
        return false;
      }
    }
  }

  // 4. For condition-specific questions (non-General), check if condition is being investigated
  if (question.condition && question.condition !== 'General Assessment') {
    const condState = state.suspectedConditions.get(question.condition);
    // Skip condition questions if condition isn't active yet (needs to be triggered first)
    // UNLESS this is the first question for this condition (allows investigation to start)
    const conditionQuestions = state.conditionQuestions.get(question.condition) || [];
    const isFirstConditionQuestion = conditionQuestions[0] === question.id;

    // For now, allow condition questions if condition hasn't been explicitly ruled out
    // This maintains backward compatibility while adding rule-out capability
    if (state.ruledOutConditions.has(question.condition)) {
      return false;
    }
  }

  return true;
}

/**
 * Format question for display in component
 */
function formatQuestionForDisplay(state, question) {
  // Calculate progress metrics
  const totalQuestions = state.questionOrder.length;
  const answeredCount = state.answeredQuestions.length;
  const skippedCount = state.skippedQuestions.size;

  // Estimate remaining questions (excluding ruled-out conditions)
  let remainingEstimate = 0;
  for (const qId of state.questionOrder) {
    if (!state.answeredQuestions.some((aq) => aq.questionId === qId)) {
      const q = state.questionsMap.get(qId);
      if (q && canShowQuestion(state, q)) {
        remainingEstimate++;
      }
    }
  }

  return {
    id: question.id,
    question: question.question,
    answers: question.answers,
    category: question.category,
    inputType: question.inputType,
    metadata: question.metadata,
    conditionName: question.condition,
    isGating: question.isGating,
    // Progress info
    answeredCount,
    totalQuestions,
    remainingEstimate,
    ruledOutCount: state.ruledOutConditions.size,
    skippedCount,
  };
}

// ============================================================================
// ANSWER PROCESSING
// ============================================================================

/**
 * Process an answer and update engine state with branching logic
 * @param {Object} state - Current engine state
 * @param {string} questionId - ID of the question being answered
 * @param {string} answerValue - The selected answer value
 * @returns {Object} Updated engine state
 */
export function processAnswer(state, questionId, answerValue) {
  const question = state.questionsMap.get(questionId);
  if (!question) {
    console.warn(`Question not found: ${questionId}`);
    return state;
  }

  // Find the selected answer
  const selectedAnswer = question.answers.find(
    (a) =>
      a.value === answerValue || a.value?.toLowerCase() === answerValue?.toLowerCase()
  );

  const effects = selectedAnswer?.effects || {
    nextQuestionId: null,
    skipToQuestionId: null,
    triggeredConditions: [],
    excludedConditions: [],
    increaseLikelihood: [],
    decreaseLikelihood: [],
    redFlag: false,
    redFlagText: null,
    terminateAssessment: false,
  };

  // Create answered question record
  const answeredQuestion = {
    questionId: question.id,
    question: question.question,
    answer: answerValue,
    conditionContext: question.condition,
    category: question.category,
    effects: { ...effects },
    timestamp: new Date().toISOString(),
  };

  // Clone state for immutable update
  const newState = {
    ...state,
    answeredQuestions: [...state.answeredQuestions, answeredQuestion],
    ruledOutConditions: new Set(state.ruledOutConditions),
    suspectedConditions: new Map(state.suspectedConditions),
    redFlags: [...state.redFlags],
    skippedQuestions: new Set(state.skippedQuestions),
    pendingJump: null,
  };

  // Process excluded conditions (rule-outs)
  if (effects.excludedConditions && effects.excludedConditions.length > 0) {
    for (const condName of effects.excludedConditions) {
      const matchingCondition = findMatchingCondition(newState, condName);
      if (matchingCondition) {
        newState.ruledOutConditions.add(matchingCondition);

        // Mark all questions for this condition as skipped
        const condQuestions = newState.conditionQuestions.get(matchingCondition) || [];
        condQuestions.forEach((qId) => {
          if (!newState.answeredQuestions.some((aq) => aq.questionId === qId)) {
            newState.skippedQuestions.add(qId);
          }
        });

        // Update condition state
        const condState = newState.suspectedConditions.get(matchingCondition);
        if (condState) {
          newState.suspectedConditions.set(matchingCondition, {
            ...condState,
            active: false,
            ruledOut: true,
            ruledOutReason: {
              question: question.question,
              answer: answerValue,
            },
          });
        }
      }
    }
  }

  // Process gating question logic
  if (question.isGating && question.condition) {
    // For gating questions, a negative answer rules out the parent condition
    const isNegativeAnswer = [
      'no',
      'none',
      'never',
      'not applicable',
      'n/a',
      'skipped',
    ].includes(answerValue.toLowerCase());

    if (isNegativeAnswer) {
      newState.ruledOutConditions.add(question.condition);
      const condQuestions = newState.conditionQuestions.get(question.condition) || [];
      condQuestions.forEach((qId) => {
        if (!newState.answeredQuestions.some((aq) => aq.questionId === qId)) {
          newState.skippedQuestions.add(qId);
        }
      });
    }
  }

  // Process triggered conditions
  if (effects.triggeredConditions && effects.triggeredConditions.length > 0) {
    for (const condName of effects.triggeredConditions) {
      const matchingCondition = findMatchingCondition(newState, condName);
      if (matchingCondition && !newState.ruledOutConditions.has(matchingCondition)) {
        const condState = newState.suspectedConditions.get(matchingCondition);
        if (condState) {
          newState.suspectedConditions.set(matchingCondition, {
            ...condState,
            active: true,
            triggerAnswers: [
              ...(condState.triggerAnswers || []),
              { question: question.question, answer: answerValue },
            ],
          });
        }
      }
    }
  }

  // Process likelihood changes
  if (effects.increaseLikelihood && effects.increaseLikelihood.length > 0) {
    for (const condName of effects.increaseLikelihood) {
      const matchingCondition = findMatchingCondition(newState, condName);
      if (matchingCondition && !newState.ruledOutConditions.has(matchingCondition)) {
        const condState = newState.suspectedConditions.get(matchingCondition);
        if (condState) {
          newState.suspectedConditions.set(matchingCondition, {
            ...condState,
            active: true,
            likelihood: Math.min(
              100,
              (condState.likelihood || INITIAL_LIKELIHOOD) + LIKELIHOOD_INCREMENT
            ),
            reasons: [
              ...(condState.reasons || []),
              { type: 'increase', question: question.question, answer: answerValue },
            ],
          });
        }
      }
    }
  }

  if (effects.decreaseLikelihood && effects.decreaseLikelihood.length > 0) {
    for (const condName of effects.decreaseLikelihood) {
      const matchingCondition = findMatchingCondition(newState, condName);
      if (matchingCondition) {
        const condState = newState.suspectedConditions.get(matchingCondition);
        if (condState) {
          const newLikelihood = Math.max(
            0,
            (condState.likelihood || INITIAL_LIKELIHOOD) - LIKELIHOOD_DECREMENT
          );
          newState.suspectedConditions.set(matchingCondition, {
            ...condState,
            likelihood: newLikelihood,
            reasons: [
              ...(condState.reasons || []),
              { type: 'decrease', question: question.question, answer: answerValue },
            ],
          });

          // Auto rule-out if likelihood drops too low
          if (newLikelihood < LOW_CONFIDENCE_THRESHOLD) {
            newState.ruledOutConditions.add(matchingCondition);
          }
        }
      }
    }
  }

  // Process red flags
  if (effects.redFlag) {
    newState.redFlags.push({
      question: question.question,
      answer: answerValue,
      redFlagText: effects.redFlagText || 'Clinical concern detected',
      conditionContext: question.condition,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle branching (nextQuestionId or skipToQuestionId)
  if (effects.nextQuestionId) {
    newState.pendingJump = effects.nextQuestionId;
  } else if (effects.skipToQuestionId) {
    newState.pendingJump = effects.skipToQuestionId;
    // Mark all questions between current and target as skipped
    const currentIndex = newState.questionOrder.indexOf(questionId);
    const targetIndex = newState.questionOrder.indexOf(effects.skipToQuestionId);
    if (currentIndex >= 0 && targetIndex > currentIndex) {
      for (let i = currentIndex + 1; i < targetIndex; i++) {
        newState.skippedQuestions.add(newState.questionOrder[i]);
      }
    }
  }

  // Check for assessment termination
  if (effects.terminateAssessment) {
    newState.isComplete = true;
    newState.completionReason = 'terminated_by_answer';
  } else {
    // Update current question pointer
    const currentIndex = newState.questionOrder.indexOf(questionId);
    newState.currentQuestionId = newState.questionOrder[currentIndex + 1] || null;

    // Check if we've exhausted all questions
    const nextQuestion = getCurrentQuestion(newState);
    if (!nextQuestion) {
      newState.isComplete = true;
      newState.completionReason = 'all_relevant_questions_answered';
    }
  }

  return newState;
}

/**
 * Resolve a condition reference (from a rule effect) to a real condition name.
 *
 * Matching is EXACT (then case-insensitive-exact) only. The previous
 * `includes()` partial-match fallback was unsafe for medical taxonomy: e.g.
 * searching "CL" would match "ACL Injury", and with 4 knee ligaments
 * (ACL/MCL/LCL/PCL) a substring could resolve to the wrong condition and
 * cross-contaminate the assessment. Effect references are validated to match
 * condition names exactly (scripts/validate_region.mjs), so a non-match here
 * means a bad reference — and returning null (no rule-out / no change) is the
 * safe outcome rather than guessing.
 */
function findMatchingCondition(state, searchName) {
  if (!searchName) return null;

  // Exact match first.
  if (state.suspectedConditions.has(searchName)) {
    return searchName;
  }

  // Case-insensitive exact match (tolerates casing differences only).
  const searchLower = searchName.toLowerCase().trim();
  for (const [condName] of state.suspectedConditions) {
    if (condName.toLowerCase().trim() === searchLower) {
      return condName;
    }
  }

  return null;
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Move back to the previous question (undo last answer)
 * @param {Object} state - Current engine state
 * @returns {Object} Reverted engine state
 */
export function previousQuestion(state) {
  if (!state || state.answeredQuestions.length === 0) {
    return state;
  }

  // Get all answers except the last one
  const remainingAnswers = state.answeredQuestions.slice(0, -1);

  // Re-initialize and replay answers
  const freshState = initializeEngine({
    region: state.region,
    title: state.title,
    conditions: state.conditions,
  });

  let rebuiltState = freshState;
  for (const aq of remainingAnswers) {
    rebuiltState = processAnswer(rebuiltState, aq.questionId, aq.answer);
  }

  return rebuiltState;
}

// ============================================================================
// COMPLETION & SUMMARY
// ============================================================================

/**
 * Mark the assessment as complete and generate summary
 * @param {Object} state - Current engine state
 * @returns {Object} Final state with summary
 */
export function completeAssessment(state) {
  // Rank conditions by likelihood (excluding ruled-out)
  const rankedConditions = [];

  for (const [name, condState] of state.suspectedConditions) {
    if (!state.ruledOutConditions.has(name) && !condState.isGeneral) {
      rankedConditions.push({
        name,
        likelihood: condState.likelihood || 0,
        active: condState.active,
        reasons: condState.reasons || [],
        triggerAnswers: condState.triggerAnswers || [],
      });
    }
  }

  // Sort by likelihood descending
  rankedConditions.sort((a, b) => b.likelihood - a.likelihood);

  // Get ruled-out conditions with reasons
  const ruledOutWithReasons = [];
  for (const condName of state.ruledOutConditions) {
    const condState = state.suspectedConditions.get(condName);
    ruledOutWithReasons.push({
      name: condName,
      ruledOutReason: condState?.ruledOutReason || {
        question: 'Unknown',
        answer: 'Unknown',
      },
    });
  }

  return {
    ...state,
    isComplete: true,
    completionReason: state.completionReason || 'manually_completed',
    completedAt: new Date().toISOString(),
    summary: {
      totalQuestionsAnswered: state.answeredQuestions.length,
      totalQuestionsSkipped: state.skippedQuestions.size,
      redFlagsDetected: state.redFlags.length,
      conditionsRuledOut: ruledOutWithReasons,
      suspectedConditions: rankedConditions.filter(
        (c) => c.active || c.likelihood > INITIAL_LIKELIHOOD
      ),
      rankedConditions,
      primarySuspicion:
        rankedConditions.find((c) => c.active) || rankedConditions[0] || null,
      differentialDiagnoses: rankedConditions.slice(1, 4),
    },
  };
}

/**
 * Get assessment summary for display before AI analysis
 * @param {Object} state - Current engine state
 * @returns {Object} Summary object for patient review
 */
export function getAssessmentSummary(state) {
  return {
    region: state.region,
    title: state.title,
    questionsAnswered: state.answeredQuestions.map((aq) => ({
      question: aq.question,
      answer: aq.answer,
      category: aq.category,
      conditionContext: aq.conditionContext,
    })),
    questionsSkipped: state.skippedQuestions.size,
    conditionsRuledOut: Array.from(state.ruledOutConditions),
    redFlagsDetected: state.redFlags,
    startedAt: state.startedAt,
    answeredCount: state.answeredQuestions.length,
  };
}

/**
 * Prepare data for AI temporal diagnosis
 * @param {Object} state - Completed engine state
 * @param {Object} biodata - Patient biodata snapshot
 * @returns {Object} Payload for AI analysis API
 */
export function prepareForAiAnalysis(state, biodata) {
  const completedState = completeAssessment(state);

  return {
    region: completedState.region,
    biodata: biodata,
    symptomData: completedState.answeredQuestions.map((aq) => ({
      questionId: aq.questionId,
      question: aq.question,
      response: aq.answer,
      questionCategory: aq.category,
      conditionContext: aq.conditionContext,
      effects: aq.effects,
    })),
    redFlags: completedState.redFlags,
    conditionsRuledOut: completedState.summary.conditionsRuledOut,
    suspectedConditions: completedState.summary.suspectedConditions,
    conditionAnalysis: completedState.summary.rankedConditions,
    primarySuspicion: completedState.summary.primarySuspicion,
    differentialDiagnoses: completedState.summary.differentialDiagnoses,
    assessmentMetadata: {
      startedAt: completedState.startedAt,
      completedAt: completedState.completedAt,
      totalQuestionsAnswered: completedState.answeredQuestions.length,
      totalQuestionsSkipped: completedState.skippedQuestions.size,
      completionReason: completedState.completionReason,
      engineVersion: 'v2-branching',
    },
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Load rules for a specific region
 * @param {string} region - Region identifier (e.g., 'ankle', 'lumbar')
 * @returns {Promise<Object|null>} Loaded rules or null if not found
 */
export async function loadRegionRules(region) {
  try {
    const regionName = region.charAt(0).toUpperCase() + region.slice(1);
    const response = await fetch(`/rules/${regionName} Region.json`);
    if (!response.ok) {
      console.warn(`Rules not found for region: ${region}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading rules for region ${region}:`, error);
    return null;
  }
}

/**
 * Load the rules index
 * @returns {Promise<Object|null>} Rules index or null
 */
export async function loadRulesIndex() {
  try {
    const response = await fetch('/rules/index.json');
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading rules index:', error);
    return null;
  }
}

/**
 * Serialize state for persistence (handles Map and Set)
 */
export function serializeState(state) {
  if (!state) return null;

  return {
    ...state,
    questionsMap: Object.fromEntries(state.questionsMap || new Map()),
    conditionQuestions: Object.fromEntries(state.conditionQuestions || new Map()),
    ruledOutConditions: Array.from(state.ruledOutConditions || new Set()),
    suspectedConditions: Object.fromEntries(state.suspectedConditions || new Map()),
    skippedQuestions: Array.from(state.skippedQuestions || new Set()),
  };
}

/**
 * Deserialize state from persistence
 */
export function deserializeState(serialized) {
  if (!serialized) return null;

  return {
    ...serialized,
    questionsMap: new Map(Object.entries(serialized.questionsMap || {})),
    conditionQuestions: new Map(Object.entries(serialized.conditionQuestions || {})),
    ruledOutConditions: new Set(serialized.ruledOutConditions || []),
    suspectedConditions: new Map(Object.entries(serialized.suspectedConditions || {})),
    skippedQuestions: new Set(serialized.skippedQuestions || []),
  };
}
