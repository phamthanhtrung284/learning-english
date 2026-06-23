import axios from "axios";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "/api" });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    if (status === 429 && code === "DAILY_LIMIT_REACHED") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("daily-limit-reached", {
            detail: error.response.data,
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
