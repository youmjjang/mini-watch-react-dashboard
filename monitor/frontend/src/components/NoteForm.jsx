import { useState } from "react";

export default function NoteForm({ mode, initialNote, onSave, onCancel }) {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave({ title, content });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h3>{mode === "edit" ? "메모 수정" : "새 메모 작성"}</h3>
      <label htmlFor="note-title">제목</label>
      <input
        id="note-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="note-content">내용</label>
      <textarea
        id="note-content"
        rows="7"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      {error && <p className="message error">{error}</p>}
      <div className="button-row">
        <button className="primary" type="submit" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        <button className="secondary" type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}
