// Exemplo de estrutura de dados para uma TimeEntry
const timeEntryModel = {
  id: null,          // number
  userId: null,      // number
  taskId: null,      // number
  clientId: null,    // number
  startTime: '',     // string (ISO Date format do backend, ex: "2024-06-28T14:30:00.000Z")
  endTime: null,     // string (ISO Date format ou null se ainda ativa)
  // Campos adicionados pelo backend para relatórios/listagens:
  username: '',      // string
  taskName: '',      // string
  clientName: '',    // string
};

// Exemplo de payload para iniciar uma entrada de tempo
const startTimeEntryPayload = {
  taskId: null,   // number (ID da tarefa selecionada)
  clientId: null, // number (ID do cliente selecionado)
};