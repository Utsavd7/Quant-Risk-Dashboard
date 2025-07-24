# market_data.py
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
import httpx

class MarketDataService:
    def __init__(self):
        self.cache = {}
        self.last_update = None
        
    def get_historical_data(self, tickers: List[str], period: str = "2y") -> pd.DataFrame:
        """Fetch historical data including 2024-2025 data"""
        # Ensure we get data up to current date
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)  # 2 years
        
        try:
            data = yf.download(
                tickers, 
                start=start_date, 
                end=end_date,
                progress=False,
                threads=True
            )
            
            # Handle single ticker case
            if len(tickers) == 1:
                data.columns = pd.MultiIndex.from_product([data.columns, tickers])
            
            return data['Adj Close']
        except Exception as e:
            print(f"Error fetching historical data: {e}")
            # Return dummy data for demo if API fails
            return self._generate_dummy_data(tickers, start_date, end_date)
    
    def get_live_portfolio_data(self, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Get live/recent data for portfolio"""
        tickers = list(portfolio.keys())
        
        try:
            # Get latest prices
            tickers_str = ' '.join(tickers)
            data = yf.Tickers(tickers_str)
            
            prices = {}
            changes = {}
            
            for ticker in tickers:
                try:
                    info = data.tickers[ticker].info
                    prices[ticker] = info.get('currentPrice', info.get('regularMarketPrice', 0))
                    changes[ticker] = info.get('regularMarketChangePercent', 0)
                except:
                    prices[ticker] = np.random.normal(100, 10)
                    changes[ticker] = np.random.normal(0, 2)
            
            return {
                "prices": prices,
                "changes": changes,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching live data: {e}")
            return self._generate_live_dummy_data(tickers)
    
    def get_portfolio_with_prices(self, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Get portfolio with current prices and values"""
        live_data = self.get_live_portfolio_data(portfolio)
        
        enhanced_portfolio = {}
        total_value = 0
        
        for ticker, details in portfolio.items():
            price = live_data["prices"].get(ticker, 100)
            shares = details["shares"]
            value = price * shares
            total_value += value
            
            enhanced_portfolio[ticker] = {
                **details,
                "current_price": price,
                "market_value": value,
                "daily_change": live_data["changes"].get(ticker, 0)
            }
        
        # Recalculate weights based on current values
        for ticker in enhanced_portfolio:
            enhanced_portfolio[ticker]["current_weight"] = (
                enhanced_portfolio[ticker]["market_value"] / total_value
            )
        
        return {
            "portfolio": enhanced_portfolio,
            "total_value": total_value,
            "timestamp": live_data["timestamp"]
        }
    
    def _generate_dummy_data(self, tickers: List[str], start_date, end_date) -> pd.DataFrame:
        """Generate realistic dummy data for demo"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        data = {}
        for ticker in tickers:
            # Generate realistic price movements
            initial_price = np.random.uniform(50, 500)
            returns = np.random.normal(0.0005, 0.02, len(dates))
            prices = initial_price * np.exp(np.cumsum(returns))
            data[ticker] = prices
        
        return pd.DataFrame(data, index=dates)
    
    def _generate_live_dummy_data(self, tickers: List[str]) -> Dict[str, Any]:
        """Generate dummy live data"""
        prices = {ticker: np.random.uniform(50, 500) for ticker in tickers}
        changes = {ticker: np.random.uniform(-5, 5) for ticker in tickers}
        
        return {
            "prices": prices,
            "changes": changes,
            "timestamp": datetime.now().isoformat()
        }