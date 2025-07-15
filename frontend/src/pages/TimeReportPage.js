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
  const [selectedClient, setSelectedClient] = useState(''); // New state for selected client
  const [clients, setClients] = useState([]); // New state for clients list
  const [allTasks, setAllTasks] = useState([]); // New state for all tasks list
  // Removed selectedDate as it's no longer directly used for monthly/weekly selection
  const [view, setView] = useState('monthly');

  // States for monthly view
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()) + 1); // getMonth is 0-indexed
  const [selectedYearForMonth, setSelectedYearForMonth] = useState(getYear(new Date()));

  // States for weekly view
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedYearForWeek, setSelectedYearForWeek] = useState(getYear(new Date()));

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

  const fetchAllTasks = useCallback(async () => {
    if (!token) return;
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/tasks/`, config);
      setAllTasks(res.data);
    } catch (err) {
      console.error('Erro ao buscar todas as tarefas:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar tarefas. Por favor, tente novamente.');
    }
  }, [token]);

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
          clientId: selectedClient, // Add selected client to params
        };
        endpoint = `${API_BASE_URL}/time-entries/user/${user.id}/monthly-summary`;
      } else if (view === 'weekly') {
        config.params = {
          week: selectedWeek,
          year: selectedYearForWeek,
          clientId: selectedClient, // Add selected client to params
        };
        endpoint = `${API_BASE_URL}/time-entries/user/${user.id}/weekly-summary`;
      }

      const res = await axios.get(endpoint, config);
      setTimeSummary(res.data);
      console.log('[TimeReportPage] timeSummary received:', res.data);
      setLoading(false);
    } catch (err) {
      console.error(`Erro ao buscar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}:`, err.response ? err.response.data.msg : err.message);
      setError(`Erro ao carregar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}. Por favor, tente novamente.`);
      setLoading(false);
    }
  }, [token, user, view, selectedMonth, selectedYearForMonth, selectedWeek, selectedYearForWeek, selectedClient]); // Updated dependencies

  useEffect(() => {
    fetchAllTasks();
    fetchClients();
    fetchTimeSummary();
  }, [fetchAllTasks, fetchClients, fetchTimeSummary]);

  // Generate years for the Select component
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Months for the Select component
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  console.log('[TimeReportPage] allTasks at render:', JSON.stringify(allTasks));
  console.log('[TimeReportPage] timeSummary at render:', timeSummary);

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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="client-select-label">Cliente</InputLabel>
            <Select
              labelId="client-select-label"
              value={selectedClient}
              label="Cliente"
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="client-select-label">Cliente</InputLabel>
            <Select
              labelId="client-select-label"
              value={selectedClient}
              label="Cliente"
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
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
        <Alert severity="info">Nenhuma tarefa encontrada.</Alert>
      ) : (
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="resumo de tempo">
            <TableHead>
              <TableRow>
                <TableCell>Tarefa</TableCell>
                <TableCell align="right">Duração Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTasks.map((task) => {
                console.log(`[TimeReportPage] Searching for task: ${task.name}`);
                const summaryRow = timeSummary.find(row => {
                  if (!row || typeof row.taskname !== 'string') {
                    console.log(`[TimeReportPage] Invalid row or taskName: ${JSON.stringify(row)}`);
                    return false;
                  }
                  const normalizedRowTaskName = row.taskname.toLowerCase().trim();
                  const normalizedTaskName = task.name.toLowerCase().trim();
                  console.log(`[TimeReportPage] Comparing: '${normalizedRowTaskName}' with '${normalizedTaskName}'`);
                  return normalizedRowTaskName === normalizedTaskName;
                });
                const totalDuration = summaryRow ? parseInt(summaryRow.totalDuration, 10) : 0;
                console.log(`[TimeReportPage] Task: ${task.name}, Summary Row: ${JSON.stringify(summaryRow)}, Total Duration (parsed): ${totalDuration}`);
                return (
                  <TableRow key={task.id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell align="right">{formatDuration(totalDuration)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default TimeReportPage;