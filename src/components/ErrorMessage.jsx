export default function ErrorMessage({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div
      className="error-state-card text-center p-4 my-4 rounded-4"
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        maxWidth: '540px',
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
      <h4 style={{ color: '#f87171', fontWeight: 600, fontSize: '18px' }}>Something Went Wrong</h4>
      <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px' }}>{message}</p>
      {onRetry && (
        <button
          className="btn btn-sm px-4 py-2"
          onClick={onRetry}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
