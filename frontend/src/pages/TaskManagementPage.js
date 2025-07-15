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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';


const API_BASE_URL = 'http://localhost:5000/api';

function TaskManagementPage() {
  const { token } = useAuth();
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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Tarefas
      </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Criar Nova Tarefa
          </Typography>
          <Box component="form" onSubmit={handleCreateTask} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome da Tarefa"
              variant="outlined"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}>
              Criar Tarefa
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Tarefas Existentes
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Carregando tarefas...</Typography>
          </Box>
        ) : tasks.length === 0 ? (
          <Alert severity="info">Nenhuma tarefa encontrada.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="lista de tarefas">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome da Tarefa</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((taskItem) => (
                  <TableRow key={taskItem.id}>
                    <TableCell>{taskItem.id}</TableCell>
                    <TableCell>{taskItem.name}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteTask(taskItem.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
  );
}

export default TaskManagementPage;
