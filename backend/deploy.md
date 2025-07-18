# FastAPI Backend Deployment Guide

## Overview
This FastAPI backend replaces the Node.js/Express backend and integrates yfinance directly for real NSE stock data.

## Local Development

### Option 1: Direct Python execution
```bash
cd backend
python main.py
```

### Option 2: Using uvicorn directly
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Production Deployment

### Railway Deployment
1. Create a new Railway project
2. Connect your GitHub repository
3. Add environment variables:
   - `OPENAI_API_KEY=your_openai_key`
   - `PORT=5000`
4. Set the start command: `cd backend && python main.py`
5. Deploy

### Render Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `cd backend && pip install -r requirements.txt`
4. Set the start command: `cd backend && python main.py`
5. Add environment variables:
   - `OPENAI_API_KEY=your_openai_key`
6. Deploy

### Docker Deployment
```bash
# Build the Docker image
docker build -t nse-stock-analysis ./backend

# Run the container
docker run -p 5000:5000 -e OPENAI_API_KEY=your_key nse-stock-analysis
```

### Docker Compose Deployment
```bash
# Start both frontend and backend
docker-compose up -d
```

## API Endpoints

### Stock Data
- `GET /api/stocks/{symbol}` - Get stock data
- `GET /api/stocks/{symbol}/history?period=1D` - Get historical data
- `GET /api/stocks/search/{query}` - Search stocks
- `GET /api/stocks/recent` - Get recent analyses

### Sentiment Analysis
- `POST /api/stocks/{symbol}/analyze` - Analyze sentiment
- `GET /api/stocks/{symbol}/sentiment` - Get sentiment analysis

### Earnings Calls
- `GET /api/stocks/{symbol}/earnings/{quarter}/{year}` - Get transcript
- `GET /api/stocks/{symbol}/earnings/latest` - Get latest transcript
- `POST /api/stocks/{symbol}/earnings/generate` - Generate transcript

### Health Check
- `GET /health` - Health check endpoint

## Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for sentiment analysis
- `PORT` - Server port (default: 5000)

## Key Features
- Real-time NSE stock data via yfinance
- OpenAI-powered sentiment analysis
- Earnings call transcript generation
- CORS enabled for frontend integration
- In-memory data storage (can be extended to database)
- Comprehensive error handling
- Health check endpoint for deployment monitoring