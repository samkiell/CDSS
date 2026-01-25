import axios from 'axios';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/agents/completions';

/**
 * Communicates with the Mistral AI Agent to provide a preliminary clinical analysis
 * using the Weighted Matching Paradigm.
 *
 * @param {Object} data - The assessment data including symptoms and body region.
 * @returns {Promise<Object>} The AI's preliminary diagnosis in structured JSON.
 */
export async function getWeightedAiAnalysis(data) {
  const apiKey = process.env['CDSS-AI_API_KEY'];
  const agentId = process.env['CDSS-AI_AGENT_ID'];

  if (!apiKey || !agentId) {
    throw new Error('AI Configuration missing (API Key or Agent ID)');
  }

  const systemInstruction = `
    You are a diagnostic engine using the Weighted Matching Paradigm. 
    Compare symptoms against clinical heuristics. 
    Output JSON only: { "temporalDiagnosis": string, "confidenceScore": number, "riskLevel": "Low" | "Moderate" | "Urgent", "reasoning": string[] }
  `;

  const userPrompt = `
    Analyze the following patient assessment data:
    - Body Region: ${data.bodyRegion}
    - Symptom Data: ${JSON.stringify(data.symptomData, null, 2)}
    
    Ensure the diagnosis is musculoskeletal and follows standard orthopaedic heuristics.
  `;

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        agent_id: agentId,
        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        // Note: Mistral Agent API might not support response_format: 'json_object' yet,
        // but we'll instruct it in the system prompt.
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let content = response.data.choices[0].message.content;

    // Clean up content if AI adds markdown blocks
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('AI returned invalid format');
    }

    return {
      success: true,
      analysis,
      model: response.data.model,
    };
  } catch (error) {
    console.error('Mistral AI Agent Error:', error.response?.data || error.message);
    throw new Error('AI analysis failed. Please try again later.');
  }
}
