import { compileExercise } from "../services/terminal-api";

class TerminalState {
    isCompiling = $state<boolean>(false); // true if the server is currently compiling the program
    canExecute = $state<boolean>(false); // true if the executable of the current exercise exists
    isExecuting = $state<boolean>(false); // true if the program is under execution right now
    params = $state<string>(""); // the command line arguments/input to the program
    output = $state<string>(""); // the output/error of the pragram

    compileOptions = $state({
        ansi: false,
        wall: false,
        wpedantic: false,
        wextra: false
    });

    compile = async (exerciseName: string): Promise<void> => {
        this.isCompiling = true;
        this.canExecute = false;
        this.isExecuting = false;
        this.output = "";

        try {
            const result = await compileExercise(exerciseName, this.compileOptions);
            this.output = result.output;
            this.canExecute = result.success;
        } catch (e) {
            this.output = "Errore di rete durante la compilazione.";
        } finally {
            this.isCompiling = false;
        }
    }
}

export const ts = new TerminalState();