import axios from "axios";

const API = axios.create({
  baseURL: "https://resumetic-ai-resume-analyzer-production.up.railway.app",
});

export default API;