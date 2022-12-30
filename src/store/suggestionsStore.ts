class SuggestionsStore {
  activeIndex = -1;
  list: string[] = [];

  get active() {
    return this.list[this.activeIndex];
  }

  resetActiveIndex() {
    this.activeIndex = -1;
  }

  move(direction: -1 | 1) {
    let newIndex =
      ((this.activeIndex + direction + 1) % (this.list.length + 1)) - 1;
    if (newIndex < -1) {
      newIndex += this.list.length + 1;
    }
    this.activeIndex = newIndex;
    return newIndex;
  }
}

export default SuggestionsStore;
