export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="state-block state-loading" role="status">
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="state-block state-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "Nothing here yet." }) {
  return (
    <div className="state-block state-empty">
      <p>{message}</p>
    </div>
  );
}
