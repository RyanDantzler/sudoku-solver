class SudokuSolver {

  validate(puzzleString) {
    const regex = /^[1-9|\.]+$/;

    if (puzzleString.length !== 81)
      throw new Error("Expected puzzle to be 81 characters long");

    if (!regex.test(puzzleString))
      throw new Error("Invalid characters in puzzle");

    for (let i = 0; i < 81; i++) {
      if (puzzleString[i] !== '.') {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (!this.checkRowPlacement(puzzleString, row, col, puzzleString[i]) ||
           !this.checkColPlacement(puzzleString, row, col, puzzleString[i]) ||
           !this.checkRegionPlacement(puzzleString, row, col, puzzleString[i])) {
          throw new Error("Puzzle cannot be solved")
        }  
      }
    }
    
    return true;
  }

  check(puzzleString, coordinate, value) {
    const [ rowLetter, column ] = coordinate.split('');
    
    const rows = ["a","b","c","d","e","f","g","h","i"];
    const row = rows.indexOf(rowLetter.toLowerCase());

    if (row < 0 || column < 1 || column > 9)
      throw new Error("Invalid coordinate");

    const conflicts = [];
    
    if (!this.checkRowPlacement(puzzleString, row, column - 1, value))
      conflicts.push("row");
    
    if (!this.checkColPlacement(puzzleString, row, column - 1, value))
      conflicts.push("column");
    
    if (!this.checkRegionPlacement(puzzleString, row, column - 1, value))
      conflicts.push("region");

    if (conflicts.length > 0)
      return { "valid": false, "conflict": conflicts };
    else
      return { "valid": true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const rowStart = row * 9;
    const rowEnd = (row * 9) + 8;
    const ignoreCell = (row * 9) + column;
    
    for (let i = rowStart; i <= rowEnd; i++) {
      if (puzzleString[i] == value && i !== ignoreCell)
        return false;
    }

    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const colStart = column;
    const colEnd = (8 * 9) + column;
    const ignoreCell = (row * 9) + column;
    
    for (let i = colStart; i <= colEnd; i += 9) {
      if (puzzleString[i] == value && i !== ignoreCell)
        return false;
    }

    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const rowStart = row - (row % 3);
    const rowEnd = rowStart + 2;
    
    const colStart = column - (column % 3);
    const colEnd = colStart + 2;

    const ignoreCell = (row * 9) + column;
    
    for (let i = rowStart; i <= rowEnd; i++) {
      for (let j = colStart; j <= colEnd; j++) {
        const cell = (i * 9) + j;
        if (puzzleString[cell] == value && cell !== ignoreCell)
          return false;
      }
    }

    return true;
  }

  solve(puzzleString) {
    if (puzzleString.indexOf('.') < 0)
      return puzzleString;

    for (let i = 0; i < 81; i++) {
      if (puzzleString[i] == '.') {
        const candidates = [];
        for (let j = 1; j <= 9; j++) {
          const row = Math.floor(i / 9);
          const col = i % 9;
          if (this.checkRowPlacement(puzzleString, row, col, j) &&
             this.checkColPlacement(puzzleString, row, col, j) &&
             this.checkRegionPlacement(puzzleString, row, col, j)) {
            candidates.push(j);
          }  
        }

        if (candidates.length == 0)
          throw new Error("Puzzle cannot be solved");
        else if (candidates.length == 1) {
          return this.solve(puzzleString.substring(0, i) + candidates[0] + puzzleString.substring(i + 1));
        }
      }
    }

    throw new Error("Puzzle cannot be solved");
  }
}

module.exports = SudokuSolver;

