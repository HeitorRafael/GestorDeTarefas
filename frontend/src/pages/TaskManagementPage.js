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
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';


const API_BASE_URL = 'http://localhost:5000/api';

function TaskManagementPage() {
  const { token } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/tasks/admin/`, config);
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar tarefas. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
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
        `${API_BASE_URL}/admin/tasks/`,
        { name: newTaskName },
        config
      );
      setSuccessMessage('Tarefa criada com sucesso!');
      setNewTaskName('');
      fetchTasks(); // Refresh task list
    } catch (err) {
      console.error('Erro ao criar tarefa:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao criar tarefa: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
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
      await axios.delete(`${API_BASE_URL}/admin/tasks/${taskId}/`, config);
      setSuccessMessage('Tarefa excluída com sucesso!');
      fetchTasks(); // Refresh task list
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao excluir tarefa: ${err.response?.data?.msg || err.message}`);
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
          Carregando tarefas...
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
        📋 Gerenciamento de Tarefas
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

      {/* Formulário de Criação de Tarefa */}
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
            <TaskIcon /> Criar Nova Tarefa
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={handleCreateTask} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3 
            }}
          >
            <TextField
              label="Nome da Tarefa"
              variant="outlined"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
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
              Criar Tarefa
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Lista de Tarefas */}
      <Typography variant="h6" gutterBottom align="center" sx={{ 
        mb: 3,
        color: 'primary.main',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <AssignmentIcon /> Tarefas Existentes
      </Typography>
      
      {tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Alert 
            severity="info" 
            sx={{ 
              maxWidth: '85%', 
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Nenhuma tarefa encontrada.
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
            <Table sx={{ minWidth: 650 }} aria-label="lista de tarefas">
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
                    Nome da Tarefa
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
                {tasks.map((taskItem, index) => (
                  <TableRow 
                    key={taskItem.id}
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
                      {taskItem.id}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '1rem', 
                      py: 2,
                      color: 'text.primary',
                      fontWeight: '500'
                    }}>
                      {taskItem.name}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteTask(taskItem.id)}
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

export default TaskManagementPage;
