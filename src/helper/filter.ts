import $ from './domElements';

export const addFilter = () => {
  $.filter.style.display = 'block';
  setTimeout(() => ($.filter.style.opacity = '0.6'));
};

export const removeFilter = () => {
  $.filter.style.opacity = '';
  setTimeout(() => ($.filter.style.display = 'none'), 200);
};
