import { useCallback, useRef, useState } from 'react';

export const useDebounceState = <T>(initialValue: T, delay: number) => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    // eslint-disable-next-line no-unused-vars
    (value: T | ((value: T) => T), immediately?: boolean) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setValue(value);

      if (immediately) {
        setDebouncedValue(value);
      } else {
        timer.current = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
      }
    },
    [delay],
  );

  return [value, debouncedValue, handleChange] as const;
};
