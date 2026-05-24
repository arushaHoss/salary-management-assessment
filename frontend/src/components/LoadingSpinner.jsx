export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="spinner-container" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
