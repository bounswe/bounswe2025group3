import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

class TokenManager {

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
      this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
      this.refreshSubscribers.forEach(cb => cb(token));
  }

  async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  }
  async getAccessToken() {
    return await SecureStore.getItemAsync('accessToken');
  }

  async getRefreshToken() {
    return await SecureStore.getItemAsync('refreshToken');
  }

  async clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  async hasValidTokens() {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  async autoLogin() {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();

    if (!accessToken || !refreshToken) return false;

    try {
      // Verify token validity by making a test API call
      const response = await this.authenticatedFetch(API_ENDPOINTS.AUTH.TEST_PROTECTED);
      if (response.ok) return true;
      return false;
    } catch (error) {
      console.error('Auto login failed:', error);
      return false;
    }

  }

  async authenticatedFetch(endpoint: string, options: RequestInit = {}) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
        throw new Error('No access token found, User must log in.');
    }

    const fetchWithToken = async (token: string) => {
        const url = `${API_BASE_URL}${endpoint}`;
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    };

    let response = await fetchWithToken(accessToken);

    if (response.status === 401) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
                const newAccessToken = await this.refreshAccessToken();
                if (!newAccessToken) throw new Error("Refresh failed to return a new token.");
                
                this.isRefreshing = false;
                this.onRefreshed(newAccessToken);
                this.refreshSubscribers = [];
                
                response = await fetchWithToken(newAccessToken);
            } catch (error) {
                this.isRefreshing = false;
                this.refreshSubscribers = [];
                //await this.clearTokens();
                throw new Error('Session expired. Please log in again.');
            }
        } else {
            return new Promise<Response>((resolve) => {
                this.subscribeTokenRefresh(async (newAccessToken: string) => {
                    resolve(fetchWithToken(newAccessToken));
                });
            });
        }
    }

    return response;
}

  async refreshAccessToken() {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
        console.log("No refresh token found");
        throw new Error("No refresh token found");
    }
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed on the server.');
        }
        const data = await response.json();
        console.log('Token refresh successful, storing new tokens');
        await this.saveTokens(data.access, data.refresh);
        return data.access;
    } catch (error) {
        console.log("Token refresh error, logging out.", error);
        await this.clearTokens();
        throw error;
    }
  }
}

export default new TokenManager();
