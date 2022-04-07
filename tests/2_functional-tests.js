const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  const VALID_PUZZLE = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const UNSOLVABLE_PUZZLE = "1.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const INVALID_LENGTH = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..";
  const INVALID_CHARACTER = "ab9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  const VALID_SOLUTION = "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
  
  test('Solve valid puzzle POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ "puzzle": VALID_PUZZLE })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.solution, VALID_SOLUTION);
        done();
      });
  });
  
  test('Missing required puzzle field POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Required field missing");
        done();
      });
  });

  test('Puzzle contains invalid characters field POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ "puzzle": INVALID_CHARACTER })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });

  test('Puzzle length is invalid field POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ "puzzle": INVALID_LENGTH })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
        done();
      });
  });

  test('Puzzle cannot be solved field POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ "puzzle": UNSOLVABLE_PUZZLE })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Puzzle cannot be solved");
        done();
      });
  });

  test('All required fields, no conflicts POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "a1",
        "value": 7
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.valid, true);
        done();
      });
  });

    test('All required fields, single conflicts POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "d2",
        "value": 5
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.valid, false);
        assert.isTrue(res.body.conflict.length == 1);
        done();
      });
  });
  
  test('All required fields, multiple conflicts POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "d2",
        "value": 3
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.valid, false);
        assert.isTrue(res.body.conflict.length > 1);
        done();
      });
  });

  test('All required fields, all conflicts POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "f8",
        "value": 9
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.valid, false);
        assert.isTrue(res.body.conflict.includes("row"));
        assert.isTrue(res.body.conflict.includes("column"));
        assert.isTrue(res.body.conflict.includes("region"));
        done();
      });
  });

  test('Missing required fields POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "value": 9
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Required field(s) missing");
        done();
      });
  });

  test('Invalid characters POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": INVALID_CHARACTER,
        "coordinate": "f8",
        "value": 9
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });

  test('Invalid length puzzle POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": INVALID_LENGTH,
        "coordinate": "f8",
        "value": 9
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
        done();
      });
  });

  test('Invalid coordinate POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "j8",
        "value": 9
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Invalid coordinate");
        done();
      });
  });

  test('Invalid value to check POST /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ 
        "puzzle": VALID_PUZZLE,
        "coordinate": "f8",
        "value": 10
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });
});

