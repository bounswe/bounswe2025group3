interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

let currentPage = 1;

export const fetchEnvironmentalNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=(environmental OR "climate change" OR "renewable energy" OR "sustainable" OR "waste management" OR "recycling") AND NOT (psychology OR mental OR health)&language=en&sortBy=publishedAt&page=${currentPage}&pageSize=1&apiKey=${'75a31f6a49d54ffbb49a8cb9eba3be5c'}`
    );

    const data = await response.json();
    
    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      // Increment page for next refresh
      currentPage++;
      // Reset to page 1 if we've gone through all articles
      if (currentPage > 10) {
        currentPage = 1;
      }

      const article = data.articles[0];
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
    console.error('Error fetching news:', error);
    return [];
  }
}; 