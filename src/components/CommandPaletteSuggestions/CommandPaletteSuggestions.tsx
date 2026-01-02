import { FC, useMemo, useRef } from 'react';

import { useDashboardContext } from '#contexts/DashboardContext';
import { useCommands } from '#hooks/useCommands';
import { useModes } from '#hooks/useModes';
import { CommandName } from '#types/commandType';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { ModifiersOnlyEvent } from '#utils/modifiers';

interface CommandPaletteSuggestionsProps {
  commandActionsMap: Record<
    Exclude<CommandName, 'nextSuggestion' | 'prevSuggestion'>,
    (e: Partial<ModifiersOnlyEvent>) => void
  >;
}

const CommandPaletteSuggestions: FC<CommandPaletteSuggestionsProps> = ({ commandActionsMap }) => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setMode = useDashboardContext((ctx) => ctx.setMode);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const { modesInCommandPalette } = useModes();
  const { commandsInCommandPalette } = useCommands();

  const modeSuggestions: Suggestion[] = useMemo(
    () =>
      modesInCommandPalette
        .filter((mode) => (query ? mode.title.toLowerCase().includes(query.toLowerCase()) : true))
        .map((mode) => {
          const extra = typeof mode.hotkey === 'string' ? mode.hotkey : mode.hotkey.join(', ');
          return {
            title: mode.title,
            extra,
            actions: {
              '': () => setMode(mode.key),
            },
          };
        }),
    [modesInCommandPalette, query, setMode],
  );

  const commandSuggestions: Suggestion[] = useMemo(
    () =>
      commandsInCommandPalette
        .filter((command) =>
          query ? command.title.toLowerCase().includes(query.toLowerCase()) : true,
        )
        .map((command) => {
          const extra =
            typeof command.hotkey === 'string' ? command.hotkey : command.hotkey.join(', ');

          const applySuggestion = (options?: { newTab?: boolean }) => {
            ({
              nextSuggestion: () => {},
              prevSuggestion: () => {},
              ...commandActionsMap,
            })[command.key]({ ctrlKey: options?.newTab });
          };

          return {
            title: command.title,
            extra,
            actions: {
              '': () => applySuggestion(),
              c: () => applySuggestion({ newTab: true }),
            },
          };
        }),
    [commandsInCommandPalette, query, commandActionsMap],
  );

  return (
    <SuggestionList
      suggestions={[...modeSuggestions, ...commandSuggestions]}
      ref={suggestionListRef}
    />
  );
};

export default CommandPaletteSuggestions;
