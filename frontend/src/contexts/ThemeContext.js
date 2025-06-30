// frontend/src/contexts/ThemeContext.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Reseta CSS para padrões do Material-UI
import { lightTheme, darkTheme } from '../theme/theme';

export const ThemeContext = createContext({ toggleColorMode: () => {}, mode: 'dark' });

export function ThemeProvider({ children }) {
  // Padrão para modo escuro, como solicitado
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'dark');

  useEffect(() => {
    // Salva a preferência do usuário no localStorage
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Aplica um CSS base */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar o tema e o toggle
export const useThemeToggle = () => useContext(ThemeContext);