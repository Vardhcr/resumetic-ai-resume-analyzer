import axios from "axios";

const PRODUCTION_URL = "https://resumetic-ai-resume-analyzer-production.up.railway.app";

// Detect if a hostname is a private/local address (localhost, 127.x, 192.168.x,
// 10.x, 172.16-31.x). Anything else (including custom domains) should use the
// production backend.
const isPrivateAddress = (hostname) => {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    // 192.168.x.x, 10.x.x.x, 172.16.x.x - 172.31.x.x
    return (
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    );
  }
  return false;
};

// Dynamic API URL resolution
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isHttps = window.location.protocol === "https:";

    // Localhost or Local Wi-Fi network testing (e.g. 192.168.x.x or 10.x.x.x)
    if (isPrivateAddress(hostname)) {
      // Use https for the backend when the page itself is served over https,
      // otherwise browsers block the request as "mixed content".
      return `${isHttps ? "https" : "http"}://${hostname}:8000`;
    }
  }

  // Production fallback (also used for custom domains)
  return PRODUCTION_URL;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
});

// Expose resolved base URL for debugging (visible in the browser console)
console.info("[Resumetic] API base URL:", API.defaults.baseURL);

export default API;
