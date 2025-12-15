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

type ErrorPayload = {
  detail?: string;
  message?: string;
  error?: string;
  non_field_errors?: string | string[];
  [key: string]: any;
};

export type ApiError = Error & {
  payload?: ErrorPayload | null;
  status?: number;
};

const extractMessage = (data: ErrorPayload | null, fallbackMessage: string) => {
  if (!data) return fallbackMessage;

  const { detail, message, error, non_field_errors } = data;
  const candidate =
    detail ||
    message ||
    error ||
    (Array.isArray(non_field_errors) ? non_field_errors.join(" ") : non_field_errors);

  if (candidate && typeof candidate === "string") {
    return candidate;
  }
  
  const fieldErrorKey = Object.keys(data).find(
    (key) =>
      key !== "detail" &&
      key !== "message" &&
      key !== "error" &&
      key !== "non_field_errors" &&
      Array.isArray(data[key]) &&
      data[key].length > 0 &&
      typeof data[key][0] === "string"
  );
  
  if (fieldErrorKey) {
    return data[fieldErrorKey][0];
  }

  const firstValue = Object.values(data).find((value) => typeof value === "string");
  if (typeof firstValue === "string") {
    return firstValue;
  }

  return fallbackMessage;
};

export const parseJson = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  
  let data: ErrorPayload | null = null;
  const responseText = await response.text();

  try {
    if (!responseText) {
      // Empty response
      if (!response.ok) {
        const error = new Error(`${fallbackMessage} (Status: ${response.status})`) as ApiError;
        error.status = response.status;
        throw error;
      }
      return {} as T;
    }
    data = JSON.parse(responseText) as ErrorPayload;
  } catch (jsonError) {
    // If it's not valid JSON and response is not ok, throw a more informative error
    if (!response.ok) {
      const error = new Error(`${fallbackMessage} (Status: ${response.status}, Invalid JSON response)`) as ApiError;
      error.status = response.status;
      throw error;
    }
    // If response is ok but not valid JSON, return empty object
    console.warn(`Response OK but invalid JSON for ${fallbackMessage}`);
    return {} as T;
  }

  if (!response.ok) {
    const error = new Error(extractMessage(data, fallbackMessage)) as ApiError;
    error.payload = data;
    error.status = response.status;
    throw error;
  }

  return (data ?? {}) as T;
};

export const ensureError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : fallbackMessage);
};
