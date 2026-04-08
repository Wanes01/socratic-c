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

    // recursevly elaborate directories
    if (stats.isDirectory()) {
        info.children = fs.readdirSync(dirPath)
            .reduce((acc, childName) => {
                const childResult = exports.getFileTree(path.join(dirPath, childName), condition);

                // filters out all the nodes that did not comply the condition
                if (childResult !== null) {
                    acc[childResult.name] = childResult;
                }

                return acc;
            }, {});
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

    const viewableDirs = ['student-root', 'tests'];

    const tree = exports.getFileTree(
        EXERCISES_DIR,
        (item) => !item.path.includes("/") || viewableDirs.some(dir => item.path.includes(`/${dir}`))
    );

    const rawExercises = tree.children || {};

    const exercises = Object.values(rawExercises).reduce((acc, exercise) => {
        const sRoot = exercise.children?.['student-root'];
        const tRoot = exercise.children?.['tests'];

        acc[exercise.name] = {
            path: exercise.path,
            // makes access to data easier on frontend
            studentRoot: sRoot?.children || {},
            tests: tRoot?.children || {}
        };

        return acc;
    }, {});

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