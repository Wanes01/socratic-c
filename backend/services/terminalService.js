const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');
const EXEC_NAME = "program"
const EXEC_DIR = "bin"

/**
 * compiles the specified exercise
 * @param {string} exerciseName - the name of the directory of the exercise
 * @param {Object} [options] - compilation options
 * @param {boolean} [options.ansi=false] - compile with -ansi flag (C89)
 * @param {boolean} [options.wall=false] - enable common warnings (-Wall)
 * @param {boolean} [options.wpedantic=false] - enable pedantic warnings (-Wpedantic)
 * @param {boolean} [options.wextra=false] - enable extra warnings (-Wextra)
 * @returns {Promise<{success: boolean, output: string}>}
 */
exports.compileExercise = (exerciseName, options) => {
    return new Promise((resolve) => {
        const exercisePath = path.join(EXERCISES_DIR, exerciseName);
        const studentRoot = path.join(exercisePath, 'root');
        const binDir = path.join(exercisePath, EXEC_DIR);
        //const outputFile = path.join(binDir, EXEC_NAME);

        // verifies that the exerciseName directory exists
        if (!fs.existsSync(studentRoot)) {
            return resolve({
                success: false,
                output: `Errore: Cartella 'root' non trovata in ${exerciseName}`
            });
        }

        // creates the bin folder if it does not exists
        if (!fs.existsSync(binDir)) {
            fs.mkdirSync(binDir, { recursive: true });
        }

        // builds the flags to use
        const flags = [];
        if (options.ansi) flags.push('-ansi');
        if (options.wall) flags.push('-Wall');
        if (options.wpedantic) flags.push('-Wpedantic');
        if (options.wextra) flags.push('-Wextra');

        const flagsStr = flags.join(' ');

        // command costruction
        const compileCmd = `find . -name "*.c" -print0 | xargs -0 gcc -o "../${EXEC_DIR}/${EXEC_NAME}" -I. -Wall -Wextra -lm -fdiagnostics-color=always ${flagsStr}`;

        // executes the command on root as the cwd.
        // sets a timeout to make sure that the compilation doesn't get stuck
        exec(compileCmd, { cwd: studentRoot, timeout: 10000 }, (error, stdout, stderr) => {
            const output = stdout + stderr;

            if (error) {
                resolve({
                    success: false,
                    output: output || "Errore di compilazione sconosciuto."
                });
            } else {
                resolve({
                    success: true,
                    output: output || "Compilazione completata con successo."
                });
            }
        });
    });
};