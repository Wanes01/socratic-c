import { compileExercise } from "../services/terminal-api";

// the max amount of characters that the terminal can show before killing the process
export const EXEC_MAX_OUTPUT_CHARS = 100_000;

export const MESSAGES = {
    COMPILE_SUCCESS: "[Compilazione avvenuta con successo.]",
    COMPILATION_IN_PROGRESS: "[Compilazione in corso...]",
    NETWORK_ERROR: "[Errore di rete durante la compilazione.]",
    MAX_OUTPUT_EXEEDED: `[L'output ha raggiunto più di ${EXEC_MAX_OUTPUT_CHARS} caratteri, motivo per cui il processo è stato terminato.]`
}

class TerminalState {

    isCompiling = $state<boolean>(false); // true if the server is currently compiling the program
    isExecuting = $state<boolean>(false); // true if the program is under execution right now
    lastAction = $state<"none" | "compile" | "execute">("none"); // last action performed
    lastCompileSuccess = $state<boolean>(false); // true if the last compilation was successful
    lastExecutionSuccess = $state<boolean>(false); // true if the last execution was successful
    hasWarnings = $state<boolean>(false); // true if compilation produced warnings
    hasErrors = $state<boolean>(false); // true if the compilation or execution produced errors
    canExecute = $derived(this.lastCompileSuccess && !this.isCompiling && !this.isExecuting);
    
    params = $state<string>(""); // the command line arguments/input to the program
    output = $state<string>(""); // the output/error of the program
    
    compileOptions = $state({
        ansi: true,
        wall: true,
        wpedantic: true,
        wextra: false,
        werror: false,
        includeTests: true
    });

    private ws: WebSocket | null = null;

    /**
     * Compiles the specified exercise with the current compileOptions configuration
     * @param exerciseName the exercise to compile
     */
    compile = async (exerciseName: string): Promise<void> => {
        this.isCompiling = true;
        this.lastAction = "none";
        this.lastCompileSuccess = false;
        this.hasWarnings = false;
        this.hasErrors = false;
        this.output = MESSAGES.COMPILATION_IN_PROGRESS;

        try {
            const result = await compileExercise(exerciseName, this.compileOptions);
            this.lastCompileSuccess = result.success;
            this.lastAction = "compile";
            this.output = result.success
                /* if it is a warning, show it; if it is an empty string then
                the compilation was successful (shows the standard text).*/
                ? (result.output || MESSAGES.COMPILE_SUCCESS)
                // if it's an error show it
                : result.output;
            this.hasWarnings = result.success && !!result.output;
            this.hasErrors = !result.success;
        } catch (e) {
            this.lastAction = "compile";
            this.output = MESSAGES.NETWORK_ERROR;
            this.hasErrors = true;
        } finally {
            this.isCompiling = false;
        }
    }

    execute = (exerciseName: string): void => {
        this.isExecuting = true;
        this.lastAction = "none";
        this.lastExecutionSuccess = false;
        this.hasWarnings = false;
        this.hasErrors = false;
        this.output = "";

        this.ws = new WebSocket(`ws://localhost:5000`);

        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            // appends stdout and stderr to the output as they arrive
            if (msg.type === 'stdout' || msg.type === 'stderr') {
                this.output += msg.data;
            }

            /* when the process terminates, updates the state with the exit code
            exit code 0 = success, anything else = error */
            if (msg.type === 'exit') {
                this.lastAction = "execute";
                this.lastExecutionSuccess = msg.code === 0;
                this.hasErrors = msg.code !== 0;
                this.hasWarnings = false;

                if (msg.exitMessage) {
                    this.output += msg.exitMessage;
                }

                this.isExecuting = false;
                this.ws = null;
            }
        };

        /* once the connection is open, send the run command with the exercise name
        and the command line arguments */
        this.ws.onopen = () => {
            this.ws!.send(JSON.stringify({
                type: 'run',
                exerciseName,
                params: this.params
            }));
        };

        this.ws.onerror = () => {
            this.output = MESSAGES.NETWORK_ERROR;
            this.isExecuting = false;
            this.ws = null;
        };
    }

    // sends the current params value as stdin input to the running process
    sendInput = (): void => {
        this.ws?.send(JSON.stringify({ type: 'stdin', data: this.params }));
        this.params = "";
    }

    // stops the running process
    stop = (): void => {
        this.ws?.close();
        this.ws = null;
        this.isExecuting = false;
    }
}

export const ts = new TerminalState();