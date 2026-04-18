import type { CompileOptions } from "../types/terminal-types";
import { apiFetch } from "../util/utilities";

const TERMINAL_API_BASE_URL = '/api/terminal';

/**
 * Compiles the specified exercise
 * @param exerciseName - the name of the directory of the exercise
 * @param options - compilation options
 * @returns a promise that resolves in the compilation result
 */
export const compileExercise = (
    exerciseName: string,
    options: CompileOptions
): Promise<{ success: boolean; output: string }> => {
    return apiFetch<{ success: boolean; output: string }>(
        TERMINAL_API_BASE_URL,
        '/compile',
        {
            method: 'POST',
            body: JSON.stringify({ exerciseName, options })
        },
        'Errore sconosciuto durante la compilazione dell\'esercizio'
    );
};

/**
 * Checks if the selected exercise can be executed
 * @param exerciseName the exercise to executed
 * @returns a promise that resolves in a boolean expressing if the exercise can be executed
 */
export const checkExecutableExistance = (exerciseName: string): Promise<{ exists: boolean }> =>
    apiFetch(TERMINAL_API_BASE_URL, `/can-execute?exercise=${exerciseName}`);