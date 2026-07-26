import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "https://ghost-chat-853p.onrender.com/api" ? "http://localhost:3001/api" : "/api",
  withCredentials: true,
});