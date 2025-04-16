import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '#store';

import App from './App';

import 'modern-normalize/modern-normalize.css';
import './styles/index.scss';
import './styles/global.scss';
import './styles/themes/dark.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          draggable={false}
          theme="colored"
        />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
