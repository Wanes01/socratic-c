const filesService = require('../services/filesService')
const path = require('path');

// function called when the exercises files tree is requested 
exports.getTree = (_, res) => {
    try {
        const tree = filesService.getExercisesTree();
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: "Error loading files" });
    }
}

// retrives the content of the file specified in the path query parameter
exports.getFileContent = (req, res) => {
    // reads the relative file path from the query string
    const relPath = req.query.path;

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
exports.setFileContent = (req, res) => {
    const { relPath, content } = req.body;
    const success = filesService.saveExerciseFile(relPath, content);

    if (success) {
        res.status(200).json({ message: "File salvato con successo" });
    } else {
        res.status(500).json({ error: "Non è stato possibile salvare il file" });
    }
}