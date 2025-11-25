import tokenManager from "@/services/tokenManager";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

import { parseJson } from "./utils";

interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  [key: string]: any;
}


export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<LoginResponse>(response, "Invalid email or password.");
  await tokenManager.saveTokens(data.access, data.refresh);
  return data;
};

export const register = async (username: string, email: string, password: string, password2: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password1: password, password2 }),
  });

  return parseJson(response, "Registration failed.");
};

export const reset_password = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseJson(response, "Password reset failed.");
};
