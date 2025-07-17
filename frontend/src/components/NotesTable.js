import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  StickyNote2,
  Person,
  Event,
  AccessTime,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_BASE_URL = 'http://localhost:5000/api';

const formatDuration = (seconds) => {
  if (seconds === null || isNaN(seconds) || seconds < 0) return '00:00:00';
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remainingSeconds}`;
};

function NotesTable({ 
  view, 
  selectedMonth, 
  selectedYearForMonth, 
  selectedWeek, 
  selectedYearForWeek, 
  selectedClient, 
  selectedUser 
}) {
  const { token, isAdmin } = useAuth();
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchNotes = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: { 'x-auth-token': token },
        params: {},
      };

      if (view === 'monthly') {
        config.params = {
          month: selectedMonth,
          year: selectedYearForMonth,
          ...(selectedClient && selectedClient !== '' && { clientId: selectedClient }),
          ...(isAdmin && selectedUser && selectedUser !== '' && { userId: selectedUser }),
        };
      } else if (view === 'weekly') {
        config.params = {
          week: selectedWeek,
          year: selectedYearForWeek,
          ...(selectedClient && selectedClient !== '' && { clientId: selectedClient }),
          ...(isAdmin && selectedUser && selectedUser !== '' && { userId: selectedUser }),
        };
      }

      const res = await axios.get(`${API_BASE_URL}/time-entries/notes-report`, config);
      setNotes(res.data);
    } catch (err) {
      console.error('Erro ao buscar anotações:', err);
      setError('Erro ao carregar anotações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [token, view, selectedMonth, selectedYearForMonth, selectedWeek, selectedYearForWeek, selectedClient, selectedUser, isAdmin]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleToggleExpand = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (notes.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        📝 Nenhuma anotação encontrada para o período selecionado.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: 'primary.main',
        fontWeight: 'bold',
        mb: 3
      }}>
        📝 Anotações das Tarefas
      </Typography>

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper 
            : theme.palette.background.paper,
          border: theme.palette.mode === 'dark' 
            ? `1px solid ${theme.palette.divider}` 
            : 'none',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.secondary.main 
            }}>
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none'
              }}>
                📋 Tarefa
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none'
              }}>
                👥 Cliente
              </TableCell>
              {isAdmin && (
                <TableCell sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.common.white 
                    : theme.palette.secondary.contrastText,
                  fontWeight: 'bold',
                  borderBottom: 'none'
                }}>
                  👤 Usuário
                </TableCell>
              )}
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none'
              }}>
                📅 Data
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none'
              }}>
                ⏱️ Duração
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none'
              }}>
                📝 Anotação
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.secondary.contrastText,
                fontWeight: 'bold',
                borderBottom: 'none',
                width: '60px'
              }}>
                
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note, index) => (
              <React.Fragment key={note.id}>
                <TableRow 
                  sx={{ 
                    '&:nth-of-type(odd)': { 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : theme.palette.grey[50]
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : theme.palette.action.hover,
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleToggleExpand(note.id)}
                >
                  <TableCell sx={{ fontWeight: '500' }}>
                    {note.taskname}
                  </TableCell>
                  <TableCell>
                    {note.clientname}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Chip 
                        icon={<Person />}
                        label={note.username}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event fontSize="small" color="action" />
                      {format(new Date(note.starttime), 'dd/MM/yyyy', { locale: ptBR })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formatDuration(note.duration)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StickyNote2 fontSize="small" color="secondary" />
                      <Typography variant="body2" sx={{ 
                        fontStyle: expandedRows.has(note.id) ? 'normal' : 'italic',
                        color: 'text.secondary'
                      }}>
                        {expandedRows.has(note.id) ? note.notes : truncateText(note.notes, 30)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      sx={{ 
                        transition: 'transform 0.2s',
                        transform: expandedRows.has(note.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      {expandedRows.has(note.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    style={{ paddingBottom: 0, paddingTop: 0 }} 
                    colSpan={isAdmin ? 7 : 6}
                  >
                    <Collapse in={expandedRows.has(note.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ 
                        margin: 2,
                        p: 3,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : theme.palette.grey[100],
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'secondary.main'
                        }}>
                          📝 Anotação Completa
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          backgroundColor: theme.palette.background.paper,
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`
                        }}>
                          {note.notes}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<Event />}
                            label={`Início: ${format(new Date(note.starttime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
                            size="small"
                            variant="outlined"
                          />
                          {note.endtime && (
                            <Chip 
                              icon={<AccessTime />}
                              label={`Fim: ${format(new Date(note.endtime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default NotesTable;
