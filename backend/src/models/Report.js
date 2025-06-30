// Estrutura para relatórios de tempo por tarefa (diário/semanal) e demanda por tarefa
const taskReportModel = {
  taskName: '',        // string
  totalDuration: '',   // string (formato HH:MM:SS)
};

// Estrutura para relatório de demanda por cliente
const clientReportModel = {
  clientName: '',      // string
  totalDuration: '',   // string (formato HH:MM:SS)
};

// Estrutura para relatório de tempo por tarefa por cliente
const taskByClientReportModel = {
  clientName: '',      // string
  taskName: '',        // string
  totalDuration: '',   // string (formato HH:MM:SS)
};

// Exemplo de parâmetros de query para relatórios:
const reportQueryParams = {
  userId: null,     // number | undefined (opcional para admin)
  date: '',         // string (YYYY-MM-DD, para diário)
  weekNumber: null, // number (para semanal)
  year: null,       // number (para semanal)
  startDate: '',    // string (YYYY-MM-DD, para demanda/tarefa-por-cliente)
  endDate: '',      // string (YYYY-MM-DD, para demanda/tarefa-por-cliente)
};