import { fixUrl } from './url';
import store from '../store';
import { TVisitedSuggestion, TCategory, TLink } from '../types';

const config = store.config;

export const listTemplate = <T>(callback: (items: T) => string, items: T[]) => {
  return items.map(callback).join('');
};

export const searchSuggestionTemplate = (suggestion: string) =>
  `<button class="suggestion suggestion-search" type="button">
    ${suggestion}
  </button>`;

export const visitedSuggestionTemplate = (suggestion: TVisitedSuggestion) =>
  `<button class="suggestion suggestion-visited" type="button">
    <span class="suggestion-visited__title">${suggestion.title || '--- no_title ---'}</span>
    <span class="suggestion-visited__url">${suggestion.url}</span>
  </button>`;

const linkTemplate = (link: TLink) =>
  `<a href="${fixUrl(link.url)}" class="link">
    ${link.name}
  </a>`;

export const categoryTemplate = (category: TCategory) =>
  `<div class="category" style="width:${config.data.columns.width}px">
    <div class="category__name">${category.name}</div>
    <div class="links">${listTemplate(linkTemplate, category.links)}</div>
  </div>`;
