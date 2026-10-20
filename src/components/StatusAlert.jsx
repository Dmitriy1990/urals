export default function StatusAlert({ variant = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${variant} alert-dismissible`} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Закрыть"
          onClick={onClose}
        />
      )}
    </div>
  );
}
