import $ from './domElements';
import store from '../store';

const config = store.config;

export const createMasonry = () => {
  const containerWidth = $.container.offsetWidth || 0;
  const colsCount = Math.floor(
    (containerWidth + config.data.columns.gap) /
      (config.data.columns.width + config.data.columns.gap)
  );
  const colsHeight = [...Array(colsCount)].map(() => 0);

  const colsSumWidth =
    (config.data.columns.width + config.data.columns.gap) *
      Math.min(colsCount, config.data.categories.length) -
    config.data.columns.gap;
  const sidePadding = (containerWidth - colsSumWidth) / 2;

  $.categories.style.marginLeft = `${sidePadding}px`;
  $.categories.style.marginRight = `${sidePadding}px`;

  $.getCategoryElems().forEach((elem) => {
    const min = colsHeight.reduce(
      (acc, colHeight, i) => (colHeight < acc.value ? { colIndex: i, value: colHeight } : acc),
      { colIndex: -1, value: Number.MAX_SAFE_INTEGER }
    );

    elem.style.top = `${min.value}px`;
    elem.style.left = `${(config.data.columns.width + config.data.columns.gap) * min.colIndex}px`;
    colsHeight[min.colIndex] += elem.offsetHeight + config.data.columns.gap;
  });
};
