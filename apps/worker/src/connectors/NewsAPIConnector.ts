import axios from 'axios';

/**
 * NewsAPI Connector
 * 
 * Fetches commodity-related news from NewsAPI.org.
 * Free tier: 100 requests/day (max 100 articles per request).
 * Polls every 30 minutes to stay well within limits.
 * 
 * Searches for: gold, silver, crude oil, copper, aluminium, solar energy, commodities
 */

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: { name: string };
  publishedAt: string;
}

// Keywords to search — these map to commodity categories
const COMMODITY_KEYWORDS = [
  'gold price',
  'silver commodity',
  'crude oil price',
  'copper metal price',
  'aluminium metal',
  'solar energy market',
  'MCX commodity',
  'indian commodity market',
];

// Keyword → assetId mapping for linking news to specific commodities
const KEYWORD_ASSET_MAP: Record<string, string> = {
  'gold': 'MCX_GOLD',
  'silver': 'MCX_SILVER',
  'crude oil': 'MCX_CRUDEOIL',
  'copper': 'MCX_COPPER',
  'aluminium': 'MCX_ALUMINIUM',
  'aluminum': 'MCX_ALUMINIUM',
  'solar': 'POLYSILICON_USD',
  'steel': 'MCX_STEEL',
};

export class NewsAPIConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;

  constructor(
    apiKey: string,
    private onNews: (articles: {
      title: string;
      summary: string | null;
      sourceUrl: string;
      sourceName: string;
      sentiment: string | null;
      publishedAt: Date;
      matchedAssetId: string | null;
    }[]) => void,
  ) {
    this.apiKey = apiKey;
  }

  start() {
    console.log('[NewsAPI] Starting commodity news polling...');
    this.fetchNews();
    // Poll every 30 minutes
    this.timer = setInterval(() => this.fetchNews(), 30 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[NewsAPI] Stopped.');
  }

  private async fetchNews() {
    try {
      // Build a combined query for commodity news
      const query = COMMODITY_KEYWORDS.slice(0, 5).join(' OR ');

      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.apiKey,
        },
        timeout: 15000,
      });

      const articles: NewsArticle[] = response.data?.articles || [];
      
      if (articles.length === 0) {
        console.warn('[NewsAPI] No articles returned');
        return;
      }

      // Transform and detect which commodity an article belongs to
      const processed = articles
        .filter(a => a.title && a.title !== '[Removed]')
        .map(a => {
          const titleLower = (a.title || '').toLowerCase();
          const descLower = (a.description || '').toLowerCase();
          const combined = `${titleLower} ${descLower}`;

          // Find matching commodity
          let matchedAssetId: string | null = null;
          for (const [keyword, assetId] of Object.entries(KEYWORD_ASSET_MAP)) {
            if (combined.includes(keyword)) {
              matchedAssetId = assetId;
              break;
            }
          }

          // Simple sentiment detection
          let sentiment: string | null = null;
          const positiveWords = ['surge', 'rally', 'gain', 'rise', 'jump', 'high', 'bullish', 'up', 'growth', 'record'];
          const negativeWords = ['drop', 'fall', 'decline', 'plunge', 'crash', 'low', 'bearish', 'down', 'loss', 'slump'];
          
          const posCount = positiveWords.filter(w => combined.includes(w)).length;
          const negCount = negativeWords.filter(w => combined.includes(w)).length;
          
          if (posCount > negCount) sentiment = 'POSITIVE';
          else if (negCount > posCount) sentiment = 'NEGATIVE';
          else sentiment = 'NEUTRAL';

          return {
            title: a.title,
            summary: a.description,
            sourceUrl: a.url,
            sourceName: a.source.name,
            sentiment,
            publishedAt: new Date(a.publishedAt),
            matchedAssetId,
          };
        });

      this.onNews(processed);
      console.log(`[NewsAPI] Fetched ${processed.length} commodity articles at ${new Date().toLocaleTimeString()}`);

    } catch (err: any) {
      if (err.response?.status === 426) {
        console.error('[NewsAPI] Free tier limit — need paid plan for production usage');
      } else {
        console.error(`[NewsAPI] API error: ${err.message}`);
      }
    }
  }
}
