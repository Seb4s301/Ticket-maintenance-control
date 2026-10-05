export default function HistoryTimeline({ entries }) {
  if (!entries.length) {
    return <p>No history yet.</p>
  }

  return (
    <ol className="history-timeline">
      {entries.map((entry) => (
        <li key={entry.id}>
          <span className="history-event">{entry.eventType}</span>
          {entry.fromStatusCode && entry.toStatusCode && (
            <span>
              {' '}
              {entry.fromStatusCode} → {entry.toStatusCode}
            </span>
          )}
          <span className="history-meta">
            {' '}
            by {entry.userName} · {new Date(entry.createdAt).toLocaleString()}
          </span>
          {entry.comment && <p className="history-comment">{entry.comment}</p>}
        </li>
      ))}
    </ol>
  )
}
