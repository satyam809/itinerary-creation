export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      <div>
        {title ? <h2>{title}</h2> : null}
        {children}
        {onClose ? (
          <button type="button" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
