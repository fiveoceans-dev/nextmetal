// src/main.tsx

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'leaflet/dist/leaflet.css';
// If you use Tailwind, also import your global CSS here:
// import './index.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FocusStyleManager } from '@blueprintjs/core';
import App from './App';

// Show focus outlines only when navigating via keyboard
FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);