import apiClient from "./apiClient";

/**
 * POST /api/auth/register
 * Body: { email, password, ...required account fields }
 */
export function register(payload) {
  return apiClient.post("/auth/register", payload).then((res) => res.data);
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Expected response: { token, user }
 */
export function login(payload) {
  return apiClient.post("/auth/login", payload).then((res) => res.data);
}
