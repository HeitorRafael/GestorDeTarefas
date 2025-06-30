// frontend/src/components/TimeTracker.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause'; // Certifique-se que o import está correto para o Material-UI v5
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

function TimeTracker({ selectedClient, selectedTask, onTimeEntrySaved }) {
  const { token, user } = useAuth();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const timerRef = useRef(null);
  const currentEntryId = useRef(null); // Para armazenar o ID da entrada de tempo atual

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
      setSaveError('Por favor, selecione um Cliente e uma Tarefa antes de iniciar.');
      return;
    }
    setSaveError(null);
    setTime(0); // Reinicia o cronômetro para uma nova entrada
    setIsRunning(true);


    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.post(
        `${API_BASE_URL}/time-entries/start`,
        { clientId: selectedClient.id, taskId: selectedTask.id }, // Usa .id
        config
      );
      currentEntryId.current = res.data.entry.id; // Armazena o ID da nova entrada (res.data.entry.id)
    } catch (err) {
      console.error('Erro ao iniciar registro de tempo:', err.response ? err.response.data.msg : err.message);
      setSaveError('Falha ao iniciar registro de tempo. ' + (err.response ? err.response.data.msg : ''));
      setIsRunning(false); // Pare o cronômetro se houver erro ao iniciar
      setTime(0); // Reseta o tempo em caso de erro no início
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStopAndSave = async () => {
    setIsRunning(false); // Pausa o cronômetro visualmente
    setIsSaving(true);
    setSaveError(null);

    if (time === 0) {
      setSaveError('Nenhum tempo registrado para salvar.');
      setIsSaving(false);
      return;
    }

    if (!currentEntryId.current) {
        setSaveError('Nenhuma entrada de tempo ativa para finalizar. Por favor, inicie um novo registro.');
        setIsSaving(false);
        return;
    }

    try {
      const config = { headers: { 'x-auth-token': token } };
      // O backend agora calcula a duração e não espera 'duration' no corpo
      const res = await axios.put(`${API_BASE_URL}/time-entries/end/${currentEntryId.current}`, {}, config);

      alert('Registro de tempo finalizado e salvo com sucesso!'); // Feedback
      setTime(0); // Reseta o cronômetro
      currentEntryId.current = null; // Limpa o ID da entrada atual

      if (onTimeEntrySaved) {
        onTimeEntrySaved(); // Chama a função para recarregar a lista no dashboard
      }
    } catch (err) {
      console.error('Erro ao finalizar registro de tempo:', err.response ? err.response.data.msg : err.message);
      setSaveError('Falha ao finalizar registro de tempo. ' + (err.response ? err.response.data.msg : ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Se há um currentEntryId, e o usuário reseta, pode-se considerar
    // cancelar/deletar essa entrada no banco de dados. Por enquanto, apenas reseta o frontend.
    // Lógica para deletar/cancelar a entrada incompleta no banco de dados aqui (rota DELETE no backend)
    setIsRunning(false);
    setTime(0);
    setSaveError(null);
    currentEntryId.current = null; // Limpa o ID da entrada também no reset
  };

  return (
    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
        {formatTime(time)}
      </Typography>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        {!isRunning ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
            disabled={!selectedClient || !selectedTask || isSaving}
          >
            Iniciar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            startIcon={<PauseIcon />}
            onClick={handlePause}
            disabled={isSaving}
          >
            Pausar
          </Button>
        )}
        <Button
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
          onClick={handleStopAndSave}
          // Desabilitar se cronômetro 0, ou estiver rodando, ou salvando, ou não tiver ID de entrada ativa
          disabled={time === 0 || isRunning || isSaving || !currentEntryId.current}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Parar e Salvar'}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          // Permitir resetar mesmo que não esteja rodando, mas não se estiver salvando
          disabled={isSaving}
        >
          Resetar
        </Button>
      </Box>
    </Paper>
  );
}

export default TimeTracker;