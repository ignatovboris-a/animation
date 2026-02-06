import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OwlOverlay } from './components/Owl/OwlOverlay';

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
// @ts-ignore
window.mountOwlWidget = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <OwlOverlay />
            </React.StrictMode>
        );
    } else {
        console.error(`OwlWidget: Container with id '${containerId}' not found.`);
    }
};