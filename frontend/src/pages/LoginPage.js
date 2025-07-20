// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress, // Para indicar carregamento
  Alert, // Para exibir mensagens de erro
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useThemeToggle } from '../contexts/ThemeContext';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext'; // Importe o hook useAuth

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Estado de carregamento do login
  const [error, setError] = useState(null); // Estado para mensagens de erro

  const { toggleColorMode, mode } = useThemeToggle();
  const theme = useTheme();
  const { login } = useAuth(); // Obtém a função de login do contexto

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página no submit do formulário
    setLoading(true);
    setError(null); // Limpa erros anteriores

    const result = await login(username, password);

    if (result !== true) { // Se o login não foi bem-sucedido (retornou uma string de erro)
      setError(result);
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[8],
        }}
      >
        <Box sx={{ mb: 4 }}>
          {/* Adicione sua tag <img> aqui para o logo. Exemplo: */}
          {/* <img src="/logo.png" alt="Sistema Logo" style={{ maxWidth: '150px', height: 'auto' }} /> */}
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            GESTÃO DE TEMPO
          </Typography>
          <Typography variant="h6" component="p" sx={{ color: 'text.secondary', mt: 1 }}>
            Gerenciamento de Tempo
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
          Bem-vindo!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate> {/* Adicionei um formulário */}
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{ style: { color: theme.palette.text.primary } }}
          />
          <TextField
            label="Senha"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit" // Botão de submit do formulário
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, mb: 2, textTransform: 'none', fontWeight: 'bold' }}
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
          <IconButton onClick={() => toggleColorMode()} color="inherit">
            {mode === 'dark' ? <LightModeIcon sx={{ color: 'text.secondary' }} /> : <DarkModeIcon sx={{ color: 'text.secondary' }} />}
          </IconButton>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} color="default" />}
            labelPlacement="end"
            label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>{mode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</Typography>}
          />
        </Box>

        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
          Problemas para entrar? <Link href="#" color="primary.main" underline="hover">Fale com o suporte</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage;