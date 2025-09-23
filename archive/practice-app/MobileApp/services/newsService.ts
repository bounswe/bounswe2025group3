interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    description: string | null;
    url: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

// API key should be moved to environment variables in production
const API_KEY = '75a31f6a49d54ffbb49a8cb9eba3be5c';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

let currentPage = 1;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateArticle = (article: any): boolean => {
  return (
    article &&
    typeof article.title === 'string' &&
    typeof article.url === 'string' &&
    typeof article.publishedAt === 'string' &&
    article.source &&
    typeof article.source.name === 'string'
  );
};

export const fetchEnvironmentalNews = async (): Promise<NewsArticle[]> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Get date 7 days ago for recent news
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fromDate = sevenDaysAgo.toISOString().split('T')[0];

      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        // Main environmental terms (must include at least one)
        `q=(environmental OR "climate change" OR "renewable energy" OR "sustainable" OR "waste management" OR "recycling")` +
        // Additional context terms to ensure relevance
        ` AND (environment OR sustainability OR conservation OR "green energy" OR "carbon emissions" OR "climate action")` +
        // Exclude irrelevant topics
        ` NOT (psychology OR mental OR health OR sports OR entertainment OR politics)` +
        `&language=en` +
        `&sortBy=relevancy` + // Changed from publishedAt to relevancy
        `&from=${fromDate}` + // Only get news from last 7 days
        `&page=${currentPage}` +
        `&pageSize=1` +
        `&apiKey=${API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`News API error: ${errorData.message || response.statusText}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        const article = data.articles[0];
        
        if (!validateArticle(article)) {
          throw new Error('Invalid article data received from API');
        }

        // Increment page for next refresh
        currentPage++;
        // Reset to page 1 if we've gone through all articles
        if (currentPage > Math.min(10, Math.ceil(data.totalResults / 1))) {
          currentPage = 1;
        }

        return [{
          title: article.title,
          description: article.description || 'No description available',
          url: article.url,
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name
          }
        }];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching news (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
      
      if (retries < MAX_RETRIES - 1) {
        retries++;
        await sleep(RETRY_DELAY * retries); // Exponential backoff
        continue;
      }
      
      throw error; // Re-throw the error after all retries are exhausted
    }
  }
  
  return []; // This should never be reached due to the throw in the catch block
}; 