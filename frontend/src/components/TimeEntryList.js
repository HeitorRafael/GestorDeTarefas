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
  useTheme,
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
  const theme = useTheme();
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
      
      // Obtém a data atual no formato YYYY-MM-DD
      const today = new Date();
      const todayFormatted = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      const config = {
        headers: {
          'x-auth-token': token,
        },
        params: {
          date: todayFormatted // Filtra apenas registros do dia atual
        }
      };
      
      // Usando o ID do usuário do AuthContext na URL com filtro de data
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
    return (
      <Alert 
        severity="info" 
        sx={{ 
          fontSize: '1rem',
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        � Nenhum registro de tempo encontrado para hoje.
      </Alert>
    );
  }

  return (
    <Box>
      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
          border: theme.palette.mode === 'dark' 
            ? `1px solid ${theme.palette.divider}` 
            : 'none',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="registros de tempo">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[700] 
                : theme.palette.grey[100] 
            }}>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                🆔 ID
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                🕐 Início
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                🕑 Fim
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                👥 Cliente
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                📋 Tarefa
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'primary.main'
              }}>
                ⏱️ Duração
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.map((entry, index) => (
              <TableRow
                key={entry.id}
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.03)' 
                      : theme.palette.grey[50]
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.08)' 
                      : theme.palette.action.hover,
                    transform: 'scale(1.005)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TableCell sx={{ fontSize: '0.95rem' }}>
                  <Chip 
                    label={entry.id} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>
                  {entry.starttime ? format(new Date(entry.starttime), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : 'N/A'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>
                  {entry.endtime ? (
                    format(new Date(entry.endtime), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
                  ) : (
                    <Chip 
                      label="Em andamento" 
                      size="small" 
                      color="success"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: '0.95rem', fontWeight: '500' }}>
                  {entry.clientname}
                </TableCell>
                <TableCell sx={{ fontSize: '0.95rem', fontWeight: '500' }}>
                  {entry.taskname}
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontSize: '1rem', 
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: 'secondary.main'
                }}>
                  {formatDuration(entry.duration)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TimeEntryList;