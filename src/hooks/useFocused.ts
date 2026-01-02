import { useState, useEffect } from 'react';

export const useFocused = (elemRef: React.RefObject<Element | null>) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const elem = elemRef.current;
    if (!elem) return;

    setIsFocused(document.activeElement === elem);

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    elem?.addEventListener('focus', onFocus);
    elem?.addEventListener('blur', onBlur);

    return () => {
      elem?.removeEventListener('focus', onFocus);
      elem?.removeEventListener('blur', onBlur);
    };
  }, [elemRef]);

  return isFocused;
};
