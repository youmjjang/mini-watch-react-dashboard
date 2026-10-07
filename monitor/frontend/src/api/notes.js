import { apiRequest } from "./request";

export function fetchNotes() {
  return apiRequest("/api/notes");
}

export function fetchNote(noteId) {
  return apiRequest(`/api/notes/${noteId}`);
}

export function createNote(payload) {
  return apiRequest("/api/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateNote(noteId, payload) {
  return apiRequest(`/api/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteNote(noteId) {
  return apiRequest(`/api/notes/${noteId}`, {
    method: "DELETE",
  });
}
