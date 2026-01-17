import './setup';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { reatomComponent } from '@reatom/react';

import './index.css';
import { layoutRoute, gridRoute } from './pages';

// Редирект на grid при заходе на /
if (location.pathname === '/') {
  gridRoute.go();
}

const App = reatomComponent(() => {
  return <>{layoutRoute.render()}</>;
}, 'App');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
