import $ from './domElements';
import { removeFilter, addFilter } from './filter';
import { fixUrl } from './url';
import { getHotkey, getLinkByHotkey } from './hotkey';
import store from '../store';
import {
  unsetSuggestions,
  setSearchSuggestions,
  setHistorySuggestions,
  setBookmarkSuggestions,
} from './suggestions';
import { TVisitedSuggestion } from '../types';

const config = store.config;

export const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();

  if (store.form.value.startsWith(config.data.hotkeyLeader)) {
    const link = getLinkByHotkey(getHotkey(store.form.value));
    if (link) {
      window.location.href = fixUrl(link.url);
    } else {
      $.input.value = config.data.hotkeyLeader;
    }
    return;
  }

  const suggestionsMode = store.suggestions.mode;

  if (suggestionsMode === 'search') {
    search();
    return;
  }

  const suggestions = store.suggestions.list[suggestionsMode] as TVisitedSuggestion[];
  const index = store.suggestions.activeIndex;
  const suggestion = suggestions[index];
  if (suggestion.url) {
    window.location.href = suggestion.url;
  } else {
    search(suggestion.title);
  }
};

export const handleInput = async () => {
  store.form.value = $.input.value;
  store.suggestions.resetActiveIndex();

  if (!store.form.value) {
    removeFilter();
    unsetSuggestions();
    return;
  }

  addFilter();
  if (store.form.value.startsWith(config.data.hotkeyLeader)) {
    unsetSuggestions();
    return;
  }

  const suggestionActions = {
    search: setSearchSuggestions,
    history: setHistorySuggestions,
    bookmarks: setBookmarkSuggestions,
  };
  suggestionActions[store.suggestions.mode]();
};

export const search = (q = $.input.value) => {
  store.form.value = $.input.value;
  const regexp =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  if (regexp.test(q)) {
    window.location.href = q;
  } else {
    const urlParams = new URLSearchParams({ q });
    window.location.href = `https://www.google.com/search?${urlParams}`;
  }
  unsetSuggestions();
};
