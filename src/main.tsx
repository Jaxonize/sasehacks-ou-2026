import '@fontsource-variable/jetbrains-mono';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('App root is missing.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
