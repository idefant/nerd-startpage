import classNames from 'classnames';
import { FC, useRef } from 'react';

import { useMasonry } from '#hooks/useMasonry';
import { Config } from '#types/configType';
import { CategoryCard } from '#ui/CategoryCard';

import cls from './CategoryGrid.module.scss';

interface CategoryGridProps {
  columnWidth?: number;
  columnGap?: number;
  columnMaxCount?: number;
  categories?: Config['categories'];
}

export const CategoryGrid: FC<CategoryGridProps> = ({
  columnWidth = 200,
  columnGap = 20,
  columnMaxCount = 6,
  categories,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryListRef = useRef<(HTMLDivElement | null)[]>([]);

  const { elemsCoords: categoriesCoords, elemsListSize: categoriesListSize } = useMasonry(
    categoryListRef,
    { columnWidth, columnGap, columnMaxCount, containerRef },
  );

  return (
    <div ref={containerRef}>
      <div
        className={classNames(cls.categories, {
          [cls.categoriesHidden]: categoriesCoords.length === 0,
        })}
        style={{ width: categoriesListSize?.width, height: categoriesListSize?.height }}
      >
        {categories?.map((category, i) => (
          <CategoryCard
            name={category.name}
            color={category.color}
            links={category.links}
            style={{
              width: columnWidth,
              top: categoriesCoords[i]?.top,
              left: categoriesCoords[i]?.left,
            }}
            className={cls.categoryCard}
            ref={(elem) => {
              categoryListRef.current[i] = elem;
            }}
            key={i}
          />
        ))}
      </div>{' '}
    </div>
  );
};
