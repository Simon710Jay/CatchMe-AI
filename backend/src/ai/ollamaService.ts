import axios from 'axios';

export interface AIAnalysisResult {
  probableCause: string;
  impact: string;
  recommendedFix: string;
  codePatch: string;
  confidenceScore: number;
}

export class OllamaService {
  private static readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  private static readonly MODEL = process.env.OLLAMA_MODEL || 'llama3';

  static async analyzeIncident(
    title: string,
    service: string,
    severity: string,
    logs: string[]
  ): Promise<AIAnalysisResult> {
    const prompt = `
      You are a Senior DevOps and Reliability Engineer. 
      Analyze the following incident logs and provide a structured diagnosis.
      
      INCIDENT DETAILS:
      Title: ${title}
      Service: ${service}
      Severity: ${severity}
      
      LOGS:
      ${logs.join('\n')}
      
      RESPONSE FORMAT:
      You MUST respond ONLY with a valid JSON object. Do not include any text before or after the JSON.
      {
        "probableCause": "A detailed explanation of why this error occurred",
        "impact": "A clear description of how this affects the system or users",
        "recommendedFix": "Step-by-step instructions to resolve the issue",
        "codePatch": "A git diff or code snippet suggesting the fix (if applicable)",
        "confidenceScore": 0.95
      }
    `;

    try {
      const response = await axios.post(`${this.OLLAMA_URL}/api/generate`, {
        model: this.MODEL,
        prompt: prompt,
        stream: false,
        format: 'json',
      }, {
        timeout: 60000, // AI can be slow
      });

      const result = JSON.parse(response.data.response);
      
      return {
        probableCause: result.probableCause || 'Unknown',
        impact: result.impact || 'Unknown',
        recommendedFix: result.recommendedFix || 'Unknown',
        codePatch: result.codePatch || '',
        confidenceScore: result.confidenceScore || 0.5,
      };
    } catch (error: any) {
      console.error('Ollama Analysis Error:', error.message);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }
}
