import { HotkeyCallback, useHotkeys } from 'react-hotkeys-hook';
import { OptionsOrDependencyArray } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { CommandName } from '#types/commandType';

import { useCommands } from './useCommands';

export const useCommandHotkey = (
  commandName: CommandName,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
) => {
  const { detailedCommandsMap } = useCommands();

  useHotkeys(detailedCommandsMap[commandName].hotkey, callback, {
    ...hotkeyHookConfig,
    enabled: !detailedCommandsMap[commandName].disabled,
    ...options,
  });
};
