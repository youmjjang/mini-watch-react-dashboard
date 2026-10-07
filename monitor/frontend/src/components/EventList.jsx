export default function EventList({ events, loading, error }) {
  if (loading) {
    return <p className="empty-state">요청 기록을 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p className="message error">{error}</p>;
  }

  if (events.length === 0) {
    return <p className="empty-state">수집된 요청 기록이 없습니다.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>시각</th>
            <th>메서드</th>
            <th>경로</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {events.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.occurred_at).toLocaleString("ko-KR")}</td>
              <td><span className="method-badge">{item.method}</span></td>
              <td className="path-cell">{item.path}</td>
              <td>
                <span className={item.status_code >= 400 ? "status bad" : "status good"}>
                  {item.status_code}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
