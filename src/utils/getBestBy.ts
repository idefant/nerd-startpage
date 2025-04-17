export const getBestBy = <T>(
  /* eslint-disable no-unused-vars */
  arr: T[],
  callback: (bestElem: T, elem: T, index: number) => boolean,
  /* eslint-enable no-unused-vars */
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
