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

// Dynamic primary API URL resolution
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

const primaryURL = getBaseURL();
const primaryIsProduction = primaryURL === PRODUCTION_URL;

const primary = axios.create({
  baseURL: primaryURL,
  timeout: 60000,
});

const fallback = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 60000,
});

// Expose resolved base URL for debugging (visible in the browser console)
console.info("[Resumetic] API base URL:", primary.defaults.baseURL);

/**
 * Wraps requests so that network-level failures against the primary backend
 * automatically retry against the production backend.
 *
 * This makes the app work from a phone even when the local backend isn't
 * running, is bound to 127.0.0.1 only, or is blocked by the Windows firewall.
 */
const request = async (method, url, ...args) => {
  try {
    return await primary[method](url, ...args);
  } catch (err) {
    // Only fall back for network-level errors (no response received).
    // A server response (e.g. 400/413/500) carries real information, so
    // surface it to the user instead of retrying.
    if (!err.response && !primaryIsProduction) {
      console.warn(
        `[Resumetic] ${primary.defaults.baseURL} unreachable, retrying ${PRODUCTION_URL}`
      );
      return await fallback[method](url, ...args);
    }
    throw err;
  }
};

// Whether the page is being served from a production (deployed) URL rather than
// a localhost / LAN dev server. Used to tailor error messages for end users.
const isProductionHost = () => {
  if (typeof window === "undefined" || !window.location) return true;
  const hostname = window.location.hostname;
  return !isPrivateAddress(hostname) && hostname !== "localhost" && hostname !== "127.0.0.1";
};

const API = {
  get: (url, config) => request("get", url, config),
  post: (url, body, config) => request("post", url, body, config),
  put: (url, body, config) => request("put", url, body, config),
  patch: (url, body, config) => request("patch", url, body, config),
  delete: (url, config) => request("delete", url, config),
  defaults: primary.defaults,
  isProductionHost,
  PRODUCTION_URL,
};

export default API;

