import { compileExercise } from "../services/terminal-api";

const COMPILATION_SUCCESS_MESSAGE = "Compilazione avvenuta con successo.";
const COMPILATION_IN_PROGRESS_MESSAGE = "Compilazione in corso...";
const NETWORK_ERROR_MESSAGE = "Errore di rete durante la compilazione.";

class TerminalState {
    isCompiling = $state<boolean>(false); // true if the server is currently compiling the program
    isExecuting = $state<boolean>(false); // true if the program is under execution right now
    lastAction = $state<"none" | "compile" | "execute">("none"); // last action performed
    lastCompileSuccess = $state<boolean>(false); // true if the last compilation was successful
    lastExecutionSuccess = $state<boolean>(false); // true if the last execution was successful
    canExecute = $derived(this.lastCompileSuccess && !this.isCompiling && !this.isExecuting);
    
    hasErrors = $derived(
        (this.lastAction === "compile" && !this.lastCompileSuccess) ||
        (this.lastAction === "execute" && !this.lastExecutionSuccess)
    );
    
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
        this.output = COMPILATION_IN_PROGRESS_MESSAGE;

        try {
            const result = await compileExercise(exerciseName, this.compileOptions);
            this.lastCompileSuccess = result.success;
            this.lastAction = "compile";
            this.output = result.success
                ? COMPILATION_SUCCESS_MESSAGE
                : result.output;
        } catch (e) {
            this.lastAction = "compile";
            this.output = NETWORK_ERROR_MESSAGE;
        } finally {
            this.isCompiling = false;
        }
    }

    execute = (exerciseName: string): void => {
        this.isExecuting = true;
        this.lastAction = "none";
        this.lastExecutionSuccess = false;
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
            this.output = NETWORK_ERROR_MESSAGE;
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