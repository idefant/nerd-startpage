import { visitedSuggestionTemplate, listTemplate, searchSuggestionTemplate } from './templates';
import $ from './domElements';
import store from '../store';
import { hotkey } from './hotkey';
import { search } from './form';
import { TVisitedSuggestion } from '../types';
import { fetchSuggestions } from './requests';

const config = store.config;

export const setSearchSuggestions = async () => {
  const suggestions = await fetchSuggestions(store.form.value);
  if (!suggestions) return;
  store.suggestions.list.search = suggestions;

  $.suggestions.innerHTML = listTemplate(searchSuggestionTemplate, suggestions);
  $.getSuggestionElems().forEach((elem) =>
    elem.addEventListener('click', () => search(elem.textContent || ''))
  );
};

export const setHistorySuggestions = async () => {
  const startTime = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const historyList = await browser.history.search({
    text: store.form.value,
    startTime,
    maxResults: 16,
  });

  const filteredList = historyList
    .filter((historyItem) => historyItem.url)
    .slice(0, 8)
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
  setVisitedSuggestions(filteredList);
};

export const setBookmarkSuggestions = async () => {
  const bookmarksList = await browser.bookmarks.search(store.form.value);
  const filteredList = bookmarksList.filter((bookmark) => bookmark.url).slice(0, 8);
  setVisitedSuggestions(filteredList);
};

export const setVisitedSuggestions = (suggestions: TVisitedSuggestion[]) => {
  const mode = store.suggestions.mode;
  if (mode === 'search') return;

  store.suggestions.list[mode] = suggestions;

  $.suggestions.innerHTML = listTemplate(visitedSuggestionTemplate, suggestions);
  $.getSuggestionElems().forEach((elem, i) =>
    elem.addEventListener('click', () => {
      const suggestion = suggestions[i];
      if (suggestion.url) {
        window.location.href = suggestion.url;
      }
    })
  );
};

export const unsetSuggestions = () => {
  store.suggestions.list = { search: [], history: [], bookmarks: [] };
  $.suggestions.innerHTML = '';
};

export const moveBySuggestions = (direction: 1 | -1) => {
  const newIndex = store.suggestions.move(direction);

  const suggestionElems = $.getSuggestionElems();
  suggestionElems.forEach((elem) => elem.classList.remove('suggestion-active'));

  if (newIndex === -1) {
    $.input.value = store.form.value;
    return;
  }

  suggestionElems[newIndex].classList.add('suggestion-active');
  if (store.suggestions.mode === 'search') {
    $.input.value = store.suggestions.active as string;
  }
};

const suggestionActionEventRemovers: (() => void)[] = [];

export const addSuggestionsEventListeners = () => {
  suggestionActionEventRemovers.forEach((eventRemover) => eventRemover());

  suggestionActionEventRemovers.push(
    hotkey(config.data.mappings.suggestionNext, () => moveBySuggestions(1), {
      elem: $.input,
    })
  );

  suggestionActionEventRemovers.push(
    hotkey(config.data.mappings.suggestionPrev, () => moveBySuggestions(-1), {
      elem: $.input,
    })
  );
};
