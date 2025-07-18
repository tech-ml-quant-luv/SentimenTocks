import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, AlertCircle, CheckCircle } from "lucide-react";

interface FundamentalData {
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
}

interface FundamentalAnalysisProps {
  data: FundamentalData;
  symbol: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  status?: 'good' | 'warning' | 'poor';
}

function MetricCard({ title, value, change, icon, description, status }: MetricCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'poor': return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={`text-lg font-semibold ${getStatusColor(status)}`}>{value}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status)}
            {change !== undefined && (
              <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs">
                {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(change)}%
              </Badge>
            )}
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

function getValuationStatus(peRatio: number): 'good' | 'warning' | 'poor' {
  if (peRatio < 15) return 'good';
  if (peRatio < 25) return 'warning';
  return 'poor';
}

function getProfitabilityStatus(margin: number): 'good' | 'warning' | 'poor' {
  if (margin > 20) return 'good';
  if (margin > 10) return 'warning';
  return 'poor';
}

function getLiquidityStatus(ratio: number): 'good' | 'warning' | 'poor' {
  if (ratio > 2) return 'good';
  if (ratio > 1.5) return 'warning';
  return 'poor';
}

function getGrowthStatus(growth: number): 'good' | 'warning' | 'poor' {
  if (growth > 15) return 'good';
  if (growth > 5) return 'warning';
  return 'poor';
}

export function FundamentalAnalysis({ data, symbol }: FundamentalAnalysisProps) {
  const financialStrength = Math.min(100, Math.max(0, 
    (data.currentRatio > 1.5 ? 20 : 10) +
    (data.debtToEquity < 0.5 ? 20 : 10) +
    (data.roe > 15 ? 20 : 10) +
    (data.profitMargin > 10 ? 20 : 10) +
    (data.revenueGrowth > 10 ? 20 : 10)
  ));

  const valuationScore = Math.min(100, Math.max(0,
    (data.peRatio < 15 ? 25 : data.peRatio < 25 ? 15 : 5) +
    (data.priceToBook < 1.5 ? 25 : data.priceToBook < 3 ? 15 : 5) +
    (data.priceToSales < 2 ? 25 : data.priceToSales < 4 ? 15 : 5) +
    (data.pegRatio < 1 ? 25 : data.pegRatio < 2 ? 15 : 5)
  ));

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Fundamental Analysis - {symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Financial Strength</span>
                <span className="text-sm font-semibold">{financialStrength}/100</span>
              </div>
              <Progress value={financialStrength} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valuation Score</span>
                <span className="text-sm font-semibold">{valuationScore}/100</span>
              </div>
              <Progress value={valuationScore} className="h-2" />
            </div>
          </div>

          {/* Valuation Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Valuation Metrics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                title="P/E Ratio"
                value={data.peRatio.toFixed(2)}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                description="Price to Earnings ratio"
                status={getValuationStatus(data.peRatio)}
              />
              <MetricCard
                title="P/B Ratio"
                value={data.priceToBook.toFixed(2)}
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
                description="Price to Book ratio"
                status={data.priceToBook < 1.5 ? 'good' : data.priceToBook < 3 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="P/S Ratio"
                value={data.priceToSales.toFixed(2)}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                description="Price to Sales ratio"
                status={data.priceToSales < 2 ? 'good' : data.priceToSales < 4 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="PEG Ratio"
                value={data.pegRatio.toFixed(2)}
                icon={<Target className="h-4 w-4 text-primary" />}
                description="Price/Earnings to Growth ratio"
                status={data.pegRatio < 1 ? 'good' : data.pegRatio < 2 ? 'warning' : 'poor'}
              />
            </div>
          </div>

          {/* Financial Health */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Financial Health</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                title="Current Ratio"
                value={data.currentRatio.toFixed(2)}
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
                description="Current assets / Current liabilities"
                status={getLiquidityStatus(data.currentRatio)}
              />
              <MetricCard
                title="Quick Ratio"
                value={data.quickRatio.toFixed(2)}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                description="(Current assets - Inventory) / Current liabilities"
                status={data.quickRatio > 1 ? 'good' : data.quickRatio > 0.8 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="Debt to Equity"
                value={data.debtToEquity.toFixed(2)}
                icon={<AlertCircle className="h-4 w-4 text-primary" />}
                description="Total debt / Total equity"
                status={data.debtToEquity < 0.5 ? 'good' : data.debtToEquity < 1 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="Interest Coverage"
                value={data.interestCoverage.toFixed(1) + 'x'}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                description="EBIT / Interest expense"
                status={data.interestCoverage > 5 ? 'good' : data.interestCoverage > 2.5 ? 'warning' : 'poor'}
              />
            </div>
          </div>

          {/* Profitability */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Profitability</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                title="Profit Margin"
                value={data.profitMargin.toFixed(1) + '%'}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                description="Net income / Revenue"
                status={getProfitabilityStatus(data.profitMargin)}
              />
              <MetricCard
                title="Operating Margin"
                value={data.operatingMargin.toFixed(1) + '%'}
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
                description="Operating income / Revenue"
                status={getProfitabilityStatus(data.operatingMargin)}
              />
              <MetricCard
                title="ROE"
                value={data.roe.toFixed(1) + '%'}
                icon={<Target className="h-4 w-4 text-primary" />}
                description="Return on Equity"
                status={data.roe > 15 ? 'good' : data.roe > 10 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="ROA"
                value={data.returnOnAssets.toFixed(1) + '%'}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                description="Return on Assets"
                status={data.returnOnAssets > 10 ? 'good' : data.returnOnAssets > 5 ? 'warning' : 'poor'}
              />
            </div>
          </div>

          {/* Growth & Efficiency */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Growth & Efficiency</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                title="Revenue Growth"
                value={data.revenueGrowth.toFixed(1) + '%'}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                description="Year-over-year revenue growth"
                status={getGrowthStatus(data.revenueGrowth)}
              />
              <MetricCard
                title="EPS"
                value={'₹' + data.eps.toFixed(2)}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                description="Earnings per Share"
              />
              <MetricCard
                title="Dividend Yield"
                value={data.dividendYield.toFixed(2) + '%'}
                icon={<Target className="h-4 w-4 text-primary" />}
                description="Annual dividend / Share price"
                status={data.dividendYield > 3 ? 'good' : data.dividendYield > 1 ? 'warning' : 'poor'}
              />
              <MetricCard
                title="Asset Turnover"
                value={data.assetTurnover.toFixed(2) + 'x'}
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
                description="Revenue / Total assets"
                status={data.assetTurnover > 1.5 ? 'good' : data.assetTurnover > 1 ? 'warning' : 'poor'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}