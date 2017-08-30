import { createStore } from 'redux';
import { gameApp } from '../reducers';
import { defaultGameState } from "../helpers"
import * as Actions from "../actions";

describe('testing reducers', () => {
  let store;
  beforeEach(() => {
    store = createStore(gameApp, defaultGameState());
  });

  it ('add player', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    expect(store.getState().players.length).toEqual(1);
  });

  it ('delete player', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    expect(store.getState().players.length).toEqual(1);
    store.dispatch(Actions.deletePlayer(0));
    //console.log(store.getState());
    expect(store.getState().players.length).toEqual(0);
  });

  it ('reset game', () => {
    store.dispatch(Actions.newGame());
    expect(store.getState()).toEqual(defaultGameState());
  });

  it ('start game', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    expect(store.getState().started).toBeTruthy();
    expect(store.getState().players.length).toBe(2);
  });


  it ('hit', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.hit(0, 3));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('port', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.port(0, 3));
    expect(store.getState().players[0].current).toBe(true);
    expect(store.getState().players[0].score).toBe(6);
    expect(store.getState().balls[3]).toEqual({ number: 3, points: 6, active: false, current: false });
    expect(store.getState().balls[4].current).toBe(true);
  });

  it ('miss before ball is ported', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.miss(0, 3));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(0);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('miss', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.port(0, 7));
    store.dispatch(Actions.hit(0, 3));
    store.dispatch(Actions.miss(0, 3));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().players[1].current).toBe(false);
    expect(store.getState().players[1].score).toBe(-6);
    expect(store.getState().players[0].current).toBe(true);
  });

  it ('foul port before ball is ported', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.foulPort(0, 6));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().balls[6].active).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(0);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('foul port', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.port(0, 7));
    store.dispatch(Actions.hit(0, 3));
    store.dispatch(Actions.foulPort(1, 6));
    store.dispatch(Actions.addPlayer('Player 3'));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().balls[6].active).toBe(true);
    expect(store.getState().players[1].current).toBe(false);
    expect(store.getState().players[1].score).toBe(-6);
    expect(store.getState().players[0].current).toBe(true);
  });

  it ('port current ball and white ball', () => {
    store.dispatch(Actions.addPlayer('Player 1'));
    store.dispatch(Actions.addPlayer('Player 2'));
    store.dispatch(Actions.startGame());
    store.dispatch(Actions.portCurrentAndWhiteBall(0, 3));
    expect(store.getState().balls[3].active).toBe(false);
    expect(store.getState().balls[4].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(0);
    expect(store.getState().players[1].current).toBe(true);
  });

});

