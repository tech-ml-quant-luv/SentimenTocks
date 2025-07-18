import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nseService } from "./services/nse-service";
import { openaiService } from "./services/openai-service";
import { z } from "zod";
import { insertStockDataSchema, insertSentimentAnalysisSchema, insertEarningsCallTranscriptSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get stock data
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Try to get cached data first
      let stockData = await storage.getStockData(symbol);
      
      // If no cached data or data is older than 5 minutes, fetch fresh data
      if (!stockData || (stockData.lastUpdated && Date.now() - stockData.lastUpdated.getTime() > 5 * 60 * 1000)) {
        const freshData = await nseService.getStockQuote(symbol);
        stockData = await storage.createOrUpdateStockData(freshData);
      }
      
      res.json(stockData);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get historical stock data
  app.get("/api/stocks/:symbol/history", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const period = req.query.period as string || "1D";
      
      const historicalData = await nseService.getHistoricalData(symbol, period);
      res.json(historicalData);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get fundamental analysis
  app.get("/api/stocks/:symbol/fundamentals", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Try to get cached fundamental data first
      let fundamentalData = await storage.getFundamentalData(symbol);
      
      // If no cached data or data is older than 1 hour, fetch fresh data
      if (!fundamentalData || (fundamentalData.lastUpdated && Date.now() - fundamentalData.lastUpdated.getTime() > 60 * 60 * 1000)) {
        const freshData = await nseService.getFundamentalData(symbol);
        fundamentalData = await storage.createOrUpdateFundamentalData(freshData);
      }
      
      res.json(fundamentalData);
    } catch (error) {
      res.status(404).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get sentiment analysis
  app.get("/api/stocks/:symbol/sentiment", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      const sentiment = await storage.getSentimentAnalysis(symbol);
      if (!sentiment) {
        res.status(404).json({ message: "No sentiment analysis found for this stock" });
        return;
      }
      
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Analyze sentiment for a stock
  app.post("/api/stocks/:symbol/analyze", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const { transcriptText } = req.body;
      
      if (!transcriptText) {
        res.status(400).json({ message: "Transcript text is required" });
        return;
      }

      const analysisResult = await openaiService.analyzeSentiment(transcriptText);
      
      const sentimentData = {
        stockSymbol: symbol,
        transcriptText,
        sentimentScore: analysisResult.sentimentScore,
        positiveCount: analysisResult.positiveCount,
        neutralCount: analysisResult.neutralCount,
        negativeCount: analysisResult.negativeCount,
        confidence: analysisResult.confidence,
        summary: analysisResult.summary,
        keyHighlights: analysisResult.keyHighlights,
        riskFactors: analysisResult.riskFactors,
      };

      const sentiment = await storage.createSentimentAnalysis(sentimentData);
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get earnings call transcript
  app.get("/api/stocks/:symbol/earnings/:quarter/:year", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const quarter = req.params.quarter;
      const year = req.params.year;
      
      const transcript = await storage.getEarningsCallTranscript(symbol, quarter, year);
      if (!transcript) {
        res.status(404).json({ message: "No earnings call transcript found" });
        return;
      }
      
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get latest earnings call transcript
  app.get("/api/stocks/:symbol/earnings/latest", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      const transcript = await storage.getLatestEarningsCallTranscript(symbol);
      if (!transcript) {
        res.status(404).json({ message: "No earnings call transcript found" });
        return;
      }
      
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Generate earnings call transcript
  app.post("/api/stocks/:symbol/earnings/generate", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const { quarter, year } = req.body;
      
      if (!quarter || !year) {
        res.status(400).json({ message: "Quarter and year are required" });
        return;
      }

      // Get company name from stock data
      const stockData = await storage.getStockData(symbol);
      const companyName = stockData?.name || symbol;

      const transcriptText = await openaiService.generateEarningsCallTranscript(companyName, quarter, year);
      
      const transcriptData = {
        stockSymbol: symbol,
        quarter,
        year,
        transcript: transcriptText,
        speakers: [
          { name: "CEO", role: "Chief Executive Officer" },
          { name: "CFO", role: "Chief Financial Officer" },
          { name: "Analyst", role: "Financial Analyst" }
        ],
      };

      const transcript = await storage.createEarningsCallTranscript(transcriptData);
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all recent stock analyses
  app.get("/api/stocks/recent", async (req, res) => {
    try {
      const recentStocks = await storage.getAllStockData();
      res.json(recentStocks.slice(0, 10)); // Return last 10 analyses
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search stocks
  app.get("/api/stocks/search/:query", async (req, res) => {
    try {
      const query = req.params.query.toUpperCase();
      
      const searchResults = await nseService.searchStocks(query);
      
      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
