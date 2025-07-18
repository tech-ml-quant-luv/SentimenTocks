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
    const { stockSymbol, quarter, year } = JSON.parse(event.body);
    
    if (!stockSymbol || !quarter || !year) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Stock symbol, quarter, and year are required' })
      };
    }

    // Generate earnings call transcript using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a financial analyst creating realistic earnings call transcripts. Generate a comprehensive earnings call transcript for the specified Indian NSE stock, quarter, and year. The transcript should include realistic financial metrics, guidance, and management commentary typical for that company and time period.

Include:
- CEO opening remarks
- CFO financial highlights
- Q&A session with analysts
- Forward-looking statements
- Realistic financial metrics and growth numbers
- Industry-specific challenges and opportunities

Make it sound authentic and professional, around 800-1000 words.`
        },
        {
          role: "user",
          content: `Generate an earnings call transcript for ${stockSymbol} for ${quarter} ${year}. Make it realistic and comprehensive.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const transcript = response.choices[0].message.content;
    
    // Return the generated transcript
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: 1,
        stockSymbol: stockSymbol,
        quarter: quarter,
        year: year,
        transcript: transcript,
        createdAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('OpenAI Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: `Transcript generation failed: ${error.message}` })
    };
  }
};