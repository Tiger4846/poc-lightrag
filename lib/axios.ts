import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_PATH || "/lightrag-directory",
});

export default api;
