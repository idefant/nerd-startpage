const $ = {
  suggestions: document.querySelector('.suggestions') as Element,
  categories: document.querySelector('.categories') as HTMLElement,
  input: document.querySelector('input') as HTMLInputElement,
  filter: document.querySelector('.bg-filter') as HTMLElement,
  container: document.querySelector('.container') as HTMLElement,
  form: document.querySelector('form') as HTMLFormElement,
  reloadButton: document.querySelector('#reload_config_button') as Element,
  settingButton: document.querySelector('#setting_button') as Element,

  getCategoryElems: () => document.querySelectorAll<HTMLElement>('.category'),
  getSuggestionElems: () => document.querySelectorAll('.suggestion'),
};

export default $;
