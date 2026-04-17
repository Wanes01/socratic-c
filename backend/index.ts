import express, { Application } from 'express';
import path from 'path';
import { initWebSocket } from './services/terminal-services';
// the routers that handle the HTTP requests
import filesRouter from './routes/files-routes';
import aiRouter from './routes/ai-routes';
import terminalRouter from './routes/terminal-routes';

const app: Application = express();
app.use(express.json());
const server = app.listen(5000);

// initializes the web socket server to read stdout, stderr and write on stdin of the current process
initWebSocket(server);

// sets the routes to be managed by the routers
app.use('/api/files', filesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/terminal', terminalRouter);