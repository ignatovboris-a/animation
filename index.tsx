import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { mountOwlWidget } from './widget';

// Standalone mount (for development)
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Expose mount function for Blazor / External Embedding
// This mounts ONLY the Owl Overlay, not the App content background
window.mountOwlWidget = mountOwlWidget;
