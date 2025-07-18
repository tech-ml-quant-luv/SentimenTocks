import { pgTable, text, serial, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stockData = pgTable("stock_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  openPrice: real("open_price").notNull(),
  highPrice: real("high_price").notNull(),
  lowPrice: real("low_price").notNull(),
  volume: text("volume").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  marketCap: text("market_cap"),
  peRatio: real("pe_ratio"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").notNull(),
  transcriptText: text("transcript_text").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  positiveCount: real("positive_count").notNull(),
  neutralCount: real("neutral_count").notNull(),
  negativeCount: real("negative_count").notNull(),
  confidence: real("confidence").notNull(),
  summary: text("summary").notNull(),
  keyHighlights: json("key_highlights").$type<string[]>(),
  riskFactors: json("risk_factors").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earningsCallTranscripts = pgTable("earnings_call_transcripts", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").notNull(),
  quarter: text("quarter").notNull(),
  year: text("year").notNull(),
  transcript: text("transcript").notNull(),
  speakers: json("speakers").$type<Array<{name: string, role: string}>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockDataSchema = createInsertSchema(stockData).omit({
  id: true,
  lastUpdated: true,
});

export const insertSentimentAnalysisSchema = createInsertSchema(sentimentAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertEarningsCallTranscriptSchema = createInsertSchema(earningsCallTranscripts).omit({
  id: true,
  createdAt: true,
});

export type StockData = typeof stockData.$inferSelect;
export type InsertStockData = z.infer<typeof insertStockDataSchema>;
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = z.infer<typeof insertSentimentAnalysisSchema>;
export type EarningsCallTranscript = typeof earningsCallTranscripts.$inferSelect;
export type InsertEarningsCallTranscript = z.infer<typeof insertEarningsCallTranscriptSchema>;
