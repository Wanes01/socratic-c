import type { CompileOptions } from "../types";
import { apiFetch } from "../util/utilities";

const TERMINAL_API_BASE_URL = '/api/terminal';

/**
 * Compiles the specified exercise
 * @param exerciseName - the name of the directory of the exercise
 * @param options - compilation options
 * @returns {Promise<{success: boolean, output: string}>}
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