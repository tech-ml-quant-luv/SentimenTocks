import { useState } from "react";
import { Download, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EarningsCallTranscript, SentimentAnalysis } from "@/lib/types";
import { quarterOptions, yearOptions } from "@/data/earnings-data";

interface EarningsCallProps {
  transcript: EarningsCallTranscript;
  sentiment: SentimentAnalysis;
  onGenerateTranscript: (quarter: string, year: string) => void;
  isGenerating?: boolean;
}

export function EarningsCall({ transcript, sentiment, onGenerateTranscript, isGenerating }: EarningsCallProps) {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4");
  const [selectedYear, setSelectedYear] = useState("2025");
  


  const handleGenerate = () => {
    onGenerateTranscript(selectedQuarter, selectedYear);
  };

  const parseTranscript = (text: string) => {
    const segments = text.split('\n\n').filter(segment => segment.trim());
    return segments.map((segment, index) => {
      const lines = segment.split('\n');
      const speaker = lines[0].includes(':') ? lines[0].split(':')[0] : 'Speaker';
      const content = lines.slice(1).join(' ') || lines[0];
      return {
        id: index,
        speaker,
        content,
        sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
        confidence: Math.random() * 0.3 + 0.7
      };
    });
  };

  const segments = transcript ? parseTranscript(transcript.transcript) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Earnings Call Transcript */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">Earnings Call Transcript</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {transcript && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {transcript.quarter} {transcript.year}
                  </Badge>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Quarter and Year Selection */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                {quarterOptions.map((quarter) => (
                  <SelectItem key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full sm:w-auto"
              size="sm"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transcript ? (
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4">
                {segments.slice(0, 5).map((segment) => (
                  <div key={segment.id} className={`border-l-4 pl-4 ${
                    segment.sentiment === 'positive' ? 'border-success' : 
                    segment.sentiment === 'negative' ? 'border-error' : 'border-muted'
                  }`}>
                    <div className={`text-sm font-medium ${
                      segment.sentiment === 'positive' ? 'text-success' : 
                      segment.sentiment === 'negative' ? 'text-error' : 'text-muted-foreground'
                    }`}>
                      {segment.speaker}
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {segment.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge 
                        variant={segment.sentiment === 'positive' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          segment.sentiment === 'positive' ? 'bg-success/20 text-success' : 
                          segment.sentiment === 'negative' ? 'bg-error/20 text-error' : 'bg-muted/20'
                        }`}
                      >
                        {segment.sentiment}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Confidence: {segment.confidence.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No earnings call transcript available</p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Transcript"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold">AI Summary & Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {sentiment ? (
            <div className="space-y-4">
              {/* Sentiment Score Overview */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Sentiment Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overall Score</span>
                      <span className={`text-sm font-bold ${
                        sentiment.sentimentScore > 3 ? 'text-success' : 
                        sentiment.sentimentScore < 2 ? 'text-error' : 'text-muted-foreground'
                      }`}>
                        {sentiment.sentimentScore.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-sm font-medium text-success">
                        {(sentiment.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Positive</span>
                      <span className="text-sm font-medium text-success">
                        {sentiment.positiveCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Negative</span>
                      <span className="text-sm font-medium text-error">
                        {sentiment.negativeCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {sentiment.summary && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">AI Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sentiment.summary}
                  </p>
                </div>
              )}

              {/* Key Highlights */}
              {sentiment.keyHighlights && sentiment.keyHighlights.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Key Highlights
                  </h4>
                  <ul className="text-sm space-y-1">
                    {sentiment.keyHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-success mr-2">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {sentiment.riskFactors && sentiment.riskFactors.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Risk Factors
                  </h4>
                  <ul className="text-sm space-y-1">
                    {sentiment.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-error mr-2">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sentiment analysis available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
