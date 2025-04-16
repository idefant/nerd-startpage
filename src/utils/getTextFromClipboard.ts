import { toast } from 'react-toastify';

export const getTextFromClipboard = () => {
  try {
    return navigator.clipboard.readText();
  } catch {
    toast.error('Не удалось получить доступ к буферу обмена');
    return undefined;
  }
};
