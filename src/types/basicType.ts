export type ToTuple<K extends readonly string[], T> = {
  [I in keyof K]: K[I] extends keyof T ? { key: K[I] } & T[K[I]] : never;
};
