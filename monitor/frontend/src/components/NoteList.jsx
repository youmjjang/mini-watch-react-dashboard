export default function NoteList({ notes, selectedId, onSelect, loading, error }) {
  if (loading) {
    return <p className="empty-state">메모 목록을 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p className="message error">{error}</p>;
  }

  if (notes.length === 0) {
    return <p className="empty-state">등록된 관찰 메모가 없습니다.</p>;
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className={selectedId === note.id ? "note-link active" : "note-link"}
            onClick={() => onSelect(note.id)}
          >
            <span>#{note.id}</span>
            <strong>{note.title}</strong>
          </button>
        </li>
      ))}
    </ul>
  );
}
