import { Entries } from 'type-fest';

/** Типизированная версия Object.entries */
export const objectEntries = <T extends object>(obj: T) => Object.entries(obj) as Entries<T>;

/** Типизированная версия Object.fromEntries */
export const objectFromEntries = <const T extends ReadonlyArray<readonly [PropertyKey, unknown]>>(
  entries: T,
) =>
  Object.fromEntries(entries) as {
    [K in T[number] as K[0]]: Extract<T[number], readonly [K[0], any]>[1];
  };
