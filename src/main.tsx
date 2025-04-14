import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import 'modern-normalize/modern-normalize.css';
import './styles/index.scss';
import './styles/global.scss';
import './styles/themes/dark.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
