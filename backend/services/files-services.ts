import type { ExercisesMap, FileContent, FileTreeNode, NodeChildrenMap, OperationResult } from '../types/files-types';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { ExerciseAIConfig } from '../types/ai-types';

export const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');
export const EXERCISE_AI_CONFIG_FILE_NAME = 'exercise-config.yaml';

const viewableDirs = ['root', 'tests'];

/**
 * Recursive function to map a directory tree structure to JSON with filtering
 * @param dirPath the absolute path
 * @param condition predicate that receives the info object (defaults to true, accepting all elements)
 * @returns the node info or null if it doesn't satisfy the condition
 */
export const getFileTree = async (dirPath: string, condition: (node: FileTreeNode) => boolean = (_) => true): Promise<FileTreeNode | null> => {
    const stats = await fs.stat(dirPath);
    const relativePath = path.relative(EXERCISES_DIR, dirPath);

    // an obejct describing the directory/file
    const info: FileTreeNode = {
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
        const childrenNames = await fs.readdir(dirPath);
        info.children = {};

        const childrenPromises = childrenNames.map(async (childName) => {
            const childResult = await getFileTree(path.join(dirPath, childName), condition);
            if (childResult !== null) {
                info.children![childResult.name] = childResult;
            }
        });

        await Promise.all(childrenPromises);
    }

    return info;
}

/**
 * Gets the student's viewable exercise tree structure.
 * Creates the exercises directory if it does not exist.
 * @returns the exercises file tree.
 */
export const getExercisesTree = async (): Promise<ExercisesMap> => {
    await fs.mkdir(EXERCISES_DIR, { recursive: true });

    const tree = await getFileTree(
        EXERCISES_DIR,
        (item: FileTreeNode) =>
            !item.path.includes("/") // accepts first level nodes
            || viewableDirs.some(dir => item.path.includes(`/${dir}`)) // accept root, tests and all their content
    );

    const rawExercises = (tree?.children ?? {}) as NodeChildrenMap;

    const exercisesPromises = Object.values(rawExercises).map(async (exercise: FileTreeNode) => {
        const exercisePath = path.join(EXERCISES_DIR, exercise.name);

        // creates the root directory if it doesn't exist
        const rootPath = path.join(exercisePath, 'root');
        await fs.mkdir(rootPath, { recursive: true });

        let exerciseAIConfig: ExerciseAIConfig = {} as ExerciseAIConfig;

        try {
            const exerciseConfigRaw = await fs.readFile(path.join(exercisePath, EXERCISE_AI_CONFIG_FILE_NAME), 'utf-8');
            exerciseAIConfig = (exerciseConfigRaw ? yaml.load(exerciseConfigRaw) : {}) as ExerciseAIConfig;
        } catch (e: any) {
            if (e.code !== 'ENOENT') { // file not found / corrupted
                console.error(`Errore lettura/parsing ${EXERCISE_AI_CONFIG_FILE_NAME} per ${exercise.name}:`, e.message);
            }
        }

        const sRoot = exercise.children?.['root'];
        const tRoot = exercise.children?.['tests'];

        return [
            exercise.name,
            {
                path: exercise.path,
                studentRoot: sRoot || {},
                tests: tRoot || {},
                description: exerciseAIConfig.description,
                learningGoals: exerciseAIConfig.learningGoals || null,
                constraints: exerciseAIConfig.constraints || null
            }
        ] as const;
    });

    const resolvedExercises = await Promise.all(exercisesPromises);
    return Object.fromEntries(resolvedExercises);
}

/**
 * Reads the content of the file in the exercises directory given the relative path
 * @param relPath the relative path of the file from the exercises directory
 * @returns the content of the file as a string
 */
export const readExerciseFile = async (relPath: string): Promise<string | null> => {
    try {
        const fullPath = path.join(EXERCISES_DIR, relPath);

        // path traversal guard (user may request ../../../)
        if (!fullPath.startsWith(EXERCISES_DIR)) {
            console.error(`Tentativo di accesso non autorizzato: ${relPath}`);
            return null;
        }

        return await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
        console.error(`An error occurred while reading a file:`, error.message);
        return null;
    }
}

/**
 * Saves (overwrites) the content of a file.
 * @param relPath the relative path of the file from EXERCISES_DIR
 * @param content the new content to save
 * @returns true if success, false otherwise
 */
export const saveExerciseFile = async (relPath: string, content: string): Promise<OperationResult> => {
    try {
        const fullPath = path.join(EXERCISES_DIR, relPath);
        if (!fullPath.startsWith(EXERCISES_DIR)) {
            console.error(`Tentativo di accesso non autorizzato al percorso: ${fullPath}`);
            return { success: false, message: "Accesso non autorizzato" };
        }
        /* writes the file. If it doesn't exist then it gets created */
        await fs.writeFile(fullPath, content, 'utf-8');
        return { success: true, message: "File salvato" };
    } catch (error: any) {
        console.error(`Errore durante il salvataggio del file`, error.message);
        return { success: false, message: "Errore durante il salvataggio del file" };
    }
}

/**
 * Renames a file or directory.
 * @param oldRelPath current relative path
 * @param newRelPath new relative path
 */
export const renameNode = async (oldRelPath: string, newRelPath: string): Promise<OperationResult> => {
    try {
        const oldFullPath = path.join(EXERCISES_DIR, oldRelPath);
        const newFullPath = path.join(EXERCISES_DIR, newRelPath);

        if (!oldFullPath.startsWith(EXERCISES_DIR) || !newFullPath.startsWith(EXERCISES_DIR)) {
            throw new Error("Unauthorized path access");
        }

        try {
            // does not throw an error: a file with this name already exists
            await fs.access(newFullPath);
            return { success: false, message: "Esiste già un file con questo nome" };
        } catch {
        }

        // if the destination folder does not exist, create it
        const newDir = path.dirname(newFullPath);
        await fs.mkdir(newDir, { recursive: true });

        fs.rename(oldFullPath, newFullPath);
        return { success: true, message: "File rinominato correttamente" };
    } catch (error: any) {
        console.error(`Errore durante la rinomina da ${oldRelPath} a ${newRelPath}:`, error.message);
        return { success: false, message: "Non è stato possibile rinominare il file" };
    }
}

/**
 * Deletes a file ora a directory (and all its content)
 * @param relativePath the relative path from the exercises folder
 * @returns the result of the operation
 */
export const deleteNode = async (relativePath: string): Promise<OperationResult> => {
    try {
        const fullPath = path.join(EXERCISES_DIR, relativePath);

        if (!fullPath.startsWith(EXERCISES_DIR)) {
            return { success: false, message: "Accesso non autorizzato al percorso" };
        }

        await fs.rm(fullPath, { recursive: true, force: true });

        return { success: true, message: "Eliminazione completata" };
    } catch (error: any) {
        console.error(`Errore durante l'eliminazione di ${relativePath}:`, error.message);
        // throw new Error(`Impossibile eliminare la risorsa: ${error.message}`);
        return { success: false, message: "Impossibile eliminare la risorsa" };
    }
};

/**
 * Creates a new node (file/directory)
 * @param relativePath : relative path of the new node
 * @param type : the type of the node to create
 * @returns the result of the operation
 */
export const createNode = async (relativePath: string, type: 'file' | 'directory'): Promise<OperationResult> => {
    try {
        const fullPath = path.join(EXERCISES_DIR, relativePath);

        if (!fullPath.startsWith(EXERCISES_DIR)) {
            return { success: false, message: "Accesso non autorizzato al percorso" };
        }

        try {
            await fs.access(fullPath);
            return { success: false, message: "Un elemento con questo nome esiste già" };
        } catch {
        }

        if (type === 'directory') {
            await fs.mkdir(fullPath, { recursive: true });
        } else {
            const parentDir = path.dirname(fullPath);
            await fs.mkdir(parentDir, { recursive: true });
            // wx makes so that the files doesn't get overwritten between the access controll and this command
            await fs.writeFile(fullPath, "", { encoding: 'utf-8', flag: 'wx' });
        }

        return { success: true, message: `${type === 'file' ? 'File' : 'Directory'} creato correttamente` };
    } catch (error: any) {
        return {
            success: false,
            message: `Errore durante la creazione: ${error.message}`
        };
    }
};

/**
 * Creates the ZIP of an exercise directory
 * @param {string} exerciseName the name of the exercise to zip
 * @returns {Archiver} the archiver instance with the zipped file
 */
export const createExerciseZip = async (exerciseName: string): Promise<archiver.Archiver> => {
    const exercisePath = path.resolve(EXERCISES_DIR, exerciseName);

    if (!exercisePath.startsWith(EXERCISES_DIR)) {
        throw new Error("Accesso non autorizzato");
    }

    try {
        const stats = await fs.stat(exercisePath);
        if (!stats.isDirectory()) {
            throw new Error("Il percorso specificato non è una directory");
        }
    } catch (error: any) {
        throw new Error("Esercizio non trovato");
    }

    const archive = archiver('zip', {
        zlib: { level: 9 } // the compression level
    });

    for (const dir of viewableDirs) {
        const fullSubPath = path.join(exercisePath, dir);
        try {
            const subStats = await fs.stat(fullSubPath);
            if (subStats.isDirectory()) {
                // preserves the dir name
                archive.directory(fullSubPath, dir);
            }
        } catch {
            continue;
        }
    }

    archive.finalize();

    return archive;
};

/**
 * Recursively reads all files from a file tree node
 * @param node a node returned by getFileTree
 * @returns a list of files with their content
 */
export const readFilesFromTree = async (node: FileTreeNode | null): Promise<FileContent[]> => {
    if (!node) {
        return [];
    }

    if (node.type === 'file') {
        const content = await readExerciseFile(node.path);
        if (content !== null) {
            return [{ name: node.name, content }];
        }
        return [];
    }

    // it's a directory, reads files in parallel
    if (node.children) {
        const childrenArray = Object.values(node.children);

        // applies the same operation on all children
        const results = await Promise.all(
            childrenArray.map(child => readFilesFromTree(child))
        );
        return results.flat();
    }

    return [];
};