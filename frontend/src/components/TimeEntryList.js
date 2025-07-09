// frontend/src/components/TimeEntryList.js
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
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00'; // Garante que não há duração negativa
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

function TimeEntryList({ refreshTrigger }) {
  const { token, user } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeEntries = useCallback(async () => {
    if (!token || !user || !user.id) { // Certifica-se de que o ID do usuário está disponível
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
      // Usando o ID do usuário do AuthContext na URL
      const res = await axios.get(`${API_BASE_URL}/time-entries/user/${user.id}`, config);
      setTimeEntries(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar registros de tempo:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar registros de tempo. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token, user]); // Dependência do 'user' para pegar o 'user.id'

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries, refreshTrigger]); // re-executa quando fetchTimeEntries muda ou refreshTrigger é ativado

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando registros...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (timeEntries.length === 0) {
    return <Alert severity="info">Nenhum registro de tempo encontrado.</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Meus Registros de Tempo
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="registros de tempo">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tarefa</TableCell>
              <TableCell align="right">Duração</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow
                key={entry.id} // Certifique-se de usar entry.id
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Chip label={entry.id} size="small" />
                </TableCell>
                {/* Formatação de data no frontend */}
                <TableCell>{entry.startTime ? format(new Date(entry.startTime), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : 'N/A'}</TableCell>
                <TableCell>{entry.endTime ? format(new Date(entry.endTime), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : 'Em andamento'}</TableCell>
                <TableCell>{entry.clientname}</TableCell>
                <TableCell>{entry.taskname}</TableCell>
                <TableCell align="right">{formatDuration(entry.duration)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TimeEntryList;