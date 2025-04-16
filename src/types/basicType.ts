export type FilterWithIsMode<T> = {
  [K in keyof T as T[K] extends { isMode: any } ? K : never]: T[K];
};

export type ToTuple<K extends readonly string[], T> = {
  [I in keyof K]: K[I] extends keyof T ? { key: K[I] } & T[K[I]] : never;
};
