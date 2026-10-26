export default function EmptyState({
  title = 'No Results Found',
  message = 'We could not find any matches for your current search or filters.',
  onReset,
  icon = '🎬',
}) {
  return (
    <div
      className="empty-state-box text-center py-5 px-4 my-4 rounded-4"
      style={{
        background: '#161424',
        border: '1px dashed #2f2a42',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ color: '#f7f5ff', fontSize: '20px', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '8px auto 16px' }}>
        {message}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="btn btn-sm px-4 py-2"
          style={{
            background: 'transparent',
            border: '1px solid #8b5cf6',
            color: '#a78bfa',
            borderRadius: '8px',
            fontWeight: 600,
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
