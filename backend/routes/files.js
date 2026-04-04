const express = require('express');
const router = express.Router();
const fs = require('fs')
const path = require('path')

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');

/**
 * Recursive function to map a directory tree structure to JSON
 * @param {string} dirPath : the absolute path of the directory or file be analyzed
 * @returns 
 */
function getFileTree(dirPath) {
    const stats = fs.statSync(dirPath);
    // paths must be relative to EXERCISES_DIR to not expose server side root
    const relativePath = path.relative(EXERCISES_DIR, dirPath);
    const info = {
        name: path.basename(dirPath),
        path: relativePath || ".",
        type: stats.isDirectory() ? "directory" : "file"
    };

    if (stats.isDirectory()) {
        /*
        reads the names of the files and directories in the found subdirectory
        and recursively builds a directory tree from them
        */
        info.children = fs.readdirSync(dirPath).map(child => {
            return getFileTree(path.join(dirPath, child));
        });
    } else {
        info.extension = path.extname(dirPath);
    }

    return info;
}

// gets the exercises files tree
router.get('/tree', (_, res) => {
    try {
        /*
        the exercises dir should always exist but we create it anyway
        in order to dodge unexpected behaviors
        */
        if (!fs.existsSync(EXERCISES_DIR)) {
            fs.mkdirSync(EXERCISES_DIR);
        }

        const tree = getFileTree(EXERCISES_DIR);
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: "Error loading files" })
    }
});

// exports the router to be seen by the main app
module.exports = router;