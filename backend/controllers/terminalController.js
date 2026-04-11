const terminalService = require('../services/terminalService');

/**
 * Compiles the specified exercise
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.compileExercise = async (req, res) => {
    const { exerciseName, options } = req.body;

    if (!exerciseName) {
        return res.status(400).json({ success: false, output: "Parametro 'exerciseName' mancante." });
    }

    const result = await terminalService.compileExercise(exerciseName, options);
    return res.status(result.success ? 200 : 422).json(result);
};