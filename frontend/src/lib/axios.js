import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://ghost-chat-853p.onrender.com/api" : "/api",
  withCredentials: true,
});