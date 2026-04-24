const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const shotsEl = document.getElementById('shots');
const savesEl = document.getElementById('saves');
const streakEl = document.getElementById('streak');
const levelEl = document.getElementById('level');
const bestEl = document.getElementById('best');
const statusEl = document.getElementById('status');
const pauseToggle = document.getElementById('pauseToggle');

const state = {
  score: 0,
  shots: 0,
  saves: 0,
  streak: 0,
  level: 1,
  best: Number(localStorage.getItem('goalie-best') || 0),
  paused: false,
  roundActive: false,
  isChallenge: false,
  challengeEndsAt: 0,
  reactionMs: 1200,
  keeperLane: 'center',
  ball: { lane: 'center', x: 0, y: 0, progress: 0 },
};

bestEl.textContent = state.best;

const laneX = {
  left: () => canvas.width * 0.29,
  center: () => canvas.width * 0.5,
  right: () => canvas.width * 0.71,
};

function updateHud() {
  scoreEl.textContent = state.score;
  shotsEl.textContent = state.shots;
  savesEl.textContent = state.saves;
  streakEl.textContent = state.streak;
  levelEl.textContent = state.level;
  bestEl.textContent = state.best;
}

function message(text) {
  statusEl.textContent = text;
}

function drawPitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // field
  ctx.fillStyle = '#0f9b4a';
  ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

  // goal area
  ctx.strokeStyle = '#f1fff1';
  ctx.lineWidth = 6;
  ctx.strokeRect(canvas.width * 0.2, canvas.height * 0.12, canvas.width * 0.6, canvas.height * 0.2);

  // goal net
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 9; i += 1) {
    const x = canvas.width * 0.2 + (i * canvas.width * 0.6) / 8;
    ctx.beginPath();
    ctx.moveTo(x, canvas.height * 0.12);
    ctx.lineTo(x, canvas.height * 0.32);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // penalty spot
  ctx.fillStyle = '#f1fff1';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, canvas.height * 0.68, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawKeeper() {
  const x = laneX[state.keeperLane]();
  const y = canvas.height * 0.29;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#0033aa';
  ctx.fillRect(-22, -10, 44, 60); // body
  ctx.fillStyle = '#f7d3b6';
  ctx.beginPath();
  ctx.arc(0, -22, 16, 0, Math.PI * 2);
  ctx.fill(); // head

  ctx.fillStyle = '#11ccff';
  ctx.fillRect(-44, 5, 20, 12);
  ctx.fillRect(24, 5, 20, 12);
  ctx.restore();
}

function drawBall() {
  const p = state.ball.progress;
  const x = laneX[state.ball.lane]();
  const startY = canvas.height * 0.68;
  const endY = canvas.height * 0.24;
  const y = startY + (endY - startY) * p;
  const radius = 18 - p * 8;

  state.ball.x = x;
  state.ball.y = y;

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.stroke();
}

function difficultyStep() {
  state.level = 1 + Math.floor(state.score / 5);
  state.reactionMs = Math.max(500, 1200 - (state.level - 1) * 80);
}

function startRound() {
  if (state.paused) return;
  state.roundActive = true;
  state.ball.lane = ['left', 'center', 'right'][Math.floor(Math.random() * 3)];
  state.ball.progress = 0;
  message('Save it!');
}

function endRound(saved) {
  state.roundActive = false;
  state.shots += 1;

  if (saved) {
    state.saves += 1;
    state.streak += 1;
    state.score += 10 + state.streak;
    message('Great save! 🧤');
  } else {
    state.streak = 0;
    state.score = Math.max(0, state.score - 3);
    message('Goal scored. Try again!');
  }

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('goalie-best', String(state.best));
  }

  difficultyStep();
  updateHud();

  setTimeout(startRound, 700);
}

function setDive(lane) {
  if (state.paused) return;
  state.keeperLane = lane;
}

function gameLoop(ts) {
  if (!gameLoop.last) gameLoop.last = ts;
  const dt = ts - gameLoop.last;
  gameLoop.last = ts;

  drawPitch();
  drawKeeper();

  if (!state.paused && state.roundActive) {
    state.ball.progress += dt / state.reactionMs;
    drawBall();

    if (state.ball.progress >= 1) {
      endRound(state.keeperLane === state.ball.lane);
    }
  } else {
    drawBall();
  }

  if (state.isChallenge) {
    const seconds = Math.max(0, Math.ceil((state.challengeEndsAt - Date.now()) / 1000));
    message(seconds > 0 ? `Challenge: ${seconds}s left` : 'Challenge over!');
    if (Date.now() >= state.challengeEndsAt) {
      state.isChallenge = false;
      state.paused = true;
      pauseToggle.textContent = 'Resume';
    }
  }

  requestAnimationFrame(gameLoop);
}

document.querySelectorAll('[data-dive]').forEach((btn) => {
  btn.addEventListener('click', () => setDive(btn.dataset.dive));
});

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  if (x < 0.33) setDive('left');
  else if (x < 0.66) setDive('center');
  else setDive('right');
});

pauseToggle.addEventListener('click', () => {
  state.paused = !state.paused;
  pauseToggle.textContent = state.paused ? 'Resume' : 'Pause';
  message(state.paused ? 'Game paused.' : 'Back in goal!');

  if (!state.paused && !state.roundActive) startRound();
});

document.getElementById('challenge').addEventListener('click', () => {
  state.isChallenge = true;
  state.paused = false;
  pauseToggle.textContent = 'Pause';
  state.challengeEndsAt = Date.now() + 30_000;
  state.score = 0;
  state.saves = 0;
  state.shots = 0;
  state.streak = 0;
  state.level = 1;
  state.reactionMs = 1200;
  updateHud();
  startRound();
});

document.getElementById('resetBest').addEventListener('click', () => {
  state.best = 0;
  localStorage.setItem('goalie-best', '0');
  updateHud();
  message('Best score reset.');
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Optional for offline support.
  });
}

updateHud();
startRound();
requestAnimationFrame(gameLoop);
