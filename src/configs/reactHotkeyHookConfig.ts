import { OptionsOrDependencyArray } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';

export const hotkeyHookConfig: OptionsOrDependencyArray = {
  enableOnFormTags: true,
  preventDefault: true,
  enabled: (ev) => ev.code !== '',
};
