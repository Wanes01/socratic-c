import express from 'express';
import * as terminalController from '../controllers/terminalController';

const router = express.Router();

// compiles the source code of the specified exercise
router.post('/compile', terminalController.compileExercise);

// exports the router to be seen by the main app
export default router;