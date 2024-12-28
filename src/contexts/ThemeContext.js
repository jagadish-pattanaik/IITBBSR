import React, { useState } from 'react';

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark'; // Default to dark
  });

  // ... rest of the provider code
};

export default ThemeProvider; 