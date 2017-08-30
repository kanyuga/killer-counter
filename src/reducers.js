import * as Actions from "./actions";
import * as Helpers from "./helpers";

/** helpers **/



const initialState = Helpers.defaultGameState();



/** reducers **/

export function started(state = false, action) {
  return action.type === Actions.START_GAME ? true : state;
}

export function resetGame(state = initialState, action) {
  return action.type === Actions.NEW_GAME ? Helpers.defaultGameState() : state;
}

export function play(state = initialState, action) {
  const newState = Object.assign({}, state);
  const currentPlayer = Helpers.getCurrentPlayer(newState.players);
  const currentBall = Helpers.getCurrentBall(newState.balls);
  let portedBall;
  switch (action.type) {
    case Actions.PLAY_HIT:
      newState.players = Helpers.switchNextPlayer(newState.players, currentPlayer);
      break;
    case Actions.PLAY_PORT:
      portedBall = newState.balls[action.number];
      portedBall.active = false;
      newState.players[currentPlayer].score += portedBall.points;
      newState.balls = Helpers.switchNextBall(newState.balls, currentBall);
      break;
    case Actions.PLAY_MISS:
      let missedBall = newState.balls[currentBall];
      newState.players[currentPlayer].score -= Helpers.ballPorted(newState.balls) ? missedBall.points : 0;
      newState.players = Helpers.switchNextPlayer(newState.players, currentPlayer);
      break;
    case Actions.PLAY_FOUL_PORT:
      let foulBall = newState.balls[action.number];
      newState.players[currentPlayer].score -= Helpers.ballPorted(newState.balls) ? foulBall.points : 0;
      newState.players = Helpers.switchNextPlayer(newState.players, currentPlayer);
      break;
    case Actions.PLAY_PORT_CURRENT_AND_WHITE_BALL:
      portedBall = newState.balls[currentBall];
      portedBall.active = false;
      newState.players = Helpers.switchNextPlayer(newState.players, currentPlayer);
      newState.balls = Helpers.switchNextBall(newState.balls, currentBall);
      break;
  }
  newState.players = Helpers.refreshActivePlayers(newState.players, Helpers.pointsLeft(newState.balls));
  return newState;
}

export function players(players = [], action) {
  players = players.slice();
  switch (action.type) {
    case Actions.ADD_PLAYER:
      players.push({
        name: action.name,
        active: true,
        score: 0,
        current: players.length === 0
      });
      break;
    case Actions.DELETE_PLAYER:
      const currentPlayer = Helpers.getCurrentPlayer(players);
      if (currentPlayer === action.index) {
        players = Helpers.switchNextPlayer(players, currentPlayer);
      }
      players.splice(action.index, 1);

  }
  return players;
}

export function gameApp(state, action) {
  if (action.type.endsWith('PLAYER')) {
    state = Object.assign({}, state, { players: players(state.players, action)} );
  } else if (action.type.startsWith('PLAY_')) {
    state = Object.assign({}, state, play(state, action));
  } else if (action.type === Actions.START_GAME) {
    state = Object.assign({}, state, {started: started(state.started, action)});
  } else if (action.type === Actions.NEW_GAME) {
    state = Object.assign({}, state, resetGame(state, action));
  }
  return state;
}