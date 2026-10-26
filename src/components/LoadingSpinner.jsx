export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem', color: '#8b5cf6' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-secondary" style={{ fontSize: '15px' }}>{message}</p>
    </div>
  );
}
