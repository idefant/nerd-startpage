import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebounceState = <T>(initialValue: T, delay: number) => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const handleChange = useCallback(
    (next: T | ((prev: T) => T), immediately?: boolean) => {
      clearTimer();
      setValue(next);

      if (immediately) {
        setIsPending(false);
        setDebouncedValue(next);
        return;
      }

      setIsPending(true);
      timer.current = setTimeout(() => {
        setDebouncedValue(next);
        setIsPending(false);
        timer.current = null;
      }, delay);
    },
    [clearTimer, delay],
  );

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return [value, debouncedValue, handleChange, isPending] as const;
};
