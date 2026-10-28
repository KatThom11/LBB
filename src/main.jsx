import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import NotebookErrorBoundary from './components/NotebookErrorBoundary';
import './styles.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><NotebookErrorBoundary><App /></NotebookErrorBoundary></React.StrictMode>);
