import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: apiBase });

// Auto-attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const code   = error?.response?.data?.code;

    // Daily limit reached — dispatch a custom event so any component can react
    if (status === 429 && code === "DAILY_LIMIT_REACHED") {
      window.dispatchEvent(new CustomEvent("daily-limit-reached", {
        detail: error.response.data,
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
