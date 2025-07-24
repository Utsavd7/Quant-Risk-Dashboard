export const calculatePortfolioMetrics = (portfolio: any) => {
  // Client-side calculations if needed
  return {
    totalValue: Object.values(portfolio).reduce((sum: number, asset: any) => sum + asset.market_value, 0),
    totalWeight: Object.values(portfolio).reduce((sum: number, asset: any) => sum + asset.weight, 0),
  };
};