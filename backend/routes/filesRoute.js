const express = require('express');
const router = express.Router();
const filesController = require('../controllers/filesController')

// gets the exercises files tree
router.get('/tree', filesController.getTree);

// reads an exercise file content
router.get('/read', filesController.getFileContent);

// saves an exercise file content
router.post('/save', filesController.setFileContent)

// renames a file/directory
router.patch('/rename', filesController.renameNode);

// exports the router to be seen by the main app
module.exports = router;