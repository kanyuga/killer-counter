
export const ADD_PLAYER = 'ADD_PLAYER';
export const DELETE_PLAYER = 'DELETE_PLAYER';
export const START_GAME = 'START_GAME';
export const NEW_GAME = 'NEW_GAME';
export const PLAY_PORT = 'PLAY_PORT_BALL';
export const PLAY_MISS = 'PLAY_MISS';
export const PLAY_HIT = 'PLAY_HIT';
export const PLAY_FOUL_PORT = 'PLAY_FOUL_PORT';
export const PLAY_PORT_CURRENT_AND_WHITE_BALL = 'PLAY_PORT_CURRENT_AND_WHITE_BALL';
export const UNDO = 'UNDO';

export function undo() {
  return { type: UNDO };
}

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

export function port(number) {
  return { type: PLAY_PORT, number };
}

export function miss() {
  return { type: PLAY_MISS };
}

export function hit() {
  return { type: PLAY_HIT };
}

export function foulPort(number) {
  return { type: PLAY_FOUL_PORT, number };
}

export function portCurrentAndWhiteBall() {
  return { type: PLAY_PORT_CURRENT_AND_WHITE_BALL };
}