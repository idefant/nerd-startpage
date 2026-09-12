import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { openUrl } from '#utils/openUrl';

import { useAppSelector } from './reduxHooks';

export const useShowConfig = () => {
  const { configUrl } = useAppSelector((state) => state.config);

  const showConfig = useCallback(
    (options?: { newTab?: boolean }) => {
      if (!configUrl) {
        toast.error('Config URL is empty');
        return;
      }
      openUrl(configUrl, options?.newTab);
    },
    [configUrl],
  );

  return showConfig;
};
