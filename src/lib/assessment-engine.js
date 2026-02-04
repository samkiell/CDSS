/**
 * BRANCHING ASSESSMENT ENGINE
 * ============================
 * Implements a dynamic question engine driven entirely by JSON rules.
 *
 * CORE BEHAVIOR:
 * - Questions are presented one at a time
 * - Each answer updates rule-out states and condition likelihood weights
 * - The engine determines the next question based on current state
 * - Questions related to ruled-out conditions continue (rule-out = investigate further)
 * - Stops when diagnostic confidence threshold is reached or no questions remain
 *
 * IMPORTANT:
 * - This engine does NOT invent medical logic
 * - All logic comes from JSON rules extracted from source documents
 * - Rule out in this context means "investigate this condition further"
 *
 * @module AssessmentEngine
 */

/**
 * ENGINE STATE SCHEMA
 * ====================
 * {
 *   region: string,               // Selected body region
 *   currentConditionIndex: number,// Index in conditions array
 *   currentQuestionIndex: number, // Index in current condition's questions
 *   askedQuestions: [],           // Array of { questionId, question, answer, effects, timestamp }
 *   conditionStates: {            // Keyed by condition name
 *     [conditionName]: {
 *       active: boolean,          // Whether condition is being investigated
 *       likelihood: number,       // 0-100 likelihood score
 *       ruleOutReasons: [],       // Reasons this condition is being investigated
 *       confirmationReasons: [],  // Evidence supporting this condition
 *     }
 *   },
 *   redFlags: [],                 // Array of detected red flag answers
 *   isComplete: boolean,          // Whether assessment is complete
 *   completionReason: string,     // Why assessment ended
 * }
 */

/**
 * Initialize a new assessment engine state for a given region
 * @param {Object} rulesJson - The loaded JSON rules for the region
 * @returns {Object} Initial engine state
 */
export function initializeEngine(rulesJson) {
  if (!rulesJson || !rulesJson.conditions) {
    throw new Error('Invalid rules JSON: missing conditions array');
  }

  // Initialize condition states for all conditions
  const conditionStates = {};
  rulesJson.conditions.forEach((condition) => {
    conditionStates[condition.name] = {
      active: true, // All conditions start as active (being considered)
      likelihood: 50, // Start at neutral likelihood
      ruleOutReasons: [],
      confirmationReasons: [],
      questionCount: condition.questions.length,
    };
  });

  return {
    region: rulesJson.region,
    title: rulesJson.title,
    conditions: rulesJson.conditions,
    currentConditionIndex: 0,
    currentQuestionIndex: 0,
    askedQuestions: [],
    conditionStates,
    redFlags: [],
    isComplete: false,
    completionReason: null,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Get the current question to display
 * @param {Object} state - Current engine state
 * @returns {Object|null} Current question object or null if complete
 */
export function getCurrentQuestion(state) {
  if (state.isComplete) {
    return null;
  }

  const { conditions, currentConditionIndex, currentQuestionIndex } = state;

  // Find next available question
  for (let ci = currentConditionIndex; ci < conditions.length; ci++) {
    const condition = conditions[ci];
    const startQi = ci === currentConditionIndex ? currentQuestionIndex : 0;

    for (let qi = startQi; qi < condition.questions.length; qi++) {
      const question = condition.questions[qi];

      // Check if question was already asked
      const alreadyAsked = state.askedQuestions.some(
        (aq) => aq.questionId === question.id
      );

      if (!alreadyAsked) {
        // Normalize the question structure for the component
        // JSON uses: questionText, options
        // Component expects: question, answers
        return {
          id: question.id,
          question: question.questionText || question.question,
          answers: question.options || question.answers || [],
          category: question.category,
          inputType: question.inputType,
          metadata: question.metadata,
          conditionName: condition.name,
          conditionIndex: ci,
          questionIndex: qi,
          totalQuestions: conditions.reduce(
            (sum, c) => sum + (c.questions?.length || 0),
            0
          ),
          answeredCount: state.askedQuestions.length,
        };
      }
    }
  }

  // No more questions
  return null;
}

/**
 * Process an answer and update engine state
 * @param {Object} state - Current engine state
 * @param {string} questionId - ID of the question being answered
 * @param {string} answerValue - The selected answer value
 * @returns {Object} Updated engine state
 */
export function processAnswer(state, questionId, answerValue) {
  const question = findQuestionById(state, questionId);
  if (!question) {
    console.warn(`Question not found: ${questionId}`);
    return state;
  }

  // Find the answer object
  const answerObj = question.question.answers.find(
    (a) => a.value === answerValue || a.value.toLowerCase() === answerValue.toLowerCase()
  );

  const effects = answerObj?.effects || {
    rule_out: [],
    increase_likelihood: [],
    decrease_likelihood: [],
  };

  // Record the answered question
  /**
   * TRACEABILITY:
   * Each answered question is recorded with full context for later review.
   * This data will be stored with the assessment for therapist review.
   */
  const answeredQuestion = {
    questionId: question.question.id,
    question: question.question.question,
    category: question.question.category,
    conditionName: question.conditionName,
    answer: answerValue,
    effects: effects,
    timestamp: new Date().toISOString(),
  };

  const newAskedQuestions = [...state.askedQuestions, answeredQuestion];

  // Update condition states based on effects
  const newConditionStates = { ...state.conditionStates };

  /**
   * RULE-OUT LOGIC:
   * In this clinical context, "rule out" means "investigate this condition further"
   * NOT "eliminate this condition from consideration".
   *
   * When a response triggers a rule-out:
   * - The condition becomes a focus of investigation
   * - More questions about this condition should be asked
   * - The condition likelihood may increase based on subsequent responses
   */
  effects.rule_out.forEach((conditionName) => {
    // Find matching condition (case-insensitive partial match)
    const matchingCondition = Object.keys(newConditionStates).find(
      (cn) =>
        cn.toLowerCase().includes(conditionName.toLowerCase()) ||
        conditionName.toLowerCase().includes(cn.toLowerCase())
    );

    if (matchingCondition) {
      newConditionStates[matchingCondition] = {
        ...newConditionStates[matchingCondition],
        active: true,
        ruleOutReasons: [
          ...newConditionStates[matchingCondition].ruleOutReasons,
          { question: question.question.question, answer: answerValue },
        ],
        // Increase likelihood slightly when a condition is being investigated
        likelihood: Math.min(100, newConditionStates[matchingCondition].likelihood + 10),
      };
    }
  });

  // Process confirmation indicators
  effects.increase_likelihood.forEach((conditionName) => {
    const matchingCondition = Object.keys(newConditionStates).find(
      (cn) =>
        cn.toLowerCase().includes(conditionName.toLowerCase()) ||
        conditionName.toLowerCase().includes(cn.toLowerCase())
    );

    if (matchingCondition) {
      newConditionStates[matchingCondition] = {
        ...newConditionStates[matchingCondition],
        confirmationReasons: [
          ...newConditionStates[matchingCondition].confirmationReasons,
          { question: question.question.question, answer: answerValue },
        ],
        likelihood: Math.min(100, newConditionStates[matchingCondition].likelihood + 15),
      };
    }
  });

  // Process decreased likelihood
  effects.decrease_likelihood.forEach((conditionName) => {
    const matchingCondition = Object.keys(newConditionStates).find(
      (cn) =>
        cn.toLowerCase().includes(conditionName.toLowerCase()) ||
        conditionName.toLowerCase().includes(cn.toLowerCase())
    );

    if (matchingCondition) {
      newConditionStates[matchingCondition] = {
        ...newConditionStates[matchingCondition],
        likelihood: Math.max(0, newConditionStates[matchingCondition].likelihood - 15),
      };
    }
  });

  // Process red flags
  const newRedFlags = [...state.redFlags];
  if (effects.red_flag) {
    newRedFlags.push({
      question: question.question.question,
      answer: answerValue,
      redFlagText: effects.red_flag_text,
      timestamp: new Date().toISOString(),
    });
  }

  // Advance to next question
  let newConditionIndex = question.conditionIndex;
  let newQuestionIndex = question.questionIndex + 1;

  // Check if we need to advance to the next condition
  if (newQuestionIndex >= state.conditions[newConditionIndex].questions.length) {
    newConditionIndex++;
    newQuestionIndex = 0;
  }

  // Check if assessment is complete
  let isComplete = false;
  let completionReason = null;

  if (newConditionIndex >= state.conditions.length) {
    isComplete = true;
    completionReason = 'all_questions_answered';
  }

  // Check for high confidence in any condition
  const highConfidenceConditions = Object.entries(newConditionStates)
    .filter(([_, cs]) => cs.likelihood >= 90)
    .map(([name, _]) => name);

  // Don't auto-complete based on confidence - let all relevant questions be asked
  // This ensures thorough assessment

  return {
    ...state,
    currentConditionIndex: newConditionIndex,
    currentQuestionIndex: newQuestionIndex,
    askedQuestions: newAskedQuestions,
    conditionStates: newConditionStates,
    redFlags: newRedFlags,
    isComplete,
    completionReason,
  };
}

/**
 * Move back to the previous question
 * @param {Object} state - Current engine state
 * @returns {Object} Reverted engine state
 */
export function previousQuestion(state) {
  if (!state || state.askedQuestions.length === 0) {
    return state;
  }

  // Get all answers except the last one
  const remainingAnswers = [...state.askedQuestions];
  remainingAnswers.pop();

  // Re-initialize a fresh state
  const rulesJson = {
    region: state.region,
    title: state.title,
    conditions: state.conditions,
  };

  let newState = initializeEngine(rulesJson);

  // Re-process all remaining answers to reconstruct state accurately
  remainingAnswers.forEach((aq) => {
    newState = processAnswer(newState, aq.questionId, aq.answer);
  });

  return newState;
}

/**
 * Find a question by its ID across all conditions
 */
function findQuestionById(state, questionId) {
  for (let ci = 0; ci < state.conditions.length; ci++) {
    const condition = state.conditions[ci];
    for (let qi = 0; qi < condition.questions.length; qi++) {
      if (condition.questions[qi].id === questionId) {
        return {
          question: condition.questions[qi],
          conditionName: condition.name,
          conditionIndex: ci,
          questionIndex: qi,
        };
      }
    }
  }
  return null;
}

/**
 * Mark the assessment as complete and prepare summary
 * @param {Object} state - Current engine state
 * @returns {Object} Final state with summary
 */
export function completeAssessment(state) {
  // Rank conditions by likelihood
  const rankedConditions = Object.entries(state.conditionStates)
    .filter(([_, cs]) => cs.likelihood > 0)
    .sort((a, b) => b[1].likelihood - a[1].likelihood)
    .map(([name, cs]) => ({
      name,
      likelihood: cs.likelihood,
      ruleOutReasons: cs.ruleOutReasons,
      confirmationReasons: cs.confirmationReasons,
    }));

  return {
    ...state,
    isComplete: true,
    completionReason: state.completionReason || 'manually_completed',
    completedAt: new Date().toISOString(),
    summary: {
      totalQuestionsAnswered: state.askedQuestions.length,
      redFlagsDetected: state.redFlags.length,
      rankedConditions,
      primarySuspicion: rankedConditions[0] || null,
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
    questionsAnswered: state.askedQuestions.map((aq) => ({
      question: aq.question,
      answer: aq.answer,
      category: aq.category,
    })),
    redFlagsDetected: state.redFlags,
    startedAt: state.startedAt,
    answeredCount: state.askedQuestions.length,
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

  /**
   * AI ANALYSIS PAYLOAD
   * ====================
   * This data is sent to the AI for temporal diagnosis generation.
   * The AI will:
   * - Reason over the structured answers
   * - Apply clinical logic based on rule context
   * - Produce a TEMPORAL diagnosis (not final)
   * - Include disclaimer about preliminary nature
   */
  return {
    region: completedState.region,
    biodata: biodata,
    symptomData: completedState.askedQuestions.map((aq) => ({
      questionId: aq.questionId,
      question: aq.question,
      response: aq.answer,
      questionCategory: aq.category,
      conditionContext: aq.conditionName,
      effects: aq.effects,
    })),
    redFlags: completedState.redFlags,
    conditionAnalysis: completedState.summary.rankedConditions,
    primarySuspicion: completedState.summary.primarySuspicion,
    differentialDiagnoses: completedState.summary.differentialDiagnoses,
    assessmentMetadata: {
      startedAt: completedState.startedAt,
      completedAt: completedState.completedAt,
      totalQuestionsAnswered: completedState.askedQuestions.length,
      completionReason: completedState.completionReason,
    },
  };
}

/**
 * Load rules for a specific region
 * @param {string} region - Region identifier (e.g., 'ankle', 'lumbar')
 * @returns {Promise<Object|null>} Loaded rules or null if not found
 */
export async function loadRegionRules(region) {
  try {
    const response = await fetch(
      `/rules/${region.charAt(0).toUpperCase() + region.slice(1)} Region.json`
    );
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
