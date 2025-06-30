// frontend/src/components/ClientTaskSelector.js
import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

function ClientTaskSelector({ onSelectClientTask }) {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para carregar CLIENTES
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setError(null);
        const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        const res = await axios.get(`${API_BASE_URL}/clients`, config);
        setClients(res.data);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err.response ? err.response.data.msg : err.message);
        setError('Erro ao carregar clientes. Por favor, tente novamente.');
      }
    };

    if (token) {
      fetchClients();
    }
  }, [token]);

  // useEffect para carregar TAREFAS
  useEffect(() => {
    const fetchTasks = async () => {
      if (token) {
        try {
          setError(null);
          const config = {
            headers: {
              'x-auth-token': token,
            },
          };
          const res = await axios.get(`${API_BASE_URL}/tasks`, config);
          setTasks(res.data); // Seta TODAS as tarefas
        } catch (err) {
          console.error('Erro ao buscar tarefas:', err.response ? err.response.data.msg : err.message);
          setError('Erro ao carregar tarefas. Por favor, tente novamente.');
        } finally {
          // Garante que o loading termine apenas após AMBAS as buscas
          // (clientes e tarefas) terem finalizado.
          // Isso requer uma lógica mais sofisticada se as buscas forem totalmente independentes
          // ou um estado de loading que aguarde ambas.
          // Por enquanto, vamos assumir que clients e tasks serão carregados rapidamente
          // e o setLoading(false) ao final de fetchTasks é suficiente para o carregamento inicial.
          // Se houver problemas, podemos refatorar.
          setLoading(false);
        }
      } else {
        setTasks([]);
        setSelectedTaskId('');
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);


  // Chama a função passada por prop quando cliente ou tarefa mudam
  useEffect(() => {
    // Certifique-se de que `clients` e `tasks` já foram carregados
    // e que os IDs selecionados não são vazios antes de tentar encontrar os objetos
    if (onSelectClientTask && selectedClientId && selectedTaskId && clients.length > 0 && tasks.length > 0) {
      // Mude `c._id` para `c.id`
      const selectedClient = clients.find(c => c.id === selectedClientId);
      // Mude `t._id` para `t.id`
      const selectedTask = tasks.find(t => t.id === selectedTaskId);

      // Verifique se os objetos foram encontrados antes de chamar onSelectClientTask
      if (selectedClient && selectedTask) {
        onSelectClientTask(selectedClient, selectedTask);
      }
    }
  }, [selectedClientId, selectedTaskId, clients, tasks, onSelectClientTask]);


  const handleClientChange = (event) => {
    setSelectedClientId(event.target.value);
    setSelectedTaskId(''); // Resetar a tarefa quando o cliente muda
  };

  const handleTaskChange = (event) => {
    setSelectedTaskId(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="client-select-label">Cliente</InputLabel>
        <Select
          labelId="client-select-label"
          id="client-select"
          value={selectedClientId}
          label="Cliente"
          onChange={handleClientChange}
        >
          <MenuItem value="">
            <em>Selecione um cliente</em>
          </MenuItem>
          {clients.map((client) => (
            // >>>>>>>>>> MUDE AQUI: client._id para client.id <<<<<<<<<<
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedClientId}>
        <InputLabel id="task-select-label">Tarefa</InputLabel>
        <Select
          labelId="task-select-label"
          id="task-select"
          value={selectedTaskId}
          label="Tarefa"
          onChange={handleTaskChange}
          disabled={!selectedClientId || tasks.length === 0}
        >
          <MenuItem value="">
            <em>Selecione uma tarefa</em>
          </MenuItem>
          {tasks.map((task) => (
            // >>>>>>>>>> MUDE AQUI: task._id para task.id <<<<<<<<<<
            <MenuItem key={task.id} value={task.id}>
              {task.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default ClientTaskSelector;