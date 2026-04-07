const fs = require('fs')
const path = require('path')

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');

/**
 * Recursive function to map a directory tree structure to JSON with filtering
 * @param {string} dirPath : the absolute path
 * @param {function} condition : predicate that receives the info object (defaults to true, accepting all elements)
 * @returns {object|null} : the node info or null if it doesn't satisfy the condition
 */
exports.getFileTree = (dirPath, condition = (item) => true) => {
    const stats = fs.statSync(dirPath);
    const relativePath = path.relative(EXERCISES_DIR, dirPath);

    // an obejct describing the directory/file
    const info = {
        name: path.basename(dirPath),
        path: relativePath || ".",
        type: stats.isDirectory() ? "directory" : "file"
    };

    if (!stats.isDirectory()) {
        info.extension = path.extname(dirPath);
    }

    if (!condition(info)) {
        return null;
    }

    // recursevly elborate directories
    if (stats.isDirectory()) {
        info.children = fs.readdirSync(dirPath)
            .map(child => {
                return exports.getFileTree(path.join(dirPath, child), condition);
            })
            // filters out all the nodes that did not comply the condition
            .filter(child => child !== null);
    }

    return info;
}

/**
 * Gets the student's viewable exercise tree structure.
 * Creates the exercises directory if it does not exist.
 * @returns the exercises file tree.
 */
exports.getExercisesTree = () => {
    if (!fs.existsSync(EXERCISES_DIR)) {
        fs.mkdirSync(EXERCISES_DIR);
    }

    const viewableDirs = ['/student-root', '/tests'];
    let exercises = exports.getFileTree(
        EXERCISES_DIR,
        // students can't see solutions or ai-configuration
        (item) => !item.path.includes("/") || viewableDirs.some(dir => item.path.includes(dir))
    ).children;

    return exercises;
}

/**
 * Reads a file from the student's root directory
 * @param {string} relPath a relative path from the student's root directory
 * @returns a json containing the file's data
 */
exports.readExerciseFile = (exerciseDirName, relPath) => {
    // es: es1/cartella/roba.c


}