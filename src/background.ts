browser.commands.onCommand.addListener((command) => {
  if (command === 'open_startpage') {
    browser.tabs.create({ url: browser.runtime.getURL('index.html') });
  }
});
