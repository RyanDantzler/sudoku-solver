class SudokuSolver {

  validate(puzzleString) {
    const regex = /^[1-9|\.]+$/;
    //new RegExp('^[1-9.]{81}$').test(puzzleString)

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
    const rowEnd = row * 9 + 8;
    const ignoreCell = row * 9 + column;
    
    for (let i = rowStart; i <= rowEnd; i++) {
      if (puzzleString[i] == value && i !== ignoreCell)
        return false;
    }

    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const colStart = column;
    const colEnd = 8 * 9 + column;
    const ignoreCell = row * 9 + column;
    
    for (let i = colStart; i <= colEnd; i += 9) {
      if (puzzleString[i] == value && i !== ignoreCell)
        return false;
    }

    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const rowStart = Math.floor(row / 3) * 3;
    const colStart = Math.floor(column / 3) * 3;
    const ignoreCell = row * 9 + column;
    
    for (let i = rowStart; i < rowStart + 3; i++) {
      for (let j = colStart; j < colStart + 3; j++) {
        const cell = i * 9 + j;
        if (puzzleString[cell] == value && cell !== ignoreCell)
          return false;
      }
    }

    return true;
  }

  solveOld(puzzleString) {
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

  indexToRowCol(index) {
    return { row: Math.floor(index / 9), col: index % 9 };
  }

  rowColToIndex(row, col) {
    return row * 9 + col;
  }

  validPlacement(puzzle, index, value) {
    let row = Math.floor(index / 9);
    let col = index % 9;

    for (let r = 0; r < 9; r++) {
      if (puzzle[this.rowColToIndex(r, col)] == value) 
        return false;
    }

    for (let c = 0; c < 9; c++) {
      if (puzzle[this.rowColToIndex(row, c)] == value)
        return false;
    }

    let r1 = Math.floor(row / 3) * 3;
    let c1 = Math.floor(col / 3) * 3;
    
    for (let r = r1; r < r1 + 3; r++) {
      for (let c = c1; c < c1 + 3; c++) {
        if (puzzle[this.rowColToIndex(r, c)] == value)
          return false;
      }
    }

    return true;
  }

  unique(puzzle, index, value) {
    let row = Math.floor(index / 9);
    let col = index % 9;
    let r1 = Math.floor(row / 3) * 3;
    let c1 = Math.floor(col / 3) * 3;

    for (let r = r1; r < r1 + 3; r++) {
      for (let c = c1; c < c1 + 3; c++) {
        let i = this.rowColToIndex(r, c);
        if (i !== index && !puzzle[i] && this.validPlacement(puzzle, i, value)) {
          return false;
        }
      }
    }

    return true;
  }

  getChoices(puzzle, index) {
    let choices = [];
    
    for (let val = 1; val <= 9; val++) {
      if (this.validPlacement(puzzle, index, val)) {
        if (this.unique(puzzle, index, val))
          return [ val ];
        else
          choices.push(val);
      }
    }

    return choices;
  }

  getIndexOfLeastChoices(puzzle) {
    let index, moves, min = 10;
    for (let i = 0; i < puzzle.length; i++) {
      if (!puzzle[i]) {
        let choices = this.getChoices(puzzle, i);
        if (choices.length < min) {
          min = choices.length;
          moves = choices;
          index = i;
        
          if (min == 0) break;
        }
      }
    }

    return { index, moves };
  }

  convertToPuzzleString(puzzle) {
    return puzzle.join('').replaceAll(0, '.');
  }
  
  convertToArray(puzzleString) {
    return [...puzzleString].map(item => isNaN(item) ? 0 : parseInt(item, 10));
  }

  solve(puzzleString) {
    let self = this;
    const puzzle = this.convertToArray(puzzleString);

    console.log(puzzle);

    function solve() {
      let { index, moves } = self.getIndexOfLeastChoices(puzzle);

      // if index is not set then all cells are filled
      if (index == null) return true;
      
      for (let m of moves) {
        puzzle[index] = m;
        if (solve())
          return true;
      }

      // backtrack
      puzzle[index] = 0;
      return false;
    }
    
    if (solve())
      return puzzle.join('');
      
    throw new Error("Puzzle cannot be solved");
  }

  shuffledNumList() {
    const array = [1,2,3,4,5,6,7,8,9]
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  generateSolvedPuzzle() {
    let self = this;
    let puzzle = this.convertToArray('.'.repeat(81));

    (function generate() {
      let index = 0;
      while (index < puzzle.length && puzzle[index]) index++;

      if (index >= puzzle.length) return true;

      for (let val of self.shuffledNumList()) {
        if (self.validPlacement(puzzle, index, val)) {
          puzzle[index] = val;
          if (generate())
            return true;
        }
      }
      
      puzzle[index] = 0;
      return false;
    })();

    return puzzle;
  }

  hasMultipleSolutions(puzzle) {
    let self = this;
    let counter = 0;
    
    function solve(index) {    
      while (index < puzzle.length && puzzle[index]) index++;

      if (index == puzzle.length) {
        counter++;
        
        if (counter > 1)
          return true;
        
        return false;
      }
      
      let moves = self.getChoices(puzzle, index);
      
      for (let m of moves) {
        puzzle[index] = m;
        
        if (solve(index + 1))
          return true;
      }
        
        puzzle[index] = 0;
        return false;
    }

    solve(0);

    return counter > 1;
  }
  
  generatePuzzle(difficulty = "easy") {
    let attempts;
    let puzzle = this.generateSolvedPuzzle();
    
    switch (difficulty) {
      case "easy": 
        attempts = 5;
        break;
      case "medium":
        attempts = 7;
        break;
      case "hard":
        attempts = 10;
        break;
      case "expert":
        attempts = 12;
        break;
    }
    
    while (attempts > 0) {
      let rand = Math.floor(Math.random() * 81);
      
      while (!puzzle[rand])
        rand = Math.floor(Math.random() * 81);

      let val = puzzle[rand];
      puzzle[rand] = 0;

      if (this.hasMultipleSolutions([...puzzle])) {
        puzzle[rand] = val;
        attempts--;
      }
    }

    return this.convertToPuzzleString(puzzle);
  }
}

module.exports = SudokuSolver;

