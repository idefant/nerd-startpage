import { fixUrl } from './url';
import store from '../store';
import { TCategory, TLink } from '../types';

const config = store.config;

export const listTemplate = <T>(callback: (items: T) => string, items: T[]) => {
  return items.map(callback).join('');
};

export const suggestionTemplate = (suggestion: string) =>
  `<button class="suggestion" type="button">
    ${suggestion}
  </button>`;

const linkTemplate = (link: TLink) =>
  `<a href="${fixUrl(link.url)}" class="link">
    ${link.name}
  </a>`;

export const categoryTemplate = (category: TCategory) =>
  `<div class="category" style="width:${config.data.colWidth}px">
    <div class="category__name">${category.name}</div>
    <div class="links">${listTemplate(linkTemplate, category.links)}</div>
  </div>`;
