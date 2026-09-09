import { useState, useEffect, useCallback } from "react";

/**
 * Runs an async fetcher on mount (and whenever `deps` changes), tracking
 * loading/error/data state consistently. Every page that hits a backend
 * endpoint uses this instead of hand-rolling its own useEffect/useState
 * combo, so loading/error handling stays consistent across the app
 * (spec Section 19).
 *
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 */
export function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => setData(result))
      .catch((err) => {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Unable to load data. Please try again."
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
