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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getWeek, getYear, getMonth } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00';
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

function MainDashboard() {
  const { token, user, isAdmin } = useAuth();
  const theme = useTheme();
  const [timeSummary, setTimeSummary] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [view, setView] = useState('monthly');
  
  // States para filtro por usuário (apenas para admins)
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);

  // States for monthly view
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()) + 1);
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
      const res = await axios.get(`${API_BASE_URL}/clients/`, config);
      setClients(res.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err.response ? err.response.data.msg : err.message);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get(`${API_BASE_URL}/admin/users`, config);
      setUsers(res.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.response ? err.response.data.msg : err.message);
    }
  }, [token, isAdmin]);

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
        params: {},
      };

      let endpoint = `${API_BASE_URL}/reports/detailed-summary`;

      if (view === 'monthly') {
        config.params = {
          month: selectedMonth,
          year: selectedYearForMonth,
          clientId: selectedClient,
          ...(isAdmin && selectedUser && { userId: selectedUser }),
        };
      } else if (view === 'weekly') {
        config.params = {
          week: selectedWeek,
          year: selectedYearForWeek,
          clientId: selectedClient,
          ...(isAdmin && selectedUser && { userId: selectedUser }),
        };
      }

      const res = await axios.get(endpoint, config);
      setTimeSummary(res.data);
      setLoading(false);
    } catch (err) {
      console.error(`Erro ao buscar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}:`, err.response ? err.response.data.msg : err.message);
      setError(`Erro ao carregar resumo ${view === 'monthly' ? 'mensal' : 'semanal'}. Por favor, tente novamente.`);
      setLoading(false);
    }
  }, [token, user, view, selectedMonth, selectedYearForMonth, selectedWeek, selectedYearForWeek, selectedClient, selectedUser, isAdmin]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      if (newView === 'monthly') {
        setSelectedMonth(getMonth(new Date()) + 1);
        setSelectedYearForMonth(getYear(new Date()));
      } else if (newView === 'weekly') {
        setSelectedWeek(getWeek(new Date(), { weekStartsOn: 1 }));
        setSelectedYearForWeek(getYear(new Date()));
      }
    }
  };

  useEffect(() => {
    fetchClients();
    fetchAllTasks();
    fetchTimeSummary();
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchClients, fetchAllTasks, fetchTimeSummary, fetchUsers, isAdmin]);

  // Generate years for the Select component
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Months for the Select component
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Obter estatísticas de uma tarefa específica
  const getTaskStats = (taskName) => {
    const summaryRow = timeSummary.find(row => row.taskname === taskName);
    
    if (!summaryRow) {
      return {
        totalDuration: 0,
        averageDuration: 0,
        entryCount: 0
      };
    }

    return {
      totalDuration: summaryRow.totalDuration,
      averageDuration: summaryRow.averageDuration,
      entryCount: summaryRow.entryCount
    };
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        mb: 4, 
        fontWeight: 'bold',
        color: 'primary.main',
        fontSize: '2.2rem'
      }}>
        📊 Relatório de Tempo
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="time report view"
          sx={{ 
            boxShadow: 2,
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: '500'
            }
          }}
        >
          <ToggleButton value="monthly" aria-label="monthly view">
            📅 Mensal
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly view">
            📊 Semanal
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'monthly' ? (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="month-select-label" sx={{ fontSize: '1rem' }}>Mês</InputLabel>
            <Select
              labelId="month-select-label"
              value={selectedMonth}
              label="Mês"
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              {months.map((monthNum) => (
                <MenuItem key={monthNum} value={monthNum} sx={{ fontSize: '1rem' }}>
                  {monthNum.toString().padStart(2, '0')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label" sx={{ fontSize: '1rem' }}>Ano</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYearForMonth}
              label="Ano"
              onChange={(e) => setSelectedYearForMonth(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              {years.map((yearNum) => (
                <MenuItem key={yearNum} value={yearNum} sx={{ fontSize: '1rem' }}>
                  {yearNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="client-select-label" sx={{ fontSize: '1rem' }}>👥 Cliente</InputLabel>
            <Select
              labelId="client-select-label"
              value={selectedClient}
              label="👥 Cliente"
              onChange={(e) => setSelectedClient(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '1rem' }}>Todos</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id} sx={{ fontSize: '1rem' }}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isAdmin && (
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="user-select-label" sx={{ fontSize: '1rem' }}>👤 Usuário</InputLabel>
              <Select
                labelId="user-select-label"
                value={selectedUser}
                label="👤 Usuário"
                onChange={(e) => setSelectedUser(e.target.value)}
                sx={{ fontSize: '1rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '1rem' }}>Todos</MenuItem>
                {users.map((userItem) => (
                  <MenuItem key={userItem.id} value={userItem.id} sx={{ fontSize: '1rem' }}>
                    {userItem.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="week-select-label" sx={{ fontSize: '1rem' }}>Semana</InputLabel>
            <Select
              labelId="week-select-label"
              value={selectedWeek}
              label="Semana"
              onChange={(e) => setSelectedWeek(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              {Array.from({ length: 53 }, (_, i) => i + 1).map((weekNum) => (
                <MenuItem key={weekNum} value={weekNum} sx={{ fontSize: '1rem' }}>
                  Semana {weekNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label" sx={{ fontSize: '1rem' }}>Ano</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYearForWeek}
              label="Ano"
              onChange={(e) => setSelectedYearForWeek(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              {years.map((yearNum) => (
                <MenuItem key={yearNum} value={yearNum} sx={{ fontSize: '1rem' }}>
                  {yearNum}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="client-select-label" sx={{ fontSize: '1rem' }}>👥 Cliente</InputLabel>
            <Select
              labelId="client-select-label"
              value={selectedClient}
              label="👥 Cliente"
              onChange={(e) => setSelectedClient(e.target.value)}
              sx={{ fontSize: '1rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '1rem' }}>Todos</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id} sx={{ fontSize: '1rem' }}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isAdmin && (
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="user-select-weekly-label" sx={{ fontSize: '1rem' }}>👤 Usuário</InputLabel>
              <Select
                labelId="user-select-weekly-label"
                value={selectedUser}
                label="👤 Usuário"
                onChange={(e) => setSelectedUser(e.target.value)}
                sx={{ fontSize: '1rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '1rem' }}>Todos</MenuItem>
                {users.map((userItem) => (
                  <MenuItem key={userItem.id} value={userItem.id} sx={{ fontSize: '1rem' }}>
                    {userItem.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
            Carregando resumo...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', px: 3 }}>
          <Alert severity="error" sx={{ maxWidth: '600px', fontSize: '1rem' }}>
            {error}
          </Alert>
        </Box>
      ) : allTasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', px: 3 }}>
          <Alert severity="info" sx={{ maxWidth: '600px', fontSize: '1rem' }}>
            Nenhuma tarefa encontrada.
          </Alert>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 4 }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxWidth: '85%', 
              width: 'auto',
              minWidth: '700px',
              boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : theme.palette.background.paper,
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${theme.palette.divider}` 
                : 'none',
              animation: 'fadeIn 0.5s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="resumo de tempo">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[800] 
                    : theme.palette.primary.main 
                }}>
                  <TableCell sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    py: 3,
                    borderBottom: 'none'
                  }}>
                    📋 Tarefa
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    py: 3,
                    borderBottom: 'none'
                  }}>
                    ⏱️ Duração Total
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    py: 3,
                    borderBottom: 'none'
                  }}>
                    📊 Tempo Médio
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.primary.contrastText, 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    py: 3,
                    borderBottom: 'none'
                  }}>
                    🔢 Nº de Entradas
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTasks.map((task, index) => {
                  const stats = getTaskStats(task.name);
                  return (
                    <TableRow 
                      key={task.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : theme.palette.grey[50]
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.1)' 
                            : theme.palette.primary.light,
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <TableCell sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '500',
                        py: 2.5,
                        borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(224, 224, 224, 0.5)'
                        }`
                      }}>
                        {task.name}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        py: 2.5,
                        fontFamily: 'monospace',
                        color: theme.palette.primary.main,
                        borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(224, 224, 224, 0.5)'
                        }`
                      }}>
                        {formatDuration(stats.totalDuration)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        py: 2.5,
                        fontFamily: 'monospace',
                        color: theme.palette.secondary.main,
                        borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(224, 224, 224, 0.5)'
                        }`
                      }}>
                        {formatDuration(stats.averageDuration)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        py: 2.5,
                        color: theme.palette.success.main,
                        borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(224, 224, 224, 0.5)'
                        }`
                      }}>
                        {stats.entryCount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default MainDashboard;
