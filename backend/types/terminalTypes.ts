export interface CompileOptions {
    ansi: boolean;
    wall: boolean;
    wpedantic: boolean;
    wextra: boolean;
    werror: boolean;
    /** includes or not the tests of the exercise in the compilation (if any) */
    includeTests: boolean;
}

export interface CompilationResult {
    success: boolean;
    output: string;
}