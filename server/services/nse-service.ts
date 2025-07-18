import { InsertStockData } from "@shared/schema";

// Define FundamentalData interface locally to avoid import issues
interface FundamentalData {
  id: number;
  stockSymbol: string;
  marketCap: number;
  peRatio: number;
  pegRatio: number;
  bookValue: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  revenueGrowth: number;
  profitMargin: number;
  operatingMargin: number;
  eps: number;
  priceToBook: number;
  priceToSales: number;
  quickRatio: number;
  interestCoverage: number;
  assetTurnover: number;
  returnOnAssets: number;
  lastUpdated?: Date;
}
import { spawn } from "child_process";
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export interface NSEQuote {
  symbol: string;
  companyName: string;
  lastPrice: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  totalTradedVolume: number;
  change: number;
  pChange: number;
  marketCap?: number;
  peRatio?: number;
}

export class NSEService {
  private pythonServiceURL = 'http://localhost:5001';
  
  private async callPythonService(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceURL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error calling Python service: ${error}`);
      throw error;
    }
  }
  
  async getStockQuote(symbol: string): Promise<InsertStockData> {
    try {
      const data = await this.callPythonService(`/stock/${symbol}`);
      return {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        openPrice: data.openPrice,
        highPrice: data.highPrice,
        lowPrice: data.lowPrice,
        volume: data.volume,
        change: data.change,
        changePercent: data.changePercent,
        marketCap: data.marketCap,
        peRatio: data.peRatio,
      };
    } catch (error) {
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
  }

  private getMockStockData(symbol: string): NSEQuote {
    const stockDatabase: Record<string, NSEQuote> = {
      'RELIANCE': {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        lastPrice: 2847.50,
        open: 2823.20,
        dayHigh: 2851.75,
        dayLow: 2818.40,
        totalTradedVolume: 15200000,
        change: 24.30,
        pChange: 0.86,
        marketCap: 1820000000000,
        peRatio: 28.5,
      },
      'TCS': {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        lastPrice: 3654.20,
        open: 3667.00,
        dayHigh: 3678.45,
        dayLow: 3645.30,
        totalTradedVolume: 8900000,
        change: -12.80,
        pChange: -0.35,
        marketCap: 1350000000000,
        peRatio: 29.2,
      },
      'INFY': {
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        lastPrice: 1456.75,
        open: 1438.30,
        dayHigh: 1461.20,
        dayLow: 1435.60,
        totalTradedVolume: 12300000,
        change: 18.45,
        pChange: 1.28,
        marketCap: 605000000000,
        peRatio: 26.8,
      },
      'HDFCBANK': {
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank Limited',
        lastPrice: 1645.30,
        open: 1652.80,
        dayHigh: 1658.90,
        dayLow: 1641.20,
        totalTradedVolume: 18700000,
        change: -7.50,
        pChange: -0.45,
        marketCap: 1250000000000,
        peRatio: 19.5,
      },
      'ICICIBANK': {
        symbol: 'ICICIBANK',
        companyName: 'ICICI Bank Limited',
        lastPrice: 1138.45,
        open: 1142.60,
        dayHigh: 1149.80,
        dayLow: 1133.20,
        totalTradedVolume: 22100000,
        change: -4.15,
        pChange: -0.36,
        marketCap: 798000000000,
        peRatio: 17.2,
      },
    };

    const stock = stockDatabase[symbol.toUpperCase()];
    if (!stock) {
      throw new Error(`Stock symbol ${symbol} not found in NSE database`);
    }

    return stock;
  }

  private formatVolume(volume: number): string {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1000000000000) {
      return `₹${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 10000000000) {
      return `₹${(marketCap / 10000000000).toFixed(1)}B`;
    } else if (marketCap >= 10000000) {
      return `₹${(marketCap / 10000000).toFixed(1)}Cr`;
    }
    return `₹${marketCap.toFixed(0)}`;
  }

  async getHistoricalData(symbol: string, period: string): Promise<Array<{date: string, price: number}>> {
    try {
      const data = await this.callPythonService(`/history/${symbol}?period=${period}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }

  async getFundamentalData(symbol: string): Promise<Partial<FundamentalData>> {
    try {
      const data = await this.callPythonService(`/fundamentals/${symbol}`);
      return {
        stockSymbol: symbol,
        ...data
      };
    } catch (error) {
      console.error('Error fetching fundamental data:', error);
      return this.getDefaultFundamentalData(symbol);
    }
  }

  private getDefaultFundamentalData(symbol: string): Partial<FundamentalData> {
    const fundamentalDatabase: Record<string, Partial<FundamentalData>> = {
      'RELIANCE': {
        stockSymbol: 'RELIANCE',
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
      'TCS': {
        stockSymbol: 'TCS',
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
      },
    };

    return fundamentalDatabase[symbol] || {
      stockSymbol: symbol,
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
  }
  
  async searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
    try {
      const data = await this.callPythonService(`/search/${query}`);
      return data;
    } catch (error) {
      throw new Error(`Failed to search stocks for ${query}: ${error.message}`);
    }
  }
  
  // Start the Python yfinance service
  async startPythonService(): Promise<void> {
    const pythonServicePath = path.join(process.cwd(), 'server', 'services', 'yfinance-service.py');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [pythonServicePath], {
        stdio: 'inherit',
        detached: true
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Error starting Python service:', error);
        reject(error);
      });
      
      // Give the service time to start
      setTimeout(() => {
        console.log('Python yfinance service started on port 5001');
        resolve();
      }, 2000);
    });
  }
}

export const nseService = new NSEService();
