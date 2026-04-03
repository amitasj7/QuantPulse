import axios from 'axios';

/**
 * NewsData.io Connector
 * 
 * Fetches commodity-related news from NewsData.io API.
 * Free tier: 200 credits/day, 10 results per request.
 * Polls every 2 hours (12 req/day = well within limits).
 * 
 * Searches for: gold, silver, crude oil, commodity market, solar energy
 */

interface NewsDataArticle {
  title: string;
  description: string | null;
  link: string;
  source_name: string;
  pubDate: string;
  sentiment?: string; // available on paid plans
  category?: string[];
}

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

export class NewsDataConnector {
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
    console.log('[NewsData] Starting commodity news polling (every 2 hours)...');
    this.fetchNews();
    // Poll every 2 hours
    this.timer = setInterval(() => this.fetchNews(), 2 * 60 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[NewsData] Stopped.');
  }

  private async fetchNews() {
    try {
      const response = await axios.get('https://newsdata.io/api/1/latest', {
        params: {
          apikey: this.apiKey,
          q: 'gold OR silver OR "crude oil" OR commodity OR MCX',
          language: 'en',
          category: 'business',
          size: 10, // Free tier max per request
        },
        timeout: 15000,
      });

      const articles: NewsDataArticle[] = response.data?.results || [];
      
      if (articles.length === 0) {
        console.warn('[NewsData] No articles returned');
        return;
      }

      // Transform and detect which commodity an article belongs to
      const processed = articles
        .filter(a => a.title && a.title.trim().length > 0)
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

          // Sentiment detection (NewsData.io provides this on paid plans)
          let sentiment: string | null = a.sentiment || null;
          
          // Fallback: basic keyword-based sentiment if API doesn't provide it
          if (!sentiment) {
            const positiveWords = ['surge', 'rally', 'gain', 'rise', 'jump', 'high', 'bullish', 'growth', 'record', 'soar'];
            const negativeWords = ['drop', 'fall', 'decline', 'plunge', 'crash', 'low', 'bearish', 'loss', 'slump', 'tumble'];
            
            const posCount = positiveWords.filter(w => combined.includes(w)).length;
            const negCount = negativeWords.filter(w => combined.includes(w)).length;
            
            if (posCount > negCount) sentiment = 'POSITIVE';
            else if (negCount > posCount) sentiment = 'NEGATIVE';
            else sentiment = 'NEUTRAL';
          }

          return {
            title: a.title,
            summary: a.description,
            sourceUrl: a.link,
            sourceName: a.source_name || 'Unknown',
            sentiment,
            publishedAt: new Date(a.pubDate),
            matchedAssetId,
          };
        });

      this.onNews(processed);
      console.log(`[NewsData] Fetched ${processed.length} commodity articles at ${new Date().toLocaleTimeString()}`);

    } catch (err: any) {
      if (err.response?.status === 401) {
        console.error('[NewsData] Invalid API key');
      } else if (err.response?.status === 429) {
        console.error('[NewsData] Rate limit exceeded');
      } else {
        console.error(`[NewsData] API error: ${err.message}`);
      }
    }
  }
}
