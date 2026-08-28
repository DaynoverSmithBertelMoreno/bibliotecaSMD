import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

/**
 * Único punto donde la UI habla con la aplicación. Ignora respuestas obsoletas para que
 * una búsqueda lenta no pise a otra más reciente.
 */
export function useAsync<T>(task: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);

    task()
      .then((result) => current && setData(result))
      .catch((cause) => current && setError(cause as Error))
      .finally(() => current && setLoading(false));

    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload };
}

/** Debounce para el buscador de `Inicio`: 300 ms (SPEC §8.2). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
