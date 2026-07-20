import axios from "axios";
import { env } from "@/config/env";
import { emitUnauthorized, getToken } from "@/lib/authToken";

/**
 * The single axios instance for the app. Never import axios directly in
 * features — go through the query hooks in services/api.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

// Attach the customer bearer token on every request.
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set "multipart/form-data; boundary=..." itself — the
  // instance-level "application/json" default would otherwise stop axios
  // from serializing FormData bodies (e.g. file uploads) correctly.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// On 401 the session is dead — notify the auth store to sign out.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      emitUnauthorized();
    }
    return Promise.reject(error);
  },
);
