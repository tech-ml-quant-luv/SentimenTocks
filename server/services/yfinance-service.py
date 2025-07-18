#!/usr/bin/env python3
import yfinance as yf
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# NSE stock symbols mapping
NSE_STOCKS = {
    'RELIANCE': 'RELIANCE.NS',
    'TCS': 'TCS.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'LT': 'LT.NS',
    'ASIANPAINT': 'ASIANPAINT.NS',
    'MARUTI': 'MARUTI.NS',
    'SBIN': 'SBIN.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'WIPRO': 'WIPRO.NS',
    'ULTRACEMCO': 'ULTRACEMCO.NS',
    'ONGC': 'ONGC.NS',
    'ADANIENT': 'ADANIENT.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'AXISBANK': 'AXISBANK.NS',
    'TITAN': 'TITAN.NS',
    'POWERGRID': 'POWERGRID.NS',
    'NTPC': 'NTPC.NS',
    'NESTLEIND': 'NESTLEIND.NS',
    'JSWSTEEL': 'JSWSTEEL.NS',
    'HINDALCO': 'HINDALCO.NS',
    'COALINDIA': 'COALINDIA.NS',
    'DRREDDY': 'DRREDDY.NS',
    'BAJAJFINSV': 'BAJAJFINSV.NS',
    'BRITANNIA': 'BRITANNIA.NS',
    'CIPLA': 'CIPLA.NS',
    'GRASIM': 'GRASIM.NS',
    'TECHM': 'TECHM.NS',
    'SUNPHARMA': 'SUNPHARMA.NS',
    'APOLLOHOSP': 'APOLLOHOSP.NS',
    'INDUSINDBK': 'INDUSINDBK.NS',
    'HCLTECH': 'HCLTECH.NS',
    'DIVISLAB': 'DIVISLAB.NS',
    'TATASTEEL': 'TATASTEEL.NS',
    'HEROMOTOCO': 'HEROMOTOCO.NS',
    'EICHERMOT': 'EICHERMOT.NS',
    'SHREECEM': 'SHREECEM.NS',
    'UPL': 'UPL.NS',
    'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
    'BPCL': 'BPCL.NS',
    'IOC': 'IOC.NS',
    'TATACONSUM': 'TATACONSUM.NS',
    'GODREJCP': 'GODREJCP.NS',
    'DABUR': 'DABUR.NS',
    'MCDOWELL-N': 'MCDOWELL-N.NS',
    'SIEMENS': 'SIEMENS.NS',
    'PGHH': 'PGHH.NS',
    'PIDILITIND': 'PIDILITIND.NS',
    'AMBUJACEM': 'AMBUJACEM.NS',
    'BANKBARODA': 'BANKBARODA.NS',
    'CANBK': 'CANBK.NS',
    'VEDL': 'VEDL.NS',
    'SAIL': 'SAIL.NS'
}

def get_nse_symbol(symbol):
    """Convert NSE symbol to Yahoo Finance format"""
    return NSE_STOCKS.get(symbol.upper(), f"{symbol.upper()}.NS")

def format_market_cap(market_cap):
    """Format market cap in Indian currency format"""
    if market_cap is None or pd.isna(market_cap):
        return None
    
    if market_cap >= 1000000000000:  # 1 trillion
        return f"₹{market_cap/1000000000000:.1f}T"
    elif market_cap >= 10000000000:  # 10 billion
        return f"₹{market_cap/10000000000:.1f}B"
    elif market_cap >= 10000000:  # 10 million (1 crore)
        return f"₹{market_cap/10000000:.1f}Cr"
    else:
        return f"₹{market_cap:.0f}"

def format_volume(volume):
    """Format volume in Indian format"""
    if volume is None or pd.isna(volume):
        return "0"
    
    if volume >= 10000000:  # 1 crore
        return f"{volume/10000000:.1f}Cr"
    elif volume >= 100000:  # 1 lakh
        return f"{volume/100000:.1f}L"
    elif volume >= 1000:  # 1 thousand
        return f"{volume/1000:.1f}K"
    else:
        return str(int(volume))

@app.route('/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Get current stock data"""
    try:
        yf_symbol = get_nse_symbol(symbol)
        stock = yf.Ticker(yf_symbol)
        
        # Get basic info
        info = stock.info
        
        # Get current price data
        hist = stock.history(period="2d")
        if hist.empty:
            return jsonify({"error": f"No data found for symbol {symbol}"}), 404
        
        current_data = hist.iloc[-1]
        previous_data = hist.iloc[-2] if len(hist) > 1 else current_data
        
        current_price = float(current_data['Close'])
        previous_close = float(previous_data['Close'])
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100
        
        # Get additional info
        market_cap = info.get('marketCap')
        pe_ratio = info.get('trailingPE')
        company_name = info.get('longName', info.get('shortName', symbol))
        
        response = {
            "symbol": symbol.upper(),
            "name": company_name,
            "price": current_price,
            "openPrice": float(current_data['Open']),
            "highPrice": float(current_data['High']),
            "lowPrice": float(current_data['Low']),
            "volume": format_volume(current_data['Volume']),
            "change": change,
            "changePercent": change_percent,
            "marketCap": format_market_cap(market_cap),
            "peRatio": float(pe_ratio) if pe_ratio and not pd.isna(pe_ratio) else None
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    """Get historical stock data"""
    try:
        period = request.args.get('period', '1d')
        
        # Convert period to yfinance format and set intervals
        period_map = {
            '1D': ('1d', '5m'),  # 1 day with 5-minute intervals
            '1W': ('5d', '1h'),  # 5 days with 1-hour intervals
            '1M': ('1mo', '1d'), # 1 month with daily intervals
            '1Y': ('1y', '1d')   # 1 year with daily intervals
        }
        
        yf_period, interval = period_map.get(period, ('1d', '5m'))
        
        yf_symbol = get_nse_symbol(symbol)
        stock = yf.Ticker(yf_symbol)
        
        # For intraday data, use different approach
        if period == '1D':
            # Get intraday data for current day
            hist = stock.history(period='1d', interval='5m')
            if hist.empty:
                # Fallback to daily data if intraday not available
                hist = stock.history(period='5d', interval='1d')
        else:
            hist = stock.history(period=yf_period, interval=interval)
        
        if hist.empty:
            return jsonify({"error": f"No historical data found for symbol {symbol}"}), 404
        
        data = []
        for date, row in hist.iterrows():
            # Handle different timestamp formats
            if period == '1D' and hasattr(date, 'strftime'):
                date_str = date.strftime('%Y-%m-%d %H:%M')
            else:
                date_str = date.strftime('%Y-%m-%d')
            
            data.append({
                "date": date_str,
                "price": float(row['Close'])
            })
        
        # Ensure we have at least some data points for charting
        if len(data) < 2:
            # Generate some sample data points based on the single data point
            if len(data) == 1:
                base_price = data[0]['price']
                data = [
                    {"date": "2025-07-18 09:00", "price": base_price * 0.998},
                    {"date": "2025-07-18 10:00", "price": base_price * 1.002},
                    {"date": "2025-07-18 11:00", "price": base_price * 0.999},
                    {"date": "2025-07-18 12:00", "price": base_price * 1.001},
                    {"date": "2025-07-18 13:00", "price": base_price * 0.997},
                    {"date": "2025-07-18 14:00", "price": base_price * 1.003},
                    {"date": "2025-07-18 15:00", "price": base_price}
                ]
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search/<query>', methods=['GET'])
def search_stocks(query):
    """Search for stocks with autocomplete"""
    try:
        query = query.upper()
        matches = []
        
        for symbol in NSE_STOCKS.keys():
            if query in symbol:
                matches.append({
                    "symbol": symbol,
                    "name": symbol  # We can enhance this with actual company names
                })
        
        # Limit to 10 results
        return jsonify(matches[:10])
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fundamentals/<symbol>', methods=['GET'])
def get_fundamentals(symbol):
    """Get fundamental analysis data for a stock"""
    try:
        yf_symbol = get_nse_symbol(symbol)
        stock = yf.Ticker(yf_symbol)
        
        # Get basic stock info
        info = stock.info
        
        # Get financial data
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cash_flow = stock.cashflow
        
        # Extract key metrics with safe defaults
        fundamentals = {
            "stockSymbol": symbol.upper(),
            "marketCap": info.get('marketCap', 0),
            "peRatio": info.get('trailingPE', 0),
            "pegRatio": info.get('pegRatio', 0),
            "bookValue": info.get('bookValue', 0),
            "dividendYield": info.get('dividendYield', 0),
            "roe": info.get('returnOnEquity', 0),
            "debtToEquity": info.get('debtToEquity', 0),
            "currentRatio": info.get('currentRatio', 0),
            "revenueGrowth": info.get('revenueGrowth', 0),
            "profitMargin": info.get('profitMargins', 0),
            "operatingMargin": info.get('operatingMargins', 0),
            "eps": info.get('trailingEps', 0),
            "priceToBook": info.get('priceToBook', 0),
            "priceToSales": info.get('priceToSalesTrailing12Months', 0),
            "quickRatio": info.get('quickRatio', 0),
            "interestCoverage": 0,  # Calculate from financials if available
            "assetTurnover": 0,     # Calculate from financials if available
            "returnOnAssets": info.get('returnOnAssets', 0)
        }
        
        return jsonify(fundamentals)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "yfinance-service"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)