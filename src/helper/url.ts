export const fixUrl = (url: string) => {
  const isValid = /^((http|https):\/\/)/.test(url);
  return isValid ? url : `https://${url}`;
};
