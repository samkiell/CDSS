/**
 * CDSS Heuristic Diagnostic Engine
 *
 * ============================================================================
 * WEIGHTED MATCHING PARADIGM
 * ============================================================================
 *
 * This module implements the core diagnostic algorithm for the Clinical Decision
 * Support System (CDSS) for musculoskeletal conditions. The approach follows
 * a "weighted matching paradigm" as defined in the project whitepaper.
 *
 * ALGORITHM OVERVIEW:
 * -------------------
 * 1. Patient responses to diagnostic questions are collected as symptom vectors.
 * 2. Each condition in the knowledge base has an "expected response pattern" -
 *    a set of typical symptom presentations.
 * 3. Patient responses are compared against each pattern using weighted similarity.
 * 4. Weights are assigned based on:
 *    - Clinical significance of the symptom (pathognomonic vs. general)
 *    - Specificity to the condition
 *    - Temporal and contextual factors
 * 5. A confidence score (0-1) is calculated for each potential diagnosis.
 * 6. Diagnoses are ranked, with the highest confidence as primary and others
 *    as differentials.
 *
 * FUTURE ML INTEGRATION:
 * ----------------------
 * This heuristic engine provides "temporal diagnosis" - an immediate rule-based
 * assessment. The architecture supports replacement/augmentation with:
 * - Bayesian networks for probabilistic reasoning
 * - Neural networks trained on historical diagnosis data
 * - Ensemble methods combining heuristic and ML approaches
 *
 * The ml-bridge module will handle the interface between this engine and
 * Python-based ML models.
 *
 * IMPORTANT: This module MUST remain framework-agnostic (no React, no Next.js).
 * It should be pure JavaScript that can run in any environment.
 * ============================================================================
 */

/**
 * Condition knowledge base - Expected symptom patterns
 * In production, this would be loaded from database or external config
 */
const CONDITION_PATTERNS = {
  lumbar_disc_herniation: {
    code: 'FB83.1',
    name: 'Lumbar Disc Herniation',
    category: 'lumbar_spine',
    expectedPatterns: [
      { symptom: 'pain_location', expected: 'lower_back', weight: 0.8 },
      { symptom: 'radiation', expected: 'leg', weight: 0.9 },
      { symptom: 'pain_character', expected: 'sharp', weight: 0.6 },
      {
        symptom: 'aggravating',
        expected: ['sitting', 'bending_forward'],
        weight: 0.7,
      },
      {
        symptom: 'neurological',
        expected: ['numbness', 'tingling'],
        weight: 0.85,
      },
      { symptom: 'positive_slr', expected: true, weight: 0.9 },
    ],
    severityIndicators: {
      mild: { minScore: 0.3, maxScore: 0.5 },
      moderate: { minScore: 0.5, maxScore: 0.7 },
      severe: { minScore: 0.7, maxScore: 1.0 },
    },
  },
  rotator_cuff_tear: {
    code: 'FB54.0',
    name: 'Rotator Cuff Tear',
    category: 'shoulder',
    expectedPatterns: [
      { symptom: 'pain_location', expected: 'shoulder', weight: 0.9 },
      { symptom: 'pain_character', expected: ['deep', 'aching'], weight: 0.6 },
      { symptom: 'weakness', expected: 'arm_elevation', weight: 0.85 },
      { symptom: 'night_pain', expected: true, weight: 0.7 },
      {
        symptom: 'mechanism',
        expected: ['trauma', 'repetitive_overhead'],
        weight: 0.6,
      },
      { symptom: 'age_group', expected: 'over_40', weight: 0.4 },
    ],
    severityIndicators: {
      mild: { minScore: 0.3, maxScore: 0.5 },
      moderate: { minScore: 0.5, maxScore: 0.7 },
      severe: { minScore: 0.7, maxScore: 1.0 },
    },
  },
  knee_osteoarthritis: {
    code: 'FA00.0',
    name: 'Knee Osteoarthritis',
    category: 'knee',
    expectedPatterns: [
      { symptom: 'pain_location', expected: 'knee', weight: 0.9 },
      { symptom: 'pain_character', expected: 'aching', weight: 0.5 },
      {
        symptom: 'stiffness',
        expected: 'morning_stiffness_short',
        weight: 0.8,
      },
      { symptom: 'crepitus', expected: true, weight: 0.7 },
      {
        symptom: 'aggravating',
        expected: ['stairs', 'prolonged_walking'],
        weight: 0.7,
      },
      { symptom: 'swelling', expected: 'intermittent', weight: 0.6 },
      { symptom: 'age_group', expected: 'over_50', weight: 0.5 },
    ],
    severityIndicators: {
      mild: { minScore: 0.3, maxScore: 0.5 },
      moderate: { minScore: 0.5, maxScore: 0.7 },
      severe: { minScore: 0.7, maxScore: 1.0 },
    },
  },
  // Add more conditions as needed...
};

/**
 * Calculate similarity between patient response and expected pattern
 * @param {*} response - Patient's actual response
 * @param {*} expected - Expected response pattern
 * @returns {number} Similarity score 0-1
 */
function calculateSimilarity(response, expected) {
  // Exact match
  if (response === expected) {
    return 1.0;
  }

  // Boolean comparison
  if (typeof expected === 'boolean') {
    return response === expected ? 1.0 : 0.0;
  }

  // Array matching (any match counts)
  if (Array.isArray(expected)) {
    if (Array.isArray(response)) {
      const matches = response.filter((r) => expected.includes(r)).length;
      return matches / Math.max(expected.length, response.length);
    }
    return expected.includes(response) ? 1.0 : 0.0;
  }

  // String partial matching (for fuzzy cases)
  if (typeof expected === 'string' && typeof response === 'string') {
    const normalizedExpected = expected.toLowerCase();
    const normalizedResponse = response.toLowerCase();
    if (
      normalizedResponse.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedResponse)
    ) {
      return 0.8;
    }
  }

  return 0.0;
}

/**
 * Calculate weighted match score for a single condition
 * @param {Object[]} symptoms - Patient symptom responses
 * @param {Object} conditionPattern - Condition's expected patterns
 * @returns {Object} Match result with score and matched patterns
 */
function calculateConditionScore(symptoms, conditionPattern) {
  const symptomMap = new Map(
    symptoms.map((s) => [s.questionCategory || s.questionId, s.response])
  );

  let totalWeight = 0;
  let weightedScore = 0;
  const matchedPatterns = [];

  for (const pattern of conditionPattern.expectedPatterns) {
    const response = symptomMap.get(pattern.symptom);

    if (response !== undefined) {
      const similarity = calculateSimilarity(response, pattern.expected);
      const weightedSimilarity = similarity * pattern.weight;

      weightedScore += weightedSimilarity;
      totalWeight += pattern.weight;

      if (similarity > 0) {
        matchedPatterns.push({
          patternId: pattern.symptom,
          matchScore: similarity,
        });
      }
    }
  }

  // Normalize score
  const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;

  return {
    confidence: Math.min(1, Math.max(0, confidence)),
    matchedPatterns,
  };
}

/**
 * Determine severity based on confidence score and condition indicators
 * @param {number} confidence - Calculated confidence score
 * @param {Object} severityIndicators - Condition's severity thresholds
 * @returns {string} Severity level
 */
function determineSeverity(confidence, severityIndicators) {
  if (!severityIndicators) return 'unknown';

  for (const [level, thresholds] of Object.entries(severityIndicators)) {
    if (confidence >= thresholds.minScore && confidence <= thresholds.maxScore) {
      return level;
    }
  }

  return 'unknown';
}

/**
 * Generate recommendations based on diagnosis
 * @param {string} conditionCode - Condition code
 * @param {string} severity - Severity level
 * @returns {string[]} Array of recommendations
 */
function generateRecommendations(conditionCode, severity) {
  const baseRecommendations = [
    'Follow up with a healthcare provider for clinical examination',
    'Avoid activities that aggravate symptoms',
  ];

  const severityRecommendations = {
    mild: ['Consider conservative management', 'Monitor symptoms for changes'],
    moderate: [
      'Clinical evaluation recommended within 1-2 weeks',
      'Consider imaging studies if symptoms persist',
    ],
    severe: [
      'Urgent clinical evaluation recommended',
      'Imaging studies likely warranted',
      'Consider specialist referral',
    ],
  };

  return [...baseRecommendations, ...(severityRecommendations[severity] || [])];
}

/**
 * Main diagnostic function - Calculate temporal diagnosis
 * @param {Object[]} symptoms - Array of symptom response objects
 * @param {Object} options - Optional configuration
 * @returns {Object} Diagnosis result with primary and differential diagnoses
 */
export function calculateTemporalDiagnosis(symptoms, options = {}) {
  const { minConfidence = 0.2, maxDifferentials = 3 } = options;

  if (!symptoms || symptoms.length === 0) {
    return {
      primaryDiagnosis: null,
      differentialDiagnoses: [],
      calculatedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
      error: 'No symptoms provided',
    };
  }

  // Calculate scores for all conditions
  const results = [];

  for (const conditionData of Object.values(CONDITION_PATTERNS)) {
    const { confidence, matchedPatterns } = calculateConditionScore(
      symptoms,
      conditionData
    );

    if (confidence >= minConfidence) {
      const severity = determineSeverity(confidence, conditionData.severityIndicators);

      results.push({
        conditionCode: conditionData.code,
        conditionName: conditionData.name,
        confidence: parseFloat(confidence.toFixed(3)),
        severity,
        matchedPatterns,
        recommendations: generateRecommendations(conditionData.code, severity),
      });
    }
  }

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  // Extract primary and differentials
  const primaryDiagnosis = results.length > 0 ? results[0] : null;
  const differentialDiagnoses = results.slice(1, maxDifferentials + 1);

  return {
    primaryDiagnosis,
    differentialDiagnoses,
    calculatedAt: new Date().toISOString(),
    engineVersion: '1.0.0',
  };
}

/**
 * Validate symptoms array structure
 * @param {Object[]} symptoms - Symptoms to validate
 * @returns {Object} Validation result
 */
export function validateSymptoms(symptoms) {
  const errors = [];

  if (!Array.isArray(symptoms)) {
    return { valid: false, errors: ['Symptoms must be an array'] };
  }

  symptoms.forEach((symptom, index) => {
    if (!symptom.questionId) {
      errors.push(`Symptom at index ${index} missing questionId`);
    }
    if (symptom.response === undefined) {
      errors.push(`Symptom at index ${index} missing response`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get available condition categories
 * @returns {string[]} Array of category names
 */
export function getConditionCategories() {
  const categories = new Set();
  for (const condition of Object.values(CONDITION_PATTERNS)) {
    categories.add(condition.category);
  }
  return Array.from(categories);
}

/**
 * Export condition patterns for external use (e.g., generating questions)
 */
export const conditionPatterns = CONDITION_PATTERNS;

const decisionEngine = {
  calculateTemporalDiagnosis,
  validateSymptoms,
  getConditionCategories,
  conditionPatterns,
};

export default decisionEngine;
