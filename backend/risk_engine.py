import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta

class RiskEngine:
    def __init__(self):
        self.risk_free_rate = 0.045  # 4.5% risk-free rate (2025 estimate)
    
    def calculate_returns(self, prices: pd.DataFrame) -> pd.DataFrame:
        """Calculate daily returns"""
        return prices.pct_change().dropna()
    
    def calculate_portfolio_returns(self, returns: pd.DataFrame, weights: Dict[str, float]) -> pd.Series:
        """Calculate portfolio returns based on weights"""
        # Extract weights in correct order
        tickers = returns.columns.tolist()
        w = np.array([weights[ticker]["weight"] for ticker in tickers])
        
        # Calculate weighted returns
        portfolio_returns = (returns * w).sum(axis=1)
        return portfolio_returns
    
    def historical_var(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Historical VaR"""
        return -np.percentile(returns, (1 - confidence_level) * 100)
    
    def parametric_var(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Parametric VaR (assumes normal distribution)"""
        mean = returns.mean()
        std = returns.std()
        z_score = stats.norm.ppf(1 - confidence_level)
        return -(mean + z_score * std)
    
    def calculate_var_analysis(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Comprehensive VaR analysis"""
        returns = self.calculate_returns(prices)
        portfolio_returns = self.calculate_portfolio_returns(returns, portfolio)
        
        # Multiple confidence levels
        confidence_levels = [0.90, 0.95, 0.99]
        
        var_results = {
            "historical": {},
            "parametric": {},
            "returns_distribution": {
                "mean": float(portfolio_returns.mean()),
                "std": float(portfolio_returns.std()),
                "skew": float(portfolio_returns.skew()),
                "kurtosis": float(portfolio_returns.kurtosis())
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
        window = 252  # 1 year rolling
        rolling_var = []
        
        for i in range(window, len(portfolio_returns)):
            window_returns = portfolio_returns.iloc[i-window:i]
            rolling_var.append({
                "date": portfolio_returns.index[i].isoformat(),
                "var_95": float(self.historical_var(window_returns, 0.95))
            })
        
        var_results["time_series"] = rolling_var
        
        return var_results
    
    def calculate_volatility(self, returns: pd.Series, annualize: bool = True) -> float:
        """Calculate volatility (annualized by default)"""
        vol = returns.std()
        if annualize:
            vol *= np.sqrt(252)  # Annualize
        return float(vol)
    
    def sharpe_ratio(self, returns: pd.Series) -> float:
        """Calculate Sharpe Ratio"""
        excess_returns = returns - self.risk_free_rate / 252  # Daily risk-free
        return float(np.sqrt(252) * excess_returns.mean() / returns.std())
    
    def max_drawdown(self, prices: pd.Series) -> float:
        """Calculate Maximum Drawdown"""
        cumulative = (1 + self.calculate_returns(prices)).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return float(drawdown.min())
    
    def calculate_correlations(self, prices: pd.DataFrame) -> Dict[str, Any]:
        """Calculate correlation matrix and statistics"""
        returns = self.calculate_returns(prices)
        corr_matrix = returns.corr()
        
        # Find highest and lowest correlations
        corr_values = []
        for i in range(len(corr_matrix)):
            for j in range(i+1, len(corr_matrix)):
                corr_values.append({
                    "asset1": corr_matrix.index[i],
                    "asset2": corr_matrix.columns[j],
                    "correlation": corr_matrix.iloc[i, j]
                })
        
        corr_values.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        return {
            "matrix": corr_matrix.to_dict(),
            "highest_correlations": corr_values[:5],
            "lowest_correlations": corr_values[-5:],
            "average_correlation": float(corr_matrix.values[np.triu_indices_from(corr_matrix.values, k=1)].mean())
        }
    
    def calculate_risk_decomposition(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Decompose portfolio risk by asset contribution"""
        returns = self.calculate_returns(prices)
        
        # Get weights
        tickers = returns.columns.tolist()
        weights = np.array([portfolio[ticker]["weight"] for ticker in tickers])
        
        # Calculate covariance matrix
        cov_matrix = returns.cov() * 252  # Annualized
        
        # Portfolio variance
        portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
        portfolio_vol = np.sqrt(portfolio_variance)
        
        # Marginal contribution to risk
        marginal_contrib = np.dot(cov_matrix, weights) / portfolio_vol
        
        # Component contribution
        component_contrib = weights * marginal_contrib
        
        # Percentage contribution
        pct_contrib = component_contrib / portfolio_vol
        
        risk_decomposition = {}
        for i, ticker in enumerate(tickers):
            risk_decomposition[ticker] = {
                "weight": float(weights[i]),
                "marginal_contribution": float(marginal_contrib[i]),
                "total_contribution": float(component_contrib[i]),
                "percentage_contribution": float(pct_contrib[i] * 100)
            }
        
        return {
            "portfolio_volatility": float(portfolio_vol),
            "risk_contributions": risk_decomposition
        }
    
    def run_stress_tests(self, prices: pd.DataFrame, portfolio: Dict[str, Dict], 
                        scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run stress test scenarios"""
        returns = self.calculate_returns(prices)
        current_portfolio_value = 1000000  # Assume $1M portfolio
        
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
            scenario_var = self.historical_var(portfolio_returns, 0.95)
            scenario_loss = current_portfolio_value * scenario_var
            
            results.append({
                "scenario_name": scenario.get("name", "Custom Scenario"),
                "var_95": float(scenario_var),
                "expected_loss": float(scenario_loss),
                "probability": scenario.get("probability", "N/A")
            })
        
        return {"scenarios": results, "current_value": current_portfolio_value}
    
    def calculate_all_metrics(self, prices: pd.DataFrame, portfolio: Dict[str, Dict]) -> Dict[str, Any]:
        """Calculate all risk metrics"""
        returns = self.calculate_returns(prices)
        portfolio_returns = self.calculate_portfolio_returns(returns, portfolio)
        
        # Get prices as series for some calculations
        tickers = list(portfolio.keys())
        weights = [portfolio[t]["weight"] for t in tickers]
        portfolio_prices = (prices[tickers] * weights).sum(axis=1)
        
        return {
            "var_95_historical": float(self.historical_var(portfolio_returns, 0.95)),
            "var_99_historical": float(self.historical_var(portfolio_returns, 0.99)),
            "var_95_parametric": float(self.parametric_var(portfolio_returns, 0.95)),
            "var_99_parametric": float(self.parametric_var(portfolio_returns, 0.99)),
            "volatility_annual": float(self.calculate_volatility(portfolio_returns)),
            "sharpe_ratio": float(self.sharpe_ratio(portfolio_returns)),
            "max_drawdown": float(self.max_drawdown(portfolio_prices)),
            "returns_stats": {
                "daily_mean": float(portfolio_returns.mean()),
                "daily_std": float(portfolio_returns.std()),
                "annual_return": float(portfolio_returns.mean() * 252),
                "skewness": float(portfolio_returns.skew()),
                "kurtosis": float(portfolio_returns.kurtosis())
            }
        }
    
    def calculate_live_metrics(self, live_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate metrics from live data"""
        # This would integrate with real-time risk calculations
        # For now, return formatted live data
        return {
            "prices": live_data["prices"],
            "changes": live_data["changes"],
            "timestamp": live_data["timestamp"],
            "alerts": self._check_risk_alerts(live_data["changes"])
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