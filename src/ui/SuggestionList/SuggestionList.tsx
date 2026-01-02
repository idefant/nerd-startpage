import classNames from 'classnames';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { useFocused } from '#hooks/useFocused';
import { hotkeysCommandList } from '#schema/configSchema';
import { Suggestion } from '#types/suggestionType';
import { loopBetween } from '#utils/loopBetween';
import { getModifiers } from '#utils/modifiers';

import cls from './SuggestionList.module.scss';

export interface SuggestionListRef {
  currentSuggestion: Suggestion | undefined;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
}

const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ suggestions }, ref) => {
    const query = useDashboardContext((ctx) => ctx.query);
    const inputRef = useDashboardContext((ctx) => ctx.inputRef);

    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
    const [hasBackdrop, setHasBackdrop] = useState(false);
    const isInputFocused = useFocused(inputRef);

    useImperativeHandle(
      ref,
      () => ({
        currentSuggestion: suggestions[activeSuggestionIndex],
      }),
      [activeSuggestionIndex, suggestions],
    );

    const scrollSuggestionsToTop = useCallback(
      () => suggestionsRef.current?.scrollTo({ top: 0 }),
      [],
    );

    const scrollToActiveSuggestion = useCallback(() => {
      const activeElem = suggestionsRef.current?.children[activeSuggestionIndex];
      activeElem?.scrollIntoView({ block: 'nearest' });
    }, [activeSuggestionIndex]);

    const handleShowBackdropIfNeed = useCallback(() => {
      setHasBackdrop(!!query || !!suggestions.length);
    }, [query, suggestions.length]);

    useEffect(() => handleShowBackdropIfNeed(), [handleShowBackdropIfNeed]);

    useEffect(() => {
      setActiveSuggestionIndex(-1);
      scrollSuggestionsToTop();
    }, [scrollSuggestionsToTop, suggestions]);

    useEffect(() => {
      if (activeSuggestionIndex === -1) {
        scrollSuggestionsToTop();
        return;
      }
      scrollToActiveSuggestion();
    }, [activeSuggestionIndex, scrollSuggestionsToTop, scrollToActiveSuggestion]);

    useEffect(() => {
      const inputElem = inputRef.current;
      if (!inputElem) return;

      const cb = () => setHasBackdrop(!!query || !!suggestions.length);
      inputElem?.addEventListener('click', cb);
      return () => inputElem?.removeEventListener('click', cb);
    }, [inputRef, query, suggestions.length]);

    // XXX: Пока не уверен, а нахрена это надо
    const hotkeys = useMemo(
      () =>
        Object.fromEntries(
          hotkeysCommandList.map((commandKey) => {
            // if (config?.mappings?.[commandKey]) {
            //   return [commandKey, config?.mappings?.[commandKey]];
            // }
            // if (commandKey in commandsMap && 'hotkey' in commandsMap[commandKey as CommandKey]) {
            //   return [commandKey, (commandsMap[commandKey as CommandKey] as any).hotkey as string];
            // }
            if (commandKey === 'prevSuggestion') {
              return [commandKey, 'ArrowUp'];
            }
            if (commandKey === 'nextSuggestion') {
              return [commandKey, 'ArrowDown'];
            }
            return [commandKey, []];
          }),
        ) as Record<(typeof hotkeysCommandList)[number], string | string[]>,
      // [config?.mappings],
      [],
    );

    useHotkeys(
      hotkeys.prevSuggestion,
      () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev - 1)),
      { ...hotkeyHookConfig, scopes: 'suggestions' },
    );
    useHotkeys(
      hotkeys.nextSuggestion,
      () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev + 1)),
      { ...hotkeyHookConfig, scopes: 'suggestions' },
    );

    useHotkeys(
      'Esc',
      () => {
        inputRef.current?.focus();
        if (hasBackdrop) {
          setHasBackdrop(false);
        } else {
          handleShowBackdropIfNeed();
        }
      },
      hotkeyHookConfig,
    );

    useHotkeys(
      'Enter',
      (e) => {
        const suggestion = suggestions[activeSuggestionIndex];
        if (!suggestion) return;

        const modifiersCombo = getModifiers(e);
        suggestion.actions?.[modifiersCombo]?.();
      },
      { ...hotkeyHookConfig, scopes: 'suggestions', ignoreModifiers: true },
    );

    return (
      <>
        <div
          className={classNames(cls.suggestions, {
            [cls.suggestionsVisible]: isInputFocused && hasBackdrop && suggestions.length !== 0,
          })}
          ref={suggestionsRef}
        >
          {suggestions?.map((suggestion, i) => {
            const handleClickSuggestion = (e: React.MouseEvent) => {
              const modifiersCombo = getModifiers(e);
              suggestion.actions?.[modifiersCombo]?.();
            };

            return (
              <button
                className={classNames(cls.suggestion, {
                  [cls.suggestionActive]: activeSuggestionIndex === i,
                })}
                onClick={handleClickSuggestion}
                type="button"
              >
                <span className={cls.suggestionTitle}>
                  {suggestion.title || '--- no_title ---'}
                </span>
                {suggestion.extra && (
                  <span className={cls.suggestionExtra}>{suggestion.extra}</span>
                )}
              </button>
            );
          })}
        </div>

        {createPortal(
          <div
            className={classNames(cls.backdrop, {
              [cls.backdropVisible]: isInputFocused && hasBackdrop,
            })}
            onClick={() => setHasBackdrop(false)}
          />,
          document.body,
        )}
      </>
    );
  },
);

export default SuggestionList;
