import { FC, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '#hooks/reduxHooks';
import { DashboardPage } from '#pages/DashboardPage';
import { clearWasResetDueToInvalidConfig } from '#store/reducers/configSlice';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const wasResetDueToInvalidConfig = useAppSelector(
    (state) => state.config.wasResetDueToInvalidConfig,
  );

  useEffect(() => {
    if (!wasResetDueToInvalidConfig) return;
    toast.warning(
      'Конфигурация устарела и была сброшена до дефолтной. Обнови свой конфиг согласно документации.',
    );
    dispatch(clearWasResetDueToInvalidConfig());
  }, [wasResetDueToInvalidConfig, dispatch]);

  return <DashboardPage />;
};

export default App;
