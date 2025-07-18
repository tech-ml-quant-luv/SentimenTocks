# SentimenTocks

## Overview

SentimenTocks is a full-stack NSE (National Stock Exchange) stock analysis platform that combines real-time market data with AI-powered sentiment intelligence. Users can search for Indian stock symbols and access comprehensive stock data, sentiment analysis, and earnings call insights. The application provides real-time stock quotes, historical data visualization, and AI-powered sentiment analysis of earnings call transcripts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
- **Client**: React frontend with TypeScript and Vite
- **Backend**: FastAPI with Python (converted from Node.js/Express)
- **Shared**: Common schemas and types used by both client and server
- **Database**: In-memory storage with PostgreSQL support ready

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Python, FastAPI, uvicorn
- **Data Source**: yfinance library for real NSE stock data
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Plotly.js for data visualization
- **AI**: OpenAI API for sentiment analysis

## Key Components

### Database Schema
The application uses three main database tables:
- **stock_data**: Stores real-time stock information including price, volume, market cap, and P/E ratio
- **sentiment_analysis**: Stores AI-generated sentiment analysis results from earnings call transcripts
- **earnings_call_transcripts**: Stores earnings call transcripts with metadata

### Backend Services
- **FastAPI Backend**: Unified Python backend with integrated yfinance for real NSE stock data
- **OpenAI Service**: Processes earnings call transcripts and generates sentiment analysis using GPT-4
- **Storage Layer**: In-memory storage with Pydantic models (easily extensible to PostgreSQL)
- **yfinance Integration**: Direct integration for authentic NSE stock data from Yahoo Finance
- **Default Data**: Pre-loaded Reliance Q4 2025 earnings data for homepage, all other stocks fetch real-time data

### Frontend Features
- **Stock Search**: Search for NSE stocks by symbol
- **Stock Overview**: Display current price, change, volume, and key metrics
- **Price Charts**: Interactive historical price charts with multiple time periods
- **Sentiment Analysis**: Visual representation of sentiment scores from earnings calls
- **Earnings Call Viewer**: Display and analyze earnings call transcripts

## Data Flow

1. **Homepage**: Reliance loads as default with pre-stored Q4 2025 earnings data and sentiment analysis
2. **User Input**: User searches for other stock symbols through the search interface
3. **Stock Data Fetch**: FastAPI backend fetches current stock data directly from yfinance
4. **Real-time Earnings**: All stocks except Reliance fetch earnings data in real-time from APIs
5. **Data Caching**: Stock data is cached for 5 minutes to reduce API calls
6. **Sentiment Analysis**: If earnings call data exists, OpenAI analyzes transcript sentiment
7. **Historical Data**: Historical price data is fetched directly from yfinance
8. **Real-time Updates**: Frontend uses React Query for efficient data fetching and caching

## External Dependencies

### API Integrations
- **NSE API**: For real-time stock data (currently mocked)
- **OpenAI API**: For sentiment analysis of earnings call transcripts
- **Plotly.js**: For interactive charts and data visualization

### Database
- **PostgreSQL**: Primary database using Neon Database serverless
- **Drizzle ORM**: Type-safe database queries and migrations

### UI Components
- **shadcn/ui**: Comprehensive component library based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Vite**: Fast development server with hot module replacement
- **Express**: Backend development server with automatic reloading
- **Python Service**: yfinance service for real stock data
- **Environment Variables**: Separate configurations for database and API keys

### Production Build Options

#### Netlify Deployment (Recommended)
- **Static Site**: Vite builds optimized static assets
- **Serverless Functions**: Three functions handle all backend logic
- **AI Integration**: OpenAI for sentiment analysis and transcript generation
- **Mock Data**: Curated stock data for reliable demo performance
- **Configuration**: Pre-configured `netlify.toml` with all settings

#### Replit Deployments
- **Full Backend**: Express server with Python yfinance service
- **Real Data**: Live stock data from Yahoo Finance
- **Database**: PostgreSQL with Drizzle ORM
- **Environment**: Complete development environment

#### Traditional Hosting
- **Static Assets**: Build with `npm run build`
- **Backend Required**: Separate hosting for API endpoints
- **Database**: PostgreSQL or in-memory storage

### Environment Configuration
- **OPENAI_API_KEY**: OpenAI API key for sentiment analysis and transcript generation
- **DATABASE_URL**: PostgreSQL connection string (optional)
- **NODE_ENV**: Environment mode (development/production)

### Recent Updates (July 2025)
- Added comprehensive fundamental analysis section
- Implemented Netlify serverless functions for full backend
- Created deployment guide with multiple hosting options
- Fixed all API endpoint errors and network issues
- Added real-time transcript generation with OpenAI
- Integrated color-coded financial health indicators

The application is now ready for immediate deployment on Netlify with full functionality, or can be deployed on Replit for development with real data sources.