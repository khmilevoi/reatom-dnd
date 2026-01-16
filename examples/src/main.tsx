import './setup';

import { createRoot } from 'react-dom/client';

import './index.css';
import { DndDemo } from './demo/DndDemo';

createRoot(document.getElementById('root')!).render(<DndDemo />);
