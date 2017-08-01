import React from 'react';
import ReactDOM from 'react-dom';
import App, { Button, PlayerForm, PlayerList } from './App';
import { mount } from 'enzyme';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

test('App has correct defaults when started', () => {
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
   expect(app.defaultGameState()).toEqual(defaultState);
});

test('addPlayer actually adds a player', () => {
    const name = "Topher";
    //const app = mount(<App />);
    const app = new App;
    app.setState = function(object) {
        Object.assign(this.state, object);
    };
    //app.find('form').simulate('submit');
    app.addPlayer(name);
    expect(app.state.players[0]).toEqual( { name: name, points: 0, active: true });
});


