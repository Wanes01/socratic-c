import express from 'express';
import * as terminalController from '../controllers/terminal-controllers';

const router = express.Router();

// compiles the source code of the specified exercise
router.post('/compile', terminalController.compileExercise);

// checks the existance of an executable
router.get('/can-execute', terminalController.checkExecutable);

// exports the router to be seen by the main app
export default router;