import { getBestBy } from './getBestBy';

export const minBy = <T>(arr: T[], callback: (elem: T) => number) => {
  const res = getBestBy(arr, (minElem, elem) => callback(elem) < callback(minElem));
  return res;
};
