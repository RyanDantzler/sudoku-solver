const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const Solver = require('../controllers/sudoku-solver.js');
let solver;

suite('UnitTests', () => {
  suiteSetup(() => {
    solver = new Solver();
  });
  
  const VALID_PUZZLE = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const VALID_PUZZLE1 = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const VALID_PUZZLE2 = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const VALID_PUZZLE3 = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const UNSOLVABLE_PUZZLE = "1.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const INVALID_LENGTH = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..";
  const INVALID_CHARACTER = "ab9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const VALID_SOLUTION = "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
  const INVALID_SOLUTION = "169235418851496372432178956174569283395842761628713549283657194516924837947381625";
  test("Valid puzzle", function() {
    assert.equal(solver.validate(VALID_PUZZLE), true);
  });
  test("Invalid characters in puzzle", function() {
    assert.equal(solver.validate(VALID_PUZZLE1), true);
    expect(() => { solver.validate(INVALID_CHARACTER) }).to.throw("Invalid characters in puzzle");
  });
  test("Invalid length puzzle", function() {
    assert.equal(solver.validate(VALID_PUZZLE2), true);
    expect(() => { solver.validate(INVALID_LENGTH) }).to.throw("Expected puzzle to be 81 characters long");
  });
  test("Valid row placement", function() {
    assert.equal(solver.checkRowPlacement(VALID_PUZZLE, 0, 0, 7), true);
  });
  test("Invalid row placement", function() {
    assert.equal(solver.checkRowPlacement(VALID_PUZZLE, 0, 0, 1), false);
  });
  test("Valid column placement", function() {
    assert.equal(solver.checkColPlacement(VALID_PUZZLE, 0, 0, 7), true);
  });
  test("Invalid column placement", function() {
    assert.equal(solver.checkColPlacement(VALID_PUZZLE, 0, 0, 1), false);
  });
  test("Valid region placement", function() {
    assert.equal(solver.checkRegionPlacement(VALID_PUZZLE, 0, 0, 7), true);
  });
  test("Invalid region placement", function() {
    assert.equal(solver.checkRegionPlacement(VALID_PUZZLE, 0, 0, 2), false);
  });
  test("Valid completed puzzle passes solver", function() {
    assert.equal(solver.solve(VALID_SOLUTION), VALID_SOLUTION);
  });
  test("Invalid completed puzzle fails the solver", function() {
    assert.equal(solver.validate(VALID_PUZZLE3), true);
    expect(() => { solver.solve(INVALID_SOLUTION) }).to.throw("Puzzle cannot be solved");
  });
  test("Expected solution for valid incomplete puzzle", function() {
    assert.equal(solver.solve(VALID_PUZZLE), VALID_SOLUTION);
  });
});
