import { useMemo } from 'react';

import { commandNameList, commandsMap } from '#data/command';
import { objectFromEntries } from '#utils/objectEntries';

import { useAppSelector } from './reduxHooks';

export const useCommands = () => {
  const config = useAppSelector((state) => state.config.config);

  const detailedCommands = useMemo(
    () =>
      commandNameList
        .map((commandName) => ({
          key: commandName,
          ...commandsMap[commandName],
          ...config.commands[commandName],
        }))
        .filter((mode) => !mode.disabled),
    [config.commands],
  );

  const commandsInCommandPalette = detailedCommands.filter((mode) => mode.showInCommandPalette);

  const detailedCommandsMap = useMemo(
    () =>
      objectFromEntries(
        commandNameList.map((modeName) => [modeName, config.commands[modeName]] as const),
      ),
    [config.commands],
  );

  return { detailedCommands, commandsInCommandPalette, detailedCommandsMap };
};
