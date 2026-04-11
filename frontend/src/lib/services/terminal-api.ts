import type { CompileOptions } from "../types";
const TERMINAL_API_BASE_URL = '/api/terminal';

/**
 * Compiles the specified exercise
 * @param exerciseName - the name of the directory of the exercise
 * @param options - compilation options
 * @returns {Promise<{success: boolean, output: string}>}
 */
export async function compileExercise(
  exerciseName: string,
  options: CompileOptions = {}
): Promise<{ success: boolean; output: string }> {
  const response = await fetch(`${TERMINAL_API_BASE_URL}/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseName, options })
  });

  if (!response.ok && response.status !== 422) {
    throw new Error(`Errore HTTP: ${response.status}`);
  }

  return response.json();
}