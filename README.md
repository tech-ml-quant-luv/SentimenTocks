# SentimenTocks

A comprehensive NSE stock analysis application with AI-powered sentiment analysis and real-time market data intelligence.

## 🚀 Features

- **Real-time Stock Data**: Live NSE stock prices via yfinance
- **Autocomplete Search**: Smart search with keyboard navigation
- **Sentiment Analysis**: AI-powered earnings call analysis using OpenAI GPT-4
- **Historical Charts**: Interactive price charts with multiple timeframes
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Earnings Call Transcripts**: Generate and analyze earnings call transcripts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for data fetching and caching
- **shadcn/ui** components with Tailwind CSS
- **Theme System** with dark/light mode support

### Backend (FastAPI + Python)
- **FastAPI** with async/await support
- **yfinance** for real NSE stock data
- **OpenAI API** for sentiment analysis
- **Pydantic** models for data validation
- **CORS** enabled for frontend integration

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, FastAPI, uvicorn
- **Data**: yfinance, pandas
- **AI**: OpenAI GPT-4
- **Charts**: Plotly.js
- **State Management**: TanStack Query

## 🚀 Deployment Options

### 1. Railway (Recommended)
- Supports Python + React in one repository
- Built-in PostgreSQL database
- Automatic HTTPS and custom domains
- Environment variable management

### 2. Render
- Free tier with limitations
- Supports background services
- Easy GitHub integration
- Built-in SSL certificates

### 3. Vercel + Railway
- Vercel for frontend (React)
- Railway for backend (FastAPI)
- Split deployment for optimal performance

### 4. Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

## 📦 Installation & Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
npm install
npm run build
```

## 🌐 API Endpoints

### Stock Data
- `GET /api/stocks/{symbol}` - Get current stock data
- `GET /api/stocks/{symbol}/history?period=1D` - Historical data
- `GET /api/stocks/search/{query}` - Search stocks
- `GET /api/stocks/recent` - Recent analyses

### Sentiment Analysis
- `POST /api/stocks/{symbol}/analyze` - Analyze transcript
- `GET /api/stocks/{symbol}/sentiment` - Get sentiment data

### Earnings Calls
- `GET /api/stocks/{symbol}/earnings/latest` - Latest transcript
- `POST /api/stocks/{symbol}/earnings/generate` - Generate transcript

## 📊 Stock Symbols Supported

Supports all major NSE stocks including:
- RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK
- BHARTIARTL, KOTAKBANK, LT, ASIANPAINT, MARUTI
- And many more...

## 🎯 Key Features

1. **Real-time Data**: Authentic NSE stock prices from yfinance
2. **Smart Search**: Autocomplete with keyboard navigation
3. **AI Analysis**: OpenAI-powered sentiment analysis
4. **Responsive Design**: Works on all devices
5. **Theme Support**: Dark/light mode with system detection
6. **Performance**: Optimized with caching and efficient queries

## 🔒 Security

- CORS configuration for secure frontend-backend communication
- Environment variables for sensitive data
- Input validation with Pydantic models
- Error handling and logging

## 📈 Performance

- Data caching for 5 minutes to reduce API calls
- Efficient queries with TanStack Query
- Lazy loading and code splitting
- Optimized bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] Portfolio tracking
- [ ] Advanced charting features
- [ ] Mobile app version
- [ ] Real-time notifications

---

Built with ❤️ for the Indian stock market community.