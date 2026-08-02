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
  timeout: 90000,
});

const fallback = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 90000,
});

// Expose resolved base URL for debugging (visible in the browser console)
console.info("[Resumetic] API base URL:", primary.defaults.baseURL);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Whether we have already pinged the backend this page-load. Guards against
// firing multiple warm-up requests (StrictMode double-invokes effects).
let warmupStarted = false;

/**
 * Ping the backend with a lightweight request as soon as the page loads so a
 * sleep-on-idle host (e.g. Railway free tier) is already awake by the time the
 * user picks a file. Failures are ignored — the retry logic below handles them.
 */
const warmUp = async () => {
  if (warmupStarted) return;
  warmupStarted = true;
  try {
    await primary.get("/", { timeout: 12000 });
    console.info("[Resumetic] backend warm-up OK:", primary.defaults.baseURL);
  } catch (err) {
    // No-op: the real request will retry. Allow a later warm-up attempt.
    warmupStarted = false;
    console.warn("[Resumetic] backend warm-up failed:", err.code || err.message);
  }
};

/**
 * Wraps requests so that:
 *  1. Network-level failures against a LOCAL primary backend automatically
 *     retry against the production backend (works from a phone on the same
 *     Wi-Fi when the local backend isn't running or is firewall-blocked).
 *  2. Network-level failures against the PRODUCTION backend (e.g. Railway
 *     cold-start wake-up) are retried a few times with backoff before giving
 *     up, so transient outages self-heal instead of instantly failing.
 *
 * A server response (e.g. 400/413/500) carries real information and is always
 * surfaced to the user without retrying.
 */
const request = async (method, url, ...args) => {
  const MAX_ATTEMPTS = 3;
  let lastErr;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await primary[method](url, ...args);
    } catch (err) {
      // Server responded — real information, do not retry.
      if (err.response) throw err;

      lastErr = err;

      // Local/dev primary unreachable → fall back to production immediately.
      if (!primaryIsProduction) {
        console.warn(
          `[Resumetic] ${primary.defaults.baseURL} unreachable, retrying ${PRODUCTION_URL}`
        );
        return await fallback[method](url, ...args);
      }

      // Production primary: transient network errors (Railway cold start,
      // mobile signal drop) are common. Back off and retry before giving up.
      if (attempt < MAX_ATTEMPTS - 1) {
        const delay = 2000 * Math.pow(2, attempt); // 2s, 4s
        console.warn(
          `[Resumetic] network error (${err.code}) on attempt ${attempt + 1}, retrying in ${delay}ms`
        );
        await sleep(delay);
      }
    }
  }

  throw lastErr;
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
  warmUp,
};

export default API;

