import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DesignTest from './DesignTest';
import '../App.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Redesign primitives showcase — visit `#design-test` to view.
// Lives at the entry point so the App component's hooks aren't affected.
const isDesignTest = window.location.hash === '#design-test';

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {isDesignTest ? <DesignTest /> : <App />}
  </React.StrictMode>
);