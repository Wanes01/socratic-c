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
}

export const ts = new TerminalState();