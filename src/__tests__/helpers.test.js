import * as Helpers from '../helpers';

describe('testing helpers', () => {
  let players;
  let balls;
  beforeEach(() => {
    players = [
      { name: "Player 1", score: 100, active: true, current: true },
      { name: "Player 2", score: 10, active: true, current: false },
      { name: "Player 3", score: 90, active: false, current: false },
    ];
    balls = {
      1: { number: 1, points: 1, active: true, current: true },
      2: { number: 2, points: 2, active: false, current: false },
      3: { number: 3, points: 3, active: true, current: false },
      4: { number: 4, points: 4, active: true, current: false },
      5: { number: 5, points: 5, active: true, current: false },
      6: { number: 6, points: 6, active: true, current: false },
      7: { number: 7, points: 7, active: true, current: false },
      8: { number: 8, points: 8, active: true, current: false },
    }
  });
  it ('refreshactiveplayers', () => {
    players = Helpers.refreshActivePlayers(players, 20);
    expect(players).toEqual([
      { name: "Player 1", score: 100, active: true, current: true },
      { name: "Player 2", score: 10, active: false, current: false },
      { name: "Player 3", score: 90, active: true, current: false },
    ]);
  });

  it ('pointsLeft', () => {
    expect(Helpers.pointsLeft(balls)).toBe(34);
  });

  it ('current Player', () => {
    expect(Helpers.getCurrentPlayer(players)).toBe(0);
    players[0].current = false;
    players[1].current = true;
    expect(Helpers.getCurrentPlayer(players)).toBe(1);
  });

  it ('current ball', () => {
    expect(Helpers.getCurrentBall(balls)).toEqual(1);
    balls[1].current = false;
    balls[3].current = true;
    expect(Helpers.getCurrentBall(balls)).toEqual(3);
  });

  it ('switch to next player', () => {
    players = Helpers.switchNextPlayer(players, 0);
    expect(Helpers.getCurrentPlayer(players)).toEqual(1);
    players = Helpers.switchNextPlayer(players, 1);
    expect(Helpers.getCurrentPlayer(players)).toEqual(0);
  });

  it ('switch to next ball', () => {
    balls = Helpers.switchNextBall(balls, 1);
    expect(Helpers.getCurrentBall(balls)).toEqual(1);
    balls[1].active = false;
    balls = Helpers.switchNextBall(balls, 1);
    expect(Helpers.getCurrentBall(balls)).toEqual(3);
    balls[3].current = false;
    balls[8].current = true;
    balls[8].active = false;
    balls = Helpers.switchNextBall(balls, 8);
    expect(Helpers.getCurrentBall(balls)).toEqual(3);
  });

  it('balls ported', () => {
    expect(Helpers.ballPorted(balls)).toBe(true);
  })
});