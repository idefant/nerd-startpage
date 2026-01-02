import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useLazyFetchConfigQuery } from '#api/mainApi';

import { useAppSelector } from './reduxHooks';

export const useReloadConfig = () => {
  const { configUrl } = useAppSelector((state) => state.config);

  const [reloadConfig] = useLazyFetchConfigQuery();

  const handleReloadConfig = useCallback(
    (url = configUrl) => {
      if (!url) {
        toast.error('Config URL is empty');
        return;
      }
      reloadConfig({ configUrl: url });
    },
    [configUrl, reloadConfig],
  );

  return handleReloadConfig;
};
