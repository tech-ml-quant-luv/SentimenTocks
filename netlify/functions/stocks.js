const fetch = require('node-fetch');

// Mock NSE data for Netlify (since we can't run Python service)
const mockStockData = {
  "RELIANCE": {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    price: 2456.75,
    openPrice: 2450.00,
    highPrice: 2475.50,
    lowPrice: 2445.25,
    volume: "1.25Cr",
    change: 6.75,
    changePercent: 0.28,
    marketCap: "₹16.6L Cr",
    peRatio: 15.8
  },
  "TCS": {
    symbol: "TCS",
    name: "Tata Consultancy Services Limited",
    price: 3845.20,
    openPrice: 3830.00,
    highPrice: 3865.75,
    lowPrice: 3825.10,
    volume: "45.2L",
    change: 15.20,
    changePercent: 0.40,
    marketCap: "₹14.1L Cr",
    peRatio: 28.4
  },
  "INFY": {
    symbol: "INFY",
    name: "Infosys Limited",
    price: 1735.90,
    openPrice: 1740.00,
    highPrice: 1748.25,
    lowPrice: 1728.50,
    volume: "32.8L",
    change: -4.10,
    changePercent: -0.24,
    marketCap: "₹7.2L Cr",
    peRatio: 26.7
  },
  "HDFCBANK": {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    price: 1625.45,
    openPrice: 1630.00,
    highPrice: 1635.80,
    lowPrice: 1618.20,
    volume: "78.5L",
    change: -4.55,
    changePercent: -0.28,
    marketCap: "₹12.4L Cr",
    peRatio: 18.9
  },
  "ICICIBANK": {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    price: 1105.30,
    openPrice: 1110.00,
    highPrice: 1115.75,
    lowPrice: 1098.40,
    volume: "65.2L",
    change: -4.70,
    changePercent: -0.42,
    marketCap: "₹7.8L Cr",
    peRatio: 16.2
  }
};

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

  try {
    // Parse the path to get the route
    const pathParts = path.split('/').filter(p => p);
    const route = pathParts.slice(2).join('/'); // Remove 'api' and 'stocks'
    
    // Get stock data
    if (httpMethod === 'GET' && route.match(/^[A-Z]+$/)) {
      const symbol = route.toUpperCase();
      const stockData = mockStockData[symbol];
      
      if (!stockData) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: `Stock data not found for symbol: ${symbol}` })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 1,
          ...stockData
        })
      };
    }
    
    // Search stocks
    if (httpMethod === 'GET' && route.startsWith('search/')) {
      const query = route.split('/')[1].toUpperCase();
      const results = Object.values(mockStockData)
        .filter(stock => 
          stock.symbol.includes(query) || 
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name
        }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(results)
      };
    }
    
    // Get historical data
    if (httpMethod === 'GET' && route.includes('/history')) {
      const symbol = route.split('/')[0].toUpperCase();
      const stockData = mockStockData[symbol];
      
      if (!stockData) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: `Stock data not found for symbol: ${symbol}` })
        };
      }
      
      // Generate mock historical data
      const currentPrice = stockData.price;
      const data = [];
      
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const variation = (Math.random() - 0.5) * 0.1;
        const price = currentPrice * (1 + variation);
        
        data.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(price * 100) / 100
        });
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }
    
    // Get recent stocks
    if (httpMethod === 'GET' && route === 'recent') {
      const recentStocks = Object.values(mockStockData).slice(0, 5);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(recentStocks)
      };
    }
    
    // Sentiment analysis (mock response)
    if (httpMethod === 'GET' && route.includes('/sentiment')) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "No sentiment analysis found" })
      };
    }
    
    // Earnings calls (mock response)
    if (httpMethod === 'GET' && route.includes('/earnings')) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "No earnings call transcript found" })
      };
    }

    // Fundamentals analysis
    if (httpMethod === 'GET' && route.includes('/fundamentals')) {
      const symbol = route.split('/')[0].toUpperCase();
      
      // Mock fundamental data for Netlify deployment
      const fundamentalData = {
        "RELIANCE": {
          marketCap: 1820000000000,
          peRatio: 28.5,
          pegRatio: 1.2,
          bookValue: 1120.5,
          dividendYield: 0.35,
          roe: 15.2,
          debtToEquity: 0.18,
          currentRatio: 1.85,
          revenueGrowth: 12.5,
          profitMargin: 8.2,
          operatingMargin: 11.8,
          eps: 89.5,
          priceToBook: 2.54,
          priceToSales: 1.8,
          quickRatio: 1.65,
          interestCoverage: 8.5,
          assetTurnover: 0.75,
          returnOnAssets: 11.4,
        },
        "TCS": {
          marketCap: 1420000000000,
          peRatio: 24.8,
          pegRatio: 1.8,
          bookValue: 78.2,
          dividendYield: 3.2,
          roe: 45.6,
          debtToEquity: 0.05,
          currentRatio: 3.2,
          revenueGrowth: 15.8,
          profitMargin: 19.5,
          operatingMargin: 23.8,
          eps: 145.2,
          priceToBook: 12.5,
          priceToSales: 8.2,
          quickRatio: 3.1,
          interestCoverage: 45.2,
          assetTurnover: 1.85,
          returnOnAssets: 38.9,
        }
      };

      const defaultFundamentals = {
        marketCap: 150000000000,
        peRatio: 22.5,
        pegRatio: 1.5,
        bookValue: 500.0,
        dividendYield: 1.8,
        roe: 12.5,
        debtToEquity: 0.35,
        currentRatio: 1.5,
        revenueGrowth: 8.5,
        profitMargin: 6.8,
        operatingMargin: 9.2,
        eps: 45.2,
        priceToBook: 3.2,
        priceToSales: 2.8,
        quickRatio: 1.3,
        interestCoverage: 6.5,
        assetTurnover: 1.1,
        returnOnAssets: 8.9,
      };

      const data = fundamentalData[symbol] || defaultFundamentals;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 1,
          stockSymbol: symbol,
          ...data,
          lastUpdated: new Date().toISOString()
        })
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};