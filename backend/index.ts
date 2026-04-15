import express, { Application } from 'express';
import path from 'path';
import { initWebSocket } from './services/terminalService';
// the routers that handle the HTTP requests
import filesRouter from './routes/filesRoute';
import aiRouter from './routes/aiRoute';
import terminalRouter from './routes/terminalRoute';

const app: Application = express();
app.use(express.json());
const server = app.listen(5000);

// initializes the web socket server to read stdout, stderr and write on stdin of the current process
initWebSocket(server);

// sets the routes to be managed by the routers
app.use('/api/files', filesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/terminal', terminalRouter);



// Serve i file statici prodotti da Svelte
app.use(express.static(path.join(__dirname, 'public')));


// Per ogni altra rotta, rimanda all'index.html di Svelte
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});