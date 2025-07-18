// frontend/src/components/TimeTracker.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import BusinessIcon from '@mui/icons-material/Business';
import TaskIcon from '@mui/icons-material/Task';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
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
  
  // Estados para modal de anotações
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingTaskData, setPendingTaskData] = useState(null);

  // Função para buscar uma tarefa ativa no backend
  const fetchActiveEntry = useCallback(async () => {
    if (!token || !user) return;
    try {
      const config = { headers: { 'x-auth-token': token } };
      // Nova rota específica para buscar tarefa ativa
      const res = await axios.get(`${API_BASE_URL}/time-entries/active`, config);
      const runningEntry = res.data;

      if (runningEntry) {
        setActiveEntry(runningEntry);
        setIsRunning(true);
        // Calcula o tempo decorrido desde o início
        const startTime = new Date(runningEntry.starttime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setTime(elapsedSeconds);
        
        // Persistir no localStorage para manter entre navegações
        localStorage.setItem('activeTimeEntry', JSON.stringify({
          id: runningEntry.id,
          startTime: runningEntry.starttime,
          taskName: runningEntry.task_name,
          clientName: runningEntry.client_name,
          taskId: runningEntry.taskid,
          clientId: runningEntry.clientid
        }));
      }
    } catch (err) {
      // Se não encontrar tarefa ativa no backend, verifica localStorage
      const savedEntry = localStorage.getItem('activeTimeEntry');
      if (savedEntry) {
        try {
          const parsedEntry = JSON.parse(savedEntry);
          // Verifica se a entrada salva ainda é válida (menos de 24h)
          const startTime = new Date(parsedEntry.startTime);
          const now = new Date();
          const hoursDiff = (now - startTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setActiveEntry(parsedEntry);
            setIsRunning(true);
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            setTime(elapsedSeconds);
          } else {
            // Remove entrada antiga
            localStorage.removeItem('activeTimeEntry');
          }
        } catch (parseErr) {
          localStorage.removeItem('activeTimeEntry');
        }
      }
      console.log("Nenhuma tarefa ativa encontrada.");
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
      const newEntry = res.data.entry;
      setActiveEntry(newEntry);
      setTime(0); // Começa do zero no start
      
      // Persistir no localStorage
      localStorage.setItem('activeTimeEntry', JSON.stringify({
        id: newEntry.id,
        startTime: newEntry.starttime,
        taskName: selectedTask.name,
        clientName: selectedClient.name,
        taskId: selectedTask.id,
        clientId: selectedClient.id
      }));
    } catch (err) {
      setError(`Falha ao iniciar: ${err.response?.data?.msg || err.message}`);
      setIsRunning(false);
    }
  };

  const handleEnd = async () => {
    if (!activeEntry) return;

    // Verificar se é "Casos complexos" (obrigatório ter nota)
    const taskName = activeEntry.task_name || activeEntry.taskName;
    const isComplexCase = taskName === 'Casos complexos';
    
    // Preparar dados da tarefa para o modal
    setPendingTaskData({
      entryId: activeEntry.id,
      taskName: taskName,
      clientName: activeEntry.client_name || activeEntry.clientName,
      isComplexCase
    });
    
    setNotes('');
    setNotesModalOpen(true);
  };

  const handleConfirmEnd = async () => {
    const isComplexCase = pendingTaskData?.isComplexCase;
    
    // Validar nota obrigatória para casos complexos
    if (isComplexCase && (!notes || notes.trim() === '')) {
      setError('Anotação é obrigatória para "Casos complexos".');
      return;
    }

    setError(null);
    setIsRunning(false); // Para o contador
    setNotesModalOpen(false);

    try {
      const config = { headers: { 'x-auth-token': token } };
      
      // Finalizar a tarefa
      await axios.put(`${API_BASE_URL}/time-entries/end/${pendingTaskData.entryId}`, {}, config);
      
      // Se há anotação, atualizar a entrada com a nota
      if (notes.trim()) {
        await axios.put(
          `${API_BASE_URL}/time-entries/${pendingTaskData.entryId}/notes`,
          { notes: notes.trim() },
          config
        );
      }
      
      // Limpar localStorage
      localStorage.removeItem('activeTimeEntry');
      
      if (onTimeEntrySaved) {
        onTimeEntrySaved();
      }
      setActiveEntry(null);
      setTime(0);
      setPendingTaskData(null);
      setNotes('');
    } catch (err) {
      setError(`Falha ao finalizar: ${err.response?.data?.msg || err.message}`);
      setIsRunning(true); // Reativa se houver erro
    }
  };

  // Função personalizada para controlar o fechamento do modal
  const handleModalClose = (event, reason) => {
    const isComplexCase = pendingTaskData?.isComplexCase;
    
    // Para casos complexos sem anotação, bloqueia TODOS os tipos de fechamento
    if (isComplexCase && (!notes || notes.trim() === '')) {
      setError('Para "Casos complexos", a anotação é obrigatória. Preencha o campo para continuar.');
      return;
    }
    
    // Caso contrário, permite fechar
    handleCancelEnd();
  };

  const handleCancelEnd = () => {
    const isComplexCase = pendingTaskData?.isComplexCase;
    
    // Se for caso complexo e não tiver anotação, não permite fechar
    if (isComplexCase && (!notes || notes.trim() === '')) {
      setError('Para "Casos complexos", a anotação é obrigatória. Preencha o campo para continuar.');
      return;
    }
    
    setNotesModalOpen(false);
    setPendingTaskData(null);
    setNotes('');
    setError(null);
  };

  const handleCancel = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar a tarefa em andamento? Esta ação não pode ser desfeita.")) {
        return;
    }
    
    try {
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`${API_BASE_URL}/time-entries/active`, config);
        
        // Limpar localStorage
        localStorage.removeItem('activeTimeEntry');
        
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
        <TimerIcon sx={{ fontSize: 'inherit', mr: 1 }} />
        {formatTime(time)}
      </Typography>

      {/* Mostrar informações da tarefa ativa */}
      {activeEntry && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
            Tarefa em Andamento:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<BusinessIcon />} 
              label={activeEntry.client_name || activeEntry.clientName}
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<TaskIcon />} 
              label={activeEntry.task_name || activeEntry.taskName}
              color="secondary" 
              variant="outlined"
            />
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        {renderButtons()}
      </Box>

      {/* Modal para anotações */}
      <Dialog 
        open={notesModalOpen} 
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={pendingTaskData?.isComplexCase && (!notes || notes.trim() === '')}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon />
          Adicionar Anotação
          {pendingTaskData?.isComplexCase && (
            <Chip label="Obrigatório" color="error" size="small" />
          )}
        </DialogTitle>
        <DialogContent>
          {pendingTaskData && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Tarefa: {pendingTaskData.taskName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Cliente: {pendingTaskData.clientName}
              </Typography>
              {pendingTaskData.isComplexCase && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <strong>Atenção:</strong> Para casos complexos, a anotação é obrigatória e você não poderá sair sem preenchê-la.
                </Alert>
              )}
            </Box>
          )}
          <TextField
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            label={pendingTaskData?.isComplexCase ? "Anotações (Obrigatório)" : "Anotações (Opcional)"}
            placeholder="Descreva o que foi realizado nesta tarefa..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            required={pendingTaskData?.isComplexCase}
            error={pendingTaskData?.isComplexCase && (!notes || notes.trim() === '')}
            helperText={
              pendingTaskData?.isComplexCase 
                ? "Para casos complexos, a anotação é obrigatória"
                : "Adicione uma anotação sobre o que foi realizado"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelEnd} 
            color="inherit"
            disabled={pendingTaskData?.isComplexCase && (!notes || notes.trim() === '')}
          >
            {pendingTaskData?.isComplexCase ? 'Cancelar*' : 'Cancelar'}
          </Button>
          <Button 
            onClick={handleConfirmEnd} 
            color="primary" 
            variant="contained"
            startIcon={<StopIcon />}
            disabled={pendingTaskData?.isComplexCase && (!notes || notes.trim() === '')}
          >
            Finalizar Tarefa
          </Button>
        </DialogActions>
        {pendingTaskData?.isComplexCase && (!notes || notes.trim() === '') && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              * O botão cancelar ficará disponível após preencher a anotação
            </Typography>
          </Box>
        )}
      </Dialog>
    </Paper>
  );
}

export default TimeTracker;
