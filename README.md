# 🚀 Quantitative Risk Metrics Dashboard

A sophisticated real-time portfolio risk management system built with FastAPI and React. This application provides comprehensive risk analysis tools including VaR calculations, stress testing, correlation analysis, and live market data monitoring.

**🎯 Ready to Explore?** The dashboard comes with realistic demo data and simulated market feeds, so you can immediately explore all features without requiring API keys or live market connections. Perfect for learning quantitative finance concepts or showcasing risk management capabilities.

## ✨ Features

### 🎯 Core Risk Analytics
- **Value at Risk (VaR)** - Historical and parametric VaR calculations at multiple confidence levels
- **Stress Testing** - Scenario-based portfolio impact analysis with predefined and custom scenarios
- **Correlation Analysis** - Interactive correlation matrix with educational insights
- **Portfolio Monitoring** - Real-time price tracking with rebalancing alerts

### 📊 Interactive Dashboards
- **Live Price Monitor** - Real-time portfolio updates via WebSocket
- **Market Overview** - Major market indices with live charts
- **Risk Metrics** - Key performance indicators with trend analysis
- **Demo Data Explorer** - Interactive API data structure visualization

### 🔧 Technical Features
- **Real-time Updates** - WebSocket integration for live data
- **Performance Optimized** - Aggressive caching and lazy loading
- **Educational UX** - Built-in explanations for complex financial concepts
- **Multiple Data Sources** - Fallback systems for market data reliability
- **Modern UI** - Glassmorphism design with smooth animations

## 📸 Application Screenshots

<table>
  <tr>
    <td align="center" width="33%">
      <strong>🏠 Dashboard Overview</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.41.19 PM.png"/><br/>
      <em>Main dashboard with portfolio metrics, market indices, and real-time data</em>
    </td>
    <td align="center" width="33%">
      <strong>📊 VaR Analysis</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.41.28 PM.png" width="300" alt="VaR Analysis"/><br/>
      <em>Value at Risk analysis with distribution charts and confidence levels</em>
    </td>
    <td align="center" width="33%">
      <strong>🧪 Stress Testing</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.41.39 PM.png" width="300" alt="Stress Testing"/><br/>
      <em>Interactive stress testing scenarios with impact visualization</em>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <strong>🔗 Correlation Matrix</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.41.49 PM.png" width="300" alt="Correlation Matrix"/><br/>
      <em>Interactive correlation heatmap with educational insights</em>
    </td>
    <td align="center" width="33%">
      <strong>📈 Live Prices Monitor</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.41.58 PM.png" width="300" alt="Live Prices Monitor"/><br/>
      <em>Real-time portfolio monitoring with rebalancing alerts</em>
    </td>
    <td align="center" width="33%">
      <strong>📁 Demo Data Explorer</strong><br/>
      <img src="screenshots/Screenshot 2025-07-27 at 2.42.06 PM.png" width="300" alt="Demo Data Explorer"/><br/>
      <em>API structure explorer with live data examples</em>
    </td>
  </tr>
</table>

## 🏗️ Architecture

### Backend (FastAPI)
```
├── app.py              # Main application with WebSocket support
├── risk_engine.py      # Core risk calculations and analytics
├── market_data.py      # Market data service with multiple providers
└── requirements.txt    # Python dependencies
```

### Frontend (React + TypeScript)
```
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx           # Main dashboard with lazy loading
│   │   ├── VaRAnalysis.tsx        # VaR visualization and analysis
│   │   ├── StressTest.tsx         # Stress testing scenarios
│   │   ├── CorrelationMatrix.tsx  # Interactive correlation heatmap
│   │   ├── LivePrices.tsx         # Real-time portfolio monitor
│   │   ├── MarketIndices.tsx      # Market overview charts
│   │   └── DemoData.tsx           # API structure explorer
│   ├── hooks/
│   │   ├── useWebSocket.ts        # WebSocket connection management
│   │   └── useRiskData.ts         # Data fetching hooks
│   ├── lib/
│   │   ├── api.ts                 # Optimized API client
│   │   └── performance.ts         # Performance monitoring
│   └── App.tsx                    # Root component with React Query
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd quantum-risk-dashboard

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app:app --reload --port 8000
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 🌐 Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📈 Market Data Configuration

The application supports multiple market data sources for reliability:

### Free Data Sources (No API Key Required)
- **CoinGecko** - Cryptocurrency prices
- **Generated Data** - Realistic stock price simulation

### Premium Data Sources (API Keys Required)
Create a `.env` file in the root directory:

```env
# Optional: Add API keys for live data
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
TWELVE_DATA_KEY=your_twelve_data_key
FINNHUB_KEY=your_finnhub_key
```

**Get Free API Keys:**
- [Alpha Vantage](https://alphavantage.co) - 500 requests/day
- [Twelve Data](https://twelvedata.com) - 5000 requests/month
- [Finnhub](https://finnhub.io) - 60 requests/minute

## 🔌 API Endpoints

### Core Data Endpoints
- `GET /api/all-data` - Fetch all dashboard data in one request
- `GET /api/risk-metrics` - Portfolio risk metrics
- `GET /api/var-analysis` - Value at Risk analysis
- `GET /api/correlation-matrix` - Asset correlation data
- `GET /api/portfolio` - Portfolio holdings with live prices
- `POST /api/stress-test` - Run stress test scenarios

### WebSocket
- `WS /ws/live-data` - Real-time price updates

## 🎨 UI/UX Features

### Educational Design
- **Contextual Help** - Tooltips and explanations for financial concepts
- **Progressive Disclosure** - Expandable educational banners
- **Visual Learning** - Color-coded charts and interactive elements

### Performance Optimizations
- **Lazy Loading** - Components load only when needed
- **Aggressive Caching** - React Query with 30-second stale time
- **Preloading** - Hover-based component preloading
- **WebSocket Fallback** - Automatic fallback to polling if WebSocket fails

## 📊 Risk Calculation Details & Mathematical Formulas

### Value at Risk (VaR)

#### Historical VaR
Based on empirical distribution of portfolio returns:
```
VaR_α = -Percentile(R, 1-α)
```
Where:
- `R` = Historical portfolio returns
- `α` = Confidence level (0.90, 0.95, 0.99)
- `Percentile(R, 1-α)` = The (1-α) percentile of return distribution

#### Parametric VaR
Assumes normal distribution of returns:
```
VaR_α = -(μ + σ × Φ^(-1)(1-α))
```
Where:
- `μ` = Mean daily return
- `σ` = Standard deviation of daily returns
- `Φ^(-1)` = Inverse standard normal cumulative distribution function
- `α` = Confidence level

#### Portfolio Return Calculation
```
R_p,t = Σ(w_i × R_i,t)
```
Where:
- `R_p,t` = Portfolio return at time t
- `w_i` = Weight of asset i in portfolio
- `R_i,t` = Return of asset i at time t

### Risk Metrics

#### Portfolio Volatility (Annualized)
```
σ_p = √(252) × σ_daily
σ_daily = √(Σ(w_i² × σ_i²) + Σ Σ(w_i × w_j × σ_i × σ_j × ρ_ij))
```
Where:
- `σ_i` = Volatility of asset i
- `ρ_ij` = Correlation between assets i and j
- `252` = Trading days per year

#### Sharpe Ratio
```
Sharpe = (R_p - R_f) / σ_p
```
Where:
- `R_p` = Portfolio return
- `R_f` = Risk-free rate
- `σ_p` = Portfolio volatility

#### Maximum Drawdown
```
MDD = max(DD_t) where DD_t = (P_peak - P_t) / P_peak
```
Where:
- `P_peak` = Peak portfolio value up to time t
- `P_t` = Portfolio value at time t

### Correlation Analysis

#### Pearson Correlation Coefficient
```
ρ_ij = Cov(R_i, R_j) / (σ_i × σ_j)
```
Where:
- `Cov(R_i, R_j)` = Covariance between returns of assets i and j
- `σ_i, σ_j` = Standard deviations of asset returns

#### Portfolio Variance
```
Var(R_p) = w^T × Σ × w
```
Where:
- `w` = Vector of portfolio weights
- `Σ` = Covariance matrix of asset returns
- `w^T` = Transpose of weight vector

### Stress Testing

#### Scenario Impact Calculation
```
L_scenario = P_0 × Σ(w_i × shock_i)
```
Where:
- `L_scenario` = Expected loss under scenario
- `P_0` = Initial portfolio value
- `w_i` = Weight of asset i
- `shock_i` = Price shock for asset i in scenario

#### Monte Carlo VaR (Advanced)
```
VaR_MC = -Percentile(Σ(w_i × R_i,sim), 1-α)
```
Where `R_i,sim` are simulated returns based on:
```
R_i,sim ~ N(μ_i, σ_i²) with correlation matrix Σ
```

### Return Distribution Statistics

#### Skewness
```
Skew = E[(R - μ)³] / σ³
```

#### Kurtosis
```
Kurt = E[(R - μ)⁴] / σ⁴
```

Where negative skewness indicates left tail risk (more frequent large losses).

---

### Code Quality
```bash
# Lint frontend code
npm run lint

# Type check
npm run build

# Format code
npm run format
```

### Performance Monitoring
The application includes built-in performance monitoring:
- API response times
- Component render times
- WebSocket connection health

### Testing
```bash
# Run frontend tests
npm test

# Run backend tests
pytest
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Serve with optimized settings
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```dockerfile
# Example Dockerfile for production
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Educational Resources

### Financial Concepts Explained
- **VaR**: "What's the most I could lose on a bad day?"
- **Correlation**: "Do my assets move together or independently?"
- **Stress Testing**: "How would my portfolio handle a crisis?"
- **Sharpe Ratio**: "Am I getting paid enough for the risk I'm taking?"

### Risk Management Best Practices
- **Diversification**: Spread risk across asset classes
- **Rebalancing**: Maintain target allocations
- **Position Sizing**: Don't put all eggs in one basket
- **Regular Monitoring**: Stay informed about portfolio performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

### Common Issues
- **WebSocket Connection Failed**: Check if backend is running on port 8000
- **No Market Data**: Verify API keys in `.env` file or use demo mode
- **Slow Performance**: Enable caching and check network connection

---

**Built with ❤️ for the quantitative finance community**

*Empowering investors with institutional-grade risk analytics tools*
