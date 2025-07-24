# app.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import asyncio
import json
from datetime import datetime
from contextlib import asynccontextmanager

# Import other modules (not as relative imports)
from risk_engine import RiskEngine
from market_data import MarketDataService

# Default portfolio - moved here to avoid circular import
DEFAULT_PORTFOLIO = {
    "AAPL": {"weight": 0.20, "shares": 100},
    "MSFT": {"weight": 0.15, "shares": 50},
    "GOOGL": {"weight": 0.15, "shares": 30},
    "NVDA": {"weight": 0.15, "shares": 40},
    "TSLA": {"weight": 0.10, "shares": 25},
    "JPM": {"weight": 0.10, "shares": 60},
    "GS": {"weight": 0.05, "shares": 15},
    "BTC-USD": {"weight": 0.05, "shares": 0.5},
    "ETH-USD": {"weight": 0.05, "shares": 2}
}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()
market_service = MarketDataService()
risk_engine = RiskEngine()

# Background task for live updates
async def broadcast_live_data():
    while True:
        try:
            # Get live prices and calculate metrics
            live_data = market_service.get_live_portfolio_data(DEFAULT_PORTFOLIO)
            if live_data:
                risk_metrics = risk_engine.calculate_live_metrics(live_data)
                await manager.broadcast({
                    "type": "live_update",
                    "timestamp": datetime.now().isoformat(),
                    "data": risk_metrics
                })
        except Exception as e:
            print(f"Error in broadcast: {e}")
        
        await asyncio.sleep(5)  # Update every 5 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    task = asyncio.create_task(broadcast_live_data())
    yield
    # Shutdown
    task.cancel()

app = FastAPI(lifespan=lifespan)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Risk Metrics Dashboard API", "version": "1.0.0"}

@app.get("/api/portfolio")
async def get_portfolio():
    """Get current portfolio with live prices"""
    return market_service.get_portfolio_with_prices(DEFAULT_PORTFOLIO)

@app.get("/api/risk-metrics")
async def get_risk_metrics():
    """Calculate comprehensive risk metrics"""
    # Get historical data (2 years including 2024-2025)
    tickers = list(DEFAULT_PORTFOLIO.keys())
    historical_data = market_service.get_historical_data(tickers)
    
    # Calculate all metrics
    metrics = risk_engine.calculate_all_metrics(
        historical_data, 
        DEFAULT_PORTFOLIO
    )
    
    return {
        "timestamp": datetime.now().isoformat(),
        "metrics": metrics,
        "portfolio": DEFAULT_PORTFOLIO
    }

@app.get("/api/var-analysis")
async def get_var_analysis():
    """Detailed VaR analysis with confidence levels"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    data = market_service.get_historical_data(tickers)
    
    return risk_engine.calculate_var_analysis(data, DEFAULT_PORTFOLIO)

@app.post("/api/stress-test")
async def run_stress_test(scenarios: List[Dict[str, Any]]):
    """Run custom stress test scenarios"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    data = market_service.get_historical_data(tickers)
    
    results = risk_engine.run_stress_tests(data, DEFAULT_PORTFOLIO, scenarios)
    return results

@app.get("/api/correlation-matrix")
async def get_correlation_matrix():
    """Get correlation matrix for portfolio assets"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    data = market_service.get_historical_data(tickers)
    
    return risk_engine.calculate_correlations(data)

@app.get("/api/risk-decomposition")
async def get_risk_decomposition():
    """Decompose portfolio risk by asset"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    data = market_service.get_historical_data(tickers)
    
    return risk_engine.calculate_risk_decomposition(data, DEFAULT_PORTFOLIO)

@app.websocket("/ws/live-data")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)