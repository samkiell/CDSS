import axios from 'axios';
import decisionEngine from './decision-engine/heuristic';

/**
 * Mistral AI Agent utility for clinical diagnosis.
 * Implements the "Weighted Matching Paradigm".
 */

/**
 * Generates AI analysis based on symptom data.
 * @param {Object} data - Assessment data
 * @param {string} data.selectedRegion - The body region
 * @param {Array} data.responses - Symptom responses (or symptomData in API format)
 */
export async function getAiPreliminaryAnalysis({
  selectedRegion,
  responses,
  symptomData,
}) {
  try {
    const bodyRegion = selectedRegion || 'Unknown';

    // Normalize data format to always have 'question', 'answer', and 'questionId'
    const symptoms = symptomData
      ? symptomData.map((s) => ({
          question: s.question || s.questionId || 'Unknown',
          answer: s.answer || s.response || 'No answer',
          questionId: s.questionId || s.question || 'Unknown',
        }))
      : Object.entries(responses || {}).map(([questionId, answer]) => ({
          question: questionId, // Fallback to ID if text isn't available
          answer,
          questionId,
        }));

    const symptomText = symptoms
      .map((s) => `Question: ${s.question}\nAnswer: ${s.answer}`)
      .join('\n\n');

    // 2. RUN HEURISTIC ENGINE FIRST
    const normalizedSymptoms = symptoms.map((s) => ({
      questionId: s.questionId,
      response: s.answer,
      questionCategory: s.questionId,
    }));
    const heuristicResult = decisionEngine.calculateTemporalDiagnosis(normalizedSymptoms);
    const baseConfidence = heuristicResult.primaryDiagnosis?.confidence || 0;

    const prompt = `
      You are a diagnostic engine using the Weighted Matching Paradigm. 
      Compare the following symptoms for the ${bodyRegion} region against clinical heuristics.
      
      Symptoms:
      ${symptomText}
      
      Mathematical Baseline Confidence: ${(baseConfidence * 100).toFixed(0)}%

      Instructions:
      1. Analyze the symptoms using clinical reasoning.
      2. Provide a temporal diagnosis and reasoning addressed DIRECTLY TO THE PATIENT.
      3. Use second-person perspective (e.g., "You reported...", "Your symptoms suggest...") instead of third-person clinical reporting (e.g., "The patient reports...").
      4. Calculate a dynamic "confidenceScore" (0-100) by refining the "Mathematical Baseline Confidence".
         - Adjust based on symptom specificity, red flags, and consistency.
         - AVOID using fixed or placeholder numbers (like 85).
         - Be granular (e.g., 73, 88, 92).
      5. For "reasoning", provide clear clinical indicators found in the symptoms, phrased so the patient understands why this diagnosis was reached.
      6. CRITICAL: Do NOT include any internal tags, question IDs, or technical codes (e.g., "(lumbar_q_redflag)") in the reasoning. Use natural language only.

      Output JSON only:
      {
        "temporalDiagnosis": "String (Geared for the patient)",
        "confidenceScore": Number,
        "riskLevel": "Low" | "Moderate" | "Urgent",
        "reasoning": ["String (Geared for the patient)"]
      }
    `;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-medium',
        messages: [
          {
            role: 'system',
            content:
              'You are a diagnostic engine using the Weighted Matching Paradigm. Compare symptoms against clinical heuristics. You speak directly to the patient in the second person (You/Your). Provide compassionate, clear, and direct analysis. Output JSON only. Do not include internal question IDs or tags in your reasoning.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env['CDSS_AI_API_KEY']}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResult = JSON.parse(response.data.choices[0].message.content);

    // Safety cleanup: Strip any (question_id) tags if they leaked into reasoning
    if (aiResult.reasoning && Array.isArray(aiResult.reasoning)) {
      aiResult.reasoning = aiResult.reasoning.map((item) =>
        item.replace(/\((?:[a-z0-9_]+(?:,\s*)?)+\)/gi, '').trim()
      );
    }

    return {
      success: true,
      analysis: aiResult,
    };
  } catch (error) {
    console.error('AI Agent Error:', error.response?.data || error.message);
    throw new Error('AI analysis failed');
  }
}

/**
 * Compatibility alias for getWeightedAiAnalysis if needed
 */
export const getWeightedAiAnalysis = getAiPreliminaryAnalysis;

/**
 * Converts a patient-facing analysis (second person) into a therapist-facing clinical narrative (third person).
 * @param {Object} analysis - The patient-facing analysis object
 * @returns {Promise<Object>} The transformed analysis in third person
 */
export async function convertToTherapistFacingAnalysis(analysis) {
  try {
    const prompt = `
      You are a clinical transcription assistant. Convert the following patient-facing assessment (written in second person) into a therapist-facing clinical narrative (written in third person).
      
      Input Analysis:
      Diagnosis: ${analysis.temporalDiagnosis}
      Reasoning: ${Array.isArray(analysis.reasoning) ? analysis.reasoning.join(' ') : analysis.reasoning}
      
      Rules for Conversion:
      1. Convert all second-person language ("you", "your", "you reported") into third-person clinical language referring to "the patient".
      2. Use neutral, professional phrasing (e.g., "The patient reported...", "The patient describes...", "Findings suggest...").
      3. Preserve: Medical meaning, risk level, and clinical uncertainty.
      4. Do NOT: Add new diagnoses, add recommendations, or change severity.
      5. Structure the output as professional clinical case notes.
      6. Return a JSON object with two fields:
         - "temporalDiagnosis": A brief clinical summary of the diagnosis in third person.
         - "clinicalNarrative": A full clinical narrative incorporating the reasoning in third person.

      Output JSON only:
      {
        "temporalDiagnosis": "String",
        "clinicalNarrative": "String"
      }
    `;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-medium',
        messages: [
          {
            role: 'system',
            content:
              'You are a clinical transcription assistant. You convert patient-facing assessments into professional therapist-facing clinical notes. Output JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env['CDSS_AI_API_KEY']}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);

    // Return transformed structured data
    return {
      temporalDiagnosis: result.temporalDiagnosis,
      confidenceScore: analysis.confidenceScore,
      riskLevel: analysis.riskLevel,
      reasoning: [result.clinicalNarrative], // Store narrative in reasoning array to maintain compatibility
      isProvisional: analysis.isProvisional ?? true,
    };
  } catch (error) {
    console.error('Conversion Error:', error.response?.data || error.message);
    throw new Error('Failed to convert analysis to therapist-facing format');
  }
}
