export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      <button className="icon-button" onClick={onClose} type="button" aria-label="Dismiss alert">
        x
      </button>
    </div>
  );
}
