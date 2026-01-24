import axios from 'axios';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/agents/completions';

/**
 * Communicates with the Mistral AI Agent to provide a preliminary clinical analysis.
 *
 * @param {Object} data - The assessment data including symptoms and responses.
 * @returns {Promise<Object>} The AI's preliminary diagnosis.
 */
export async function getAiPreliminaryAnalysis(data) {
  const apiKey = process.env['CDSS-AI_API_KEY'];
  const agentId = process.env['CDSS-AI_AGENT_ID'];

  if (!apiKey || !agentId) {
    throw new Error('AI Configuration missing (API Key or Agent ID)');
  }

  const prompt = `
    You are a highly advanced Clinical Decision Support AI. 
    Analyze the following patient assessment data for musculoskeletal issues.
    
    PATIENT DATA:
    - Selected Region: ${data.selectedRegion}
    - Symptoms: ${JSON.stringify(data.responses, null, 2)}
    - Clinical Red Flags Detected: ${JSON.stringify(data.redFlags, null, 2)}
    
    TASK:
    Provide a concise, professional "Temporary Diagnosis" for the patient. 
    Focus on potential conditions based on the symptoms.
    Clearly state that this is a preliminary analysis and not a final medical diagnosis.
    Include recommendations for next steps.
    
    CRITICAL INSTRUCTION:
    Do NOT include any internal question IDs, technical codes, or raw data keys (e.g., "ankle_q1", "achilles_pop") in your response. 
    The patient should only see natural clinical language. Instead of referencing IDs, describe the finding (e.g., write "based on the sharp pain mentioned" instead of "based on q1").
    
    FORMAT:
    Return your response in clear sections:
    1. Preliminary Analysis (Potential condition)
    2. Confidence Level
    3. Recommended Immediate Action
    4. Clinical Notes for the Doctor
  `;

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        agent_id: agentId,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      analysis: response.data.choices[0].message.content,
      model: response.data.model,
    };
  } catch (error) {
    console.error('Mistral AI Agent Error:', error.response?.data || error.message);
    throw new Error('AI analysis failed. Please try again later.');
  }
}
