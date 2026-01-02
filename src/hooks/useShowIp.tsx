import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useLazyFetchMyIpQuery } from '#api/mainApi';

export const useShowIp = () => {
  const [fetchIP] = useLazyFetchMyIpQuery();

  const showIP = useCallback(async () => {
    const res = await fetchIP(undefined);
    if (res.error) {
      toast.error('Не удалось получить IP адрес');
      return;
    }
    toast.success(
      <div>
        <div>
          <b>IP:</b> {res.data?.ip}
        </div>
        <div>
          <b>Country:</b> {res.data?.country}
        </div>
      </div>,
    );
  }, [fetchIP]);

  return showIP;
};
