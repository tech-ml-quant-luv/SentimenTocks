import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SentimentAnalysisResult {
  sentimentScore: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  confidence: number;
  summary: string;
  keyHighlights: string[];
  riskFactors: string[];
}

export class OpenAIService {
  async analyzeSentiment(transcriptText: string): Promise<SentimentAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a financial sentiment analysis expert. Analyze the earnings call transcript and provide detailed sentiment analysis with the following structure: sentiment score (-1 to 1), percentage breakdown of positive/neutral/negative sentiments, confidence level (0-1), summary, key highlights, and risk factors. Respond in JSON format."
          },
          {
            role: "user",
            content: `Analyze the sentiment of this earnings call transcript and provide a comprehensive analysis:

${transcriptText}

Please provide the response in the following JSON format:
{
  "sentimentScore": number between -1 and 1,
  "positiveCount": percentage of positive sentiments,
  "neutralCount": percentage of neutral sentiments,
  "negativeCount": percentage of negative sentiments,
  "confidence": confidence level between 0 and 1,
  "summary": "Brief summary of the overall sentiment and key takeaways",
  "keyHighlights": ["array", "of", "key", "positive", "highlights"],
  "riskFactors": ["array", "of", "identified", "risk", "factors"]
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sentimentScore: Math.max(-1, Math.min(1, result.sentimentScore || 0)),
        positiveCount: Math.max(0, Math.min(100, result.positiveCount || 0)),
        neutralCount: Math.max(0, Math.min(100, result.neutralCount || 0)),
        negativeCount: Math.max(0, Math.min(100, result.negativeCount || 0)),
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        summary: result.summary || "No summary available",
        keyHighlights: Array.isArray(result.keyHighlights) ? result.keyHighlights : [],
        riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : [],
      };
    } catch (error) {
      throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
  }

  async generateEarningsCallTranscript(companyName: string, quarter: string, year: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a financial analyst creating realistic earnings call transcripts. Generate a comprehensive earnings call transcript with multiple speakers including CEO, CFO, and analysts asking questions."
          },
          {
            role: "user",
            content: `Generate a realistic earnings call transcript for ${companyName} for Q${quarter} ${year}. Include:
- Opening remarks from CEO
- Financial highlights from CFO
- Q&A session with analysts
- Forward-looking statements
- Risk factors discussion
- Closing remarks

Make it realistic and include both positive achievements and challenges. The transcript should be around 2000-3000 words.`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "No transcript generated";
    } catch (error) {
      throw new Error(`Failed to generate earnings call transcript: ${error.message}`);
    }
  }

  async summarizeTranscript(transcriptText: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a financial analyst. Provide a concise summary of the earnings call transcript, highlighting key financial metrics, strategic initiatives, and outlook."
          },
          {
            role: "user",
            content: `Summarize this earnings call transcript in 3-4 paragraphs, focusing on the most important financial and strategic points:

${transcriptText}`
          }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || "No summary available";
    } catch (error) {
      throw new Error(`Failed to summarize transcript: ${error.message}`);
    }
  }
}

export const openaiService = new OpenAIService();
