import {
  ADD_PLAYER, DELETE_PLAYER, NEW_GAME, PLAY_FOUL_PORT, PLAY_HIT, PLAY_MISS, PLAY_PORT, PLAY_PORT_CURRENT_AND_WHITE_BALL,
  START_GAME
} from "./action";

/** helpers **/

export function defaultGameState(ballCount = 15) {
  // check if we'd initial state stored
  // if (window.localStorage) {
  //   let state = window.localStorage.getItem('state');
  //   if (state) {
  //     try {
  //       return JSON.parse(state);
  //     } catch (e) {
  //       console.error('Invalid `state` string');
  //     }
  //   }
  // }

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

const initialState = defaultGameState();

function refreshActivePlayers(players = [], pointsLeft) {
  const maxScore = players.reduce((maxScore, player) => Math.max(maxScore, player.score), 0);
  return players.map(player => {
    player.active = player.score + pointsLeft >= maxScore;
    return player;
  });
}

function pointsLeft(balls) {
  return Object.keys(balls).reduce(
    (pointsLeft, number) => pointsLeft + (balls[number].active ? balls[number].score : 0),
    0
  );
}

function getCurrentPlayer(players) {
  return players.findIndex(player => player.current) || 0;
}

function getCurrentBall(balls) {
  return Object.keys(balls).filter(index => balls[index].current)[0];
}

function switchNextBall(balls, currentBall) {
  balls = Object.assign({}, balls);
  let nextBall = currentBall;
  const numbers = Object.keys(balls);
  const maxNumber = Math.max(...numbers);
  while (!balls[nextBall].active) {
    nextBall = (++nextBall) <= maxNumber ? nextBall : 1;
  }
  balls[currentBall].current = false;
  balls[nextBall].current = true;
  return balls;
}

function switchNextPlayer(players, currentPlayer) {
  players = players.slice();
  let nextPlayer = currentPlayer;
  do {
    nextPlayer = (++nextPlayer) < players.length ? nextPlayer : 0;
  } while (!players[nextPlayer].active);
  players[currentPlayer].current = false;
  players[nextPlayer].current = true;
  return players;
}

/** reducers **/

export function started(state = false, action) {
  return action.type === START_GAME ? true : state;
}

export function resetGame(state = initialState, action) {
  return action.type === NEW_GAME ? defaultGameState() : state;
}

export function play(state = initialState, action) {
  const newState = Object.assign({}, state);
  const currentPlayer = getCurrentPlayer(newState.players);
  const currentBall = getCurrentBall(newState.balls);
  let portedBall;
  switch (action.type) {
    case PLAY_HIT:
      newState.players = switchNextPlayer(newState.players, currentPlayer);
      break;
    case PLAY_PORT:
      portedBall = newState.balls[action.number];
      portedBall.active = false;
      newState.players[currentPlayer].score += portedBall.points;
      newState.balls = switchNextBall(newState.balls, currentBall);
      break;
    case PLAY_MISS:
      let missedBall = newState.balls[action.number];
      newState.players[currentPlayer].score -= missedBall.points;
      newState.players = switchNextPlayer(newState.players, currentPlayer);
      break;
    case PLAY_FOUL_PORT:
      let foulBall = newState.balls[action.number];
      newState.players[currentPlayer].score -= foulBall.points;
      newState.players = switchNextPlayer(newState.players, currentPlayer);
      break;
    case PLAY_PORT_CURRENT_AND_WHITE_BALL:
      portedBall = newState.balls[currentBall];
      portedBall.active = false;
      newState.players = switchNextPlayer(newState.players, currentPlayer);
      newState.balls = switchNextBall(newState.balls, currentBall);
      break;
  }
  newState.players = refreshActivePlayers(newState.players, pointsLeft(newState.balls));
  return newState;
}

export function players(players = [], action) {
  players = players.slice();
  switch (action.type) {
    case ADD_PLAYER:
      players.push({
        name: action.name,
        active: true,
        score: 0,
        current: players.length === 0
      });
      break;
    case DELETE_PLAYER:
      const currentPlayer = getCurrentPlayer(players);
      if (currentPlayer === action.index) {
        players = switchNextPlayer(players, currentPlayer);
      }
      players.splice(action.index, 1);

  }
  return players;
}

export function gameApp(state, action) {
  if (action.type.endsWith('PLAYER')) {
    state = Object.assign({}, state, { players: players(state.players, action)} );
  }
  if (action.type.startsWith('PLAY_')) {
    state = Object.assign({}, state, play(state, action));
  }
  if (action.type === START_GAME) {
    state = Object.assign({}, state, {started: started(state.started, action)});
  }
  if (action.type === NEW_GAME) {
    state = Object.assign({}, state, resetGame(state, action));
  }
  return state;
}