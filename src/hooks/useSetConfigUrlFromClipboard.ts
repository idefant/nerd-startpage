import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useLazyFetchConfigQuery } from '#api/mainApi';
import { setConfigUrl } from '#store/reducers/configSlice';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';

import { useAppDispatch } from './reduxHooks';

export const useSetConfigUrlFromClipboard = () => {
  const dispatch = useAppDispatch();

  const [reloadConfig] = useLazyFetchConfigQuery();

  const setConfigUrlFromClipboard = useCallback(async () => {
    const url = await getTextFromClipboard();
    if (!url) return;
    const urlValidationResult = checkIsValidUrl(url, true);
    if (!urlValidationResult.success) {
      toast.error('Config URL from clipboard is invalid');
      return;
    }
    toast.success('Config URL was successfully added');
    dispatch(setConfigUrl(urlValidationResult.url));
    reloadConfig({ configUrl: urlValidationResult.url });
  }, [dispatch, reloadConfig]);

  return setConfigUrlFromClipboard;
};
