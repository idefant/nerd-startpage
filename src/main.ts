import { openConfigPopup, reloadConfig } from './helper/config';
import { addFilter, removeFilter } from './helper/filter';
import { categoryTemplate, listTemplate } from './helper/templates';
import $ from './helper/domElements';
import './style.scss';
import { createMasonry } from './helper/masonry';
import store from './store';
import { addSuggestionsEventListeners } from './helper/suggestions';
import { handleInput, handleSubmit } from './helper/form';

const config = store.config;

$.input.addEventListener('input', handleInput);
$.form.addEventListener('submit', handleSubmit);

$.reloadButton.addEventListener('click', () => reloadConfig().then(init));
$.settingButton.addEventListener('click', openConfigPopup);

$.input.addEventListener('blur', removeFilter);
$.input.addEventListener('focus', () => store.form.value && addFilter());

const init = () => {
  addSuggestionsEventListeners();

  $.categories.innerHTML = listTemplate(categoryTemplate, config.data.categories);

  const ro = new ResizeObserver(createMasonry);
  $.getCategoryElems().forEach((elem) => ro.observe(elem));
  window.addEventListener('resize', createMasonry);
};

init();
