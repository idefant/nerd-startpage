import { useMemo } from 'react';

import { modeMap, modeNameList } from '#data/mode';
import { objectFromEntries } from '#utils/objectEntries';

import { useAppSelector } from './reduxHooks';

export const useModes = () => {
  const config = useAppSelector((state) => state.config.config);

  const detailedModes = useMemo(
    () =>
      modeNameList
        .map((modeName) => ({
          key: modeName,
          ...modeMap[modeName],
          ...config.modes[modeName],
        }))
        .filter((mode) => !mode.disabled),
    [config.modes],
  );

  const modesInCommandPalette = detailedModes.filter((mode) => mode.showInCommandPalette);

  const detailedModesMap = useMemo(
    () =>
      objectFromEntries(
        modeNameList.map(
          (modeName) => [modeName, { ...modeMap[modeName], ...config.modes[modeName] }] as const,
        ),
      ),
    [config.modes],
  );

  return { detailedModes, modesInCommandPalette, detailedModesMap };
};
