// frontend/src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import { amber, grey } from '@mui/material/colors'; // Importando algumas cores padrão para base

// Cores base da Maximundi
const maximundiColors = {
  primaryDark: '#003366', // Azul Escuro/Petróleo
  primaryLight: '#0099cc', // Azul Mais Claro/Ciano
  // Podemos adicionar mais se necessário para nuances
};

// Tema Claro
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: maximundiColors.primaryDark,
      light: maximundiColors.primaryLight,
      dark: '#002244', // Um tom mais escuro do primário
    },
    secondary: {
      main: maximundiColors.primaryLight, // Usamos o azul claro como secundário
      light: amber[100], // Exemplo de cor secundária, pode ser ajustado
      dark: amber[700],
    },
    background: {
      default: grey[50], // Um cinza bem claro para o fundo padrão
      paper: '#FFFFFF',  // Branco puro para cards e superfícies
    },
    text: {
      primary: grey[900], // Texto escuro
      secondary: grey[700], // Texto secundário mais claro
    },
  },
  typography: {
    fontFamily: [
      'Roboto', // Material-UI usa Roboto por padrão, mantenha
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordas mais arredondadas para um toque moderno
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordas arredondadas para cards
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)', // Sombra suave
        },
      },
    },
  },
});

// Tema Escuro
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: maximundiColors.primaryLight, // No modo escuro, o azul mais claro pode ser o principal
      light: '#33CCFF', // Um pouco mais claro que o primaryLight
      dark: maximundiColors.primaryDark, // O azul escuro do Maximundi
    },
    secondary: {
      main: amber[500], // Cor de destaque no modo escuro
      light: amber[300],
      dark: amber[700],
    },
    background: {
      default: '#121212', // Fundo bem escuro
      paper: '#1E1E1E',  // Um pouco mais claro que o fundo, para cards
    },
    text: {
      primary: '#E0E0E0', // Texto claro
      secondary: grey[400], // Texto secundário um pouco mais escuro
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.4)', // Sombra mais proeminente no escuro
        },
      },
    },
  },
});