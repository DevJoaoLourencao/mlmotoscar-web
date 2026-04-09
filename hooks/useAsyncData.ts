import { useCallback, useEffect, useState } from "react";

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Hook para carregar dados assíncronos com estado de loading e refetch.
 *
 * @example
 * const { data: customers, loading, refetch } = useAsyncData(getCustomers);
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refetch: load };
}
