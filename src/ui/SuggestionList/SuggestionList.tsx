import classNames from 'classnames';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { useCommandHotkey } from '#hooks/useCommandHotkey';
import { useFocusedWithin } from '#hooks/useFocusedWithin';
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
    const searchBoxRef = useDashboardContext((ctx) => ctx.searchBoxRef);

    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
    const [hasBackdrop, setHasBackdrop] = useState(false);
    const isFocused = useFocusedWithin(searchBoxRef);

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

    useCommandHotkey(
      'prevSuggestion',
      () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev - 1)),
      { scopes: 'suggestions' },
    );
    useCommandHotkey(
      'nextSuggestion',
      () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev + 1)),
      { scopes: 'suggestions' },
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
            [cls.suggestionsVisible]: isFocused && hasBackdrop && suggestions.length !== 0,
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
                onMouseDown={(e) => e.preventDefault()}
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
              [cls.backdropVisible]: isFocused && hasBackdrop,
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
