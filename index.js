const express = require('express');
const path = require('path');
const app = express();

// Serve i file statici prodotti da Svelte
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Le tue rotte API
app.get('/api/esercizio', (req, res) => {
    res.json({ title: "Hello C" });
});

// Per ogni altra rotta, rimanda all'index.html di Svelte (fondamentale per le SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(5000, () => console.log('Server pronto su porta 5000'));