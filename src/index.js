import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateAdapter from '@date-io/date-fns';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <App />
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
