import { HotkeyCallback, useHotkeys } from 'react-hotkeys-hook';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { ModeName } from '#types/modeType';

import { useModes } from './useModes';

export const useModeHotkey = (modeName: ModeName, callback: HotkeyCallback) => {
  const { detailedModesMap } = useModes();

  const detailedMode = detailedModesMap[modeName];

  const isEnabled = (() => {
    if (detailedMode.disabled) return false;
    if (Array.isArray(detailedMode.hotkey)) return detailedMode.hotkey.length > 0;
    return detailedMode.hotkey.trim().length > 0;
  })();

  useHotkeys(detailedMode.hotkey, callback, {
    ...hotkeyHookConfig,
    enabled: isEnabled,
  });
};
