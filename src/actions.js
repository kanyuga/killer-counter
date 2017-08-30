
export const ADD_PLAYER = 'ADD_PLAYER';
export const DELETE_PLAYER = 'DELETE_PLAYER';
export const START_GAME = 'START_GAME';
export const NEW_GAME = 'NEW_GAME';
export const PLAY_PORT = 'PLAY_PORT_BALL';
export const PLAY_MISS = 'PLAY_MISS';
export const PLAY_HIT = 'PLAY_HIT';
export const PLAY_FOUL_PORT = 'PLAY_FOUL_PORT';
export const PLAY_PORT_CURRENT_AND_WHITE_BALL = 'PLAY_PORT_CURRENT_AND_WHITE_BALL';


export function addPlayer(name) {
  return { type: ADD_PLAYER, name };
}

export function deletePlayer(index) {
  return { type: DELETE_PLAYER, index };
}

export function startGame() {
  return { type: START_GAME };
}

export function newGame() {
  return { type: NEW_GAME};
}

export function port(currentPlayer, number) {
  return { type: PLAY_PORT, currentPlayer, number };
}

export function miss(currentPlayer, number) {
  return { type: PLAY_MISS, currentPlayer, number };
}

export function hit(currentPlayer, number) {
  return { type: PLAY_HIT, currentPlayer, number };
}

export function foulPort(currentPlayer, number) {
  return { type: PLAY_FOUL_PORT, currentPlayer, number };
}

export function portCurrentAndWhiteBall(currentPlayer, number) {
  return { type: PLAY_PORT_CURRENT_AND_WHITE_BALL, currentPlayer, number };
}