export default function NoteDetail({ note, loading, error, onEdit, onDelete }) {
  if (loading) {
    return <p className="empty-state">메모 상세를 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p className="message error">{error}</p>;
  }

  if (!note) {
    return <p className="empty-state">목록에서 메모 제목을 선택해 주세요.</p>;
  }

  return (
    <article className="note-detail">
      <p className="eyebrow">관찰 메모 #{note.id}</p>
      <h3>{note.title}</h3>
      <p className="note-content">{note.content}</p>
      <p className="muted">
        수정 시각: {new Date(note.updated_at).toLocaleString("ko-KR")}
      </p>
      <div className="button-row">
        <button type="button" className="secondary" onClick={onEdit}>수정</button>
        <button type="button" className="danger" onClick={onDelete}>삭제</button>
      </div>
    </article>
  );
}
