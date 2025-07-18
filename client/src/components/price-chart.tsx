import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoricalData } from "@/lib/types";

interface PriceChartProps {
  data: HistoricalData[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export function PriceChart({ data, period, onPeriodChange }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const trace = {
      x: data.map(d => d.date),
      y: data.map(d => d.price),
      type: 'scatter',
      mode: 'lines',
      line: { color: '#2E7D32', width: 2 },
      name: 'Price'
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'var(--foreground)', family: 'system-ui, -apple-system, sans-serif' },
      xaxis: {
        gridcolor: 'var(--border)',
        tickcolor: 'var(--border)',
        linecolor: 'var(--border)',
        color: 'var(--foreground)',
        showgrid: true,
        zeroline: false,
        type: period === '1D' ? 'date' : 'category'
      },
      yaxis: {
        gridcolor: 'var(--border)',
        tickcolor: 'var(--border)',
        linecolor: 'var(--border)',
        color: 'var(--foreground)',
        showgrid: true,
        zeroline: false,
        tickformat: '₹.2f'
      },
      margin: { l: 60, r: 20, t: 20, b: 50 },
      showlegend: false,
      hovermode: 'x unified'
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    // @ts-ignore - Plotly is loaded globally
    if (window.Plotly) {
      window.Plotly.newPlot(chartRef.current, [trace], layout, config);
    }

    return () => {
      if (chartRef.current && window.Plotly) {
        window.Plotly.purge(chartRef.current);
      }
    };
  }, [data, period]);

  const periods = ['1D', '1W', '1M', '1Y'];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Price Chart</CardTitle>
          <div className="flex space-x-2">
            {periods.map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodChange(p)}
                className="text-xs"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}
