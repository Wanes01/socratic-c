import express from 'express';
import * as filesController from '../controllers/filesController';

const router = express.Router();

// gets the exercises files tree
router.get('/tree', filesController.getTree);

// reads an exercise file content
router.get('/read', filesController.getFileContent);

// saves an exercise file content
router.post('/save', filesController.setFileContent)

// renames a file/directory
router.patch('/rename', filesController.renameNode);

// deletes a file/directory
router.delete('/delete', filesController.deleteNode);

// creates a new node (file/directory)
router.post('/create', filesController.createNode);

// downloads an exercise as a zip
router.get('/download', filesController.downloadExercise);

// exports the router to be seen by the main app
export default router;