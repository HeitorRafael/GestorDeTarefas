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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

function AdminManagementScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for new user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('common');

  // State for new task form
  const [newTaskName, setNewTaskName] = useState('');

  // State for new client form
  const [newClientName, setNewClientName] = useState('');

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

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/tasks/admin/`, config);
      setTasks(res.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar tarefas. Por favor, tente novamente.');
    }
  }, [token]);

  const fetchClients = useCallback(async () => {
    if (!token) return;
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/clients/admin/`, config);
      setClients(res.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchClients();
  }, [fetchUsers, fetchTasks, fetchClients]);

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

  const handleCreateClient = async (e) => {
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
        `${API_BASE_URL}/admin/clients/`,
        { name: newClientName },
        config
      );
      setSuccessMessage('Cliente criado com sucesso!');
      setNewClientName('');
      fetchClients(); // Refresh client list
    } catch (err) {
      console.error('Erro ao criar cliente:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao criar cliente: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
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
      await axios.delete(`${API_BASE_URL}/admin/clients/${clientId}/`, config);
      setSuccessMessage('Cliente excluído com sucesso!');
      fetchClients(); // Refresh client list
    } catch (err) {
      console.error('Erro ao excluir cliente:', err.response ? err.response.data.msg : err.message);
      setError(`Erro ao excluir cliente: ${err.response?.data?.msg || err.message}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados de gerenciamento...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Admin
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {/* Seção de Gerenciamento de Usuários */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Gerenciamento de Usuários
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Criar Novo Usuário
        </Typography>
        <Box component="form" onSubmit={handleCreateUser} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome de Usuário"
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            variant="outlined"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Função</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Função"
            >
              <MenuItem value="common">Comum</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}>
            Criar Usuário
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Usuários Existentes
      </Typography>
      {users.length === 0 ? (
        <Alert severity="info">Nenhum usuário encontrado.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="lista de usuários">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome de Usuário</TableCell>
                <TableCell>Função</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell>{userItem.id}</TableCell>
                  <TableCell>{userItem.username}</TableCell>
                  <TableCell>{userItem.role}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteUser(userItem.id)}
                      disabled={userItem.role === 'admin'} // Prevent deleting admin user for safety
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

      {/* Seção de Gerenciamento de Tarefas */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Gerenciamento de Tarefas
      </Typography>
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
      {tasks.length === 0 ? (
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

      {/* Seção de Gerenciamento de Clientes */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Gerenciamento de Clientes
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Criar Novo Cliente
        </Typography>
        <Box component="form" onSubmit={handleCreateClient} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome do Cliente"
            variant="outlined"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}>
            Criar Cliente
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Clientes Existentes
      </Typography>
      {clients.length === 0 ? (
        <Alert severity="info">Nenhum cliente encontrado.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="lista de clientes">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome do Cliente</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((clientItem) => (
                <TableRow key={clientItem.id}>
                  <TableCell>{clientItem.id}</TableCell>
                  <TableCell>{clientItem.name}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClient(clientItem.id)}
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

export default AdminManagementScreen;