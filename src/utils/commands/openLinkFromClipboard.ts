import { toast } from 'react-toastify';

import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { openUrl } from '#utils/openUrl';

export const openLinkFromClipboard = async (options?: { newTab?: boolean }) => {
  const url = await getTextFromClipboard();
  if (!url) return;
  const urlValidationResult = checkIsValidUrl(url);
  if (!urlValidationResult.success) {
    toast.error('URL from clipboard is invalid');
    return;
  }
  openUrl(urlValidationResult.url, options?.newTab);
};
