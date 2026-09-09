import axios from "axios";

// Single axios instance the whole app uses. Base URL comes from an
// env var so it's easy to point at a different backend (local vs
// deployed) without touching code — configured in Phase 11.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Attach the JWT (once auth exists, Phase 2) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (invalid/expired auth), broadcast an event rather than importing
// AuthContext directly here (would create a circular import). AuthProvider
// listens for this and clears state + redirects, per spec Section 14.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
