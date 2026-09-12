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

  const detailedCommand = detailedCommandsMap[commandName];

  const isEnabled = (() => {
    if (detailedCommand.disabled) return false;
    if (Array.isArray(detailedCommand.hotkey)) return detailedCommand.hotkey.length > 0;
    return detailedCommand.hotkey.trim().length > 0;
  })();

  useHotkeys(detailedCommand.hotkey, callback, {
    ...hotkeyHookConfig,
    enabled: isEnabled,
    ...options,
  });
};
