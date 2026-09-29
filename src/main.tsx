import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import { Entry } from './entry';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Entry />
  </StrictMode>,
);
