import React from 'react';
import ReactDOM from 'react-dom/client';
import { OwlOverlay } from './components/Owl/OwlOverlay';

declare global {
  interface Window {
    mountOwlWidget?: (containerId: string) => void;
  }
}

const ensureStyleDependencies = () => {
  const tailwindId = 'owl-widget-tailwind';
  const fontId = 'owl-widget-font';

  if (!document.getElementById(tailwindId)) {
    const script = document.createElement('script');
    script.id = tailwindId;
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }

  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap';
    document.head.appendChild(link);
  }
};

export const mountOwlWidget = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`OwlWidget: Container with id '${containerId}' not found.`);
    return;
  }

  ensureStyleDependencies();

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <OwlOverlay />
    </React.StrictMode>
  );
};

window.mountOwlWidget = mountOwlWidget;
