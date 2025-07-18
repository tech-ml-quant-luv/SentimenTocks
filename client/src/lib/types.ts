export interface StockData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: string;
  change: number;
  changePercent: number;
  marketCap?: string;
  peRatio?: number;
  lastUpdated?: Date;
}

export interface SentimentAnalysis {
  id: number;
  stockSymbol: string;
  transcriptText: string;
  sentimentScore: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  confidence: number;
  summary: string;
  keyHighlights?: string[];
  riskFactors?: string[];
  createdAt?: Date;
}

export interface EarningsCallTranscript {
  id: number;
  stockSymbol: string;
  quarter: string;
  year: string;
  transcript: string;
  speakers?: Array<{name: string, role: string}>;
  createdAt?: Date;
}

export interface HistoricalData {
  date: string;
  price: number;
}

export interface TranscriptSegment {
  speaker: string;
  role: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface FundamentalData {
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
