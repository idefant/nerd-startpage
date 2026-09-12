import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useLazyFetchMyIpQuery } from '#api/mainApi';

import { useAppSelector } from './reduxHooks';

export const useShowIp = () => {
  const config = useAppSelector((state) => state.config.config);
  const [fetchIP] = useLazyFetchMyIpQuery();

  const showIP = useCallback(async () => {
    const service = config?.commands.showMyIP.service ?? 'ifconfig';
    const res = await fetchIP({ service });
    if (res.error) {
      toast.error('Не удалось получить IP адрес');
      return;
    }
    toast.success(
      <div>
        <div>
          <b>IP:</b> {res.data?.ip}
        </div>
        {res.data?.country && (
          <div>
            <b>Country:</b> {res.data.country}
          </div>
        )}
      </div>,
    );
  }, [config?.commands.showMyIP.service, fetchIP]);

  return showIP;
};
