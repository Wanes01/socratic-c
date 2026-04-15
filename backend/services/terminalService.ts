import type { Server } from 'http';
import type { CompileOptions, CompilationResult } from '../types/terminalTypes';
import { exec, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { WebSocketServer } from 'ws';
import { EXERCISES_DIR } from './filesService';
import fs from 'fs';
import path from 'path';

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

/**
 * 
 * @param exerciseName the name of the directory of the exercise
 * @param options compilation options selected be the user
 * @returns a promise that results in the output terminal after the compilation
 */
export const compileExercise = (exerciseName: string, options: CompileOptions): Promise<CompilationResult> => {
    return new Promise((resolve) => {
        const exercisePath = path.join(EXERCISES_DIR, exerciseName);
        const studentRoot = path.join(exercisePath, 'root');
        const binDir = path.join(exercisePath, EXEC_DIR);

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
 * @param server  the HTTP server where the WebSocket will be attached
 */
export const initWebSocket = (server: Server) => {
    // attaches the WebSocker server to the same HTTP server as Express, to share the same port
    const wss = new WebSocketServer({ server });

    // every time the client opens a websocket connection...
    wss.on('connection', (ws) => {
        let currentProcess: ChildProcessWithoutNullStreams | null = null;

        ws.on('message', (data: string) => {
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