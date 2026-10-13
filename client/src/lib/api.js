const defaultApiBaseUrl = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://react-project-ecommerce.onrender.com/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
).replace(/\/+$/, "");
