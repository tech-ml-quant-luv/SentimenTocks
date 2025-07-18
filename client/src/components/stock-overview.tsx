import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockData, SentimentAnalysis } from "@/lib/types";

interface StockOverviewProps {
  stockData: StockData;
  sentimentData?: SentimentAnalysis;
}

export function StockOverview({ stockData, sentimentData }: StockOverviewProps) {
  const isPositive = stockData.change > 0;
  const sentimentLabel = sentimentData?.sentimentScore 
    ? sentimentData.sentimentScore > 0.2 ? "Positive" 
    : sentimentData.sentimentScore < -0.2 ? "Negative" 
    : "Neutral"
    : "No Data";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Stock Price Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">Stock Price</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">NSE</Badge>
              <Badge variant="default" className="text-xs bg-primary">LIVE</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xl sm:text-2xl font-bold">₹{stockData.price.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
              </span>
              {isPositive ? (
                <ArrowUp className="h-3 w-3 text-success" />
              ) : (
                <ArrowDown className="h-3 w-3 text-error" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Open:</span>
              <span className="ml-1 sm:ml-2 font-medium">₹{stockData.openPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">High:</span>
              <span className="ml-1 sm:ml-2 font-medium">₹{stockData.highPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Low:</span>
              <span className="ml-1 sm:ml-2 font-medium">₹{stockData.lowPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Volume:</span>
              <span className="ml-1 sm:ml-2 font-medium">{stockData.volume}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Score Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sentiment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {sentimentData?.sentimentScore ? sentimentData.sentimentScore.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">{sentimentLabel}</div>
                </div>
              </div>
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted"/>
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round" 
                  className="text-success" 
                  strokeDasharray="352" 
                  strokeDashoffset={sentimentData ? 352 - (sentimentData.sentimentScore + 1) * 176 : 352}
                />
              </svg>
            </div>
          </div>
          {sentimentData && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-success font-medium">{sentimentData.positiveCount.toFixed(0)}%</div>
                <div className="text-muted-foreground">Positive</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground font-medium">{sentimentData.neutralCount.toFixed(0)}%</div>
                <div className="text-muted-foreground">Neutral</div>
              </div>
              <div className="text-center">
                <div className="text-error font-medium">{sentimentData.negativeCount.toFixed(0)}%</div>
                <div className="text-muted-foreground">Negative</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Indicators */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Market Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">RSI (14)</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">67.5</span>
              <div className="w-16 h-2 bg-muted rounded-full">
                <div className="w-2/3 h-2 bg-warning rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">MACD</span>
            <span className="text-success font-medium">+12.4</span>
          </div>
          {stockData.peRatio && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">P/E Ratio</span>
              <span className="font-medium">{stockData.peRatio}</span>
            </div>
          )}
          {stockData.marketCap && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-medium">{stockData.marketCap}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
