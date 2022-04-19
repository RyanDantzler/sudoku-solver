'use strict';
const { body, validationResult } = require('express-validator');
const SudokuSolver = require('../controllers/sudoku-solver.js');
const { demoPuzzles, puzzles }  = require('../controllers/puzzle-strings.js');

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.send({ error: errors.array({ onlyFirstError: true })[0].msg });
  }
};

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/puzzle/:id?')
    .get((req, res) => {
      let id = Math.floor(Math.random() * puzzles.length);

      if (req.params.id && req.params.id < puzzles.length)
        id = req.params.id;

      res.cookie('startTime', new Date(), { signed: true, secure: true, sameSite: 'None' });
      res.send({ "puzzle": puzzles[id][0] });
    });

  app.route('/api/demo')
    .get((req, res) => {
      let id = Math.floor(Math.random() * demoPuzzles.length);

      if (req.params.id && req.params.id < demoPuzzles.length)
        id = req.params.id;

      res.cookie('startTime', new Date(), { signed: true, secure: true, sameSite: 'None' });
      res.send({ "puzzle": demoPuzzles[id][0] });
    });

  app.route('/api/generate')
    .get((req, res) => {
      let puzzle = solver.generatePuzzle();

      res.send({ "puzzle": puzzle });
    });

  app.route('/api/check')
    .post(validate([
      body('puzzle', 'Required field(s) missing').exists(),
      body('coordinate', 'Required field(s) missing').exists(),
      body('value', 'Required field(s) missing').exists()
    ]),
    (req, res) => {
      const puzzleString = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;
      const regex = /^[a-i][1-9]$/i;

      try {
        if (isNaN(value) || value < 1 || value > 9)
          throw new Error("Invalid value");
        
        if (!regex.test(coordinate))
          throw new Error("Invalid coordinate");

        solver.validate(puzzleString);
        let result = solver.check(puzzleString, coordinate, value);

        res.send(result);
      } catch (e) {
        res.send({ error: e.message });
      }
    });
    
  app.route('/api/solve')
    .post(validate([
      body('puzzle', 'Required field missing').exists()
    ]),
    (req, res) => {
      const puzzleString = req.body.puzzle;

      try {
        solver.validate(puzzleString);
        let result = solver.solve(puzzleString);
        
        res.clearCookie("startTime");
        let startTime = req.signedCookies['startTime'];
        let totalTime;

        if (startTime) {
          const diffTime = Math.abs(new Date() - new Date(startTime));
          const diffSec = Math.round(diffTime / 1000) % 60;
          const diffMin = Math.floor(diffTime / (1000 * 60));
          totalTime = diffMin.toString() + ":" + diffSec.toString().padStart(2,'0');

          if (diffMin > 59) 
            totalTime = "max";
        } else {
          totalTime = "max";
        }

        res.send({ "solution": result, "time": totalTime });
      } catch (e) {
        res.send({ error: e.message });
      }
    });
};
