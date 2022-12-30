(async () => {
  const tab = browser.tabs.getCurrent();
  browser.tabs.create({ url: browser.runtime.getURL('index.html') });
  const tabNumber = (await tab).id;
  if (tabNumber) {
    browser.tabs.remove(tabNumber);
  }
})();
