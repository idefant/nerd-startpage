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
import { useCommandHotkey } from '#hooks/useCommandHotkey';
import { useFocusedWithin } from '#hooks/useFocusedWithin';
import { useLeaderSequence } from '#hooks/useLeaderSequence';
import { Suggestion } from '#types/suggestionType';
import Spinner from '#ui/Spinner';
import { loopBetween } from '#utils/loopBetween';
import { getModifiers, ModifiersOnlyEvent } from '#utils/modifiers';

import cls from './SuggestionList.module.scss';

export interface SuggestionListRef {
  currentSuggestion: Suggestion | undefined;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  onEnterWithoutSuggestion?: (e: ModifiersOnlyEvent) => void;
  isLoading?: boolean;
}

const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ suggestions, onEnterWithoutSuggestion, isLoading }, ref) => {
    const query = useDashboardContext((ctx) => ctx.query);
    const inputRef = useDashboardContext((ctx) => ctx.inputRef);
    const searchBoxRef = useDashboardContext((ctx) => ctx.searchBoxRef);

    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
    const [hasBackdrop, setHasBackdrop] = useState(false);
    const isFocused = useFocusedWithin(searchBoxRef);
    const { isLeaderSequence, applyLeaderSequence } = useLeaderSequence();

    const visibleSuggestions = useMemo(
      () => (isLeaderSequence ? [] : suggestions),
      [isLeaderSequence, suggestions],
    );

    useImperativeHandle(
      ref,
      () => ({
        currentSuggestion: visibleSuggestions[activeSuggestionIndex],
      }),
      [activeSuggestionIndex, visibleSuggestions],
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
      setHasBackdrop(!!query || !!visibleSuggestions.length);
    }, [query, visibleSuggestions.length]);

    useEffect(() => handleShowBackdropIfNeed(), [handleShowBackdropIfNeed]);

    useEffect(() => {
      setActiveSuggestionIndex(-1);
      scrollSuggestionsToTop();
    }, [scrollSuggestionsToTop, query]);

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

      const cb = () => setHasBackdrop(!!query || !!visibleSuggestions.length);
      inputElem?.addEventListener('click', cb);
      return () => inputElem?.removeEventListener('click', cb);
    }, [inputRef, query, visibleSuggestions.length]);

    useCommandHotkey(
      'prevSuggestion',
      () => {
        if (isLoading) return;
        setActiveSuggestionIndex((prev) =>
          loopBetween(-1, visibleSuggestions.length - 1, prev - 1),
        );
      },
      { scopes: 'suggestions' },
    );
    useCommandHotkey(
      'nextSuggestion',
      () => {
        if (isLoading) return;
        setActiveSuggestionIndex((prev) =>
          loopBetween(-1, visibleSuggestions.length - 1, prev + 1),
        );
      },
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
        if (isLeaderSequence) {
          applyLeaderSequence(e);
          return;
        }

        const suggestion = visibleSuggestions[activeSuggestionIndex];
        if (!suggestion) {
          onEnterWithoutSuggestion?.(e);
          return;
        }

        const modifiersCombo = getModifiers(e);
        suggestion.actions?.[modifiersCombo]?.(e);
      },
      { ...hotkeyHookConfig, scopes: 'suggestions', ignoreModifiers: true },
    );

    return (
      <>
        <div
          className={classNames(cls.suggestions, {
            [cls.suggestionsVisible]:
              isFocused && hasBackdrop && (visibleSuggestions.length !== 0 || isLoading),
          })}
          ref={suggestionsRef}
        >
          {isLoading && (
            <>
              <div className={cls.suggestionsBackdrop} />
              <div className={cls.spinnerContainer}>
                <Spinner className={cls.spinner} />
              </div>
            </>
          )}

          {visibleSuggestions?.map((suggestion, i) => {
            const handleClickSuggestion = (e: React.MouseEvent) => {
              const modifiersCombo = getModifiers(e);
              suggestion.actions?.[modifiersCombo]?.(e);
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
