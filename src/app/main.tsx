import { StrictMode, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className='flex h-dvh items-center justify-center text-gray-400'>Loading…</div>
      }>
      <App />
    </Suspense>
  </StrictMode>
);
