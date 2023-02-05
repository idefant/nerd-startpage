import { openConfigPopup, reloadConfig } from './helper/config';
import { addFilter, removeFilter } from './helper/filter';
import { categoryTemplate, listTemplate } from './helper/templates';
import $ from './helper/domElements';
import './style.scss';
import { createMasonry } from './helper/masonry';
import store from './store';
import { addSuggestionsEventListeners } from './helper/suggestions';
import { handleInput, handleSubmit } from './helper/form';
import { hotkey } from './helper/hotkey';
import { TSuggestionsMode } from './types';

const config = store.config;

$.input.addEventListener('input', handleInput);
$.form.addEventListener('submit', handleSubmit);

$.reloadButton.addEventListener('click', () => reloadConfig().then(init));
$.settingButton.addEventListener('click', openConfigPopup);

$.input.addEventListener('blur', removeFilter);
$.input.addEventListener('focus', () => store.form.value && addFilter());

const changeMode = (mode: TSuggestionsMode) => {
  if (store.suggestions.mode === mode) return;

  $.input.value = store.form.value;
  store.suggestions.mode = mode;
  document.body.dataset.mode = mode;
  handleInput();
};

hotkey(config.data.mappings.showSearch, () => changeMode('search'));
hotkey(config.data.mappings.showHistory, () => changeMode('history'));
hotkey(config.data.mappings.showBookmarks, () => changeMode('bookmarks'));

const init = () => {
  addSuggestionsEventListeners();

  $.categories.innerHTML = listTemplate(categoryTemplate, config.data.categories);

  const ro = new ResizeObserver(createMasonry);
  $.getCategoryElems().forEach((elem) => ro.observe(elem));
  window.addEventListener('resize', createMasonry);
};

init();
