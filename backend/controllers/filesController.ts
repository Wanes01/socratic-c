import type { Request, Response } from 'express';
import * as filesService from '../services/filesService';
import path from 'path';

// function called when the exercises files tree is requested 
export const getTree = (_: Request, res: Response): void => {
    try {
        const tree = filesService.getExercisesTree();
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: "Error loading files" });
    }
}

// retrives the content of the file specified in the path query parameter
export const getFileContent = (req: Request, res: Response) => {
    // reads the relative file path from the query string
    const relPath = req.query.path as string;

    if (!relPath) {
        return res.status(400).json({ error: "File inesistente" });
    }

    const fullPath = path.resolve(filesService.EXERCISES_DIR, relPath);
    const baseDir = path.resolve(filesService.EXERCISES_DIR);

    // checks that the required file is in the exercise directory
    if (!fullPath.startsWith(baseDir)) {
        return res.status(403).json({ error: "Accesso non autorizzato" });
    }

    try {
        const content = filesService.readExerciseFile(relPath);

        if (content === null) {
            return res.status(404).json({ error: "File non trovato o non leggibile" });
        }

        res.json({
            content: content,
            path: relPath
        });
    } catch (err) {
        res.status(500).json({ error: "Errore durante la lettura del file" });
    }
}

// saves the content of the file specified in request body
export const setFileContent = (req: Request, res: Response) => {
    const { relPath, content } = req.body;
    const success = filesService.saveExerciseFile(relPath, content);

    if (success) {
        res.status(200).json({ message: "File salvato con successo" });
    } else {
        res.status(500).json({ error: "Non è stato possibile salvare il file" });
    }
}

// handles the request for renaming a file/folder
export const renameNode = (req: Request, res: Response) => {
    const { oldPath, newPath } = req.body;

    if (!oldPath || !newPath) {
        return res.status(400).json({ error: "Percorsi vecchio e nuovo sono obbligatori" });
    }

    try {
        const success = filesService.renameNode(oldPath, newPath);

        if (success) {
            return res.status(200).json({ message: "Rinomina completata con successo" });
        } else {
            return res.status(500).json({ error: "Errore durante la rinomina del file" });
        }
    } catch (error: any) {
        console.error("Errore controller renameNode:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// handles the request for deleting a file/dir
export const deleteNode = (req: Request, res: Response) => {
    const relativePath = req.query.path as string;

    try {
        const result = filesService.deleteNode(relativePath);
        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Errore eliminazione:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// creates a new node (file/directory)
export const createNode = (req: Request, res: Response) => {
    const { path: relativePath, type } = req.body;

    if (!relativePath || !type) {
        return res.status(400).json({ error: "Percorso e tipo (file/directory) sono obbligatori" });
    }

    if (type !== 'file' && type !== 'directory') {
        return res.status(400).json({ error: "Tipo non valido. Ci si aspetta 'file' o 'directory'" });
    }

    try {
        const result = filesService.createNode(relativePath, type);
        // node created successfully
        return res.status(201).json(result);
    } catch (error: any) {
        const statusCode = error.message.includes("File/dir già esistente") ? 409 : 500;
        return res.status(statusCode).json({ error: error.message });
    }
};

// downloads an exercise as a zip file
export const downloadExercise = (req: Request, res: Response) => {
    const exerciseName = req.query.name as string;

    if (!exerciseName) {
        return res.status(400).json({ error: "Esercizio non trovato" });
    }

    try {
        const archive = filesService.createExerciseZip(exerciseName);

        // sets the headers to make the file downloadable
        res.attachment(`${exerciseName}.zip`);
        res.setHeader('Content-Type', 'application/zip');

        archive.on('error', (err) => {
            console.error("Errore durante la creazione dello ZIP:", err);
            res.status(500).send({ error: "Errore durante la generazione dello ZIP" });
        });

        archive.pipe(res);

    } catch (error: any) {
        console.error("Errore downloadExercise:", error.message);
        res.status(404).json({ error: error.message });
    }
}