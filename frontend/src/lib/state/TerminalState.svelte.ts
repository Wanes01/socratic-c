class TerminalState {
    isCompiling = $state<boolean>(false); // true if the server is currently compiling the program
    canExecute = $state<boolean>(false); // true if the executable of the current exercise exists
    isExecuting = $state<boolean>(false); // true if the program is under execution right now
    params = $state<string>(""); // the command line arguments/input to the program
    output = $state<string>(""); // the output/error of the pragram

    // prepares the terminal for a new execution
    prepareForRun = () => {
        this.output = "";
        this.isExecuting = true;
    }

    // appends the new chunk data on the output
    appendOutput = (chunk: string) => {
        this.output += chunk;
    }
}

export const ts = new TerminalState();