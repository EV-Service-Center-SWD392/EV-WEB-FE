import { useState, useEffect, useCallback } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ErrorWithResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function getErrorMessage(error: unknown): string {
  const err = error as ErrorWithResponse;
  return err?.response?.data?.message || err?.message || "Đã xảy ra lỗi";
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedAsyncFunction = useCallback(asyncFunction, dependencies);

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    memoizedAsyncFunction()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        setState({ data: null, loading: false, error: getErrorMessage(error) });
      });
  }, [memoizedAsyncFunction]);

  const refetch = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    memoizedAsyncFunction()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        setState({ data: null, loading: false, error: getErrorMessage(error) });
      });
  }, [memoizedAsyncFunction]);

  return { ...state, refetch };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAsyncAction<T extends any[], R>(
  asyncFunction: (..._args: T) => Promise<R>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: T): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      return result;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setLoading(false);
  };

  return { execute, loading, error, reset };
}
