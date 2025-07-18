import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

interface StockSuggestion {
  symbol: string;
  name: string;
}

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [symbol, setSymbol] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search for stock suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<StockSuggestion[]>({
    queryKey: ['/api/stocks/search', symbol],
    enabled: symbol.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (symbol.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [symbol, suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else if (symbol.trim()) {
            handleSubmit(e as any);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSuggestions, selectedIndex, suggestions, symbol]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion: StockSuggestion) => {
    setSymbol(suggestion.symbol);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch(suggestion.symbol);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymbol(value);
    setSelectedIndex(-1);
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">Search NSE Stock</CardTitle>
        <CardDescription className="text-sm">
          Enter NSE stock symbol for sentiment analysis (e.g., RELIANCE, TCS, INFY)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter NSE stock symbol"
              value={symbol}
              onChange={handleInputChange}
              className="pr-10"
              autoComplete="off"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestionsLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.symbol}
                      className={`p-3 cursor-pointer hover:bg-accent text-sm ${
                        index === selectedIndex ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <div className="font-medium">{suggestion.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {suggestion.name}
                      </div>
                    </div>
                  ))
                ) : symbol.length > 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No stocks found matching "{symbol}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={!symbol.trim() || isLoading}
            className="w-full sm:w-auto px-6"
          >
            {isLoading ? "Analyzing..." : "Analyze Stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
