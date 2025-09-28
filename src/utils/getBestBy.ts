export const getBestBy = <T>(
  arr: T[],
  callback: (bestElem: T, elem: T, index: number) => boolean,
) => {
  const res = arr.reduce(
    (acc, elem, i) => {
      if (!acc.elem || callback(acc.elem, elem, i)) {
        return { index: i, elem };
      }
      return acc;
    },
    {} as { index: number; elem: T } | { index?: number; elem?: T },
  );
  return [res.elem, res.index] as const;
};
