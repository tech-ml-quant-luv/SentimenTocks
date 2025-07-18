import { stockData, sentimentAnalysis, earningsCallTranscripts, type StockData, type InsertStockData, type SentimentAnalysis, type InsertSentimentAnalysis, type EarningsCallTranscript, type InsertEarningsCallTranscript } from "@shared/schema";

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

export interface IStorage {
  // Stock data methods
  getStockData(symbol: string): Promise<StockData | undefined>;
  createOrUpdateStockData(data: InsertStockData): Promise<StockData>;
  getAllStockData(): Promise<StockData[]>;
  
  // Fundamental data methods
  getFundamentalData(stockSymbol: string): Promise<FundamentalData | undefined>;
  createOrUpdateFundamentalData(data: Partial<FundamentalData>): Promise<FundamentalData>;
  
  // Sentiment analysis methods
  getSentimentAnalysis(stockSymbol: string): Promise<SentimentAnalysis | undefined>;
  createSentimentAnalysis(data: InsertSentimentAnalysis): Promise<SentimentAnalysis>;
  
  // Earnings call transcript methods
  getEarningsCallTranscript(stockSymbol: string, quarter: string, year: string): Promise<EarningsCallTranscript | undefined>;
  createEarningsCallTranscript(data: InsertEarningsCallTranscript): Promise<EarningsCallTranscript>;
  getLatestEarningsCallTranscript(stockSymbol: string): Promise<EarningsCallTranscript | undefined>;
}

export class MemStorage implements IStorage {
  private stockDataMap: Map<string, StockData>;
  private fundamentalDataMap: Map<string, FundamentalData>;
  private sentimentAnalysisMap: Map<string, SentimentAnalysis>;
  private earningsCallTranscriptsMap: Map<string, EarningsCallTranscript>;
  private currentStockId: number;
  private currentFundamentalId: number;
  private currentSentimentId: number;
  private currentTranscriptId: number;

  constructor() {
    this.stockDataMap = new Map();
    this.fundamentalDataMap = new Map();
    this.sentimentAnalysisMap = new Map();
    this.earningsCallTranscriptsMap = new Map();
    this.currentStockId = 1;
    this.currentFundamentalId = 1;
    this.currentSentimentId = 1;
    this.currentTranscriptId = 1;
  }

  async getStockData(symbol: string): Promise<StockData | undefined> {
    return this.stockDataMap.get(symbol.toUpperCase());
  }

  async createOrUpdateStockData(data: InsertStockData): Promise<StockData> {
    const symbol = data.symbol.toUpperCase();
    const existing = this.stockDataMap.get(symbol);
    
    const stockData: StockData = {
      id: existing?.id || this.currentStockId++,
      ...data,
      symbol,
      marketCap: data.marketCap || null,
      peRatio: data.peRatio || null,
      lastUpdated: new Date(),
    };
    
    this.stockDataMap.set(symbol, stockData);
    return stockData;
  }

  async getAllStockData(): Promise<StockData[]> {
    return Array.from(this.stockDataMap.values())
      .sort((a, b) => (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0));
  }

  async getFundamentalData(stockSymbol: string): Promise<FundamentalData | undefined> {
    return this.fundamentalDataMap.get(stockSymbol.toUpperCase());
  }

  async createOrUpdateFundamentalData(data: Partial<FundamentalData>): Promise<FundamentalData> {
    const symbol = data.stockSymbol!.toUpperCase();
    const existing = this.fundamentalDataMap.get(symbol);
    
    const fundamentalData: FundamentalData = {
      id: existing?.id || this.currentFundamentalId++,
      stockSymbol: symbol,
      marketCap: data.marketCap || 0,
      peRatio: data.peRatio || 0,
      pegRatio: data.pegRatio || 0,
      bookValue: data.bookValue || 0,
      dividendYield: data.dividendYield || 0,
      roe: data.roe || 0,
      debtToEquity: data.debtToEquity || 0,
      currentRatio: data.currentRatio || 0,
      revenueGrowth: data.revenueGrowth || 0,
      profitMargin: data.profitMargin || 0,
      operatingMargin: data.operatingMargin || 0,
      eps: data.eps || 0,
      priceToBook: data.priceToBook || 0,
      priceToSales: data.priceToSales || 0,
      quickRatio: data.quickRatio || 0,
      interestCoverage: data.interestCoverage || 0,
      assetTurnover: data.assetTurnover || 0,
      returnOnAssets: data.returnOnAssets || 0,
      lastUpdated: new Date(),
    };
    
    this.fundamentalDataMap.set(symbol, fundamentalData);
    return fundamentalData;
  }

  async getSentimentAnalysis(stockSymbol: string): Promise<SentimentAnalysis | undefined> {
    return this.sentimentAnalysisMap.get(stockSymbol.toUpperCase());
  }

  async createSentimentAnalysis(data: InsertSentimentAnalysis): Promise<SentimentAnalysis> {
    const sentiment: SentimentAnalysis = {
      id: this.currentSentimentId++,
      ...data,
      stockSymbol: data.stockSymbol.toUpperCase(),
      keyHighlights: data.keyHighlights as string[] | null,
      riskFactors: data.riskFactors as string[] | null,
      createdAt: new Date(),
    };
    
    this.sentimentAnalysisMap.set(data.stockSymbol.toUpperCase(), sentiment);
    return sentiment;
  }

  async getEarningsCallTranscript(stockSymbol: string, quarter: string, year: string): Promise<EarningsCallTranscript | undefined> {
    const key = `${stockSymbol.toUpperCase()}-${quarter}-${year}`;
    return this.earningsCallTranscriptsMap.get(key);
  }

  async createEarningsCallTranscript(data: InsertEarningsCallTranscript): Promise<EarningsCallTranscript> {
    const transcript: EarningsCallTranscript = {
      id: this.currentTranscriptId++,
      ...data,
      stockSymbol: data.stockSymbol.toUpperCase(),
      speakers: data.speakers as Array<{name: string, role: string}> | null,
      createdAt: new Date(),
    };
    
    const key = `${data.stockSymbol.toUpperCase()}-${data.quarter}-${data.year}`;
    this.earningsCallTranscriptsMap.set(key, transcript);
    return transcript;
  }

  async getLatestEarningsCallTranscript(stockSymbol: string): Promise<EarningsCallTranscript | undefined> {
    const transcripts = Array.from(this.earningsCallTranscriptsMap.values())
      .filter(t => t.stockSymbol === stockSymbol.toUpperCase())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return transcripts[0];
  }
}

export const storage = new MemStorage();
