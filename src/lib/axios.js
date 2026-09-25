import { apiFetch } from "@/services/api";

export const http = {
  get: (path) => apiFetch(path),
  post: (path, body) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
};
