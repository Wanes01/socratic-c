import type { Request, Response } from 'express';
import * as filesService from '../services/files-services';

// function called when the exercises files tree is requested 
export const getTree = async (_: Request, res: Response) => {
    try {
        const tree = await filesService.getExercisesTree();
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: "Error loading files" });
    }
}

// retrives the content of the file specified in the path query parameter
export const getFileContent = async (req: Request, res: Response) => {
    const relPath = req.query.path as string;

    if (!relPath) {
        return res.status(400).json({ error: "Percorso mancante" });
    }

    const content = await filesService.readExerciseFile(relPath);

    if (content === null) {
        return res.status(404).json({ error: "File non trovato o accesso negato" });
    }

    res.json({ content, path: relPath });
}

// saves the content of the file specified in request body
export const setFileContent = async (req: Request, res: Response) => {
    const { relPath, content } = req.body;
    const result = await filesService.saveExerciseFile(relPath, content);

    res.status(result.success ? 200 : 500).json(result);
}

// handles the request for renaming a file/folder
export const renameNode = async (req: Request, res: Response) => {
    const { oldPath, newPath } = req.body;

    if (!oldPath || !newPath) {
        return res.status(400).json({ success: false, message: "Percorsi vecchio e nuovo sono obbligatori" });
    }

    const result = await filesService.renameNode(oldPath, newPath);
    res.status(result.success ? 200 : 500).json(result);
};

// handles the request for deleting a file/dir
export const deleteNode = async (req: Request, res: Response) => {
    const relativePath = req.query.path as string;
    if (!relativePath) {
        return res.status(400).json({ success: false, message: "Percorso mancante" });
    }
    const result = await filesService.deleteNode(relativePath);
    res.status(result.success ? 200 : 500).json(result);
};

// creates a new node (file/directory)
export const createNode = async (req: Request, res: Response) => {
    const { path: relativePath, type } = req.body;

    if (!relativePath || !type) {
        return res.status(400).json({ success: false, message: "Parametri mancanti" });
    }

    const result = await filesService.createNode(relativePath, type);
    return res.status(result.success ? 201 : 400).json(result);
};

// downloads an exercise as a zip file
export const downloadExercise = async (req: Request, res: Response) => {
    const exerciseName = req.query.name as string;

    if (!exerciseName) {
        return res.status(400).json({ success: false, message: "Nome esercizio mancante" });
    }

    try {
        const archive = await filesService.createExerciseZip(exerciseName);

        // sets the headers to make the file downloadable
        res.attachment(`${exerciseName}.zip`);
        res.setHeader('Content-Type', 'application/zip');

        archive.on('error', (err) => {
            res.status(500).send({ success: false, message: "Errore durante la generazione dello ZIP" });
        });

        archive.pipe(res);

    } catch (error: any) {
        console.error("Errore downloadExercise:", error.message);
        res.status(404).json({ error: error.message });
    }
}