import axios from "axios";

const api = axios.create({
  // baseURL: "http://10.14.95.78:8000/api/",
  baseURL: "https://tuntasin.epistura.web.id/api/",
  // baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    Accept: "application/json",
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
  }
);

export default api;