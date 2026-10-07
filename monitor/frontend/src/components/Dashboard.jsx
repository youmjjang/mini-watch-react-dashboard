import { useEffect, useState } from "react";

import { fetchEvents } from "../api/events";
import { createNote, deleteNote, fetchNote, fetchNotes, updateNote } from "../api/notes";
import DeleteConfirm from "./DeleteConfirm";
import EventList from "./EventList";
import NoteDetail from "./NoteDetail";
import NoteForm from "./NoteForm";
import NoteList from "./NoteList";

export default function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [mode, setMode] = useState("detail");

  const [eventsLoading, setEventsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [eventsError, setEventsError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  async function loadEvents() {
    setEventsLoading(true);
    setEventsError("");

    try {
      const data = await fetchEvents();
      setEvents(data.events);
    } catch (err) {
      setEventsError(err.message);
    } finally {
      setEventsLoading(false);
    }
  }

  async function loadNotes() {
    setNotesLoading(true);
    setNotesError("");

    try {
      const data = await fetchNotes();
      setNotes(data.notes);
    } catch (err) {
      setNotesError(err.message);
    } finally {
      setNotesLoading(false);
    }
  }

  async function selectNote(noteId) {
    setMode("detail");
    setDetailLoading(true);
    setDetailError("");

    try {
      const data = await fetchNote(noteId);
      setSelectedNote(data.note);
    } catch (err) {
      setSelectedNote(null);
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshAll() {
    setRefreshMessage("");
    await Promise.all([loadEvents(), loadNotes()]);
    setRefreshMessage("최신 요청 기록과 메모 목록을 다시 조회했습니다.");
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function handleCreate(payload) {
    const data = await createNote(payload);
    await loadNotes();
    setSelectedNote(data.note);
    setMode("detail");
  }

  async function handleUpdate(payload) {
    const data = await updateNote(selectedNote.id, payload);
    await loadNotes();
    setSelectedNote(data.note);
    setMode("detail");
  }

  async function handleDelete() {
    const deletedId = selectedNote.id;
    await deleteNote(deletedId);
    await loadNotes();
    setSelectedNote(null);
    setMode("detail");
    setDetailError("");
  }

  function cancelEdit() {
    setMode("detail");
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">mini-watch operator console</p>
          <h1>감시 대시보드</h1>
          <p className="muted"><strong>{user.username}</strong> 운영자로 로그인했습니다.</p>
        </div>
        <div className="topbar-actions">
          <button className="secondary" type="button" onClick={refreshAll}>전체 새로고침</button>
          <button className="secondary" type="button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      {refreshMessage && <p className="message success">{refreshMessage}</p>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">General service</p>
            <h2>요청 기록</h2>
          </div>
          <button className="secondary" type="button" onClick={loadEvents}>요청 기록 새로고침</button>
        </div>
        <EventList events={events} loading={eventsLoading} error={eventsError} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Operator notes</p>
            <h2>관찰 메모</h2>
          </div>
          <div className="button-row">
            <button className="secondary" type="button" onClick={loadNotes}>메모 목록 새로고침</button>
            <button
              className="primary"
              type="button"
              onClick={() => {
                setSelectedNote(null);
                setDetailError("");
                setMode("create");
              }}
            >
              새 메모
            </button>
          </div>
        </div>

        <div className="notes-grid">
          <aside className="notes-sidebar">
            <NoteList
              notes={notes}
              selectedId={selectedNote?.id}
              onSelect={selectNote}
              loading={notesLoading}
              error={notesError}
            />
          </aside>

          <div className="notes-content">
            {mode === "create" && (
              <NoteForm
                key="create"
                mode="create"
                initialNote={null}
                onSave={handleCreate}
                onCancel={() => setMode("detail")}
              />
            )}

            {mode === "edit" && selectedNote && (
              <NoteForm
                key={`edit-${selectedNote.id}-${selectedNote.updated_at}`}
                mode="edit"
                initialNote={selectedNote}
                onSave={handleUpdate}
                onCancel={cancelEdit}
              />
            )}

            {mode === "delete" && selectedNote && (
              <DeleteConfirm
                note={selectedNote}
                onConfirm={handleDelete}
                onCancel={() => setMode("detail")}
              />
            )}

            {mode === "detail" && (
              <NoteDetail
                note={selectedNote}
                loading={detailLoading}
                error={detailError}
                onEdit={() => setMode("edit")}
                onDelete={() => setMode("delete")}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
