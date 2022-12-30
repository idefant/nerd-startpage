import ConfigStore from './configStore';
import FormStore from './formStore';
import SuggestionsStore from './suggestionsStore';

const store = {
  config: new ConfigStore(),
  suggestions: new SuggestionsStore(),
  form: new FormStore(),
};

export default store;
