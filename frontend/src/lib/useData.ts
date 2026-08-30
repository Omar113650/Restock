"use client";

import { useState, useEffect } from 'react';
import { fetcher } from './api';

export function useData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async () => {
    setLoading(true);
    try {
      const result = await fetcher<T>(endpoint);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mutate();
  }, [endpoint]);

  return { data, loading, error, mutate };
}
