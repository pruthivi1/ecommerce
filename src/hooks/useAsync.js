import { useEffect, useRef, useState } from "react";

/**
 * Runs an async service call and tracks loading/error/data state.
 * `deps` controls when it re-runs, mirroring useEffect semantics.
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    requestId.current += 1;
    const thisRequest = requestId.current;

    setLoading(true);
    setError(null);

    asyncFn()
      .then((result) => {
        if (!cancelled && thisRequest === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled && thisRequest === requestId.current) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
