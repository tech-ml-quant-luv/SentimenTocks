from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from typing import List, Optional, Dict, Any
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json
from pydantic import BaseModel
import os
from openai import OpenAI
import asyncio
from contextlib import asynccontextmanager

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Pydantic models
class StockData(BaseModel):
    id: Optional[int] = None
    symbol: str
    name: str
    price: float
    openPrice: float
    highPrice: float
    lowPrice: float
    volume: str
    change: float
    changePercent: float
    marketCap: Optional[str] = None
    peRatio: Optional[float] = None
    createdAt: Optional[str] = None

class HistoricalData(BaseModel):
    date: str
    price: float

class StockSearch(BaseModel):
    symbol: str
    name: str

class SentimentAnalysis(BaseModel):
    id: Optional[int] = None
    stockSymbol: str
    transcriptText: str
    sentimentScore: float
    positiveCount: int
    neutralCount: int
    negativeCount: int
    confidence: float
    summary: str
    keyHighlights: List[str]
    riskFactors: List[str]
    createdAt: Optional[str] = None

class EarningsCallTranscript(BaseModel):
    id: Optional[int] = None
    stockSymbol: str
    quarter: str
    year: str
    transcript: str
    speakers: List[Dict[str, str]]
    createdAt: Optional[str] = None

class AnalyzeRequest(BaseModel):
    transcript: str

class EarningsGenerateRequest(BaseModel):
    quarter: str
    year: str

# In-memory storage
class MemoryStorage:
    def __init__(self):
        self.stock_data: Dict[str, StockData] = {}
        self.sentiment_analyses: Dict[str, SentimentAnalysis] = {}
        self.earnings_transcripts: Dict[str, List[EarningsCallTranscript]] = {}
        self.next_id = 1
    
    def get_next_id(self) -> int:
        current_id = self.next_id
        self.next_id += 1
        return current_id
    
    def store_stock_data(self, stock_data: StockData) -> StockData:
        if stock_data.id is None:
            stock_data.id = self.get_next_id()
        stock_data.createdAt = datetime.now().isoformat()
        self.stock_data[stock_data.symbol] = stock_data
        return stock_data
    
    def get_stock_data(self, symbol: str) -> Optional[StockData]:
        return self.stock_data.get(symbol)
    
    def get_all_stock_data(self) -> List[StockData]:
        return list(self.stock_data.values())
    
    def store_sentiment_analysis(self, sentiment: SentimentAnalysis) -> SentimentAnalysis:
        if sentiment.id is None:
            sentiment.id = self.get_next_id()
        sentiment.createdAt = datetime.now().isoformat()
        self.sentiment_analyses[sentiment.stockSymbol] = sentiment
        return sentiment
    
    def get_sentiment_analysis(self, symbol: str) -> Optional[SentimentAnalysis]:
        return self.sentiment_analyses.get(symbol)
    
    def store_earnings_transcript(self, transcript: EarningsCallTranscript) -> EarningsCallTranscript:
        if transcript.id is None:
            transcript.id = self.get_next_id()
        transcript.createdAt = datetime.now().isoformat()
        
        if transcript.stockSymbol not in self.earnings_transcripts:
            self.earnings_transcripts[transcript.stockSymbol] = []
        
        self.earnings_transcripts[transcript.stockSymbol].append(transcript)
        return transcript
    
    def get_earnings_transcript(self, symbol: str, quarter: str, year: str) -> Optional[EarningsCallTranscript]:
        transcripts = self.earnings_transcripts.get(symbol, [])
        for transcript in transcripts:
            if transcript.quarter == quarter and transcript.year == year:
                return transcript
        return None
    
    def get_latest_earnings_transcript(self, symbol: str) -> Optional[EarningsCallTranscript]:
        transcripts = self.earnings_transcripts.get(symbol, [])
        return transcripts[-1] if transcripts else None

# Global storage instance
storage = MemoryStorage()

# NSE stock symbols mapping
NSE_STOCKS = {
    'RELIANCE': 'RELIANCE.NS',
    'TCS': 'TCS.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'LT': 'LT.NS',
    'ASIANPAINT': 'ASIANPAINT.NS',
    'MARUTI': 'MARUTI.NS',
    'SBIN': 'SBIN.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'WIPRO': 'WIPRO.NS',
    'ULTRACEMCO': 'ULTRACEMCO.NS',
    'ONGC': 'ONGC.NS',
    'ADANIENT': 'ADANIENT.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'AXISBANK': 'AXISBANK.NS',
    'TITAN': 'TITAN.NS',
    'POWERGRID': 'POWERGRID.NS',
    'NTPC': 'NTPC.NS',
    'NESTLEIND': 'NESTLEIND.NS',
    'JSWSTEEL': 'JSWSTEEL.NS',
    'HINDALCO': 'HINDALCO.NS',
    'COALINDIA': 'COALINDIA.NS',
    'DRREDDY': 'DRREDDY.NS',
    'BAJAJFINSV': 'BAJAJFINSV.NS',
    'BRITANNIA': 'BRITANNIA.NS',
    'CIPLA': 'CIPLA.NS',
    'GRASIM': 'GRASIM.NS',
    'TECHM': 'TECHM.NS',
    'SUNPHARMA': 'SUNPHARMA.NS',
    'APOLLOHOSP': 'APOLLOHOSP.NS',
    'INDUSINDBK': 'INDUSINDBK.NS',
    'HCLTECH': 'HCLTECH.NS',
    'DIVISLAB': 'DIVISLAB.NS',
    'TATASTEEL': 'TATASTEEL.NS',
    'HEROMOTOCO': 'HEROMOTOCO.NS',
    'EICHERMOT': 'EICHERMOT.NS',
    'SHREECEM': 'SHREECEM.NS',
    'UPL': 'UPL.NS',
    'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
    'BPCL': 'BPCL.NS',
    'IOC': 'IOC.NS',
    'TATACONSUM': 'TATACONSUM.NS',
    'GODREJCP': 'GODREJCP.NS',
    'DABUR': 'DABUR.NS',
    'MCDOWELL-N': 'MCDOWELL-N.NS',
    'SIEMENS': 'SIEMENS.NS',
    'PGHH': 'PGHH.NS',
    'PIDILITIND': 'PIDILITIND.NS',
    'AMBUJACEM': 'AMBUJACEM.NS',
    'BANKBARODA': 'BANKBARODA.NS',
    'CANBK': 'CANBK.NS',
    'VEDL': 'VEDL.NS',
    'SAIL': 'SAIL.NS'
}

def get_nse_symbol(symbol: str) -> str:
    """Convert NSE symbol to Yahoo Finance format"""
    return NSE_STOCKS.get(symbol.upper(), f"{symbol.upper()}.NS")

def format_market_cap(market_cap: float) -> str:
    """Format market cap in Indian currency format"""
    if market_cap is None or pd.isna(market_cap):
        return None
    
    if market_cap >= 1000000000000:  # 1 trillion
        return f"₹{market_cap/1000000000000:.1f}T"
    elif market_cap >= 10000000000:  # 10 billion
        return f"₹{market_cap/10000000000:.1f}B"
    elif market_cap >= 10000000:  # 10 million (1 crore)
        return f"₹{market_cap/10000000:.1f}Cr"
    else:
        return f"₹{market_cap:.0f}"

def format_volume(volume: float) -> str:
    """Format volume in Indian format"""
    if volume is None or pd.isna(volume):
        return "0"
    
    if volume >= 10000000:  # 1 crore
        return f"{volume/10000000:.1f}Cr"
    elif volume >= 100000:  # 1 lakh
        return f"{volume/100000:.1f}L"
    elif volume >= 1000:  # 1 thousand
        return f"{volume/1000:.1f}K"
    else:
        return str(int(volume))

async def get_stock_data_from_yfinance(symbol: str) -> StockData:
    """Get stock data from yfinance"""
    try:
        yf_symbol = get_nse_symbol(symbol)
        stock = yf.Ticker(yf_symbol)
        
        # Get basic info
        info = stock.info
        
        # Get current price data
        hist = stock.history(period="2d")
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        current_data = hist.iloc[-1]
        previous_data = hist.iloc[-2] if len(hist) > 1 else current_data
        
        current_price = float(current_data['Close'])
        previous_close = float(previous_data['Close'])
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100
        
        # Get additional info
        market_cap = info.get('marketCap')
        pe_ratio = info.get('trailingPE')
        company_name = info.get('longName', info.get('shortName', symbol))
        
        stock_data = StockData(
            symbol=symbol.upper(),
            name=company_name,
            price=current_price,
            openPrice=float(current_data['Open']),
            highPrice=float(current_data['High']),
            lowPrice=float(current_data['Low']),
            volume=format_volume(current_data['Volume']),
            change=change,
            changePercent=change_percent,
            marketCap=format_market_cap(market_cap),
            peRatio=float(pe_ratio) if pe_ratio and not pd.isna(pe_ratio) else None
        )
        
        return storage.store_stock_data(stock_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")

async def get_historical_data_from_yfinance(symbol: str, period: str = "1D") -> List[HistoricalData]:
    """Get historical stock data from yfinance"""
    try:
        # Convert period to yfinance format
        period_map = {
            '1D': '1d',
            '1W': '5d',
            '1M': '1mo',
            '1Y': '1y'
        }
        yf_period = period_map.get(period, '1d')
        
        yf_symbol = get_nse_symbol(symbol)
        stock = yf.Ticker(yf_symbol)
        
        hist = stock.history(period=yf_period)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No historical data found for symbol {symbol}")
        
        data = []
        for date, row in hist.iterrows():
            data.append(HistoricalData(
                date=date.strftime('%Y-%m-%d'),
                price=float(row['Close'])
            ))
        
        return data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")

async def search_stocks(query: str) -> List[StockSearch]:
    """Search for stocks with autocomplete"""
    try:
        query = query.upper()
        matches = []
        
        for symbol in NSE_STOCKS.keys():
            if query in symbol:
                matches.append(StockSearch(
                    symbol=symbol,
                    name=symbol  # We can enhance this with actual company names
                ))
        
        # Limit to 10 results
        return matches[:10]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search stocks: {str(e)}")

async def analyze_sentiment_with_openai(transcript: str, symbol: str) -> SentimentAnalysis:
    """Analyze sentiment using OpenAI"""
    try:
        response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {
                    "role": "system",
                    "content": """You are a financial sentiment analyst. Analyze the earnings call transcript and provide a comprehensive sentiment analysis. Return JSON in this exact format:
                    {
                        "sentimentScore": number (1-10 scale),
                        "positiveCount": number,
                        "neutralCount": number,
                        "negativeCount": number,
                        "confidence": number (0-1),
                        "summary": "brief summary",
                        "keyHighlights": ["highlight1", "highlight2"],
                        "riskFactors": ["risk1", "risk2"]
                    }"""
                },
                {
                    "role": "user",
                    "content": f"Analyze this earnings call transcript for {symbol}:\n\n{transcript}"
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        analysis_result = json.loads(response.choices[0].message.content)
        
        sentiment = SentimentAnalysis(
            stockSymbol=symbol,
            transcriptText=transcript,
            sentimentScore=analysis_result["sentimentScore"],
            positiveCount=analysis_result["positiveCount"],
            neutralCount=analysis_result["neutralCount"],
            negativeCount=analysis_result["negativeCount"],
            confidence=analysis_result["confidence"],
            summary=analysis_result["summary"],
            keyHighlights=analysis_result["keyHighlights"],
            riskFactors=analysis_result["riskFactors"]
        )
        
        return storage.store_sentiment_analysis(sentiment)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

async def generate_earnings_transcript_with_openai(company_name: str, quarter: str, year: str) -> str:
    """Generate earnings call transcript using OpenAI"""
    try:
        response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {
                    "role": "system",
                    "content": f"""You are tasked with generating a realistic earnings call transcript for {company_name} for Q{quarter} {year}. 
                    Include:
                    - CEO opening remarks about quarterly performance
                    - CFO financial highlights (revenue, profit, margins)
                    - Key business developments and strategic initiatives
                    - Market challenges and opportunities
                    - Q&A session with analysts
                    - Forward-looking statements and guidance
                    
                    Make it sound professional and realistic, with specific financial metrics and business insights relevant to the Indian market and NSE-listed companies."""
                },
                {
                    "role": "user",
                    "content": f"Generate an earnings call transcript for {company_name} Q{quarter} {year} earnings call."
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        return response.choices[0].message.content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate transcript: {str(e)}")

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting FastAPI NSE Stock Analysis Server...")
    yield
    # Shutdown
    print("Shutting down FastAPI NSE Stock Analysis Server...")

# Create FastAPI app
app = FastAPI(
    title="NSE Stock Analysis API",
    description="A comprehensive NSE stock analysis API with sentiment analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
@app.get("/api/stocks/{symbol}", response_model=StockData)
async def get_stock(symbol: str):
    """Get stock data for a given symbol"""
    # Check if we have cached data
    cached_data = storage.get_stock_data(symbol.upper())
    if cached_data:
        # Check if data is less than 5 minutes old
        if cached_data.createdAt:
            created_time = datetime.fromisoformat(cached_data.createdAt)
            if datetime.now() - created_time < timedelta(minutes=5):
                return cached_data
    
    # Fetch fresh data from yfinance
    return await get_stock_data_from_yfinance(symbol)

@app.get("/api/stocks/{symbol}/history", response_model=List[HistoricalData])
async def get_stock_history(symbol: str, period: str = "1D"):
    """Get historical stock data"""
    return await get_historical_data_from_yfinance(symbol, period)

@app.get("/api/stocks/search/{query}", response_model=List[StockSearch])
async def search_stocks_endpoint(query: str):
    """Search for stocks"""
    return await search_stocks(query)

@app.get("/api/stocks/recent", response_model=List[StockData])
async def get_recent_stocks():
    """Get recent stock analyses"""
    recent_stocks = storage.get_all_stock_data()
    return recent_stocks[:10]

@app.post("/api/stocks/{symbol}/analyze", response_model=SentimentAnalysis)
async def analyze_stock_sentiment(symbol: str, request: AnalyzeRequest):
    """Analyze sentiment of earnings call transcript"""
    return await analyze_sentiment_with_openai(request.transcript, symbol.upper())

@app.get("/api/stocks/{symbol}/sentiment", response_model=SentimentAnalysis)
async def get_sentiment_analysis(symbol: str):
    """Get sentiment analysis for a stock"""
    sentiment = storage.get_sentiment_analysis(symbol.upper())
    if not sentiment:
        raise HTTPException(status_code=404, detail="No sentiment analysis found")
    return sentiment

@app.get("/api/stocks/{symbol}/earnings/{quarter}/{year}", response_model=EarningsCallTranscript)
async def get_earnings_transcript(symbol: str, quarter: str, year: str):
    """Get earnings call transcript"""
    transcript = storage.get_earnings_transcript(symbol.upper(), quarter, year)
    if not transcript:
        raise HTTPException(status_code=404, detail="No earnings call transcript found")
    return transcript

@app.get("/api/stocks/{symbol}/earnings/latest", response_model=EarningsCallTranscript)
async def get_latest_earnings_transcript(symbol: str):
    """Get latest earnings call transcript"""
    transcript = storage.get_latest_earnings_transcript(symbol.upper())
    if not transcript:
        raise HTTPException(status_code=404, detail="No earnings call transcript found")
    return transcript

@app.post("/api/stocks/{symbol}/earnings/generate", response_model=EarningsCallTranscript)
async def generate_earnings_transcript(symbol: str, request: EarningsGenerateRequest):
    """Generate earnings call transcript"""
    # Get company name from stock data
    stock_data = storage.get_stock_data(symbol.upper())
    if not stock_data:
        # Try to fetch from yfinance
        stock_data = await get_stock_data_from_yfinance(symbol)
    
    company_name = stock_data.name if stock_data else symbol
    
    transcript_text = await generate_earnings_transcript_with_openai(
        company_name, request.quarter, request.year
    )
    
    transcript = EarningsCallTranscript(
        stockSymbol=symbol.upper(),
        quarter=request.quarter,
        year=request.year,
        transcript=transcript_text,
        speakers=[
            {"name": "CEO", "role": "Chief Executive Officer"},
            {"name": "CFO", "role": "Chief Financial Officer"},
            {"name": "Analyst", "role": "Financial Analyst"}
        ]
    )
    
    return storage.store_earnings_transcript(transcript)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "nse-stock-analysis-api"}

# Serve static files (React app)
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")
    
    @app.get("/")
    async def serve_react_app():
        return FileResponse("dist/index.html")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        reload=True
    )