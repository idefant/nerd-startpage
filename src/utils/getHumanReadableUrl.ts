import punycode from 'punycode/';
import { decode } from 'urlencode';

function decodePathname(pathname: string): string {
  // decodeURIComponent не трогает '+', а в path обычно его и не бывает.
  // Декодируем сегменты, чтобы аккуратно переживать странные случаи.
  return pathname
    .split('/')
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        // если сегмент битый (невалидные %), оставим как есть
        return seg;
      }
    })
    .join('/');
}

function decodeQuery(search: string): string {
  if (!search) return '';
  const raw = search.slice(1);

  // сохраняем структуру k=v&k2=v2 (и случаи без "=")
  const parts = raw.split('&').map((pair) => {
    if (pair === '') return '';

    const eqIdx = pair.indexOf('=');
    const hasEq = eqIdx !== -1;

    const rawKey = hasEq ? pair.slice(0, eqIdx) : pair;
    const rawVal = hasEq ? pair.slice(eqIdx + 1) : '';

    // urlencode.decode: декодирует %xx и превращает '+' в пробел
    const key = decode(rawKey);
    const val = hasEq ? decode(rawVal) : '';

    return hasEq ? `${key}=${val}` : key;
  });

  return parts.join('&');
}

function decodeHash(hash: string): string {
  if (!hash) return '';
  const raw = hash.slice(1);

  // Иногда люди пихают в hash query-формат с '+', так что используем urlencode
  return decode(raw);
}

export function decodeUrlHuman(urlStr: string): string {
  // Поддержим и URL без схемы (vkvideo.ru/?q=...), чтобы не падать
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(urlStr);
  const parseInput = hasScheme ? urlStr : `https://${urlStr}`;

  let url: URL;
  try {
    url = new URL(parseInput);
  } catch {
    // Если совсем не похоже на URL — попробуем просто "человечить" строку
    const fallback = decode(urlStr);
    return fallback;
  }

  // punycode для домена
  const hostUnicode = punycode.toUnicode(url.hostname);

  const port = url.port ? `:${url.port}` : '';
  const pathname = decodePathname(url.pathname);

  const query = decodeQuery(url.search);
  const hash = decodeHash(url.hash);

  // Собираем "человекочитаемо" (может быть невалидным URL)
  const decoded =
    `${url.protocol}//${hostUnicode}${port}` +
    `${pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;

  return decoded;
}
