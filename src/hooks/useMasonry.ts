import { RefObject, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { maxBy } from '#utils/maxBy';
import { minBy } from '#utils/minBy';

type ElemCoords = { index: number; width: number; height: number; top: number; left: number };

export const useMasonry = (
  itemsRef: RefObject<(HTMLElement | null)[]>,
  options: {
    columnWidth: number;
    columnGap: number;
    columnMaxCount: number;
    containerRef: RefObject<HTMLElement | null>;
  },
) => {
  const { columnWidth, columnGap, columnMaxCount, containerRef } = options;

  const [elemsListSize, setElemsListSize] = useState<{ width: number; height: number }>();
  const [elemsCoords, setElemsCoords] = useState<ElemCoords[]>([]);

  const roCallback = useCallback(() => {
    if (itemsRef.current.length === 0 || !containerRef.current) return;

    const elems = itemsRef.current.filter((elem): elem is HTMLElement => !!elem);

    const elemsSizes = elems.map((elem, i) => ({
      index: i,
      width: elem.offsetWidth,
      height: elem.offsetHeight,
    }));

    const containerWidth = containerRef.current.offsetWidth;
    const columnPotentialCount = Math.floor(
      (containerWidth + columnGap) / (columnWidth + columnGap),
    );
    const columnsCount = Math.min(columnPotentialCount, columnMaxCount) || 1;

    const elemsLocations = elemsSizes.reduce(
      (acc, elem) => {
        const [minColumn] = minBy(acc, (column) => column.height);
        if (!minColumn) return acc;

        acc[minColumn.index].elems.push({
          ...elem,
          top: acc[minColumn.index].height,
          left: minColumn.index * (columnWidth + columnGap),
        });
        acc[minColumn.index].height += elem.height + columnGap;

        return acc;
      },
      [...Array(columnsCount)].map((_, i) => ({
        index: i,
        height: 0,
        elems: [] as ElemCoords[],
      })),
    );

    const [maxColumn] = maxBy(elemsLocations, (column) => column.height);
    const elemsListWidth = columnsCount * (columnWidth + columnGap) - columnGap;
    setElemsListSize({ width: elemsListWidth, height: maxColumn?.height || 0 });

    const elemsCoords = elemsLocations
      .flatMap((elem) => elem.elems)
      .sort((a, b) => a.index - b.index);
    setElemsCoords(elemsCoords);
  }, [columnGap, columnMaxCount, columnWidth, containerRef, itemsRef]);

  const ro = useMemo(() => new ResizeObserver(roCallback), [roCallback]);

  useLayoutEffect(() => {
    const elems = itemsRef.current.filter((elem): elem is HTMLElement => !!elem);
    elems.forEach((elem) => ro.observe(elem));
    return () => ro.disconnect();
  }, [itemsRef, ro]);

  useLayoutEffect(() => {
    window.addEventListener('resize', roCallback);
    return () => window.removeEventListener('resize', roCallback);
  }, [roCallback]);

  return {
    elemsListSize,
    elemsCoords,
  };
};
