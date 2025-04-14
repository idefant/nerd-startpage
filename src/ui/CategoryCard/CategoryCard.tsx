import { FC } from 'react';

import cls from './CategoryCard.module.scss';

interface CategoryCardProps {
  name: string;
  links: {
    name: string;
    url: string;
    icon?: string;
    hotkey?: string;
  }[];
}

export const CategoryCard: FC<CategoryCardProps> = ({ name, links }) => {
  const hasSomeIcon = links.some((link) => link.icon);

  return (
    <div className={cls.card}>
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
