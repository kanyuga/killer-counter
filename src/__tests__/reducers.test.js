import { createStore } from 'redux';
import { gameApp, play, players, resetGame, started } from '../reducers';
import { defaultGameState } from "../helpers"
import * as Actions from "../actions";

describe('unit tests', () => {
  let state;

  beforeEach(() => {
    state = defaultGameState();
    state.players = [
      { name: 'Player 1', score: 0, active: true, current: false },
      { name: 'Player 2', score: 0, active: true, current: true },
      { name: 'Player 3', score: 0, active: true, current: false },
    ];
  });

  it ('start game', () => {
    expect(started(state.started, Actions.startGame())).toEqual(true);
  });

  it ('reset game', () => {
    state.started = true;
    expect(resetGame(state, Actions.newGame())).toEqual(defaultGameState());
  });

  it ('add players', () => {
    state.players = [];
    expect(players(state.players, Actions.addPlayer('Player 1'))).toEqual([{
      name: 'Player 1', score: 0, active: true, current: true
    }])
  });

  it ('delete players', () => {
    const result = players(state.players, Actions.deletePlayer(1));
    expect(result.length).toBe(2);
    expect(result[0].name).toEqual('Player 1');
    expect(result[1].name).toEqual('Player 3');
    expect(result[1].current).toBe(true);
  });

  describe ('play', () => {
    beforeEach(() => {
      state.started = true;
    });
    it ('hit', () => {
      const result = play(state, Actions.hit());
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].current).toBe(true);
    });

    it ('port', () => {
      const result = play(state, Actions.port(3));
      expect(result.players[1].current).toBe(true);
      expect(result.balls[3].active).toBe(false);
      expect(result.players[1].score).toBe(6);
      expect(result.balls[4].current).toBe(true);
    });

    it ('miss when none has been ported', () => {
      const result = play(state, Actions.miss());
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].current).toBe(true);
      expect(result.players[1].score).toBe(0);
    });

    it ('miss', () => {
      state.balls[5].active = false;
      const result = play(state, Actions.miss());
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].current).toBe(true);
      expect(result.players[1].score).toBe(-6);
    });

    it ('foul port when none has been ported', () => {
      const result = play(state, Actions.foulPort(5));
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].current).toBe(true);
      expect(result.players[1].score).toBe(0);
      expect(result.balls[5].active).toBe(true);
    });

    it ('foul port', () => {
      state.balls[7].active = false;
      const result = play(state, Actions.foulPort(5));
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].current).toBe(true);
      expect(result.players[1].score).toBe(-5);
      expect(result.balls[5].active).toBe(true);
    });

    it ('port current ball and white ball', () => {
      const result = play(state, Actions.portCurrentAndWhiteBall());
      expect(result.players[2].current).toBe(true);
      expect(result.balls[3].active).toBe(false);
      expect(result.players[1].score).toBe(0);
      expect(result.balls[4].current).toBe(true);
    });
  });
});

describe('store tests', () => {
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

  describe('play', () => {

    beforeEach(() => {
      store.dispatch(Actions.addPlayer('Player 1'));
      store.dispatch(Actions.addPlayer('Player 2'));
      store.dispatch(Actions.startGame());
    });

    it('hit', () => {
      store.dispatch(Actions.hit());
      expect(store.getState().balls[3].current).toBe(true);
      expect(store.getState().players[1].current).toBe(true);
    });

    it('port', () => {
      store.dispatch(Actions.port(3));
      expect(store.getState().players[0].current).toBe(true);
      expect(store.getState().players[0].score).toBe(6);
      expect(store.getState().balls[3].active).toBe(false);
      expect(store.getState().balls[4].current).toBe(true);
    });

    it('miss before ball is ported', () => {
      store.dispatch(Actions.miss());
      expect(store.getState().balls[3].current).toBe(true);
      expect(store.getState().players[0].score).toBe(0);
      expect(store.getState().players[1].current).toBe(true);
    });

    it('miss', () => {
      store.dispatch(Actions.port(7));
      store.dispatch(Actions.hit());
      store.dispatch(Actions.miss());
      expect(store.getState().balls[3].current).toBe(true);
      expect(store.getState().players[1].score).toBe(-6);
      expect(store.getState().players[0].current).toBe(true);
    });

    it('foul port before ball is ported', () => {
      store.dispatch(Actions.foulPort(6));
      expect(store.getState().balls[3].current).toBe(true);
      expect(store.getState().balls[6].active).toBe(true);
      expect(store.getState().players[0].score).toBe(0);
      expect(store.getState().players[1].current).toBe(true);
    });

    it('foul port', () => {
      store.dispatch(Actions.port(7));
      store.dispatch(Actions.hit());
      store.dispatch(Actions.foulPort(6));
      expect(store.getState().balls[3].current).toBe(true);
      expect(store.getState().balls[6].active).toBe(true);
      expect(store.getState().players[1].score).toBe(-6);
      expect(store.getState().players[0].current).toBe(true);
    });

    it('port current ball and white ball', () => {
      store.dispatch(Actions.portCurrentAndWhiteBall());
      expect(store.getState().balls[3].active).toBe(false);
      expect(store.getState().balls[4].current).toBe(true);
      expect(store.getState().players[0].score).toBe(0);
      expect(store.getState().players[1].current).toBe(true);
    });
  });
});

