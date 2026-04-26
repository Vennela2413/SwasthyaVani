import axios from "axios";

const API = axios.create({ baseURL: "https://swasthyavani-1.onrender.com/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("aidoctor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register      = (data)       => API.post("/auth/register", data);
export const login         = (data)       => API.post("/auth/login", data);
export const getMe         = ()           => API.get("/auth/me");
export const updateLang    = (language)   => API.put("/auth/language", { language });
export const predict       = (symptoms, language) => API.post("/health/predict", { symptoms, language, save: true });
export const saveRecord    = (data)         => API.post("/health/save", data);
export const getHistory    = (page = 1)   => API.get(`/health/history?page=${page}&limit=20`);
export const deleteRecord  = (id)         => API.delete(`/health/history/${id}`);
export const getStats      = ()           => API.get("/health/stats");
export const getNearbyDoctors = (lat, lng) => API.get(`/doctors/nearby?lat=${lat}&lng=${lng}&maxDist=100000`);
export const getNearby        = getNearbyDoctors; // alias for backward compat

export default API;