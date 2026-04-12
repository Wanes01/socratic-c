const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');
const EXEC_NAME = "program"
const EXEC_DIR = "bin"

// the max amount of memory (in kilobytes) that the exercise process can take
const EXEC_MEMORY_LIMIT_KB = (process.env.EXEC_MEMORY_LIMIT_MB
    ? parseInt(process.env.EXEC_MEMORY_LIMIT_MB)
    : 128) * 1024;
// the max amount of time (in milliseconds) the exercise process can run
const EXEC_TIMEOUT_MS = (process.env.EXEC_TIMEOUT_SEC
    ? parseInt(process.env.EXEC_TIMEOUT_SEC)
    : 90) * 1000;

const EXIT_CODE = {
    success: 0,
    outOfMemory: 137,
    timeout: 124,
    segFault: 139,
}

/**
 * compiles the specified exercise
 * @param {string} exerciseName - the name of the directory of the exercise
 * @param {Object} [options] - compilation options
 * @param {boolean} [options.ansi=false] - compile with -ansi flag (C89)
 * @param {boolean} [options.wall=false] - enable common warnings (-Wall)
 * @param {boolean} [options.wpedantic=false] - enable pedantic warnings (-Wpedantic)
 * @param {boolean} [options.wextra=false] - enable extra warnings (-Wextra)
 * @param {boolean} [options.werror=false] - warnings get treated as errors (-Werror)
 * @param {boolean} [options.werror=false] - warnings get treated as errors (-Werror) includeTests
 * @param {boolean} [options.includeTests=false] - includes the test folder in the gcc command
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
        if (options.werror) flags.push('-Werror');

        const flagsStr = flags.join(' ');

        /*
        const compileCmd = options.includeTests
            ? `find . -name "*.c" ! -name "main.c" -print0 | xargs -0 gcc ../tests/*.c -o "../${EXEC_DIR}/${EXEC_NAME}" -I. -I../tests -fdiagnostics-color=always ${flagsStr} -lm`
            : `find . -name "*.c" -print0 | xargs -0 gcc -o "../${EXEC_DIR}/${EXEC_NAME}" -I. -fdiagnostics-color=always ${flagsStr} -lm`;
        */

        // command costruction
        const compileCmd = options.includeTests
            /* search and compile the ".c" files both in the student's root and in the test directory.
            Excludes the student's main so that the test's main can be used. */
            ? `gcc $(find . -name "*.c" ! -name "main.c") ../tests/*.c -o "../${EXEC_DIR}/${EXEC_NAME}" -I. -I../tests -fdiagnostics-color=always ${flagsStr} -lm`
            // compile only the ".c" files in the student's root, without considering any tests
            : `gcc $(find . -name "*.c") -o "../${EXEC_DIR}/${EXEC_NAME}" -I. -fdiagnostics-color=always ${flagsStr} -lm`;

        // executes the command on root as the cwd.
        // sets a timeout to make sure that the compilation doesn't get stuck
        exec(compileCmd, { cwd: studentRoot, timeout: 10000 }, (error, stdout, stderr) => {
            const output = stdout + stderr;

            resolve({
                success: !error,
                output: output
            });
        });
    });
};

/**
 * Initializes the WebSocket server attached to the given HTTP server.
 * Handles program execution, stdout/stderr streaming, and stdin forwarding.
 * @param {import('http').Server} server - the HTTP server to attach the WebSocket server to
 */
exports.initWebSocket = (server) => {
    // attaches the WebSocker server to the same HTTP server as Express, to share the same port
    const wss = new WebSocketServer({ server });

    // every time the client opens a websocket connection...
    wss.on('connection', (ws) => {
        let currentProcess = null;

        ws.on('message', (data) => {
            const msg = JSON.parse(data);

            if (msg.type === 'run') {
                const binPath = path.join(EXERCISES_DIR, msg.exerciseName, 'bin', 'program');
                const args = msg.params ? msg.params.trim().split(/\s+/) : [];

                /* spawns the program with stdbuf to disable output buffering,
                so stdout is sent immediately without waiting for \n.
                Also sets the max bytes that the process can take */
                const cmd = `ulimit -v ${EXEC_MEMORY_LIMIT_KB} && stdbuf -o0 ${binPath} ${args.join(' ')}`;
                currentProcess = spawn('bash', ['-c', cmd]);

                // kills the process after the timeout
                let timedOut = false;
                const timeout = setTimeout(() => {
                    timedOut = true;
                    currentProcess?.kill('SIGKILL');
                }, EXEC_TIMEOUT_MS);

                // every time the process writes on stdout/stderr, forwads it to the client
                currentProcess.stdout.on('data', (d) => ws.send(JSON.stringify({ type: 'stdout', data: d.toString() })));
                currentProcess.stderr.on('data', (d) => ws.send(JSON.stringify({ type: 'stderr', data: d.toString() })));

                /* notifies the client of the process termination (0 -> success, else -> error).
                Did not manage to pass the child process's exit code to the bash,
                so the exit code refers to the /bin/bash process */
                currentProcess.on('close', (code, signal) => {
                    // cancels the timeout if the process terminates before it
                    clearTimeout(timeout);
                    let exitMessage = '';

                    if (timedOut) {
                        exitMessage = '\n[Processo terminato: tempo massimo di esecuzione superato]';
                    } else if (signal === 'SIGSEGV') {
                        exitMessage = '\n[Segmentation fault: accesso a memoria non valida]';
                    } else if (signal === 'SIGKILL') {
                        exitMessage = '\n[Processo terminato: memoria esaurita]';
                    }

                    ws.send(JSON.stringify({ type: 'exit', code, signal, exitMessage }));
                });


            }

            // when the client sends input (e.g. for scanf), writes it to the process stdin
            if (msg.type === 'stdin') {
                currentProcess?.stdin.write(msg.data + '\n');
            }
        });

        // if the client disconnects, kills the process
        ws.on('close', () => currentProcess?.kill());
    });
}