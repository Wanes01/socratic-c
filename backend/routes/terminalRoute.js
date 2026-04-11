const express = require('express');
const router = express.Router();
const terminalController = require('../controllers/terminalController')

// compiles the source code of the specified exercise
router.post('/compile', terminalController.compileExercise);

// exports the router to be seen by the main app
module.exports = router;