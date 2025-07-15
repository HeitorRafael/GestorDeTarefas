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

function ClientManagementPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newClientName, setNewClientName] = useState('');

  const fetchClients = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/clients/admin/`, config);
      setClients(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Clientes
      </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Carregando clientes...</Typography>
          </Box>
        ) : clients.length === 0 ? (
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

export default ClientManagementPage;
