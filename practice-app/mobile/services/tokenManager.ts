import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from "@/constants/api";

class TokenManager {
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

  async refreshToken() {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      console.log("No refresh token found");
      throw new Error("No refresh token found");
    }
    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json();
      console.log(data);

      console.log('Token refresh successful, storing new tokens');
      await SecureStore.setItemAsync("accessToken", data.access);
      await SecureStore.setItemAsync("refreshToken", data.refresh);
    } catch (error) {
      console.log("Token refresh error", error);
      await this.clearTokens();
    }
  }

  async autoLogin() {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();

    if (!accessToken || !refreshToken) return false;

    try {
      // Verify token validity by making a test API call
      const response = await this.authenticatedFetch("/auth/test-protected/");
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
        try {
            const accessToken = await this.refreshAccessToken();
            response = await fetchWithToken(accessToken);
        } catch (error) {
            //await this.clearTokens();
            throw new Error('Session expired. Please log in again.');
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
      const response = await fetch(`${API_BASE_URL}/token/refresh/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json();
      console.log(data);

      console.log('Token refresh successful, storing new tokens');
      await this.saveTokens(data.access, data.refresh);
      return data.access;
    } catch (error) {
      console.log("Token refresh error, 5", error);
      await this.clearTokens();
    }
  }
}

export default new TokenManager();
