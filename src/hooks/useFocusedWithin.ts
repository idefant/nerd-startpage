import * as React from 'react';
import { useEffect, useState } from 'react';

export const useFocusedWithin = (elemRef: React.RefObject<HTMLElement | null>) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const elem = elemRef.current;
    if (!elem) return;

    const update = () => setIsFocused(elem.contains(document.activeElement));

    update();

    const onFocusIn = () => setIsFocused(true);
    const onFocusOut = () => {
      // важно: активный элемент меняется не мгновенно
      queueMicrotask(update);
    };

    elem.addEventListener('focusin', onFocusIn);
    elem.addEventListener('focusout', onFocusOut);

    return () => {
      elem.removeEventListener('focusin', onFocusIn);
      elem.removeEventListener('focusout', onFocusOut);
    };
  }, [elemRef]);

  return isFocused;
};
