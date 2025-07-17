const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Para todas as rotas, retornar o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Frontend servindo na porta ${PORT}`);
});
