import { TVisitedSuggestion, TSuggestionsMode } from '../types';

type TSuggestionLists = {
  search: string[];
  history: TVisitedSuggestion[];
  bookmarks: TVisitedSuggestion[];
};

class SuggestionsStore {
  activeIndex = -1;
  mode: TSuggestionsMode = 'search';
  list: TSuggestionLists = {
    search: [],
    history: [],
    bookmarks: [],
  };

  get active() {
    return this.list[this.mode][this.activeIndex];
  }

  resetActiveIndex() {
    this.activeIndex = -1;
  }

  move(direction: -1 | 1) {
    const suggestionsCount = this.list[this.mode].length;
    let newIndex = ((this.activeIndex + direction + 1) % (suggestionsCount + 1)) - 1;
    if (newIndex < -1) {
      newIndex += suggestionsCount + 1;
    }
    this.activeIndex = newIndex;
    return newIndex;
  }
}

export default SuggestionsStore;
