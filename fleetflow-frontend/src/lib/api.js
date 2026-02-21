import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Centralized digital hub endpoint
});

// Interceptor: Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor: Global Error Handling & Session Security
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logic: If the backend returns 401 (Unauthorized) or 403 (Forbidden)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        // Clear session context to prevent RBAC leakage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");

        // Redirect to Login (Page 1)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
