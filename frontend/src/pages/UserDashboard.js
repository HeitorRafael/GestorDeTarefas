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

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00';
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

function UserDashboard() {
  const { token, user } = useAuth();
  const [dailyReport, setDailyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchDailyReport = useCallback(async () => {
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
          userId: user.id,
          date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
        },
      };
      const res = await axios.get(`${API_BASE_URL}/reports/daily`, config);
      setDailyReport(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar relatório diário:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar relatório diário. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token, user, selectedDate]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando relatório...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Meu Dashboard de Relatórios
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

      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        Tempo Gasto por Tarefa (Diário)
      </Typography>
      {dailyReport.length === 0 ? (
        <Alert severity="info">Nenhum dado para o relatório diário encontrado para a data selecionada.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="relatório diário por tarefa">
            <TableHead>
              <TableRow>
                <TableCell>Tarefa</TableCell>
                <TableCell align="right">Duração Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyReport.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.taskName}</TableCell>
                  <TableCell align="right">{row.totalDuration}</TableCell>
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
