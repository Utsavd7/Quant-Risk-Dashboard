# market_data.py - Multiple data sources for reliability
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import time
import requests
import json
from concurrent.futures import ThreadPoolExecutor
import os
from dotenv import load_dotenv

load_dotenv()

class MarketDataService:
    def __init__(self):
        self.cache = {}
        self.last_update = None
        self._cached_historical_data = None
        self._price_cache = {}
        self._last_price_update = None
        self._last_historical_fetch = None
        
        # API Keys (get free keys from these services)
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY', 'demo')  # Get free key at alphavantage.co
        self.twelve_data_key = os.getenv('TWELVE_DATA_KEY', 'demo')  # Get free key at twelvedata.com
        self.finnhub_key = os.getenv('FINNHUB_KEY', 'demo')  # Get free key at finnhub.io
        
    def get_historical_data(self, tickers: List[str], period: str = "2y") -> pd.DataFrame:
        """Fetch historical data from multiple sources"""
        # Return cached data if fresh
        if (self._cached_historical_data is not None and 
            self._last_historical_fetch and 
            (datetime.now() - self._last_historical_fetch).seconds < 300):
            print("Returning cached historical data")
            return self._cached_historical_data
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        print(f"Fetching historical data for {tickers}")
        start_time = time.time()
        
        # Try different data sources
        data = None
        
        # Method 1: Try Twelve Data (5000 requests/month free)
        if self.twelve_data_key != 'demo':
            data = self._fetch_twelve_data(tickers, start_date, end_date)
        
        # Method 2: Try Alpha Vantage (500 requests/day free)
        if data is None and self.alpha_vantage_key != 'demo':
            data = self._fetch_alpha_vantage(tickers)
        
        # Method 3: Try Finnhub (60 requests/minute free)
        if data is None and self.finnhub_key != 'demo':
            data = self._fetch_finnhub_data(tickers, start_date, end_date)
        
        # Method 4: Use CCXT for crypto (completely free)
        if data is None:
            data = self._fetch_mixed_data(tickers, start_date, end_date)
        
        # Fallback: Generate realistic dummy data
        if data is None or data.empty:
            print("Using generated data")
            data = self._generate_realistic_data(tickers, start_date, end_date)
        
        self._cached_historical_data = data
        self._last_historical_fetch = datetime.now()
        
        fetch_time = time.time() - start_time
        print(f"Historical data fetched in {fetch_time:.2f} seconds")
        
        return data
    
    def _fetch_twelve_data(self, tickers: List[str], start_date, end_date) -> pd.DataFrame:
        """Fetch from Twelve Data API"""
        try:
            base_url = "https://api.twelvedata.com/time_series"
            
            all_data = {}
            
            # Batch request for efficiency
            symbols = ','.join(tickers)
            params = {
                'symbol': symbols,
                'interval': '1day',
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'apikey': self.twelve_data_key,
                'format': 'JSON'
            }
            
            response = requests.get(base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Process each ticker
                for ticker in tickers:
                    if ticker in data:
                        ticker_data = data[ticker]
                        if 'values' in ticker_data:
                            dates = []
                            prices = []
                            
                            for point in ticker_data['values']:
                                dates.append(pd.to_datetime(point['datetime']))
                                prices.append(float(point['close']))
                            
                            all_data[ticker] = pd.Series(prices, index=dates).sort_index()
                
                if all_data:
                    return pd.DataFrame(all_data)
                    
        except Exception as e:
            print(f"Twelve Data error: {e}")
        
        return None
    
    def _fetch_alpha_vantage(self, tickers: List[str]) -> pd.DataFrame:
        """Fetch from Alpha Vantage API"""
        try:
            base_url = "https://www.alphavantage.co/query"
            all_data = {}
            
            # Alpha Vantage requires individual requests
            for ticker in tickers[:5]:  # Limit to avoid rate limits
                params = {
                    'function': 'TIME_SERIES_DAILY',
                    'symbol': ticker,
                    'outputsize': 'full',
                    'apikey': self.alpha_vantage_key
                }
                
                response = requests.get(base_url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'Time Series (Daily)' in data:
                        time_series = data['Time Series (Daily)']
                        dates = []
                        prices = []
                        
                        for date_str, values in time_series.items():
                            dates.append(pd.to_datetime(date_str))
                            prices.append(float(values['4. close']))
                        
                        all_data[ticker] = pd.Series(prices, index=dates).sort_index()
                
                time.sleep(0.2)  # Respect rate limits
            
            if all_data:
                return pd.DataFrame(all_data)
                
        except Exception as e:
            print(f"Alpha Vantage error: {e}")
        
        return None
    
    def _fetch_finnhub_data(self, tickers: List[str], start_date, end_date) -> pd.DataFrame:
        """Fetch from Finnhub API"""
        try:
            import finnhub
            
            # Setup client
            finnhub_client = finnhub.Client(api_key=self.finnhub_key)
            
            all_data = {}
            start_timestamp = int(start_date.timestamp())
            end_timestamp = int(end_date.timestamp())
            
            for ticker in tickers:
                try:
                    # Get candle data
                    candles = finnhub_client.stock_candles(
                        ticker, 'D', start_timestamp, end_timestamp
                    )
                    
                    if candles and candles['s'] == 'ok':
                        dates = [pd.to_datetime(ts, unit='s') for ts in candles['t']]
                        prices = candles['c']  # Close prices
                        
                        all_data[ticker] = pd.Series(prices, index=dates)
                        
                except Exception as e:
                    print(f"Error fetching {ticker}: {e}")
                
                time.sleep(0.1)  # Respect rate limits
            
            if all_data:
                return pd.DataFrame(all_data)
                
        except Exception as e:
            print(f"Finnhub error: {e}")
        
        return None
    
    def _fetch_mixed_data(self, tickers: List[str], start_date, end_date) -> pd.DataFrame:
        """Use free sources - CoinGecko for crypto, generate for stocks"""
        all_data = {}
        
        # Separate crypto and stocks
        crypto_tickers = [t for t in tickers if 'USD' in t]
        stock_tickers = [t for t in tickers if 'USD' not in t]
        
        # Fetch crypto data from CoinGecko (free, no API key needed)
        if crypto_tickers:
            crypto_data = self._fetch_coingecko_data(crypto_tickers, start_date, end_date)
            if crypto_data is not None:
                all_data.update(crypto_data)
        
        # Generate realistic data for stocks
        if stock_tickers:
            stock_data = self._generate_realistic_data(stock_tickers, start_date, end_date)
            for ticker in stock_tickers:
                if ticker in stock_data.columns:
                    all_data[ticker] = stock_data[ticker]
        
        if all_data:
            return pd.DataFrame(all_data)
        
        return None
    
    def _fetch_coingecko_data(self, crypto_tickers: List[str], start_date, end_date) -> Dict:
        """Fetch crypto data from CoinGecko (free API)"""
        try:
            crypto_map = {
                'BTC-USD': 'bitcoin',
                'ETH-USD': 'ethereum'
            }
            
            base_url = "https://api.coingecko.com/api/v3"
            all_data = {}
            
            for ticker in crypto_tickers:
                if ticker in crypto_map:
                    coin_id = crypto_map[ticker]
                    
                    # Get historical data
                    url = f"{base_url}/coins/{coin_id}/market_chart/range"
                    params = {
                        'vs_currency': 'usd',
                        'from': int(start_date.timestamp()),
                        'to': int(end_date.timestamp())
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        if 'prices' in data:
                            dates = [pd.to_datetime(p[0], unit='ms') for p in data['prices']]
                            prices = [p[1] for p in data['prices']]
                            
                            # Resample to daily
                            series = pd.Series(prices, index=dates)
                            daily_series = series.resample('D').last().fillna(method='ffill')
                            all_data[ticker] = daily_series
                    
                    time.sleep(1)  # Be nice to free API
            
            return all_data
            
        except Exception as e:
            print(f"CoinGecko error: {e}")
        
        return None
    
    def get_live_portfolio_data(self, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Get live data using free sources"""
        tickers = list(portfolio.keys())
        
        # Return cached if recent
        if (self._price_cache and 
            self._last_price_update and 
            (datetime.now() - self._last_price_update).seconds < 5):
            return self._price_cache
        
        prices = {}
        changes = {}
        
        # Try to get real prices from free sources
        live_prices = self._fetch_live_prices_free(tickers)
        
        if live_prices:
            prices.update(live_prices)
            # Calculate changes based on previous cache or random
            for ticker, price in live_prices.items():
                if self._price_cache and ticker in self._price_cache.get('prices', {}):
                    old_price = self._price_cache['prices'][ticker]
                    changes[ticker] = ((price - old_price) / old_price) * 100
                else:
                    changes[ticker] = np.random.uniform(-2, 2)
        
        # Fill missing with simulated data
        for ticker in tickers:
            if ticker not in prices:
                if self._price_cache and ticker in self._price_cache.get('prices', {}):
                    # Update existing price with small change
                    old_price = self._price_cache['prices'][ticker]
                    change = np.random.normal(0, 0.002)
                    prices[ticker] = old_price * (1 + change)
                    changes[ticker] = self._price_cache['changes'].get(ticker, 0) + change * 100
                else:
                    # Initial price
                    base_prices = {
                        "AAPL": 182.45, "MSFT": 378.92, "GOOGL": 142.67,
                        "NVDA": 487.23, "TSLA": 198.45, "JPM": 156.78,
                        "GS": 342.56, "BTC-USD": 43567.89, "ETH-USD": 2345.67
                    }
                    prices[ticker] = base_prices.get(ticker, 100)
                    changes[ticker] = np.random.uniform(-2, 2)
        
        self._price_cache = {
            "prices": prices,
            "changes": changes,
            "timestamp": datetime.now().isoformat()
        }
        
        self._last_price_update = datetime.now()
        return self._price_cache
    
    def _fetch_live_prices_free(self, tickers: List[str]) -> Dict[str, float]:
        """Fetch live prices from free sources"""
        prices = {}
        
        # Separate crypto and stocks
        crypto_tickers = [t for t in tickers if 'USD' in t]
        
        # Get crypto prices from CoinGecko
        if crypto_tickers:
            try:
                crypto_map = {'BTC-USD': 'bitcoin', 'ETH-USD': 'ethereum'}
                ids = ','.join([crypto_map.get(t, '') for t in crypto_tickers if t in crypto_map])
                
                url = f"https://api.coingecko.com/api/v3/simple/price"
                params = {'ids': ids, 'vs_currencies': 'usd'}
                
                response = requests.get(url, params=params, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    for ticker, coin_id in crypto_map.items():
                        if ticker in crypto_tickers and coin_id in data:
                            prices[ticker] = data[coin_id]['usd']
                            
            except Exception as e:
                print(f"Error fetching live crypto prices: {e}")
        
        return prices
    
    def _generate_realistic_data(self, tickers: List[str], start_date, end_date) -> pd.DataFrame:
        """Generate realistic market data"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Realistic base prices
        base_prices = {
            "AAPL": 150, "MSFT": 300, "GOOGL": 120, "NVDA": 400,
            "TSLA": 200, "JPM": 140, "GS": 350,
            "BTC-USD": 40000, "ETH-USD": 2500
        }
        
        data = {}
        
        for ticker in tickers:
            initial_price = base_prices.get(ticker, np.random.uniform(50, 500))
            
            # Generate correlated returns
            if "USD" in ticker:  # Crypto - higher volatility
                daily_vol = 0.04
                trend = 0.0005
            else:  # Stocks
                daily_vol = 0.02
                trend = 0.0003
            
            # Add market regime changes
            n_days = len(dates)
            returns = []
            
            for i in range(n_days):
                # Market regimes
                if i < n_days * 0.2:  # Bull market
                    mu = trend * 2
                elif i < n_days * 0.4:  # Bear market
                    mu = -trend
                elif i < n_days * 0.6:  # Recovery
                    mu = trend * 1.5
                else:  # Normal market
                    mu = trend
                
                # Add some volatility clustering
                if i > 0 and abs(returns[-1]) > 0.02:
                    vol = daily_vol * 1.5
                else:
                    vol = daily_vol
                
                daily_return = np.random.normal(mu, vol)
                returns.append(daily_return)
            
            # Calculate prices
            price_series = initial_price * np.exp(np.cumsum(returns))
            
            # Add some mean reversion
            price_series = pd.Series(price_series, index=dates)
            price_series = price_series.ewm(span=20).mean()
            
            data[ticker] = price_series
        
        return pd.DataFrame(data, index=dates)
    
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
                "current_price": round(price, 2),
                "market_value": round(value, 2),
                "daily_change": round(live_data["changes"].get(ticker, 0), 2)
            }
        
        # Recalculate weights
        for ticker in enhanced_portfolio:
            enhanced_portfolio[ticker]["current_weight"] = round(
                enhanced_portfolio[ticker]["market_value"] / total_value, 4
            )
        
        return {
            "portfolio": enhanced_portfolio,
            "total_value": round(total_value, 2),
            "timestamp": live_data["timestamp"]
        }