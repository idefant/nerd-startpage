import classNames from 'classnames';
import { FC, HTMLAttributes } from 'react';

import { Config } from '#types/configType';

import cls from './CategoryCard.module.scss';

type CategoryCardProps = NonNullable<Config['categories']>[number] &
  HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  };

export const CategoryCard: FC<CategoryCardProps> = ({ name, links, className, ref, ...props }) => {
  const hasSomeIcon = links.some((link) => link.icon);

  return (
    <div className={classNames(cls.card, className)} ref={ref} {...props}>
      <div className={cls.name}>{name}</div>
      <div className={cls.links}>
        {links.map((link) => (
          <a href={link.url} className={cls.link}>
            {hasSomeIcon && <span className={cls.linkIcon}>{link.icon}</span>}
            <span className={cls.linkName}>{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
