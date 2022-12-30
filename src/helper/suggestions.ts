import { listTemplate, suggestionTemplate } from './templates';
import $ from './domElements';
import store from '../store';
import { hotkey } from './hotkey';
import { search } from './form';

const config = store.config;

export const setSuggestions = (suggestions: string[]) => {
  store.suggestions.list = suggestions;

  $.suggestions.innerHTML = listTemplate(suggestionTemplate, suggestions);
  $.getSuggestionElems().forEach((elem) =>
    elem.addEventListener('click', () => search(elem.textContent || ''))
  );
};

export const unsetSuggestions = () => {
  store.suggestions.list = [];
  $.suggestions.innerHTML = '';
};

export const moveBySuggestions = (direction: 1 | -1) => {
  const newIndex = store.suggestions.move(direction);

  const suggestionElems = $.getSuggestionElems();
  suggestionElems.forEach((elem) => elem.classList.remove('suggestion-active'));
  if (newIndex !== -1) {
    suggestionElems[newIndex].classList.add('suggestion-active');
    $.input.value = store.suggestions.active;
  } else {
    $.input.value = store.form.value;
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
