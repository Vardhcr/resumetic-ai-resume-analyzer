import axios from "axios";

// Vite injects VITE_* values at build time. Set VITE_API_BASE_URL in Netlify
// for another backend environment; Railway is the production fallback.
const baseURL = (import.meta.env.VITE_API_BASE_URL ||
  "https://resumetic-ai-resume-analyzer-production.up.railway.app").replace(/\/$/, "");

const API = axios.create({
  baseURL,
  timeout: 30000,
});

export default API;
