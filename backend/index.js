const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

const filesRouter = require('./routes/filesRoute');
const ollamaRouter = require('./routes/ollamaRoute');
const terminalRouter = require('./routes/terminalRoute');

app.use('/api/files', filesRouter);
app.use('/api/ollama', ollamaRouter);
app.use('/api/terminal', terminalRouter);

// Serve i file statici prodotti da Svelte
app.use(express.static(path.join(__dirname, 'public')));


// Per ogni altra rotta, rimanda all'index.html di Svelte
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(5000, () => console.log('Server pronto su porta 5000'));