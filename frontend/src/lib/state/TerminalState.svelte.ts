import { compileExercise } from "../services/terminal-api";

class TerminalState {
    isCompiling = $state<boolean>(false); // true if the server is currently compiling the program
    isExecuting = $state<boolean>(false); // true if the program is under execution right now
    lastCompileSuccess = $state<boolean>(false); // true if the last compilation was successfull
    canExecute = $derived(this.lastCompileSuccess && !this.isCompiling && !this.isExecuting); // true if the executable of the current exercise exists

    params = $state<string>(""); // the command line arguments/input to the program
    output = $state<string>(""); // the output/error of the pragram

    compileOptions = $state({
        ansi: true,
        wall: true,
        wpedantic: true,
        wextra: false,
        werror: false,
        includeTests: true // includes or not the tests source files in the compilation
    });

    // compiles the specified exercise using the current compileOptions
    compile = async (exerciseName: string): Promise<void> => {
        this.isCompiling = true;
        this.lastCompileSuccess = false;
        this.output = "";

        try {
            const result = await compileExercise(exerciseName, this.compileOptions);
            this.output = result.output;
            this.lastCompileSuccess = result.success;
        } catch (e) {
            this.output = "Errore di rete durante la compilazione.";
        } finally {
            this.isCompiling = false;
        }
    }
}

export const ts = new TerminalState();