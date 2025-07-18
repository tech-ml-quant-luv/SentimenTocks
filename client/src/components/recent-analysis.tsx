import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockData } from "@/lib/types";

interface RecentAnalysisProps {
  stocks: StockData[];
}

export function RecentAnalysis({ stocks }: RecentAnalysisProps) {
  const getStockInitial = (symbol: string) => symbol.charAt(0);
  const getStockColor = (symbol: string) => {
    const colors = ['bg-primary', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600'];
    return colors[symbol.length % colors.length];
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Change</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${getStockColor(stock.symbol)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                        {getStockInitial(stock.symbol)}
                      </div>
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-muted-foreground text-xs">{stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">₹{stock.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center space-x-1 ${
                      stock.change > 0 ? 'text-success' : 'text-error'
                    }`}>
                      {stock.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
