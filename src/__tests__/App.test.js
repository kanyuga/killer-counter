import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../App';
import { mount } from 'enzyme';
import * as sinon from "sinon";
import { forEach } from "lodash";
import { gameApp } from "../reducers";
import {defaultGameState, getCurrentBall, getCurrentPlayer} from "../helpers";
import {createStore} from "redux";
import {addPlayer, hit, port, startGame} from "../actions";

let confirmStub;
let store;

beforeEach(() => {
   confirmStub = sinon.stub(window, 'confirm');
   confirmStub.returns(true);
   store = createStore(gameApp, defaultGameState());
});

afterEach(() => {
    confirmStub.restore();
});

it ('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><App /></Provider>, div);
});

describe ('add player', () => {
    const name = "Topher";
    let appWrapper;
    beforeEach (() => {
      appWrapper = mount(<Provider store={store}><App /></Provider>);
    });
    it ('as event', () => {
        const input = appWrapper.find('#player_name');
        input.node.value = name;
        input.simulate('change');
        appWrapper.find('form').simulate('submit');
        expect(store.getState().players[0]).toEqual( { name: name, score: 0, active: true, current: true });
    });
});

describe('delete player', () => {
    let appWrapper;
    beforeEach(() => {
      [1, 2, 3, 4].forEach((i) => { store.dispatch(addPlayer(`Player ${i}`))});
      appWrapper = mount(<Provider store={store}><App /></Provider>);
    });
  
    /*it ('when only one player is left ', () => {
        store.getState().players = store.getState().players.slice(0, 1);
        store.dispatch(startGame());
        const alertStub = sinon.stub(window, 'alert');
        alertStub.returns(null);
        app.deletePlayer(0);
        expect(store.getState().players.length).toEqual(1);
        alertStub.restore();
    });*/

    it ('as event', () => {
        expect(store.getState().players[2].name).toEqual("Player 3");
        appWrapper.find('.btn.btn-danger').at(2).simulate('click');
        expect(store.getState().players[2].name).toEqual("Player 4");
    });
});

describe ('start game', () => {
    let appWrapper;
    beforeEach(() => {
        appWrapper = mount(<Provider store={store}><App /></Provider>);
        store.dispatch(addPlayer("Player 1"));
    });
    
    it ('button should not be visible unless at least two players are added', () => {
        appWrapper.update();
        expect(appWrapper.find('button.btn-outline-primary').exists()).toBeFalsy();
    });

    it ('as event', () => {
        store.dispatch(addPlayer('Player 2'));
        appWrapper.update();
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(store.getState().started).toBeTruthy();
    });
});

describe ('reset game', () => {
    let appWrapper;
    beforeEach (() => {
        appWrapper = mount(<Provider store={store}><App /></Provider>);
        store.dispatch(addPlayer("Player One"));
        store.dispatch(addPlayer("Player Two"));
        store.dispatch(startGame());
        confirmStub.reset();
    });

    it ('when game is not over', () => {
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(confirmStub.calledOnce).toEqual(true);
    });

    it ('when game is over', () => {
        forEach(store.getState().balls, (ball) => {
            store.dispatch(port(ball.number));
        });
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(confirmStub.called).toEqual(false);
        expect(store.getState()).toEqual(defaultGameState());
    });
});

describe('play', () => {
  let appWrapper;
  beforeEach(() => {
    appWrapper = mount(<Provider store={store}><App/></Provider>);
    store.dispatch(addPlayer("Player One"));
    store.dispatch(addPlayer("Player Two"));
    store.dispatch(startGame());
  });

  describe ('player one hits a ball', () => {
    beforeEach(() => {
      appWrapper.find('button.btn-block.btn-info').simulate('click');
    });

    it ("player one should have zero points", () => {
      expect(store.getState().players[0].score).toBe(0);
    });

    it ("player 2 should be the current player", () => {
      expect(getCurrentPlayer(store.getState().players)).toBe(1);
    });

    it ("the current ball should be 3", () => {
      expect(getCurrentBall(store.getState().balls)).toBe(3);
    });
  });

  describe ('player one ports a ball', () => {
    beforeEach(() => {
      appWrapper.find('button.btn-block.btn-success').simulate('click');
      appWrapper.find('button.btn-ball').first().simulate('click');
    });
    it ("player one should have some points", () => {
      expect(store.getState().players[0].score).toBeGreaterThan(0);
    });
    it ("player one should be the current player", () => {
      expect(getCurrentPlayer(store.getState().players)).toBe(0);
    });
    it ("the current ball should be 4", () => {
      expect(getCurrentBall(store.getState().balls)).toBe(4);
    });

  });

  describe ("Player One misses the ball on the first move", () => {
    beforeEach(() => {
      appWrapper.find('button.btn-block.btn-danger').first().simulate('click');
    });
    it ("player one should have 0 points since none has been ported", () => {
      expect(store.getState().players[0].score).toEqual(0);
    });
    it ("player two should be the current player", () => {
      expect(getCurrentPlayer(store.getState().players)).toBe(1);
    });
    it ("the current ball should be the same", () => {
      const originalBall = getCurrentBall(store.getState().balls);
      expect(getCurrentBall(store.getState().balls)).toBe(originalBall);
    });
  });


  describe ("Player One misses the ball when one has been ported", () => {
    let originalBall;

    beforeEach(() => {
      store.dispatch(hit());
      store.dispatch(port(7));
      store.dispatch(hit());
      appWrapper.update();
      originalBall = getCurrentBall(store.getState().balls);
      appWrapper.find('button.btn-block.btn-danger').first().simulate('click');
    });

    it ("player one should have < 0 points since one has been ported already", () => {
      expect(store.getState().players[0].score).toBe(-1 * store.getState().balls[originalBall].points);
    });
  });

  describe ("Player One hits the wrong ball on the first move", () => {
    let originalBall;
    beforeEach(() => {
      originalBall = getCurrentBall(store.getState().balls);
      appWrapper.find('button.btn-block.btn-danger').at(1).simulate('click');
      appWrapper.find('button.btn-ball').at(1).simulate('click');
    });
    it ('player one should have zero points', () => {
      expect(store.getState().players[0].score).toEqual(0);
    });
    it ('player two should be the current player', () => {
      expect(getCurrentPlayer(store.getState().players)).toBe(1);
    });
    it ('the current balls should be the same', () => {
      expect(getCurrentBall(store.getState().balls)).toBe(originalBall);
    });

  });

  describe ('Player One hits the wrong ball when one has been ported', () => {
    beforeEach(() => {
      store.dispatch(hit());
      store.dispatch(port(6));
      store.dispatch(hit());
      appWrapper.find('button.btn-block.btn-danger').at(1).simulate('click');
      appWrapper.find('button.btn-ball').at(1).simulate('click');
    });
    it ("player one should have < 0 points since one has been ported already", () => {
      expect(store.getState().players[0].score).toEqual(-4);
    });
  });

  describe('Player ports the current ball and then ports the white ball', () => {
    it ('as event', () => {
      appWrapper.find('button.btn-danger').at(2).simulate('click');
      expect(store.getState().balls[3].active).toEqual(false);
      expect(store.getState().players[0].score).toEqual(0);
    });
  });
});



