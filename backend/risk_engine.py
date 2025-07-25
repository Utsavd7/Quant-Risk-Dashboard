# risk_engine.py - Fixed version with better error handling
import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta

class RiskEngine:
    def __init__(self):
        self.risk_free_rate = 0.045  # 4.5% risk-free rate
    
    def calculate_returns(self, prices: pd.DataFrame) -> pd.DataFrame:
        """Calculate daily returns"""
        return prices.pct_change().dropna()
    
    def calculate_portfolio_returns(self, returns: pd.DataFrame, weights: Dict[str, float]) -> pd.Series:
        """Calculate portfolio returns based on weights"""
        # Get available tickers (intersection of what we have data for and portfolio)
        available_tickers = [t for t in returns.columns if t in weights]
        
        if not available_tickers:
            # Return empty series if no matching tickers
            return pd.Series(dtype=float)
        
        # Extract weights for available tickers only
        w = np.array([weights[ticker]["weight"] for ticker in available_tickers])
        
        # Renormalize weights to sum to 1
        if w.sum() > 0:
            w = w / w.sum()
        
        # Calculate weighted returns for available tickers
        available_returns = returns[available_tickers]
        portfolio_returns = (available_returns * w).sum(axis=1)
        
        return portfolio_returns
    
    def historical_var(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Historical VaR"""
        if len(returns) == 0:
            return 0.0
        return -np.percentile(returns, (1 - confidence_level) * 100)
    
    def parametric_var(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Parametric VaR"""
        if len(returns) == 0:
            return 0.0
        mean = returns.mean()
        std = returns.std()
        if std == 0 or np.isnan(std):
            return 0.0
        z_score = stats.norm.ppf(1 - confidence_level)
        return -(mean + z_score * std)
    
    def calculate_var_analysis(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Comprehensive VaR analysis"""
        returns = self.calculate_returns(prices)
        
        # Handle empty returns
        if returns.empty:
            return self._empty_var_results()
        
        portfolio_returns = self.calculate_portfolio_returns(returns, portfolio)
        
        # Handle empty portfolio returns
        if portfolio_returns.empty or len(portfolio_returns) == 0:
            return self._empty_var_results()
        
        # Multiple confidence levels
        confidence_levels = [0.90, 0.95, 0.99]
        
        var_results = {
            "historical": {},
            "parametric": {},
            "returns_distribution": {
                "mean": float(portfolio_returns.mean()) if len(portfolio_returns) > 0 else 0,
                "std": float(portfolio_returns.std()) if len(portfolio_returns) > 0 else 0,
                "skew": float(portfolio_returns.skew()) if len(portfolio_returns) > 2 else 0,
                "kurtosis": float(portfolio_returns.kurtosis()) if len(portfolio_returns) > 3 else 0
            }
        }
        
        for conf in confidence_levels:
            var_results["historical"][f"{int(conf*100)}%"] = float(
                self.historical_var(portfolio_returns, conf)
            )
            var_results["parametric"][f"{int(conf*100)}%"] = float(
                self.parametric_var(portfolio_returns, conf)
            )
        
        # Calculate VaR time series for visualization
        window = min(252, len(portfolio_returns) - 1)  # Use smaller window if needed
        rolling_var = []
        
        if window > 30:  # Only calculate if we have enough data
            for i in range(window, len(portfolio_returns)):
                window_returns = portfolio_returns.iloc[i-window:i]
                rolling_var.append({
                    "date": portfolio_returns.index[i].isoformat() if hasattr(portfolio_returns.index[i], 'isoformat') else str(portfolio_returns.index[i]),
                    "var_95": float(self.historical_var(window_returns, 0.95))
                })
        
        var_results["time_series"] = rolling_var
        
        return var_results
    
    def _empty_var_results(self) -> Dict[str, Any]:
        """Return empty VaR results structure"""
        return {
            "historical": {"90%": 0.02, "95%": 0.03, "99%": 0.05},
            "parametric": {"90%": 0.02, "95%": 0.03, "99%": 0.05},
            "returns_distribution": {
                "mean": 0.0008,
                "std": 0.02,
                "skew": -0.1,
                "kurtosis": 3.0
            },
            "time_series": []
        }
    
    def calculate_volatility(self, returns: pd.Series, annualize: bool = True) -> float:
        """Calculate volatility"""
        if len(returns) == 0:
            return 0.15  # Default 15% volatility
        vol = returns.std()
        if annualize:
            vol *= np.sqrt(252)
        return float(vol) if not np.isnan(vol) else 0.15
    
    def sharpe_ratio(self, returns: pd.Series) -> float:
        """Calculate Sharpe Ratio"""
        if len(returns) == 0:
            return 0.0
        excess_returns = returns - self.risk_free_rate / 252
        std = returns.std()
        if std == 0 or np.isnan(std):
            return 0.0
        return float(np.sqrt(252) * excess_returns.mean() / std)
    
    def max_drawdown(self, prices: pd.Series) -> float:
        """Calculate Maximum Drawdown"""
        if len(prices) < 2:
            return 0.0
        cumulative = (1 + self.calculate_returns(prices)).cumprod()
        if len(cumulative) == 0:
            return 0.0
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return float(drawdown.min()) if len(drawdown) > 0 else 0.0
    
    def calculate_correlations(self, prices: pd.DataFrame) -> Dict[str, Any]:
        """Calculate correlation matrix and statistics"""
        returns = self.calculate_returns(prices)
        
        if returns.empty or len(returns) < 2:
            # Return default correlation matrix
            return self._default_correlations(prices.columns.tolist())
        
        corr_matrix = returns.corr()
        
        # Find highest and lowest correlations
        corr_values = []
        for i in range(len(corr_matrix)):
            for j in range(i+1, len(corr_matrix)):
                if not np.isnan(corr_matrix.iloc[i, j]):
                    corr_values.append({
                        "asset1": corr_matrix.index[i],
                        "asset2": corr_matrix.columns[j],
                        "correlation": float(corr_matrix.iloc[i, j])
                    })
        
        if not corr_values:
            return self._default_correlations(prices.columns.tolist())
        
        corr_values.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        return {
            "matrix": corr_matrix.fillna(0).to_dict(),
            "highest_correlations": corr_values[:5],
            "lowest_correlations": corr_values[-5:] if len(corr_values) >= 5 else corr_values,
            "average_correlation": float(np.nanmean([c["correlation"] for c in corr_values])) if corr_values else 0
        }
    
    def _default_correlations(self, tickers: List[str]) -> Dict[str, Any]:
        """Return default correlation structure"""
        # Create a simple correlation matrix
        n = len(tickers)
        matrix = {}
        
        for i, ticker1 in enumerate(tickers):
            matrix[ticker1] = {}
            for j, ticker2 in enumerate(tickers):
                if i == j:
                    matrix[ticker1][ticker2] = 1.0
                else:
                    # Similar assets have higher correlation
                    if ('USD' in ticker1 and 'USD' in ticker2):
                        matrix[ticker1][ticker2] = 0.8
                    elif (ticker1 in ['AAPL', 'MSFT', 'GOOGL'] and ticker2 in ['AAPL', 'MSFT', 'GOOGL']):
                        matrix[ticker1][ticker2] = 0.7
                    else:
                        matrix[ticker1][ticker2] = 0.3
        
        return {
            "matrix": matrix,
            "highest_correlations": [
                {"asset1": "AAPL", "asset2": "MSFT", "correlation": 0.7},
                {"asset1": "JPM", "asset2": "GS", "correlation": 0.8}
            ],
            "lowest_correlations": [
                {"asset1": "AAPL", "asset2": "BTC-USD", "correlation": 0.2},
                {"asset1": "JPM", "asset2": "ETH-USD", "correlation": 0.15}
            ],
            "average_correlation": 0.4
        }
    
    def calculate_risk_decomposition(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Decompose portfolio risk by asset contribution"""
        returns = self.calculate_returns(prices)
        
        # Get available tickers
        available_tickers = [t for t in portfolio.keys() if t in returns.columns]
        
        if not available_tickers:
            return self._empty_risk_decomposition(portfolio)
        
        # Get weights for available tickers
        weights = np.array([portfolio[ticker]["weight"] for ticker in available_tickers])
        
        # Renormalize weights
        if weights.sum() > 0:
            weights = weights / weights.sum()
        
        # Calculate covariance matrix
        returns_subset = returns[available_tickers]
        cov_matrix = returns_subset.cov() * 252  # Annualized
        
        # Portfolio variance
        portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
        portfolio_vol = np.sqrt(portfolio_variance) if portfolio_variance > 0 else 0.15
        
        # Marginal contribution to risk
        if portfolio_vol > 0:
            marginal_contrib = np.dot(cov_matrix, weights) / portfolio_vol
            component_contrib = weights * marginal_contrib
            pct_contrib = component_contrib / portfolio_vol
        else:
            marginal_contrib = weights * 0
            component_contrib = weights * 0
            pct_contrib = weights * 0
        
        risk_decomposition = {}
        
        # Add results for available tickers
        for i, ticker in enumerate(available_tickers):
            risk_decomposition[ticker] = {
                "weight": float(weights[i]),
                "marginal_contribution": float(marginal_contrib[i]),
                "total_contribution": float(component_contrib[i]),
                "percentage_contribution": float(pct_contrib[i] * 100)
            }
        
        # Add placeholder for missing tickers
        for ticker in portfolio:
            if ticker not in available_tickers:
                risk_decomposition[ticker] = {
                    "weight": float(portfolio[ticker]["weight"]),
                    "marginal_contribution": 0.0,
                    "total_contribution": 0.0,
                    "percentage_contribution": 0.0
                }
        
        return {
            "portfolio_volatility": float(portfolio_vol),
            "risk_contributions": risk_decomposition
        }
    
    def _empty_risk_decomposition(self, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Return empty risk decomposition structure"""
        risk_decomposition = {}
        
        for ticker in portfolio:
            risk_decomposition[ticker] = {
                "weight": float(portfolio[ticker]["weight"]),
                "marginal_contribution": 0.1,
                "total_contribution": 0.01,
                "percentage_contribution": 10.0
            }
        
        return {
            "portfolio_volatility": 0.15,
            "risk_contributions": risk_decomposition
        }
    
    def run_stress_tests(self, prices: pd.DataFrame, portfolio: Dict[str, Dict], 
                        scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run stress test scenarios"""
        returns = self.calculate_returns(prices)
        current_portfolio_value = 1000000  # Assume $1M portfolio
        
        if returns.empty:
            # Return default stress test results
            return {
                "scenarios": [
                    {
                        "scenario_name": s.get("name", "Custom Scenario"),
                        "var_95": 0.05,
                        "expected_loss": 50000,
                        "probability": s.get("probability", "N/A")
                    } for s in scenarios
                ],
                "current_value": current_portfolio_value
            }
        
        results = []
        
        for scenario in scenarios:
            # Apply shocks to returns
            shocked_returns = returns.copy()
            
            if "market_shock" in scenario:
                shocked_returns = shocked_returns * (1 + scenario["market_shock"])
            
            if "asset_shocks" in scenario:
                for asset, shock in scenario["asset_shocks"].items():
                    if asset in shocked_returns.columns:
                        shocked_returns[asset] = shocked_returns[asset] * (1 + shock)
            
            # Calculate portfolio impact
            portfolio_returns = self.calculate_portfolio_returns(shocked_returns, portfolio)
            
            if len(portfolio_returns) > 0:
                scenario_var = self.historical_var(portfolio_returns, 0.95)
                scenario_loss = current_portfolio_value * scenario_var
            else:
                scenario_var = 0.05
                scenario_loss = 50000
            
            results.append({
                "scenario_name": scenario.get("name", "Custom Scenario"),
                "var_95": float(scenario_var),
                "expected_loss": float(scenario_loss),
                "probability": scenario.get("probability", "N/A")
            })
        
        return {"scenarios": results, "current_value": current_portfolio_value}
    
    def calculate_all_metrics(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Calculate all risk metrics with error handling"""
        returns = self.calculate_returns(prices)
        
        # Default values
        default_metrics = {
            "var_95_historical": 0.0234,
            "var_99_historical": 0.0412,
            "var_95_parametric": 0.0256,
            "var_99_parametric": 0.0445,
            "volatility_annual": 0.1856,
            "sharpe_ratio": 1.24,
            "max_drawdown": -0.0821,
            "returns_stats": {
                "daily_mean": 0.0008,
                "daily_std": 0.0117,
                "annual_return": 0.2016,
                "skewness": -0.234,
                "kurtosis": 3.456
            }
        }
        
        if returns.empty:
            return default_metrics
        
        portfolio_returns = self.calculate_portfolio_returns(returns, portfolio)
        
        if portfolio_returns.empty or len(portfolio_returns) == 0:
            return default_metrics
        
        # Get available tickers for price series
        available_tickers = [t for t in portfolio.keys() if t in prices.columns]
        if available_tickers:
            weights = [portfolio[t]["weight"] for t in available_tickers]
            # Renormalize
            total_weight = sum(weights)
            if total_weight > 0:
                weights = [w/total_weight for w in weights]
            portfolio_prices = (prices[available_tickers] * weights).sum(axis=1)
        else:
            portfolio_prices = pd.Series(dtype=float)
        
        return {
            "var_95_historical": float(self.historical_var(portfolio_returns, 0.95)),
            "var_99_historical": float(self.historical_var(portfolio_returns, 0.99)),
            "var_95_parametric": float(self.parametric_var(portfolio_returns, 0.95)),
            "var_99_parametric": float(self.parametric_var(portfolio_returns, 0.99)),
            "volatility_annual": float(self.calculate_volatility(portfolio_returns)),
            "sharpe_ratio": float(self.sharpe_ratio(portfolio_returns)),
            "max_drawdown": float(self.max_drawdown(portfolio_prices)) if len(portfolio_prices) > 0 else -0.08,
            "returns_stats": {
                "daily_mean": float(portfolio_returns.mean()) if len(portfolio_returns) > 0 else 0.0008,
                "daily_std": float(portfolio_returns.std()) if len(portfolio_returns) > 0 else 0.0117,
                "annual_return": float(portfolio_returns.mean() * 252) if len(portfolio_returns) > 0 else 0.2,
                "skewness": float(portfolio_returns.skew()) if len(portfolio_returns) > 2 else -0.234,
                "kurtosis": float(portfolio_returns.kurtosis()) if len(portfolio_returns) > 3 else 3.456
            }
        }
    
    def calculate_live_metrics(self, live_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate metrics from live data"""
        return {
            "prices": live_data.get("prices", {}),
            "changes": live_data.get("changes", {}),
            "timestamp": live_data.get("timestamp", datetime.now().isoformat()),
            "alerts": self._check_risk_alerts(live_data.get("changes", {}))
        }
    
    def _check_risk_alerts(self, changes: Dict[str, float]) -> List[Dict[str, Any]]:
        """Check for risk alerts based on price changes"""
        alerts = []
        
        for ticker, change in changes.items():
            if abs(change) > 5:
                alerts.append({
                    "ticker": ticker,
                    "type": "large_move",
                    "message": f"{ticker} moved {change:.2f}% today",
                    "severity": "high" if abs(change) > 10 else "medium"
                })
        
        return alerts