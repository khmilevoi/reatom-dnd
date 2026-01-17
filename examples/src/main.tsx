import './setup';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { DndDemo } from './demo/DndDemo';

createRoot(document.getElementById('root')!).render(<StrictMode><DndDemo /></StrictMode>);
