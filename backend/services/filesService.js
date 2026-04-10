const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');
EXERCISES_DIR = exports.EXERCISES_DIR

const viewableDirs = ['root', 'tests'];

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

    const tree = exports.getFileTree(
        EXERCISES_DIR,
        (item) =>
            !item.path.includes("/") // accepts first level nodes
            || viewableDirs.some(dir => item.path.includes(`/${dir}`)) // accept root, tests and all their content
    );

    const rawExercises = tree.children || {};

    const exercises = Object.values(rawExercises).reduce((acc, exercise) => {
        const sRoot = exercise.children?.['root'];
        const tRoot = exercise.children?.['tests'];

        acc[exercise.name] = {
            path: exercise.path,
            // makes access to data easier on frontend
            studentRoot: sRoot || {},
            tests: tRoot || {}
        };

        return acc;
    }, {});

    return exercises;
}

/**
 * Reads the content of the file in the exercises directory given the relative path
 * @param {string} relPath : the relative path of the file from the exercises directory
 * @returns the content of the file as a string
 */
exports.readExerciseFile = (relPath) => {
    const fullPath = path.join(EXERCISES_DIR, relPath);

    try {
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        console.error(`An error occurred while reading ${fullPath}:`, error.message);
        return null;
    }
}

/**
 * Saves (overwrites) the content of a file.
 * @param {string} relPath : the relative path of the file from EXERCISES_DIR
 * @param {string} content : the new content to save
 * @returns {boolean} : true if success, false otherwise
 */
exports.saveExerciseFile = (relPath, content) => {
    const fullPath = path.join(EXERCISES_DIR, relPath);

    if (!fullPath.startsWith(EXERCISES_DIR)) {
        console.error(`Tentativo di accesso non autorizzato al percorso: ${fullPath}`);
        return false;
    }

    try {
        /* writes the file. If it doesn't exist then it gets created */
        fs.writeFileSync(fullPath, content, 'utf-8');
        return true;
    } catch (error) {
        console.error(`Errore durante il salvataggio di ${fullPath}:`, error.message);
        return false;
    }
}

/**
 * Renames a file or directory.
 * @param {string} oldRelPath : current relative path
 * @param {string} newRelPath : new relative path
 */
exports.renameNode = (oldRelPath, newRelPath) => {
    const oldFullPath = path.join(EXERCISES_DIR, oldRelPath);
    const newFullPath = path.join(EXERCISES_DIR, newRelPath);

    if (!oldFullPath.startsWith(EXERCISES_DIR) || !newFullPath.startsWith(EXERCISES_DIR)) {
        throw new Error("Unauthorized path access");
    }

    if (fs.existsSync(newFullPath)) {
        throw new Error("Un file o una directory con questo nome esiste già");
    }

    try {
        // if the destination folder does not exist, create it
        const newDir = path.dirname(newFullPath);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        fs.renameSync(oldFullPath, newFullPath);
        return true;
    } catch (error) {
        console.error(`Errore durante la rinomina da ${oldRelPath} a ${newRelPath}:`, error.message);
        return false;
    }
}

/**
 * Deletes a file ora a directory (and all its content)
 * @param {string} relativePath : the relative path from the exercises folder
 */
exports.deleteNode = (relativePath) => {
    const fullPath = path.join(EXERCISES_DIR, relativePath);

    if (!fullPath.startsWith(EXERCISES_DIR)) {
        throw new Error("Accesso non autorizzato al percorso");
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error("Il file o la directory non esiste");
    }

    try {
        fs.rmSync(fullPath, { recursive: true, force: true });

        return { success: true, message: "Eliminazione completata" };
    } catch (error) {
        console.error(`Errore durante l'eliminazione di ${relativePath}:`, error.message);
        throw new Error(`Impossibile eliminare la risorsa: ${error.message}`);
    }
};

/**
 * Creates a new node (file/directory)
 * @param {string} relativePath : relative path of the new node
 * @param {'file' | 'directory'} type : the type of the node to create
 */
exports.createNode = (relativePath, type) => {
    const fullPath = path.join(EXERCISES_DIR, relativePath);

    if (!fullPath.startsWith(EXERCISES_DIR)) {
        throw new Error("Accesso non autorizzato al percorso");
    }

    if (fs.existsSync(fullPath)) {
        throw new Error("Un elemento con questo nome esiste già");
    }

    try {
        if (type === 'directory') {
            fs.mkdirSync(fullPath, { recursive: true });
        } else {
            const parentDir = path.dirname(fullPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(fullPath, "", 'utf-8');
        }

        return { success: true, message: `${type === 'file' ? 'File' : 'Directory'} creato correttamente` };
    } catch (error) {
        console.error(`Errore creazione ${type} in ${relativePath}:`, error.message);
        throw new Error(`Errore durante la creazione: ${error.message}`);
    }
};

/**
 * Creates the ZIP of an exercise directory
 * @param {string} exerciseName the name of the exercise
 * @returns {Archiver} the archiver instance
 */
exports.createExerciseZip = (exerciseName) => {
    const exercisePath = path.join(exports.EXERCISES_DIR, exerciseName);

    if (!fs.existsSync(exercisePath) || !fs.statSync(exercisePath).isDirectory()) {
        throw new Error("Esercizio non trovato");
    }

    const archive = archiver('zip', {
        zlib: { level: 9 } // the compression level
    });

    viewableDirs.forEach(dir => {
        const fullSubPath = path.join(exercisePath, dir);
        if (fs.existsSync(fullSubPath) && fs.statSync(fullSubPath).isDirectory()) {
            archive.directory(fullSubPath, dir);
        }
    });

    archive.finalize();

    return archive;
};