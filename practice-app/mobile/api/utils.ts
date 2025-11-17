import tokenManager from "@/services/tokenManager";

/**
 * Fetches all pages from a paginated API endpoint
 * @param initialUrl The initial URL to fetch from
 * @returns Promise resolving to an array of all items across all pages
 */
export const fetchAllPages = async <T>(initialUrl: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = initialUrl;
  
    try {
      while (nextUrl) {
        const response = await tokenManager.authenticatedFetch(nextUrl);
        if (!response.ok) {
          throw new Error(`Pagination request failed with status ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!data.results) {
          throw new Error("Response missing 'results' array — unexpected format.");
        }
        results = results.concat(data.results);
  
        if (data.next) {
            try {
              const nextURLObject = new URL(data.next);
              nextUrl = nextURLObject.pathname + nextURLObject.search;
            } catch {
              nextUrl = data.next;
            }
        } else {
          nextUrl = null;
        }
      }
  
      return results;
    } catch (error) {
      console.error("Error during paginated fetch:", error);
      throw error;
    }
};

