/**
 * Financial Data API Service
 * Integrates with various APIs to fetch real-time prices for stocks, crypto, and real estate
 */

// Yahoo Finance API (No longer available - requires API key for CORS proxy)
class YahooFinanceAPI {
  static async getStockPrice(symbol) {
    // Note: This service now requires an API key
    // Falling back to Alpha Vantage
    console.warn('Yahoo Finance API requires API key - using Alpha Vantage instead');
    return await AlphaVantageAPI.getStockPrice(symbol);
  }

  static async searchSymbols(query) {
    // Yahoo Finance API search is not available without API key
    // Return empty array - users will need to enter symbols manually
    console.warn('Yahoo Finance search requires API key - please enter symbol manually');
    return [];
  }
}

// CoinGecko API (Free for basic usage)
class CoinGeckoAPI {
  static async getCryptoPrice(id) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
      );
      const data = await response.json();

      if (data[id]) {
        return {
          price: data[id].usd,
          currency: 'USD',
          marketCap: data[id].usd_market_cap,
          change24h: data[id].usd_24h_change,
          name: id.charAt(0).toUpperCase() + id.slice(1)
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching crypto price for ${id}:`, error);
      return null;
    }
  }

  static async searchCryptos(query) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      return data.coins?.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb
      })) || [];
    } catch (error) {
      console.error('Error searching cryptos:', error);
      return [];
    }
  }
}

// Zillow API (Requires API key)
class ZillowAPI {
  static async getPropertyDetails(zpid) {
    // Note: This requires a Zillow API key
    // For demo purposes, we'll return a mock response
    // In production, you'd need to sign up for Zillow's API
    try {
      const apiKey = process.env.REACT_APP_ZILLOW_API_KEY;
      if (!apiKey) {
        console.warn('Zillow API key not found in environment variables');
        return null;
      }

      // This is a placeholder - actual Zillow API endpoints may differ
      const response = await fetch(
        `https://api.zillow.com/property/${zpid}?zws-id=${apiKey}`
      );
      const data = await response.json();

      return {
        price: data.zestimate?.amount,
        address: data.address?.streetAddress,
        city: data.address?.city,
        state: data.address?.state,
        zipCode: data.address?.zipcode,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqft: data.livingArea
      };
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  static async searchProperties(address) {
    // Simplified search - in reality, you'd use Zillow's search API
    try {
      // For demo purposes, return empty array
      // In production, implement actual Zillow search
      console.log('Zillow property search not implemented - requires API key');
      return [];
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }
}

// Alpha Vantage API (Free with API key, limited calls)
class AlphaVantageAPI {
  static async getStockPrice(symbol) {
    const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn('Alpha Vantage API key not found');
      return null;
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data['Global Quote']?.['05. price']) {
        return {
          price: parseFloat(data['Global Quote']['05. price']),
          currency: 'USD',
          change: parseFloat(data['Global Quote']['09. change']),
          changePercent: data['Global Quote']['10. change percent'],
          name: data['Global Quote']['01. symbol']
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Alpha Vantage:', error);
      return null;
    }
  }
}

// Main Financial Data API Service
class FinancialDataAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  getCachedPrice(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedPrice(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getPrice(assetType, symbol) {
    const cacheKey = `${assetType}:${symbol}`;

    // Check cache first
    const cached = this.getCachedPrice(cacheKey);
    if (cached) {
      return cached;
    }

    let price = null;

    try {
      switch (assetType) {
        case 'stock':
        case 'etf':
          price = await YahooFinanceAPI.getStockPrice(symbol);
          break;
        case 'crypto':
          price = await CoinGeckoAPI.getCryptoPrice(symbol);
          break;
        default:
          if (process.env.REACT_APP_ALPHA_VANTAGE_API_KEY) {
            price = await AlphaVantageAPI.getStockPrice(symbol);
          }
      }

      if (price) {
        this.setCachedPrice(cacheKey, price);
      }

      return price;
    } catch (error) {
      console.error('Error fetching price:', error);
      return null;
    }
  }

  async searchAssets(query, types = ['stock', 'crypto']) {
    const results = {
      stocks: [],
      cryptos: [],
      etfs: []
    };

    try {
      // Search stocks and ETFs
      if (types.includes('stock') || types.includes('etf')) {
        const stockResults = await YahooFinanceAPI.searchSymbols(query);
        results.stocks = stockResults.filter(item =>
          ['equity', 'etf'].includes(item.type)
        );
        results.etfs = stockResults.filter(item => item.type === 'etf');
      }

      // Search cryptocurrencies
      if (types.includes('crypto')) {
        results.cryptos = await CoinGeckoAPI.searchCryptos(query);
      }
    } catch (error) {
      console.error('Error searching assets:', error);
    }

    return results;
  }

  // Calculate value based on quantity and current price
  calculateValue(quantity, price) {
    if (!quantity || !price) return 0;
    return parseFloat(quantity) * parseFloat(price);
  }
}

// Export singleton instance
export const financialDataAPI = new FinancialDataAPI();
export { YahooFinanceAPI, CoinGeckoAPI, ZillowAPI, AlphaVantageAPI };

// Asset type mappings
export const ASSET_TYPES = {
  MANUAL: 'manual',
  STOCK: 'stock',
  CRYPTO: 'crypto',
  REAL_ESTATE: 'real_estate',
  ETF: 'etf',
  MUTUAL_FUND: 'mutual_fund',
  BOND: 'bond',
  COMMODITY: 'commodity'
};

// Popular symbols for quick search
export const POPULAR_SYMBOLS = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'BRK-B', name: 'Berkshire Hathaway' }
  ],
  crypto: [
    { symbol: 'bitcoin', name: 'Bitcoin' },
    { symbol: 'ethereum', name: 'Ethereum' },
    { symbol: 'binancecoin', name: 'BNB' },
    { symbol: 'cardano', name: 'Cardano' },
    { symbol: 'solana', name: 'Solana' },
    { symbol: 'polkadot', name: 'Polkadot' },
    { symbol: 'ripple', name: 'XRP' },
    { symbol: 'dogecoin', name: 'Dogecoin' }
  ],
  etfs: [
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { symbol: 'VGT', name: 'Vanguard Information Technology ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Shares' }
  ]
};