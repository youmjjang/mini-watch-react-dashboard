import { apiRequest } from "./request";

export function fetchEvents() {
  return apiRequest("/api/events");
}
