const colors = ['w', 'r', 'g', 'y', 'o', 'b'];
const faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];

class Cube {
  constructor() {
    this.faces = {};
    for (let i = 0; i < 6; i++) {
      this.faces[faceNames[i]] = Array(9).fill(colors[i]);
    }
    this.history = [];
    this.isSolved = true; 
  }

  clone() {
    const newCube = new Cube();
    for (let face in this.faces) {
      newCube.faces[face] = [...this.faces[face]];
    }
    return newCube;
  }

  rotate(face, prime = false) {
    this.history.push(face + (prime ? "'" : ""));
    this.rotateFace(face, prime);
    this.rotateAdjacent(face, prime);
  }

  rotateFace(face, prime) {
    const f = this.faces[face];
    const map = prime ? [2,5,8,1,4,7,0,3,6] : [6,3,0,7,4,1,8,5,2];
    const rotated = map.map(i => f[i]);
    this.faces[face] = rotated;
  }

  rotateAdjacent(face, prime) {
    const adj = {
      U: [['B', 0], ['R', 0], ['F', 0], ['L', 0]],
      D: [['F', 2], ['R', 2], ['B', 2], ['L', 2]],
      F: [['U', 2], ['R', 3], ['D', 0], ['L', 1]],
      B: [['U', 0], ['L', 3], ['D', 2], ['R', 1]],
      R: [['U', 1], ['B', 3], ['D', 1], ['F', 1]],
      L: [['U', 3], ['F', 3], ['D', 3], ['B', 1]],
    };

    const idxMap = {
      0: [0,1,2], 1: [2,5,8], 2: [6,7,8], 3: [0,3,6]
    };

    const seq = adj[face];
    const strips = seq.map(([f, pos]) => idxMap[pos].map(i => this.faces[f][i]));

    const rotated = prime ? [...strips.slice(1), strips[0]] : [strips[3], ...strips.slice(0, 3)];

    seq.forEach(([f, pos], i) => {
      const indices = idxMap[pos];
      indices.forEach((index, j) => {
        this.faces[f][index] = rotated[i][j];
      });
    });
  }

  scramble(moves = 20) {
    this.history = [];
    const allMoves = ['U','D','L','R','F','B'];
    for (let i = 0; i < moves; i++) {
      const face = allMoves[Math.floor(Math.random() * 6)];
      const prime = Math.random() < 0.5;
      this.rotate(face, prime);
    }
    this.isSolved = false;
  }

  solve() {
    const solution = [...this.history].reverse().map(move => {
      return move.endsWith("'") ? move[0] : move + "'";
    });

    solution.forEach(move => {
      const face = move[0];
      const prime = move.endsWith("'");
      this.rotate(face, prime);
    });

    this.isSolved = true;
    return solution;
  }

  getColorString() {
    return faceNames.map(f => this.faces[f].join("")).join("");
  }
}

const cube = new Cube();

function scrambleCube() {
  cube.scramble();
  showSteps(cube.history, "Scramble");
}

function solveCube() {
  if (cube.isSolved) {
    showNotification("Cube is already solved!");
    return;
  }

  const solution = [...cube.history].reverse().map(move =>
    move.endsWith("'") ? move[0] : move + "'"
  );

  const tempCube = cube.clone();
  showSteps(solution, "Solve", tempCube);

  cube.solve();
}

function resetCube() {
  const newCube = new Cube();
  cube.faces = newCube.faces;
  cube.history = [];
  cube.isSolved = true;

  document.getElementById("visuals").innerHTML = `<h2>Visuals (Reset)</h2>` +
    getCubeSvg(cube.getColorString());
  document.getElementById("algorithm").innerHTML = `<h2>Algorithm (Reset)</h2><p>Cube is in solved state.</p>`;
}


function manualRotate(face, prime = false) {
  cube.rotate(face, prime);
  cube.isSolved = false;
  showSteps([], "Manual Rotation");
}

function showSteps(moves, title, startingCube = cube.clone()) {
  const container = document.getElementById("visuals");
  const algo = document.getElementById("algorithm");
  container.innerHTML = `<h2>Visuals (${title})</h2>`;
  algo.innerHTML = `<h2>Algorithm (${title})</h2><ul>`;

  let tempCube = startingCube.clone();
  const reversed = title === "Solve";

  (reversed ? [...moves] : moves).forEach((move, i) => {
    const face = move[0];
    const prime = move.endsWith("'");

    tempCube.rotate(face, prime);

    const visual = getCubeSvg(tempCube.getColorString());
    container.innerHTML += `<div><strong>Step ${i + 1} - ${move}</strong><br>${visual}</div>`;
    algo.innerHTML += `<li>${move}</li>`;
  });

  if (moves.length === 0) {
    const visual = getCubeSvg(tempCube.getColorString());
    container.innerHTML += `<div><strong>Cube State</strong><br>${visual}</div>`;
  }

  algo.innerHTML += `</ul>`;
}


function getCubeSvg(colorString) {
  const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
  const faceColors = {
    w: 'white',
    y: 'yellow',
    r: 'red',
    o: 'orange',
    g: 'green',
    b: 'blue'
  };

  let visuals = '';

  for (let i = 0; i < 6; i++) {
    const face = faceOrder[i];
    const faceString = colorString.substr(i * 9, 9);

    visuals += `<div class="face"><div><strong>${face}</strong></div>`;
    for (let j = 0; j < 9; j++) {
      visuals += `<div class="cell" style="background:${faceColors[faceString[j]]};"></div>`;
    }
    visuals += `</div>`;
  }

  return `<div class="cube-visual">${visuals}</div>`;
}

function showNotification(message) {
  let note = document.createElement("div");
  note.className = "notification";
  note.innerText = message;

  document.body.appendChild(note);

  setTimeout(() => {
    note.classList.add("show");
  }, 50);

  setTimeout(() => {
    note.classList.remove("show");
    setTimeout(() => document.body.removeChild(note), 300);
  }, 2500);
}
