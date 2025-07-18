const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  const { httpMethod, path } = event;
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { transcript, symbol } = JSON.parse(event.body);
    
    if (!transcript || !symbol) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Transcript and symbol are required' })
      };
    }

    // Analyze sentiment using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a financial sentiment analyst. Analyze the earnings call transcript and provide a comprehensive sentiment analysis. Return JSON in this exact format:
          {
            "sentimentScore": number (1-10 scale),
            "positiveCount": number,
            "neutralCount": number,
            "negativeCount": number,
            "confidence": number (0-1),
            "summary": "brief summary",
            "keyHighlights": ["highlight1", "highlight2"],
            "riskFactors": ["risk1", "risk2"]
          }`
        },
        {
          role: "user",
          content: `Analyze this earnings call transcript for ${symbol}:\n\n${transcript}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);
    
    // Return the sentiment analysis
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: 1,
        stockSymbol: symbol,
        transcriptText: transcript,
        sentimentScore: analysisResult.sentimentScore,
        positiveCount: analysisResult.positiveCount,
        neutralCount: analysisResult.neutralCount,
        negativeCount: analysisResult.negativeCount,
        confidence: analysisResult.confidence,
        summary: analysisResult.summary,
        keyHighlights: analysisResult.keyHighlights,
        riskFactors: analysisResult.riskFactors,
        createdAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('OpenAI Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: `Analysis failed: ${error.message}` })
    };
  }
};