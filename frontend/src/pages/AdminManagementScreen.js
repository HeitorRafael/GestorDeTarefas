import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

function AdminManagementScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for new user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('common');

  

  

  const fetchUsers = useCallback(async () => {
    console.log('fetchUsers: Token:', token);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/admin/users/`, config);
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar usuários. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token]);

  

  

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSuccessMessage(null);
      setError(null);
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      };
      await axios.post(
        `${API_BASE_URL}/admin/users/`,
        { username: newUsername, password: newPassword, role: newRole },
        config
      );
      setSuccessMessage('Usuário criado com sucesso!');
      setNewUsername('');
      setNewPassword('');
      setNewRole('common');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Erro ao criar usuário:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao criar usuário: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    try {
      setSuccessMessage(null);
      setError(null);
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}/`, config);
      setSuccessMessage('Usuário excluído com sucesso!');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Erro ao excluir usuário:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao excluir usuário: ${err.response?.data?.msg || err.message}`);
    }
  };

  

  

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column'
      }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2, mt: 2, color: 'text.secondary' }}>
          Carregando dados de gerenciamento...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        mb: 4, 
        fontWeight: 'bold',
        color: 'primary.main',
        fontSize: '2.2rem'
      }}>
        👥 Gerenciar Usuários
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            maxWidth: '85%', 
            mx: 'auto',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            maxWidth: '85%', 
            mx: 'auto',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Formulário de Criação de Usuário */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            maxWidth: '85%', 
            width: 'auto',
            minWidth: '500px',
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${theme.palette.divider}` 
              : 'none',
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ 
            color: 'primary.main', 
            fontWeight: 'bold',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <PersonAddIcon /> Criar Novo Usuário
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={handleCreateUser} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3 
            }}
          >
            <TextField
              label="Nome de Usuário"
              variant="outlined"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Senha"
              variant="outlined"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                label="Função"
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="common">Comum</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Criar Usuário
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Lista de Usuários */}
      <Typography variant="h6" gutterBottom align="center" sx={{ 
        mb: 3,
        color: 'primary.main',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <PeopleIcon /> Usuários Existentes
      </Typography>
      
      {users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Alert 
            severity="info" 
            sx={{ 
              maxWidth: '85%', 
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Nenhum usuário encontrado.
          </Alert>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxWidth: '85%', 
              width: 'auto',
              minWidth: '700px',
              boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : theme.palette.background.paper,
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${theme.palette.divider}` 
                : 'none',
              animation: 'fadeIn 0.5s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="lista de usuários">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[800] 
                    : theme.palette.primary.main 
                }}>
                  <TableCell sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    py: 2
                  }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    py: 2
                  }}>
                    Nome de Usuário
                  </TableCell>
                  <TableCell sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    py: 2
                  }}>
                    Função
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    py: 2
                  }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userItem, index) => (
                  <TableRow 
                    key={userItem.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 
                        ? (theme.palette.mode === 'dark' 
                          ? theme.palette.grey[900] 
                          : theme.palette.grey[50])
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[800] 
                          : theme.palette.grey[100],
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      fontSize: '1rem', 
                      py: 2,
                      color: 'text.primary',
                      fontWeight: '500'
                    }}>
                      {userItem.id}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '1rem', 
                      py: 2,
                      color: 'text.primary',
                      fontWeight: '500'
                    }}>
                      {userItem.username}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '1rem', 
                      py: 2,
                      color: 'text.primary',
                      fontWeight: '500'
                    }}>
                      <Box sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: userItem.role === 'admin' 
                          ? theme.palette.error.main 
                          : theme.palette.success.main,
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {userItem.role === 'admin' ? 'Admin' : 'Comum'}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser(userItem.id)}
                        disabled={userItem.role === 'admin'}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: '500',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 3
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default AdminManagementScreen;