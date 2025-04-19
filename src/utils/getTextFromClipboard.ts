import { toast } from 'react-toastify';

export const getTextFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch {
    toast.error('Не удалось получить доступ к буферу обмена');
    return undefined;
  }
};
