import { parse } from 'tldts';

export const checkIsValidUrl = (
  str: string,
  strict?: boolean,
): { success: true; url: string } | { success: false } => {
  if (strict) {
    try {
      const newUrl = new URL(str);
      const isValid = newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
      if (!isValid) {
        return { success: false };
      }
      return { success: true, url: str };
    } catch (err) {
      return { success: false };
    }
  }

  const pattern =
    /^(?:https?:\/\/)?(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/;
  const isValid = pattern.test(str);

  if (!isValid) {
    return { success: false };
  }

  const parsedDomain = parse(str, { validHosts: ['localhost'] });
  if (!(parsedDomain.isIcann || parsedDomain.isIp || parsedDomain.hostname === 'localhost')) {
    return { success: false };
  }

  const withProtocol = /^https?:\/\//.test(str);
  return { success: true, url: withProtocol ? str : `http://${str}` };
};
