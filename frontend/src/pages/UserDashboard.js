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
  TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00';
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  return format(new Date(isoString), 'dd/MM/yyyy HH:mm:ss');
};

function UserDashboard() {
  const { token, user } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]); // Alterado de dailyReport para timeEntries
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTimeEntries = useCallback(async () => { // Alterado de fetchDailyReport para fetchTimeEntries
    if (!token || !user || !user.id) {
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
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'), // YYYY-MM-DD
        },
      };
      // Alterada a URL da API
      const res = await axios.get(`${API_BASE_URL}/time-entries/user/${user.id}`, config);
      setTimeEntries(res.data); // Alterado de setDailyReport para setTimeEntries
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar entradas de tempo:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar entradas de tempo. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token, user, selectedDate]);

  useEffect(() => {
    fetchTimeEntries(); // Alterado de fetchDailyReport para fetchTimeEntries
  }, [fetchTimeEntries]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Minhas Entradas de Tempo Diárias
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <DatePicker
          label="Selecionar Data"
          value={selectedDate}
          onChange={(newValue) => {
            setSelectedDate(newValue);
          }}
          renderInput={(params) => <TextField {...params} sx={{ mb: 3 }} />}
        />
      </LocalizationProvider>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando entradas de tempo...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : timeEntries.length === 0 ? (
        <Alert severity="info">Nenhuma entrada de tempo encontrada para a data selecionada.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="entradas de tempo diárias">
            <TableHead>
              <TableRow>
                <TableCell>Tarefa</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
                <TableCell align="right">Duração</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.taskName}</TableCell>
                  <TableCell>{entry.clientName}</TableCell>
                  <TableCell>{formatDateTime(entry.startTime)}</TableCell>
                  <TableCell>{formatDateTime(entry.endTime)}</TableCell>
                  <TableCell align="right">{formatDuration(entry.duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default UserDashboard;
