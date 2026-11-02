import axios from "axios";
import axiosRetry from "axios-retry";

const api = axios.create({
  // baseURL: "http://10.14.95.78:8000/api/",
  // baseURL: "https://tuntasin.epistura.web.id/api/",
  baseURL: "http://127.0.0.1:8000/api/",

  headers: {
    Accept: "application/json",
  },
  timeout: 5000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.warn(
      `[Axios-Retry] Gagal koneksi. Mencoba kembali percobaan ke-${retryCount}...`,
    );
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
