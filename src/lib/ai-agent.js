import axios from 'axios';

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

    // Normalize data format
    const symptoms =
      symptomData ||
      Object.entries(responses || {}).map(([question, answer]) => ({
        question,
        answer,
      }));

    const symptomText = symptoms
      .map((s) => `Question: ${s.question}\nAnswer: ${s.answer}`)
      .join('\n\n');

    const prompt = `
      You are a diagnostic engine using the Weighted Matching Paradigm. 
      Compare the following symptoms for the ${bodyRegion} region against clinical heuristics.
      
      Symptoms:
      ${symptomText}
      
      Instructions:
      1. Analyze the symptoms.
      2. Provide a temporal diagnosis.
      3. For "reasoning", provide clear clinical indicators found in the symptoms.
      4. CRITICAL: Do NOT include any internal tags, question IDs, or technical codes (e.g., "(lumbar_q_redflag)") in the reasoning. Use natural language only.

      Output JSON only:
      {
        "temporalDiagnosis": "String (e.g., Lumbar Disc Herniation)",
        "confidenceScore": "Number (0-100)",
        "riskLevel": "String (Low, Moderate, Urgent)",
        "reasoning": ["String (Key indicator 1)", "String (Key indicator 2)"]
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
              'You are a diagnostic engine using the Weighted Matching Paradigm. Compare symptoms against clinical heuristics. Output JSON only. Do not include internal question IDs or tags in your reasoning.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env['CDSS-AI_API_KEY']}`,
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
