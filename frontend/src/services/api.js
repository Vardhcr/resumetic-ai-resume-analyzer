import axios from "axios";

const PRODUCTION_URL = "https://resumetic-ai-resume-analyzer-production.up.railway.app";


const isPrivateAddress = (hostname) => {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    return (
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    );
  }
  return false;
};

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isHttps = window.location.protocol === "https:";

    if (isPrivateAddress(hostname)) {
      return `${isHttps ? "https" : "http"}://${hostname}:8000`;
    }
  }

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

console.info("[Resumetic] API base URL:", primary.defaults.baseURL);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let warmupStarted = false;

const warmUp = async () => {
  if (warmupStarted) return;
  warmupStarted = true;
  try {
    await primary.get("/", { timeout: 12000 });
    console.info("[Resumetic] backend warm-up OK:", primary.defaults.baseURL);
  } catch (err) {
    warmupStarted = false;
    console.warn("[Resumetic] backend warm-up failed:", err.code || err.message);
  }
};

const request = async (method, url, ...args) => {
  const MAX_ATTEMPTS = 3;
  let lastErr;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await primary[method](url, ...args);
    } catch (err) {
      if (err.response) throw err;

      lastErr = err;

      if (!primaryIsProduction) {
        console.warn(
          `[Resumetic] ${primary.defaults.baseURL} unreachable, retrying ${PRODUCTION_URL}`
        );
        return await fallback[method](url, ...args);
      }

      if (attempt < MAX_ATTEMPTS - 1) {
        const delay = 2000 * Math.pow(2, attempt);
        console.warn(
          `[Resumetic] network error (${err.code}) on attempt ${attempt + 1}, retrying in ${delay}ms`
        );
        await sleep(delay);
      }
    }
  }

  throw lastErr;
};

const isProductionHost = () => {
  if (typeof window === "undefined" || !window.location) return true;
  const hostname = window.location.hostname;
  return !isPrivateAddress(hostname) && hostname !== "localhost" && hostname !== "127.0.0.1";
};

/**
  Check local Ollama health status and available models.
 */
const checkOllamaStatus = async () => {
  try {
    const res = await request("get", "/resume/ollama-status");
    return res.data;
  } catch (err) {
    return {
      online: false,
      models: [],
      active_model: "qwen2.5:0.5b",
      message: "Ollama status check failed."
    };
  }
};

/**
  Send chat prompt to local Ollama LLM endpoint.
 */
const sendChatMessage = async ({ message, conversationHistory, model, resumeContext }) => {
  const res = await request("post", "/resume/chat", {
    message,
    conversation_history: conversationHistory,
    model,
    resume_context: resumeContext
  });
  return res.data;
};

/**
  Calculate JD vs Resume match score.
 */
const matchJobDescription = async (resumeText, jdText) => {
  const res = await request("post", "/resume/match-jd", {
    resume_text: resumeText,
    jd_text: jdText
  });
  return res.data;
};

const analyzeJobGap = async ({
  resumeText,
  jdText,
  jobTitle,
  resumeSkills
}) => {
  const res = await request("post", "/resume/job-gap", {
    resume_text: resumeText,
    jd_text: jdText,
    job_title: jobTitle || null,
    resume_skills: resumeSkills || []
  });

  return res.data;
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
  checkOllamaStatus,
  sendChatMessage,
  matchJobDescription,
  analyzeJobGap
};

export default API;
