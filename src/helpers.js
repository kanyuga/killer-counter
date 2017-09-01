export function defaultGameState(ballCount = 15) {

  const balls = {};

  for (let i = 1; i <= ballCount; i++) {
    balls[i] = {
      number: i,
      active: true,
      points: (i < 3 ? i + ballCount : (i === 3 ? 6 : i)),
      current: i === 3
    }
  }

  return {
    players: [],
    balls: balls,
    started: false,
    playLog: [],
    history: []
  };
}

export function refreshActivePlayers(players = [], pointsLeft) {
  const maxScore = getMaxScore(players);
  return players.map(player => {
    player.active = player.score + pointsLeft >= maxScore;
    return player;
  });
}

export function getMaxScore(players) {
  return players.reduce((maxScore, player) => Math.max(maxScore, player.score), 0);
}

export function pointsLeft(balls) {
  return Object.keys(balls).reduce(
    (pointsLeft, number) => pointsLeft + (balls[number].active ? balls[number].points : 0),
    0
  );
}

export function getCurrentPlayer(players) {
  return players.findIndex(player => player.current) || 0;
}

export function getCurrentBall(balls) {
  return parseInt(Object.keys(balls).filter(index => balls[index].current)[0]);
}

export function switchNextBall(balls, currentBall) {
  balls = Object.assign({}, balls);
  let nextBall = currentBall;
  const numbers = Object.keys(balls);
  const maxNumber = Math.max(...numbers);
  let counter = 0;
  while (!balls[nextBall].active && ++counter <= maxNumber) {
    nextBall = ++nextBall <= maxNumber ? nextBall : 1;
  }
  balls[currentBall].current = false;
  balls[nextBall].current = true;
  return balls;
}

export function switchNextPlayer(players, currentPlayer) {
  players = players.slice();
  let nextPlayer = currentPlayer;
  let counter = 0;
  do {
    nextPlayer = ++nextPlayer < players.length ? nextPlayer : 0;
    counter++;
  } while (!players[nextPlayer].active && counter < players.length);
  players[currentPlayer].current = false;
  players[nextPlayer].current = true;
  return players;
}

export function ballPorted(balls) {
  return Object.keys(balls).filter(number => !balls[number].active).length > 0;
}

export function extractForHistory(state) {
  state = {...state};
  delete state.history;
  return JSON.stringify(state);
}

export const playLogClasses = {
  success: 'text-success',
  fail: 'text-danger'
};