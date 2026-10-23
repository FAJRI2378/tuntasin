import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    Accept: "application/json",
  },
});

// Interceptor untuk otomatis menyisipkan token ke setiap request API
api.interceptors.request.use(
  (config) => {
    // Sesuaikan key "token" dengan nama yang kamu pakai saat menyimpan di localStorage saat login
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;