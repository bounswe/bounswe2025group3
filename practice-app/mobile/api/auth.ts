import tokenManager from "@/services/tokenManager";
import { API_BASE_URL } from "@/constants/api";


export const login = async (email: string, password: string) => {
  console.log(`${API_BASE_URL}/auth/login/`);
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/password/reset/`, {
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
