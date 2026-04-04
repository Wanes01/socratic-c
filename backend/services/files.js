const fs = require('fs')
const path = require('path')

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');

/**
 * Recursive function to map a directory tree structure to JSON
 * @param {string} dirPath : the absolute path of the directory or file be analyzed
 * @returns 
 */
exports.getFileTree = (dirPath) => {
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
            return exports.getFileTree(path.join(dirPath, child));
        });
    } else {
        info.extension = path.extname(dirPath);
    }

    return info;
}

/**
 * Gets the exercises file tree.
 * Creates the exercises directory if it does not exist.
 * @returns the exercises file tree.
 */
exports.getExercisesTree = () => {
    if (!fs.existsSync(EXERCISES_DIR)) {
        fs.mkdirSync(EXERCISES_DIR);
    }
    return exports.getFileTree(EXERCISES_DIR);
}