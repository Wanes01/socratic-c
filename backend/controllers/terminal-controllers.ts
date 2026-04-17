import type { Request, Response } from 'express';
import * as terminalService from '../services/terminal-services';

/**
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