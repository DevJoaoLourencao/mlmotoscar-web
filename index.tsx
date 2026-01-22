import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { SettingsProvider } from './components/SettingsProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeProvider defaultTheme="dark" storageKey="mlmotoscar-theme">
        <App />
      </ThemeProvider>
    </SettingsProvider>
  </React.StrictMode>
);