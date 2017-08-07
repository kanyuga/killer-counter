import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { mount } from 'enzyme';

it ('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

test ('App has correct defaults when started', () => {
   let app = new App;

   const defaultState = {
       players: [],
       balls: {
           '1': { active: true, points: 16 },
           '2': { active: true, points: 17 },
           '3': { active: true, points: 6 },
           '4': { active: true, points: 4 },
           '5': { active: true, points: 5 },
           '6': { active: true, points: 6 },
           '7': { active: true, points: 7 },
           '8': { active: true, points: 8 },
           '9': { active: true, points: 9 },
           '10': { active: true, points: 10 },
           '11': { active: true, points: 11 },
           '12': { active: true, points: 12 },
           '13': { active: true, points: 13 },
           '14': { active: true, points: 14 },
           '15': { active: true, points: 15 }
       },
       currentBall: 3,
       currentPlayer: 0,
       ballGridActive: false,
       ballGridLegal: null,
       gameStarted: false,
       playLog: [],
       history: [] };
   expect(app.state).toEqual(defaultState);
});

test('ballHasBeenPorted', () => {
    const app = new App;
    const balls = {
        1 : { active: true },
        2 : { active: true }
    };
   expect(app.ballHasBeenPorted(balls)).toBeFalsy();
   balls[1].active = false;
   expect(app.ballHasBeenPorted(balls)).toBeTruthy();
});

describe ('add player', () => {
    const name = "Topher";
    let app;
    let appWrapper;
    beforeEach (() => {
        appWrapper = mount(<App/>);
        app = appWrapper.node;
    });
    it ('as function', () => {
        app.addPlayer(name);
        expect(app.state.players[0]).toEqual( { name: name, points: 0, active: true });
    });
    it ('as event', () => {
        const input = appWrapper.find('#player_name');
        input.node.value = name;
        input.simulate('change');
        appWrapper.find('form').simulate('submit');
        expect(app.state.players[0]).toEqual( { name: name, points: 0, active: true });
    });
});

describe ('start game', () => {
    let appWrapper;
    let app;
    beforeEach(() => {
        appWrapper = mount(<App />);
        app = appWrapper.node;
        app.state.players = [{ name: "Topher", points: 0, active: true }];
    });
    it('as function', () => {
        app.startGame();
        expect(app.state.gameStarted).toBeTruthy();
    });

    it ('button should not be visible unless at least two players are added', () => {
        appWrapper.update();
        expect(appWrapper.find('button.btn-outline-primary').exists()).toBeFalsy();
    });

    it ('as event', () => {
        app.state.players.push({ name: "Player 2", points: 0, active: true });
        appWrapper.update();
        appWrapper.find('button.btn-outline-primary').simulate('click');
        expect(app.state.gameStarted).toBeTruthy();
    });
    it ('ballHasBeenPorted should be false', () => {
        app.startGame();
        expect(app.ballHasBeenPorted(app.state.balls)).toBeFalsy();
    });

});


describe ('player one hits a ball', () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player 1");
    app.addPlayer("Player 2");
    app.startGame();
    appWrapper.find('button.btn-block.btn-info').simulate('click');
    it ("player one should have zero points", () => {
        expect(app.state.players[0].points).toBe(0);
    });

    it ("player 2 should be the current player", () => {
        expect(app.state.currentPlayer).toBe(1);
    });

    it ("the current ball should be 3", () => {
        expect(app.state.currentBall).toBe(3);
    });
});

describe ('player one ports a ball', () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player One");
    app.addPlayer("Player Two");
    app.startGame();
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-success').simulate('click');
    appWrapper.find('button.btn-ball').first().simulate('click');
    it ("player one should have some points", () => {
        expect(app.state.players[0].points).toBeGreaterThan(0);
    });
    it ("player one should be the current player", () => {
        expect(app.state.currentPlayer).toBe(0);
    });
    it ("the current ball should be 4", () => {
        expect(app.state.currentBall).toBe(4);
    });

    it ("ballHasBeenPorted should be true", () => {
        expect(app.ballHasBeenPorted(app.state.balls)).toBeTruthy();
    });
});

describe ("Player One misses the ball on the first move", () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player One");
    app.addPlayer("Player Two");
    app.startGame();
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-danger').first().simulate('click');
    const originalBall = app.state.currentBall;
    it ("player one should have 0 points since none has been ported", () => {
       expect(appWrapper.state('players')[0].points).toEqual(0);
    });
    it ("player two should be the current player", () => {
       expect(app.state.currentPlayer).toBe(1);
    });
    it ("the current ball should be the same", () => {
        expect(app.state.currentBall).toBe(originalBall);
    });


});

describe ("Player One misses the ball when one has been ported", () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player One");
    app.addPlayer("Player Two");
    app.startGame();
    app.state.currentPlayer = 0;
    app.state.balls[6].active = false;
    appWrapper.update();

    const originalBall = app.state.currentBall;

    appWrapper.find('button.btn-block.btn-danger').first().simulate('click');

    it ("player one should have < 0 points since one has been ported already", () => {
        expect(app.state.players[0].points).toBe(-1 * app.state.balls[originalBall].points);
    });
});

describe ("Player One hits the wrong ball on the first move", () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player One");
    app.addPlayer("Player Two");
    app.startGame();
    appWrapper.update();
    appWrapper.find('button.btn-block.btn-danger').last().simulate('click');
    appWrapper.find('button.btn-ball').at(1).simulate('click');
    const originalBall = app.state.currentBall;

    it ("player one should have 0 points since none has been ported", () => {
        expect(app.state.players[0].points).toEqual(0);
    });

    it ("player 2 should be the current player", () => {
        expect(app.state.currentPlayer).toBe(1);
    });

    it ("the current ball should be 3", () => {
        expect(app.state.currentBall).toBe(originalBall);
    });
});

describe ('Player One hits the wrong ball when one has been ported', () => {
    const appWrapper = mount(<App />);
    const app = appWrapper.node;
    app.addPlayer("Player One");
    app.addPlayer("Player Two");
    app.startGame();
    app.state.currentPlayer = 0;
    app.state.balls[6].active = false;
    appWrapper.update();

    appWrapper.find('button.btn-block.btn-danger').last().simulate('click');
    appWrapper.find('button.btn-ball').at(1).simulate('click');

    it ("player one should have < 0 points since one has been ported already", () => {
        expect(app.state.players[0].points).toEqual(-4);
    });
});