import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../App';
import { mount } from 'enzyme';
import * as sinon from "sinon";
import { forEach } from "lodash";
import { gameApp } from "../reducers";
import {defaultGameState} from "../helpers";
import {createStore} from "redux";
import {addPlayer, startGame} from "../actions";

let confirmStub;
let storageStub;
let store;
let initialState;
beforeAll(() => {
   confirmStub = sinon.stub(window, 'confirm');
   confirmStub.returns(true);
   initialState = defaultGameState();
   store = createStore(gameApp, initialState);
});

afterAll(() => {
    confirmStub.restore();
});

it ('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><App /></Provider>, div);
});

describe ('add player', () => {
    const name = "Topher";
    let app;
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
    let app;
    beforeEach(() => {
        [1, 2, 3, 4].forEach((i) => { store.dispatch(addPlayer("Player "+i))})
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
        appWrapper.update();
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
    let app;
    beforeEach (() => {
        appWrapper = mount(<Provider store={store}><App /></Provider>);
        app = appWrapper.node;
        store.dispatch(addPlayer("Player One"));
        store.dispatch(addPlayer("Player Two"));
        store.dispatch(startGame());
        confirmStub.reset();
    });

    it ('as event when game is not over', () => {
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(confirmStub.calledOnce).toEqual(true);
        //expect(app.state).toEqual(app.defaultGameState()); //Not working for some reason
    });

    it ('as event when game is over', () => {
        forEach(store.getState().balls, (ball) => {
            ball.active = false;
        });
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(confirmStub.called).toEqual(false);
        expect(app.state).toEqual(app.defaultGameState());
    });
});

describe ('player one hits a ball', () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    app.addPlayer("Player 1");
    app.addPlayer("Player 2");
    store.dispatch(startGame());
    appWrapper.find('button.btn-block.btn-info').simulate('click');
    it ("player one should have zero points", () => {
        expect(store.getState().players[0].points).toBe(0);
    });

    it ("player 2 should be the current player", () => {
        expect(store.getState().currentPlayer).toBe(1);
    });

    it ("the current ball should be 3", () => {
        expect(store.getState().currentBall).toBe(3);
    });
});

describe ('player one ports a ball', () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    const app = appWrapper.node;
    store.dispatch(addPlayer("Player One"));
    store.dispatch(addPlayer("Player Two"));
    store.dispatch(startGame());
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-success').simulate('click');
    appWrapper.find('button.btn-ball').first().simulate('click');
    it ("player one should have some points", () => {
        expect(store.getState().players[0].points).toBeGreaterThan(0);
    });
    it ("player one should be the current player", () => {
        expect(store.getState().currentPlayer).toBe(0);
    });
    it ("the current ball should be 4", () => {
        expect(store.getState().currentBall).toBe(4);
    });

    it ("ballHasBeenPorted should be true", () => {
        expect(app.ballHasBeenPorted(store.getState().balls)).toBeTruthy();
    });
});

describe ("Player One misses the ball on the first move", () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    store.dispatch(addPlayer("Player One"))
    store.dispatch(addPlayer("Player Two"))
    store.dispatch(startGame());
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-danger').first().simulate('click');
    const originalBall = store.getState().currentBall;
    it ("player one should have 0 points since none has been ported", () => {
       expect(appWrapper.state('players')[0].points).toEqual(0);
    });
    it ("player two should be the current player", () => {
       expect(store.getState().currentPlayer).toBe(1);
    });
    it ("the current ball should be the same", () => {
        expect(store.getState().currentBall).toBe(originalBall);
    });


});

describe ("Player One misses the ball when one has been ported", () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    const app = appWrapper.node;
    store.dispatch(addPlayer("Player One"))
    store.dispatch(addPlayer("Player Two"))
    store.dispatch(startGame());
    store.getState().currentPlayer = 0;
    store.getState().balls[6].active = false;
    appWrapper.update();

    const originalBall = store.getState().currentBall;

    appWrapper.find('button.btn-block.btn-danger').first().simulate('click');

    it ("player one should have < 0 points since one has been ported already", () => {
        expect(store.getState().players[0].points).toBe(-1 * store.getState().balls[originalBall].points);
    });
});

describe ("Player One hits the wrong ball on the first move", () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    const app = appWrapper.node;
    store.dispatch(addPlayer("Player One"))
    store.dispatch(addPlayer("Player Two"))
    store.dispatch(startGame());
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-danger').at(1).simulate('click');
    appWrapper.find('button.btn-ball').at(1).simulate('click');
    const originalBall = store.getState().currentBall;

    it ("player one should have 0 points since none has been ported", () => {
        expect(store.getState().players[0].points).toEqual(0);
    });

    it ("player 2 should be the current player", () => {
        expect(store.getState().currentPlayer).toBe(1);
    });

    it ("the current ball should be 3", () => {
        expect(store.getState().currentBall).toBe(originalBall);
    });
});

describe ('Player One hits the wrong ball when one has been ported', () => {
    const appWrapper = mount(<Provider store={store}><App /></Provider>);
    const app = appWrapper.node;
    store.dispatch(addPlayer("Player One"))
    store.dispatch(addPlayer("Player Two"))
    store.dispatch(startGame());
    store.getState().currentPlayer = 0;
    store.getState().balls[6].active = false;
    appWrapper.update();

    appWrapper.find('button.btn-block.btn-danger').at(1).simulate('click');
    appWrapper.find('button.btn-ball').at(1).simulate('click');

    it ("player one should have < 0 points since one has been ported already", () => {
        expect(store.getState().players[0].points).toEqual(-4);
    });
});

describe('Player ports the current ball and then ports the white ball', () => {
    let appWrapper;
    let app;
    beforeEach (() =>{
        appWrapper = mount(<Provider store={store}><App /></Provider>);
        app = appWrapper.node;
        store.dispatch(addPlayer("Player One"))
        store.dispatch(addPlayer("Player Two"))
        store.dispatch(startGame());
    });
    it ('as function', () => {
        app.play('portCurrentBallAndWhiteBall');
        const state = app.state;
        expect(state.currentPlayer).toEqual(1);
        expect(state.balls[3].active).toEqual(false);
        expect(state.players[0].points).toEqual(0);
        expect(state.currentBall).toEqual(4);
    });
    it ('as event', () => {
        appWrapper.find('button.btn-danger').at(2).simulate('click');
        const state = app.state;
        expect(state.currentPlayer).toEqual(1);
        expect(state.balls[3].active).toEqual(false);
        expect(state.players[0].points).toEqual(0);
        expect(state.currentBall).toEqual(4);
    });
});