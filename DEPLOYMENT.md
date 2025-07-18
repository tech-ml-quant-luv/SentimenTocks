# SentimenTocks Deployment Guide

## Netlify Deployment

SentimenTocks is ready for deployment on Netlify with serverless functions. Here's how to deploy:

### Prerequisites
- GitHub account
- Netlify account
- OpenAI API key (for sentiment analysis and transcript generation)

### Quick Deploy Steps

1. **Push to GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SentimenTocks"
   git remote add origin https://github.com/your-username/sentimentocks.git
   git push -u origin main
   ```

2. **Deploy to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify will automatically detect the build settings from `netlify.toml`

3. **Environment Variables**
   In your Netlify dashboard, go to Site settings → Environment variables and add:
   - `OPENAI_API_KEY`: Your OpenAI API key

### Build Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build:netlify`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Redirects for SPA routing and API functions

### Serverless Functions

The application includes three Netlify functions:

1. **`stocks.js`** - Handles all stock-related endpoints:
   - `/api/stocks/{symbol}` - Get stock data
   - `/api/stocks/{symbol}/history` - Get historical data
   - `/api/stocks/{symbol}/fundamentals` - Get fundamental analysis
   - `/api/stocks/search/{query}` - Search stocks
   - `/api/stocks/recent` - Get recent analyses

2. **`openai.js`** - Sentiment analysis:
   - `/api/openai/analyze` - Analyze earnings call transcripts

3. **`generate-transcript.js`** - Transcript generation:
   - `/api/generate-transcript` - Generate earnings call transcripts

### Features Available on Netlify

✅ **Full Frontend Functionality**
- Stock search and selection
- Price charts and historical data
- Fundamental analysis with color-coded metrics
- Responsive design for mobile and desktop

✅ **Core Backend Features**
- Stock data retrieval (mock data for reliable demo)
- Fundamental analysis calculations
- Earnings transcript generation (with OpenAI)
- Sentiment analysis (with OpenAI)

✅ **AI-Powered Features**
- Real-time transcript generation
- Comprehensive sentiment analysis
- Key highlights and risk factor extraction

### Data Sources

**For Netlify deployment:**
- Stock data: Curated mock data for demonstration
- Fundamental metrics: Realistic financial ratios
- Earnings transcripts: AI-generated using OpenAI
- Sentiment analysis: Real-time AI analysis

This approach ensures:
- Fast, reliable performance
- No external API dependencies for core functionality
- Demonstration of all features without rate limits
- Real AI analysis capabilities

### Post-Deployment

Once deployed, your application will be available at:
`https://your-site-name.netlify.app`

The application includes:
- Homepage with Reliance as default stock
- Full fundamental analysis section
- AI-powered earnings call analysis
- Mobile-responsive design
- Real-time sentiment scoring

### Monitoring

Monitor your deployment through:
- Netlify Dashboard: Build logs and deployment status
- Function logs: Serverless function execution
- OpenAI usage: API calls and token consumption

### Scaling

For production use, consider:
- Upgrading to Netlify Pro for higher function limits
- Implementing caching for frequently accessed data
- Adding error monitoring and analytics
- Connecting to a database for persistent storage

## Alternative Deployment Options

### Replit Deployments
- Click "Deploy" in Replit
- Choose "Replit Deployments"
- Includes full backend with Python yfinance service

### Vercel
- Similar to Netlify with serverless functions
- Requires adapting functions to Vercel's API format

### Traditional Hosting
- Use `npm run build` to create production build
- Deploy to any static hosting service
- Requires separate backend hosting for full functionality