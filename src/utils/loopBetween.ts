export const loopBetween = (min: number, max: number, value: number) => {
  if (min > max) {
    throw new Error('Минимальное число должно быть меньше максимального');
  }

  const numCount = max - min + 1;

  if (max - min === 0) {
    return min;
  }
  if (value < min) {
    return value + numCount * Math.ceil((min - value) / (max - min));
  }
  if (value > max) {
    return value - numCount * Math.ceil((value - max) / (max - min));
  }
  return value;
};
