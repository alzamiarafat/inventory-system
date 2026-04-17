import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export function createApiClient(baseURL = API_BASE_URL) {
  return axios.create({ baseURL });
}

export function getApiErrorMessage(error, fallback = "Request failed") {
  return error?.response?.data?.message || error?.message || fallback;
}
