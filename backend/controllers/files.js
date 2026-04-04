const filesService = require('../services/files')

// function called when the exercises files tree is requested 
exports.getTree = (_, res) => {
    try {
        const tree = filesService.getExercisesTree();
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: "Error loading files" });
    }
}