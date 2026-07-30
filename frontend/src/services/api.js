import axios from "axios";

// Dynamic API URL resolution
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // Localhost or Local Wi-Fi network testing (e.g. 192.168.x.x or 10.x.x.x)
    if (hostname === "localhost" || hostname === "127.0.0.1" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return `http://${hostname}:8000`;
    }
  }

  // Production fallback
  return "https://resumetic-ai-resume-analyzer-production.up.railway.app";
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 45000,
});

export default API;
