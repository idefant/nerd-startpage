import { HotkeyCallback, useHotkeys } from 'react-hotkeys-hook';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { ModeName } from '#types/modeType';

import { useModes } from './useModes';

export const useModeHotkey = (modeName: ModeName, callback: HotkeyCallback) => {
  const { detailedModesMap } = useModes();

  useHotkeys(detailedModesMap[modeName].hotkey, callback, {
    ...hotkeyHookConfig,
    enabled: !detailedModesMap[modeName].disabled,
  });
};
