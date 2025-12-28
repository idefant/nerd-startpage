import { parse } from 'tldts';

export const checkIsValidUrl = (
  str: string,
  strict?: boolean,
): { success: true; url: string } | { success: false } => {
  const trimmedStr = str.trim();
  if (strict) {
    try {
      const newUrl = new URL(trimmedStr);
      const isValid = newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
      if (!isValid) {
        return { success: false };
      }
      return { success: true, url: trimmedStr };
    } catch (err) {
      return { success: false };
    }
  }

  const pattern =
    /^(?:https?:\/\/)?(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/;
  const isValid = pattern.test(trimmedStr);

  if (!isValid) {
    return { success: false };
  }

  const parsedDomain = parse(trimmedStr, { validHosts: ['localhost'] });
  if (
    !(
      parsedDomain.isIcann ||
      parsedDomain.isIp ||
      parsedDomain.hostname === 'localhost' ||
      parsedDomain.hostname?.endsWith('.localhost')
    )
  ) {
    return { success: false };
  }

  const withProtocol = /^https?:\/\//.test(trimmedStr);
  return { success: true, url: withProtocol ? trimmedStr : `http://${trimmedStr}` };
};
