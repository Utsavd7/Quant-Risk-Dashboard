# Quantitative Risk Metrics Dashboard

A professional-grade portfolio risk analytics platform implementing advanced quantitative finance models with real-time market data integration and interactive visualizations.

![Python](https://img.shields.io/badge/Python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🎯 Overview

This platform provides institutional-grade risk analytics for portfolio management, featuring:

- **Real-time Risk Metrics**: VaR, CVaR, volatility, Sharpe ratio, maximum drawdown
- **Advanced Analytics**: Correlation analysis, stress testing, risk decomposition
- **Live Market Data**: WebSocket integration for real-time price feeds
- **Interactive Visualizations**: D3.js-powered correlation matrices, distribution charts
- **Professional UI**: Glassmorphic design with smooth animations

## 📊 Mathematical Models & Formulas

### 1. Value at Risk (VaR)

#### Historical VaR
The α-quantile of the historical return distribution:

```
VaR_α = -quantile(R, 1-α)
```

Where:
- R = historical returns vector
- α = confidence level (e.g., 0.95 for 95% VaR)

#### Parametric VaR (Variance-Covariance Method)
Assumes normal distribution of returns:

```
VaR_α = -(μ + σ * Φ^(-1)(1-α))
```

Where:
- μ = mean return
- σ = standard deviation of returns
- Φ^(-1) = inverse normal cumulative distribution function

### 2. Portfolio Risk Metrics

#### Portfolio Variance
```
σ²_p = w^T Σ w
```

Where:
- w = vector of asset weights
- Σ = covariance matrix of asset returns
- σ²_p = portfolio variance

#### Portfolio Volatility (Annualized)
```
σ_p = √(σ²_p) * √252
```

### 3. Risk-Adjusted Performance

#### Sharpe Ratio
```
SR = (R_p - R_f) / σ_p
```

Where:
- R_p = portfolio return
- R_f = risk-free rate
- σ_p = portfolio standard deviation

#### Information Ratio
```
IR = (R_p - R_b) / TE
```

Where:
- R_b = benchmark return
- TE = tracking error (std of excess returns)

### 4. Drawdown Analysis

#### Maximum Drawdown
```
MDD = min((V_t - V_peak) / V_peak)
```

Where:
- V_t = portfolio value at time t
- V_peak = peak value before time t

### 5. Correlation & Covariance

#### Pearson Correlation
```
ρ_ij = Cov(R_i, R_j) / (σ_i * σ_j)
```

#### Covariance Matrix
```
Σ_ij = E[(R_i - μ_i)(R_j - μ_j)]
```

### 6. Risk Decomposition

#### Marginal Contribution to Risk
```
MCR_i = ∂σ_p/∂w_i = (Σw)_i / σ_p
```

#### Component Contribution to Risk
```
CCR_i = w_i * MCR_i
```

### 7. Stress Testing

#### Scenario Analysis
```
Loss = Σ(w_i * ΔP_i * shock_i)
```

Where:
- ΔP_i = price change of asset i
- shock_i = stress scenario shock for asset i

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/risk-dashboard.git
cd risk-dashboard
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
uvicorn app:app --reload
```
The API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

## 🏗️ Architecture

### Technology Stack

#### Backend
- **FastAPI**: High-performance async API framework
- **NumPy/Pandas**: Numerical computations and data manipulation
- **SciPy**: Statistical functions and distributions
- **yfinance**: Yahoo Finance market data integration
- **WebSockets**: Real-time data streaming

#### Frontend
- **React 18**: UI library with concurrent features
- **TypeScript**: Type-safe development
- **TanStack Query**: Efficient data fetching and caching
- **D3.js**: Advanced data visualizations
- **Recharts**: Interactive charts
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

### Project Structure

```
risk-dashboard/
├── backend/
│   ├── app.py                 # FastAPI application & WebSocket server
│   ├── risk_engine.py         # Core risk calculation algorithms
│   ├── market_data.py         # Market data fetching & processing
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   │   ├── VaRAnalysis.tsx    # VaR calculations & viz
│   │   │   ├── StressTest.tsx     # Stress testing interface
│   │   │   ├── CorrelationMatrix.tsx  # D3.js correlation heatmap
│   │   │   └── LivePrices.tsx     # Real-time price monitor
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useWebSocket.ts    # WebSocket connection
│   │   │   └── useRiskData.ts     # Risk metrics fetching
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts             # API client
│   │   │   └── calculations.ts    # Client-side calculations
│   │   └── App.tsx            # Application root
│   ├── package.json           # Node dependencies
│   └── vite.config.ts         # Build configuration
└── README.md
```

## 📈 Features

### 1. Real-time Risk Monitoring
- Live portfolio value updates via WebSocket
- Streaming price data with visual indicators
- Automatic risk metric recalculation

### 2. Value at Risk Analysis
- Historical VaR using empirical distribution
- Parametric VaR with normal distribution assumption
- Multiple confidence levels (90%, 95%, 99%)
- Rolling VaR time series visualization

### 3. Stress Testing Framework
- Pre-defined scenarios (Market Crash, Flash Crash, Rate Hike, Black Swan)
- Custom scenario builder with adjustable parameters
- Portfolio impact visualization
- Loss distribution analysis

### 4. Correlation Analysis
- Interactive correlation heatmap using D3.js
- Hover tooltips with detailed correlation values
- Identification of highest/lowest correlations
- Portfolio diversification insights

### 5. Portfolio Analytics
- Real-time position monitoring
- Weight drift analysis
- Performance attribution
- Risk decomposition by asset

## 🔧 API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/risk-metrics` | GET | Calculate all portfolio risk metrics |
| `/api/var-analysis` | GET | Detailed VaR analysis with confidence levels |
| `/api/correlation-matrix` | GET | Asset correlation matrix and statistics |
| `/api/stress-test` | POST | Run custom stress test scenarios |
| `/api/portfolio` | GET | Current portfolio with live prices |
| `/api/risk-decomposition` | GET | Risk contribution by asset |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `/ws/live-data` | Real-time price updates and risk alerts |

## 🧮 Sample Calculations

### Example: 95% VaR Calculation

```python
import numpy as np

# Sample returns
returns = np.array([-0.02, 0.01, -0.015, 0.03, -0.01, ...])

# Historical VaR
confidence_level = 0.95
var_95_historical = -np.percentile(returns, (1 - confidence_level) * 100)
# Result: 0.0234 (2.34% maximum expected daily loss)

# Parametric VaR
mean_return = returns.mean()
std_return = returns.std()
z_score = stats.norm.ppf(1 - confidence_level)
var_95_parametric = -(mean_return + z_score * std_return)
# Result: 0.0256 (2.56% maximum expected daily loss)
```

### Example: Portfolio Volatility

```python
# Asset weights
weights = np.array([0.20, 0.15, 0.15, 0.15, 0.10, 0.10, 0.05, 0.05, 0.05])

# Covariance matrix (annualized)
cov_matrix = returns_df.cov() * 252

# Portfolio variance
port_variance = np.dot(weights, np.dot(cov_matrix, weights))

# Portfolio volatility
port_volatility = np.sqrt(port_variance)
# Result: 0.1856 (18.56% annual volatility)
```

## 🎓 Educational Features

The platform includes comprehensive educational content for users new to quantitative finance:

- **Interactive Tutorials**: Step-by-step guide through each feature
- **Concept Explanations**: Plain-language descriptions of risk metrics
- **Real-world Examples**: Practical scenarios demonstrating each metric
- **Tooltips & Help**: Context-sensitive help throughout the interface

## 🔐 Security & Performance

- **CORS Protection**: Configured for local development
- **Input Validation**: All user inputs sanitized
- **Error Handling**: Graceful fallback to demo data
- **Caching**: Efficient data caching with React Query
- **Optimistic Updates**: Immediate UI feedback

## 🚢 Deployment

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```env
# .env
PYTHONPATH=/app
YAHOO_FINANCE_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/db
```

## 📚 Further Development

### Planned Features
- [ ] Conditional VaR (CVaR/Expected Shortfall)
- [ ] Monte Carlo simulation engine
- [ ] Portfolio optimization (Mean-Variance, Black-Litterman)
- [ ] Factor analysis (PCA, Fama-French)
- [ ] Backtesting framework
- [ ] Options analytics (Greeks calculation)
- [ ] Machine learning risk prediction

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Yahoo Finance for market data
- D3.js community for visualization tools
- FastAPI team for the excellent framework
- React team for the powerful UI library

## 📞 Contact

Your Name - [utsavd7@gmail.com](utsavd7@gmail.com)

---

**Note**: This project uses simulated data when market APIs are unavailable. For production use, ensure proper API keys and data sources are configured.