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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
// Removed AdapterDateFns, LocalizationProvider, DatePicker as they are no longer used for monthly view
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format, getWeek, getYear, getMonth } from 'date-fns'; // Added getMonth

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00';
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

function TimeReportPage() {
  const { token, user } = useAuth();
  const [timeSummary, setTimeSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed selectedDate as it's no longer directly used for monthly/weekly selection
  const [view, setView] = useState('monthly');

  // States for monthly view
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()) + 1); // getMonth is 0-indexed
  const [selectedYearForMonth, setSelectedYearForMonth] = useState(getYear(new Date()));

  // States for weekly view
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedYearForWeek, setSelectedYearForWeek] = useState(getYear(new Date()));

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      // Reset selection when changing view
      if (newView === 'monthly') {
        setSelectedMonth(getMonth(new Date()) + 1);
        setSelectedYearForMonth(getYear(new Date()));
      } else if (newView === 'weekly') {
        setSelectedWeek(getWeek(new Date(), { weekStartsOn: 1 }));
        setSelectedYearForWeek(getYear(new Date()));
      }
    }
  };

  const fetchTimeSummary = useCallback(async () => {
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
        params: {}, // Initialize params
      };

      let endpoint = '';

      if (view === 'monthly') {
        config.params = {
          month: selectedMonth,
          year: selectedYearForMonth,
        };
        endpoint = `${API_BASE_URL}/time-entries/user/${user.id}/monthly-summary`;
      } else if (view === 'weekly') {
        config.params = {
          week: selectedWeek,
          year: selectedYearForWeek,
        };
        endpoint = `${API_BASE_URL}/time-entries/user/${user.id}/weekly-summary`;
      }

      const res = await axios.get(endpoint, config);
      setTimeSummary(res.data);
      setLoading(false);
    } catch (err) {
      console.error(`Erro ao buscar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}:`, err.response ? err.response.data.msg : err.message);
      setError(`Erro ao carregar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}. Por favor, tente novamente.`);
      setLoading(false);
    }
  }, [token, user, view, selectedMonth, selectedYearForMonth, selectedWeek, selectedYearForWeek]); // Updated dependencies

  useEffect(() => {
    fetchTimeSummary();
  }, [fetchTimeSummary]);

  // Generate years for the Select component
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Months for the Select component
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Relatório de Tempo
      </Typography>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        aria-label="time report view"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="monthly" aria-label="monthly view">
          Mensal
        </ToggleButton>
        <ToggleButton value="weekly" aria-label="weekly view">
          Semanal
        </ToggleButton>
      </ToggleButtonGroup>

      {view === 'monthly' ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="month-select-label">Mês</InputLabel>
            <Select
              labelId="month-select-label"
              value={selectedMonth}
              label="Mês"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((monthNum) => (
                <MenuItem key={monthNum} value={monthNum}>
                  {monthNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label">Ano</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYearForMonth}
              label="Ano"
              onChange={(e) => setSelectedYearForMonth(e.target.value)}
            >
              {years.map((yearNum) => (
                <MenuItem key={yearNum} value={yearNum}>
                  {yearNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="week-select-label">Semana</InputLabel>
            <Select
              labelId="week-select-label"
              value={selectedWeek}
              label="Semana"
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {Array.from({ length: 53 }, (_, i) => i + 1).map((weekNum) => (
                <MenuItem key={weekNum} value={weekNum}>
                  Semana {weekNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label">Ano</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYearForWeek}
              label="Ano"
              onChange={(e) => setSelectedYearForWeek(e.target.value)}
            >
              {years.map((yearNum) => (
                <MenuItem key={yearNum} value={yearNum}>
                  {yearNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando resumo...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : timeSummary.length === 0 ? (
        <Alert severity="info">Nenhum dado encontrado para o período selecionado.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="resumo de tempo">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Tarefa</TableCell>
                <TableCell align="right">Duração Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSummary.map((row, index) => (
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

export default TimeReportPage;