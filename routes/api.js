'use strict';
const { body, validationResult } = require('express-validator');
const SudokuSolver = require('../controllers/sudoku-solver.js');
const puzzles  = require('../controllers/puzzle-strings.js');

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

  app.route('/api/puzzle')
    .get((req, res) => {
      let rand = Math.floor(Math.random() * 6);
      res.send({ "puzzle": puzzles[rand][0] });
    });

  app.route('/api/demo')
    .get((req, res) => {
      let rand = Math.floor(Math.random() * 5);
      res.send({ "puzzle": puzzles[6][0] });
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
        
        res.send({ "solution": result });
      } catch (e) {
        res.send({ error: e.message });
      }
    });
};
