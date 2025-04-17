import { getBestBy } from './getBestBy';

// eslint-disable-next-line no-unused-vars
export const minBy = <T>(arr: T[], callback: (elem: T) => number) => {
  const res = getBestBy(arr, (minElem, elem) => callback(elem) < callback(minElem));
  return res;
};
