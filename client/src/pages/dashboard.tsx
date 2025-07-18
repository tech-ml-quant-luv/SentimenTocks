import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { StockSearch } from "@/components/stock-search";
import { StockOverview } from "@/components/stock-overview";
import { PriceChart } from "@/components/price-chart";
import { SentimentChart } from "@/components/sentiment-chart";
import { EarningsCall } from "@/components/earnings-call";
import { RecentAnalysis } from "@/components/recent-analysis";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { apiRequest } from "@/lib/queryClient";
import { StockData, SentimentAnalysis, EarningsCallTranscript, HistoricalData, FundamentalData } from "@/lib/types";
import { defaultEarningsData } from "@/data/earnings-data";
import { FundamentalAnalysis } from "@/components/fundamental-analysis";

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [chartPeriod, setChartPeriod] = useState<string>("1D");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load Plotly script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Fetch stock data
  const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery<StockData>({
    queryKey: ['/api/stocks', selectedStock],
    enabled: !!selectedStock,
  });

  // Get default earnings data only for Reliance (homepage)
  const defaultEarnings = selectedStock === "RELIANCE" ? defaultEarningsData["RELIANCE"] : null;
  
  // Fetch sentiment data (skip for Reliance - use default)
  const { data: sentimentData, isLoading: sentimentLoading } = useQuery<SentimentAnalysis>({
    queryKey: ['/api/stocks', selectedStock, 'sentiment'],
    enabled: !!selectedStock && selectedStock !== "RELIANCE",
  });

  // Fetch historical data
  const { data: historicalData, isLoading: historicalLoading } = useQuery<HistoricalData[]>({
    queryKey: ['/api/stocks', selectedStock, 'history'],
    enabled: !!selectedStock,
  });

  // Fetch earnings call transcript (skip for Reliance - use default)
  const { data: earningsData, isLoading: earningsLoading } = useQuery<EarningsCallTranscript>({
    queryKey: ['/api/stocks', selectedStock, 'earnings', 'latest'],
    enabled: !!selectedStock && selectedStock !== "RELIANCE",
  });

  // Fetch fundamental data
  const { data: fundamentalData, isLoading: fundamentalLoading } = useQuery<FundamentalData>({
    queryKey: ['/api/stocks', selectedStock, 'fundamentals'],
    enabled: !!selectedStock,
  });

  // Use default data if available, otherwise use fetched data
  const currentSentimentData = defaultEarnings?.sentiment || sentimentData;
  const currentEarningsData = defaultEarnings?.transcript || earningsData;
  


  // Fetch recent stocks
  const { data: recentStocks, isLoading: recentLoading } = useQuery<StockData[]>({
    queryKey: ['/api/stocks/recent'],
  });

  // Generate transcript mutation
  const generateTranscriptMutation = useMutation({
    mutationFn: async ({ symbol, quarter, year }: { symbol: string; quarter: string; year: string }) => {
      const response = await apiRequest('POST', `/api/stocks/${symbol}/earnings/generate`, {
        quarter,
        year,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stocks', selectedStock, 'earnings'] });
      toast({
        title: "Success",
        description: "Earnings call transcript generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate transcript",
        variant: "destructive",
      });
    },
  });

  // Analyze sentiment mutation
  const analyzeSentimentMutation = useMutation({
    mutationFn: async ({ symbol, transcript }: { symbol: string; transcript: string }) => {
      const response = await apiRequest('POST', `/api/stocks/${symbol}/analyze`, {
        transcriptText: transcript,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stocks', selectedStock, 'sentiment'] });
      toast({
        title: "Success",
        description: "Sentiment analysis completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze sentiment",
        variant: "destructive",
      });
    },
  });

  const handleStockSearch = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handleGenerateTranscript = (quarter: string, year: string) => {
    if (!selectedStock) return;
    
    generateTranscriptMutation.mutate({ symbol: selectedStock, quarter, year });
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    // Refetch historical data with new period
    queryClient.invalidateQueries({ queryKey: ['/api/stocks', selectedStock, 'history'] });
  };

  // Auto-analyze sentiment when transcript is available
  useEffect(() => {
    if (earningsData && !sentimentData && !sentimentLoading) {
      analyzeSentimentMutation.mutate({
        symbol: selectedStock,
        transcript: earningsData.transcript,
      });
    }
  }, [earningsData, sentimentData, sentimentLoading, selectedStock]);

  const isLoading = stockLoading || sentimentLoading || historicalLoading || earningsLoading || fundamentalLoading;

  if (stockError) {
    toast({
      title: "Error",
      description: "Failed to fetch stock data. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <ChartLine className="text-primary text-xl sm:text-2xl" />
              <h1 className="text-lg sm:text-xl font-bold">SentimenTocks</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-4 sm:space-y-6">
        {/* Search Section */}
        <StockSearch onSearch={handleStockSearch} isLoading={isLoading} />

        {selectedStock && (
          <>
            {/* Stock Overview */}
            {stockData ? (
              <StockOverview stockData={stockData} sentimentData={currentSentimentData} />
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48 hidden md:block" />
              </div>
            ) : null}

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {historicalData && historicalData.length > 0 ? (
                <PriceChart 
                  data={historicalData} 
                  period={chartPeriod}
                  onPeriodChange={handlePeriodChange}
                />
              ) : isLoading ? (
                <Skeleton className="h-80" />
              ) : null}

              {currentSentimentData ? (
                <SentimentChart data={currentSentimentData} />
              ) : isLoading ? (
                <Skeleton className="h-80" />
              ) : null}
            </div>

            {/* Earnings Call Section */}
            {selectedStock && stockData && !isLoading && (
              <>
                {(currentEarningsData || currentSentimentData) ? (
                  <EarningsCall
                    transcript={currentEarningsData!}
                    sentiment={currentSentimentData!}
                    onGenerateTranscript={handleGenerateTranscript}
                    isGenerating={generateTranscriptMutation.isPending}
                  />
                ) : (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Generate Earnings Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No earnings call transcript found for {selectedStock}.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Generate an AI-powered earnings call transcript for analysis.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Quarter</label>
                          <select 
                            className="w-full p-2 border border-border rounded-md bg-background"
                            value={selectedQuarter}
                            onChange={(e) => setSelectedQuarter(e.target.value)}
                          >
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Year</label>
                          <select 
                            className="w-full p-2 border border-border rounded-md bg-background"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                          </select>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleGenerateTranscript(selectedQuarter, selectedYear)}
                        disabled={generateTranscriptMutation.isPending}
                        className="w-full"
                      >
                        {generateTranscriptMutation.isPending ? "Generating Transcript..." : `Generate ${selectedQuarter} ${selectedYear} Transcript`}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Fundamental Analysis Section */}
            {fundamentalData && !isLoading && (
              <FundamentalAnalysis data={fundamentalData} symbol={selectedStock} />
            )}
          </>
        )}

        {/* Recent Analysis */}
        {recentStocks && recentStocks.length > 0 ? (
          <RecentAnalysis stocks={recentStocks} />
        ) : recentLoading ? (
          <Skeleton className="h-64" />
        ) : null}
      </main>
    </div>
  );
}
