import { API_BASE_URL } from "@/constants/api";
import * as SecureStore from "expo-secure-store";

class TokenManager {
  private email: string | null;

  constructor() {
    this.email = null;
  }

  async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
  }

  async getAccessToken() {
    return await SecureStore.getItemAsync("accessToken");
  }

  async hasValidTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    return !!(accessToken && refreshToken);
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return false;
    }
  }

  async refreshAccessToken() {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
  
    if (!refreshToken) {
      console.error('No refresh token found');
      throw new Error("No refresh token found");
    }
  
    try {
      // Ensure endpoint doesn't start with a slash
      const refreshEndpoint = "api/token/refresh/";
      const url = `${API_BASE_URL}/${refreshEndpoint}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed:', errorData);
        throw new Error(errorData.detail || "Token refresh failed");
      }
  
      const data = await response.json();
      
      if (!data.access || !data.refresh) {
        console.error('Invalid token response:', data);
        throw new Error("Invalid token response");
      }

      await SecureStore.setItemAsync("accessToken", data.access);
      await SecureStore.setItemAsync("refreshToken", data.refresh);
  
      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      throw error;
    }
  }

  async autoLogin() {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
  
    if (!accessToken || !refreshToken) return false;

    try {
      // Verify token validity by making a test API call
      const response = await this.authenticatedFetch("api/auth/test-protected/");
      return response.ok;
    } catch (error) {
      console.error('Auto login failed:', error);
      return false;
    }
  }

  setEmail(email: string | null): void {
    this.email = email;
  }

  getEmail(): string | null {
    return this.email;
  }

  async clearTokens() {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    this.email = null;
  }

  async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error("No access token found. User needs to log in again.");
    }
  
    const fetchWithToken = async (token: string) => {
      // Ensure endpoint doesn't start with a slash to prevent double slashes
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      const url = `${API_BASE_URL}/${cleanEndpoint}`;
      
      return await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    };

    let response = await fetchWithToken(accessToken);
  
    if (response.status === 401) {
      try {
        // Token might have expired, try refreshing it
        accessToken = await this.refreshAccessToken();
        if (!accessToken) {
          throw new Error("Unable to refresh access token.");
        }
    
        response = await fetchWithToken(accessToken);
        
        if (response.status === 401) {
          // If still getting 401 after refresh, clear tokens and throw error
          await this.clearTokens();
          throw new Error("Session expired. Please log in again.");
        }
      } catch (error) {
        // If refresh fails, clear tokens and throw error
        await this.clearTokens();
        throw new Error("Session expired. Please log in again.");
      }
    }
    return response;
  }

  async getCurrentTokens() {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    return { accessToken, refreshToken };
  }

  async forceResetState() {
    await this.clearTokens();
    console.log("TokenManager state has been forcibly reset");
  }
}

// Export a single instance of TokenManager
export default new TokenManager();