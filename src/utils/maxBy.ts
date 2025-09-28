import { getBestBy } from './getBestBy';

export const maxBy = <T>(arr: T[], callback: (elem: T) => number) => {
  const res = getBestBy(arr, (minElem, elem) => callback(elem) > callback(minElem));
  return res;
};
