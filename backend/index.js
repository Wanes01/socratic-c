const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

const filesRouter = require('./routes/filesRoute')
const ollamaRouter = require('./routes/ollamaRoute')

app.use('/api/files', filesRouter)
app.use('/api/ollama', ollamaRouter)

// Serve i file statici prodotti da Svelte
app.use(express.static(path.join(__dirname, 'public')));

// Le tue rotte API
app.get('/api/test', (req, res) => {
    res.json({ numero: "100000000000" });
});

// Per ogni altra rotta, rimanda all'index.html di Svelte (fondamentale per le SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(5000, () => console.log('Server pronto su porta 5000'));