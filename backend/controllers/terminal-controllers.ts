import type { Request, Response } from 'express';
import * as terminalService from '../services/terminal-services';

/**
 * Handles the compilation of the requested exercise with the provided compiletion options
 * @param req the express http request
 * @param res the express http response
 * @returns A Promise that resolves to the HTTP response containing the compilation output and success status.
 */
export const compileExercise = async (req: Request, res: Response) => {
    const { exerciseName, options } = req.body;

    if (!exerciseName) {
        return res.status(400).json({ success: false, output: "Parametro 'exerciseName' mancante." });
    }

    const result = await terminalService.compileExercise(exerciseName, options);

    return res.status(result.success ? 200 : 422).json(result);
};

/**
 * Handles the request to check if the executable of an exercise exists
 * @param req the express http request
 * @param res the express http response
 */
export const checkExecutable = async (req: Request, res: Response) => {
    const exercise = req.query.exercise as string;
    const exists = await terminalService.executableExists(exercise);
    res.json({ exists });
}