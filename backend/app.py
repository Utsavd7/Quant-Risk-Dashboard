# app.py - Fixed version with correct order
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import asyncio
import json
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import time

from risk_engine import RiskEngine
from market_data import MarketDataService

# Default portfolio
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

# Connection Manager for WebSocket
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

# Cache for storing computed data
class DataCache:
    def __init__(self):
        self.risk_metrics = None
        self.var_analysis = None
        self.correlation_matrix = None
        self.portfolio_data = None
        self.last_update = None
        self.update_interval = 60  # seconds
        
    def is_stale(self):
        if self.last_update is None:
            return True
        return (datetime.now() - self.last_update).seconds > self.update_interval
    
    def update_all(self, risk_metrics, var_analysis, correlation_matrix, portfolio_data):
        self.risk_metrics = risk_metrics
        self.var_analysis = var_analysis
        self.correlation_matrix = correlation_matrix
        self.portfolio_data = portfolio_data
        self.last_update = datetime.now()

# Initialize global instances
cache = DataCache()
manager = ConnectionManager()
market_service = MarketDataService()
risk_engine = RiskEngine()

# Background task to precompute all metrics
async def precompute_all_metrics():
    """Precompute all heavy calculations and cache them"""
    while True:
        try:
            start_time = time.time()
            
            # Get data once
            tickers = list(DEFAULT_PORTFOLIO.keys())
            historical_data = market_service.get_historical_data(tickers)
            
            # Compute all metrics
            risk_metrics_result = risk_engine.calculate_all_metrics(historical_data, DEFAULT_PORTFOLIO)
            var_analysis_result = risk_engine.calculate_var_analysis(historical_data, DEFAULT_PORTFOLIO)
            correlation_result = risk_engine.calculate_correlations(historical_data)
            portfolio_result = market_service.get_portfolio_with_prices(DEFAULT_PORTFOLIO)
            
            # Update cache with all results at once
            cache.update_all(
                risk_metrics={"timestamp": datetime.now().isoformat(), "metrics": risk_metrics_result, "portfolio": DEFAULT_PORTFOLIO},
                var_analysis=var_analysis_result,
                correlation_matrix=correlation_result,
                portfolio_data=portfolio_result
            )
            
            computation_time = time.time() - start_time
            print(f"Precomputed all metrics in {computation_time:.2f} seconds")
            
        except Exception as e:
            print(f"Error in precomputation: {e}")
        
        # Wait before next update
        await asyncio.sleep(30)  # Update every 30 seconds

# Fast broadcast for live data
async def broadcast_live_data():
    """Broadcast only price updates frequently"""
    while True:
        try:
            # Get only live prices (fast operation)
            live_data = market_service.get_live_portfolio_data(DEFAULT_PORTFOLIO)
            
            if live_data:
                await manager.broadcast({
                    "type": "price_update",
                    "timestamp": datetime.now().isoformat(),
                    "data": live_data
                })
            
        except Exception as e:
            print(f"Error in live broadcast: {e}")
        
        await asyncio.sleep(2)  # Update every 2 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing Risk Dashboard...")
    
    # Precompute initial data
    print("Precomputing initial data...")
    tickers = list(DEFAULT_PORTFOLIO.keys())
    
    try:
        historical_data = market_service.get_historical_data(tickers)
        
        # Initialize cache with computed data
        cache.update_all(
            risk_metrics={
                "timestamp": datetime.now().isoformat(), 
                "metrics": risk_engine.calculate_all_metrics(historical_data, DEFAULT_PORTFOLIO), 
                "portfolio": DEFAULT_PORTFOLIO
            },
            var_analysis=risk_engine.calculate_var_analysis(historical_data, DEFAULT_PORTFOLIO),
            correlation_matrix=risk_engine.calculate_correlations(historical_data),
            portfolio_data=market_service.get_portfolio_with_prices(DEFAULT_PORTFOLIO)
        )
        print("Initial data computed successfully")
    except Exception as e:
        print(f"Error computing initial data: {e}")
        # Initialize with empty data
        cache.update_all(
            risk_metrics={"timestamp": datetime.now().isoformat(), "metrics": {}, "portfolio": DEFAULT_PORTFOLIO},
            var_analysis={},
            correlation_matrix={},
            portfolio_data={}
        )
    
    # Start background tasks
    precompute_task = asyncio.create_task(precompute_all_metrics())
    broadcast_task = asyncio.create_task(broadcast_live_data())
    
    yield
    
    # Shutdown
    precompute_task.cancel()
    broadcast_task.cancel()

# Create FastAPI app
app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Risk Metrics Dashboard API", 
        "version": "2.0.0", 
        "cache_status": "enabled",
        "last_update": cache.last_update.isoformat() if cache.last_update else None
    }

# All endpoints return cached data immediately
@app.get("/api/risk-metrics")
async def get_risk_metrics():
    """Return cached risk metrics - instant response"""
    if cache.risk_metrics is None:
        return {"error": "Data not yet available", "message": "Please wait a moment for initial computation"}
    return cache.risk_metrics

@app.get("/api/var-analysis")
async def get_var_analysis():
    """Return cached VaR analysis - instant response"""
    if cache.var_analysis is None:
        return {"error": "Data not yet available", "message": "Please wait a moment for initial computation"}
    return cache.var_analysis

@app.get("/api/correlation-matrix")
async def get_correlation_matrix():
    """Return cached correlation matrix - instant response"""
    if cache.correlation_matrix is None:
        return {"error": "Data not yet available", "message": "Please wait a moment for initial computation"}
    return cache.correlation_matrix

@app.get("/api/portfolio")
async def get_portfolio():
    """Return cached portfolio data - instant response"""
    if cache.portfolio_data is None:
        return {"error": "Data not yet available", "message": "Please wait a moment for initial computation"}
    return cache.portfolio_data

@app.post("/api/stress-test")
async def run_stress_test(scenarios: List[Dict[str, Any]]):
    """Run stress test with cached data"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    
    # Try to use cached data if available
    if hasattr(market_service, '_cached_historical_data') and market_service._cached_historical_data is not None:
        data = market_service._cached_historical_data
    else:
        data = market_service.get_historical_data(tickers)
    
    # Run stress test
    results = risk_engine.run_stress_tests(data, DEFAULT_PORTFOLIO, scenarios)
    return results

@app.get("/api/risk-decomposition")
async def get_risk_decomposition():
    """Calculate risk decomposition with cached data"""
    tickers = list(DEFAULT_PORTFOLIO.keys())
    
    if hasattr(market_service, '_cached_historical_data') and market_service._cached_historical_data is not None:
        data = market_service._cached_historical_data
    else:
        data = market_service.get_historical_data(tickers)
    
    return risk_engine.calculate_risk_decomposition(data, DEFAULT_PORTFOLIO)

# New endpoint for batch data - get everything at once
@app.get("/api/all-data")
async def get_all_data():
    """Get all dashboard data in one request"""
    # Check if all data is available
    if not all([cache.risk_metrics, cache.var_analysis, cache.correlation_matrix, cache.portfolio_data]):
        return {
            "error": "Data not yet available", 
            "message": "Please wait a moment for initial computation",
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "risk_metrics": cache.risk_metrics,
        "var_analysis": cache.var_analysis,
        "correlation_matrix": cache.correlation_matrix,
        "portfolio": cache.portfolio_data,
        "timestamp": datetime.now().isoformat(),
        "cache_age": (datetime.now() - cache.last_update).seconds if cache.last_update else None
    }

@app.websocket("/ws/live-data")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    # Send initial cached data immediately upon connection
    initial_data = {
        "type": "initial_data",
        "data": {
            "risk_metrics": cache.risk_metrics,
            "portfolio": cache.portfolio_data
        }
    }
    
    try:
        await websocket.send_json(initial_data)
        
        while True:
            # Keep connection alive
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)