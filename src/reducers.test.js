import { createStore } from 'redux';
import {gameApp, defaultGameState} from './reducers';
import {
  addPlayer, deletePlayer, hit, newGame, startGame, port, miss, foulPort,
  portCurrentAndWhiteBall
} from "./action";


describe('testing reducers', () => {
  let store;
  beforeEach(() => {
    store = createStore(gameApp, defaultGameState());
  });

  it ('add player', () => {
    store.dispatch(addPlayer('Player 1'));
    expect(store.getState().players.length).toEqual(1);
  });

  it ('delete player', () => {
    store.dispatch(addPlayer('Player 1'));
    expect(store.getState().players.length).toEqual(1);
    store.dispatch(deletePlayer(0));
    //console.log(store.getState());
    expect(store.getState().players.length).toEqual(0);
  });

  it ('reset game', () => {
    store.dispatch(newGame());
    expect(store.getState()).toEqual(defaultGameState());
  });

  it ('start game', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    expect(store.getState().started).toBeTruthy();
    expect(store.getState().players.length).toBe(2);
  });


  it ('hit', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    store.dispatch(hit(0, 3));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('port', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    store.dispatch(port(0, 3));
    expect(store.getState().players[0].current).toBe(true);
    expect(store.getState().players[0].score).toBe(6);
    expect(store.getState().balls[3]).toEqual({ number: 3, points: 6, active: false, current: false });
    expect(store.getState().balls[4].current).toBe(true);
  });

  it ('miss', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    store.dispatch(miss(0, 3));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(-6);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('foul port', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    store.dispatch(foulPort(0, 6));
    expect(store.getState().balls[3].current).toBe(true);
    expect(store.getState().balls[6].active).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(-6);
    expect(store.getState().players[1].current).toBe(true);
  });

  it ('port current ball and white ball', () => {
    store.dispatch(addPlayer('Player 1'));
    store.dispatch(addPlayer('Player 2'));
    store.dispatch(startGame());
    store.dispatch(portCurrentAndWhiteBall(0, 3));
    expect(store.getState().balls[3].active).toBe(false);
    expect(store.getState().balls[4].current).toBe(true);
    expect(store.getState().players[0].current).toBe(false);
    expect(store.getState().players[0].score).toBe(0);
    expect(store.getState().players[1].current).toBe(true);
  });

});

