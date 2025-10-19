import tokenManager from "@/services/tokenManager";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";


export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  await tokenManager.saveTokens(data.access, data.refresh);
  return data;
};

export const register = async (username: string, email: string, password: string, password2: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, password2 }),
  });

  const data = await response.json();
  console.log(data);
  if (!response.ok) {
      throw data;
  }
  return data;
};

export const reset_password = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new data;
  }
  return data;
};
