/**
 * The configuration used for the next compilation
 */
export interface CompileOptions {
    ansi: boolean;
    wall: boolean;
    wpedantic: boolean;
    wextra: boolean;
    werror: boolean;
    includeTests: boolean;
}