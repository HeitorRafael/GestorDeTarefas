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

function MonthlyReportPage() {
  const { token, user } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchMonthlySummary = useCallback(async () => {
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
          month: format(selectedDate, 'M'), // Mês sem zero à esquerda
          year: format(selectedDate, 'yyyy'),
        },
      };
      const res = await axios.get(`${API_BASE_URL}/time-entries/user/${user.id}/monthly-summary`, config);
      setMonthlySummary(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar resumo mensal:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar resumo mensal. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [token, user, selectedDate]);

  useEffect(() => {
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Relatório Mensal de Tempo
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <DatePicker
          views={['month', 'year']}
          label="Selecionar Mês e Ano"
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
          <Typography sx={{ ml: 2 }}>Carregando resumo mensal...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : monthlySummary.length === 0 ? (
        <Alert severity="info">Nenhum dado encontrado para o mês selecionado.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="resumo mensal de tempo">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Tarefa</TableCell>
                <TableCell align="right">Duração Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlySummary.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.clientName}</TableCell>
                  <TableCell>{row.taskName}</TableCell>
                  <TableCell align="right">{formatDuration(row.totalDuration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default MonthlyReportPage;