# setup_data_sources.py - Quick setup for free data sources
import os
import requests
import json

def setup_data_sources():
    print("🚀 Risk Dashboard - Data Source Setup")
    print("=" * 50)
    print("\nThis dashboard can use several FREE data sources:")
    print("\n1. NO API KEY NEEDED (Default):")
    print("   - Generated realistic market data")
    print("   - CoinGecko for crypto (BTC, ETH) - no key required")
    print("   - Perfect for demo/development")
    
    print("\n2. FREE API KEYS (Optional - Better data):")
    print("   - Alpha Vantage: 500 requests/day")
    print("   - Twelve Data: 800 requests/day") 
    print("   - Finnhub: 60 requests/minute")
    
    choice = input("\nDo you want to set up API keys? (y/n): ").lower()
    
    if choice != 'y':
        print("\n✅ Using default data sources (no API keys needed)")
        create_env_file({})
        return
    
    keys = {}
    
    print("\n📝 Enter your API keys (press Enter to skip):")
    
    # Alpha Vantage
    print("\n1. Alpha Vantage (https://www.alphavantage.co/support/#api-key)")
    av_key = input("   API Key: ").strip()
    if av_key:
        keys['ALPHA_VANTAGE_KEY'] = av_key
    
    # Twelve Data
    print("\n2. Twelve Data (https://twelvedata.com/apikey)")
    td_key = input("   API Key: ").strip()
    if td_key:
        keys['TWELVE_DATA_KEY'] = td_key
    
    # Finnhub
    print("\n3. Finnhub (https://finnhub.io/register)")
    fh_key = input("   API Key: ").strip()
    if fh_key:
        keys['FINNHUB_KEY'] = fh_key
    
    create_env_file(keys)
    
    print("\n✅ Configuration saved to backend/.env")
    print("\n🎉 Setup complete! Run the following commands:")
    print("   cd backend")
    print("   uvicorn app:app --reload")

def create_env_file(keys):
    env_content = """# Risk Dashboard Environment Variables

# Data Source API Keys (all optional)
"""
    
    # Add provided keys or use 'demo' as default
    env_content += f"ALPHA_VANTAGE_KEY={keys.get('ALPHA_VANTAGE_KEY', 'demo')}\n"
    env_content += f"TWELVE_DATA_KEY={keys.get('TWELVE_DATA_KEY', 'demo')}\n"
    env_content += f"FINNHUB_KEY={keys.get('FINNHUB_KEY', 'demo')}\n"
    
    # Write to backend directory
    env_path = os.path.join('backend', '.env')
    os.makedirs('backend', exist_ok=True)
    
    with open(env_path, 'w') as f:
        f.write(env_content)

if __name__ == "__main__":
    setup_data_sources()