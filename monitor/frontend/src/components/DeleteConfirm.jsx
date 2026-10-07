import { useState } from "react";

export default function DeleteConfirm({ note, onConfirm, onCancel }) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError("");
    setDeleting(true);

    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <section className="delete-box">
      <h3>메모 삭제 확인</h3>
      <p><strong>“{note.title}”</strong> 메모를 삭제할까요?</p>
      <p className="muted">이 화면을 연 것만으로는 삭제되지 않습니다.</p>
      {error && <p className="message error">{error}</p>}
      <div className="button-row">
        <button className="danger" type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "삭제 중..." : "삭제 확정"}
        </button>
        <button className="secondary" type="button" onClick={onCancel}>취소</button>
      </div>
    </section>
  );
}
