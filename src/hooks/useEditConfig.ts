import { useCallback } from 'react';

import { openUrl } from '#utils/openUrl';

import { useAppSelector } from './reduxHooks';
import { useShowConfig } from './useShowConfig';

export const useEditConfig = () => {
  const { config } = useAppSelector((state) => state.config);

  const showConfig = useShowConfig();

  const editConfig = useCallback(
    (options?: { newTab?: boolean }) => {
      if (config.editConfigUrl) {
        openUrl(config.editConfigUrl, options?.newTab);
        return;
      }
      showConfig(options);
    },
    [config.editConfigUrl, showConfig],
  );

  return editConfig;
};
