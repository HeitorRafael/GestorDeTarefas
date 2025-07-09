// frontend/src/components/TimeTracker.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

function TimeTracker({ selectedClient, selectedTask, onTimeEntrySaved }) {
  const { token, user } = useAuth();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null); // <<< Armazena a tarefa ativa (ID, cliente, tarefa)
  const [isLoading, setIsLoading] = useState(true); // <<< Para o carregamento inicial
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // Função para buscar uma tarefa ativa no backend
  const fetchActiveEntry = useCallback(async () => {
    if (!token || !user) return;
    try {
      const config = { headers: { 'x-auth-token': token } };
      // Uma rota hipotética para pegar a tarefa ativa
      const res = await axios.get(`${API_BASE_URL}/time-entries/user/${user.id}`, config);
      const runningEntry = res.data.find(entry => entry.endTime === null);

      if (runningEntry) {
        setActiveEntry(runningEntry);
        setIsRunning(true);
        // Calcula o tempo decorrido desde o início
        const startTime = new Date(runningEntry.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setTime(elapsedSeconds);
      }
    } catch (err) {
      // Não é um erro crítico se não encontrar nada
      console.log("Nenhuma tarefa ativa encontrada ao carregar.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchActiveEntry();
  }, [fetchActiveEntry]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const remainingSeconds = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
  };

  const handleStart = async () => {
    if (!selectedClient || !selectedTask) {
      setError('Por favor, selecione um Cliente e uma Tarefa.');
      return;
    }
    setError(null);
    setIsRunning(true);

    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.post(
        `${API_BASE_URL}/time-entries/start`,
        { clientId: selectedClient.id, taskId: selectedTask.id },
        config
      );
      setActiveEntry(res.data.entry);
      setTime(0); // Começa do zero no start
    } catch (err) {
      setError(`Falha ao iniciar: ${err.response?.data?.msg || err.message}`);
      setIsRunning(false);
    }
  };

  const handleEnd = async () => {
    setIsRunning(false); // Para o contador
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.put(`${API_BASE_URL}/time-entries/end/${activeEntry.id}`, {}, config);
      
      if (onTimeEntrySaved) {
        onTimeEntrySaved();
      }
      setActiveEntry(null);
      setTime(0);
    } catch (err) {
      setError(`Falha ao finalizar: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar a tarefa em andamento? Esta ação não pode ser desfeita.")) {
        return;
    }
    
    try {
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`${API_BASE_URL}/time-entries/active`, config);
        
        setIsRunning(false);
        setActiveEntry(null);
        setTime(0);
        setError(null);
        if (onTimeEntrySaved) {
            onTimeEntrySaved(); // Atualiza a lista
        }
    } catch (err) {
        setError(`Falha ao cancelar: ${err.response?.data?.msg || err.message}`);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  const renderButtons = () => {
    if (!activeEntry) { // Nenhuma tarefa ativa
      return (
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
          onClick={handleStart}
          disabled={!selectedClient || !selectedTask}
        >
          Iniciar
        </Button>
      );
    }

    if (isRunning) { // Tarefa rodando
      return (
        <>
          <Button variant="contained" color="warning" startIcon={<StopIcon />} onClick={handleEnd}>
            Finalizar
          </Button>
          <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancel}>
            Cancelar Tarefa
          </Button>
        </>
      );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
        {formatTime(time)}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        {renderButtons()}
      </Box>
    </Paper>
  );
}

export default TimeTracker;
