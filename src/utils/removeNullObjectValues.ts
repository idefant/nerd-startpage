/** Возвращает объект у которого нет null в значениях. Глубокая проверка */
export const removeNullObjectValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((elem) => removeNullObjectValues(elem));
  }

  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    const newObj: Record<string, any> = {};
    keys.forEach((key) => {
      if (obj[key] !== null) {
        newObj[key] = removeNullObjectValues(obj[key]);
      }
    });
    return newObj;
  }

  return obj;
};
