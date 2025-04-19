import browser from 'webextension-polyfill';

export const openUrl = (url: string, newTab?: boolean) => {
  if (!newTab) {
    window.location.href = url;
  } else {
    browser.tabs.create({ url, active: false });
  }
};
