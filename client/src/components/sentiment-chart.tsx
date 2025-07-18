import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SentimentAnalysis } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentChartProps {
  data: SentimentAnalysis;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const totalCount = data.positiveCount + data.neutralCount + data.negativeCount;
  const positivePercentage = (data.positiveCount / totalCount) * 100;
  const neutralPercentage = (data.neutralCount / totalCount) * 100;
  const negativePercentage = (data.negativeCount / totalCount) * 100;

  const getSentimentColor = (score: number) => {
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-warning";
    return "text-error";
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 4) return <TrendingUp className="h-5 w-5 text-success" />;
    if (score >= 3) return <Minus className="h-5 w-5 text-warning" />;
    return <TrendingDown className="h-5 w-5 text-error" />;
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 4) return "Highly Positive";
    if (score >= 3.5) return "Positive";
    if (score >= 2.5) return "Neutral";
    if (score >= 2) return "Negative";
    return "Highly Negative";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Sentiment Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getSentimentIcon(data.sentimentScore)}
            <span className={`text-2xl font-bold ${getSentimentColor(data.sentimentScore)}`}>
              {data.sentimentScore.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/5.0</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getSentimentLabel(data.sentimentScore)}
          </Badge>
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Sentiment Breakdown</h4>
          
          {/* Positive */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm">Positive</span>
              </div>
              <span className="text-sm font-medium">{data.positiveCount} ({positivePercentage.toFixed(1)}%)</span>
            </div>
            <Progress value={positivePercentage} className="h-2" />
          </div>

          {/* Neutral */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Neutral</span>
              </div>
              <span className="text-sm font-medium">{data.neutralCount} ({neutralPercentage.toFixed(1)}%)</span>
            </div>
            <Progress value={neutralPercentage} className="h-2" />
          </div>

          {/* Negative */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-error" />
                <span className="text-sm">Negative</span>
              </div>
              <span className="text-sm font-medium">{data.negativeCount} ({negativePercentage.toFixed(1)}%)</span>
            </div>
            <Progress value={negativePercentage} className="h-2" />
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Confidence Level</span>
            <span className="text-sm font-medium">{(data.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={data.confidence * 100} className="h-2 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
