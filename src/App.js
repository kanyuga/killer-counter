import React, {Component} from 'react';

import * as _ from 'lodash';

import BallGrid from './components/BallGrid';
import Button from './components/Button';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import PlayerModal from './components/PlayerModal';

import './App.css';

class App extends Component {

    ballCount = 15;

    constructor(props) {
        super(props);
        this.state = this.defaultGameState();
    }

    componentWillUpdate(nextProps, nextState) {
        // hook into this lifecycle event to save state in 
        // localstorage
        if (window.localStorage) {
            window.localStorage.setItem('state', JSON.stringify(nextState));
        }
    }

    defaultGameState = () =>  {
        // check if we'd initial state stored
        if (window.localStorage) {
            let state = window.localStorage.getItem('state');
            if (state) {
                try {
                    return JSON.parse(state);
                } catch (e) {
                    console.error('Invalid `state` string');
                }
            }
        }

        const balls = {};

        for (let i = 1; i <= this.ballCount; i++) {
            balls[i] = {
                active: true,
                points: (i < 3 ? i + this.ballCount : (i === 3 ? 6 : i))
            }
        }

        return {
            players: [],
            balls: balls,
            currentBall: 3,
            currentPlayer: 0,
            ballGridActive: false,
            ballGridLegal: null,
            gameStarted: false,
            playLog: [],
            history: []
        };
    };

    setGameState = (newState) => {
        const history = this.state.history.slice();
        let newHistoryEntry = Object.assign(_.cloneDeep(this.state), newState);
        delete newHistoryEntry.history;
        //stringify to remove references. _.cloneDeep didn't work here for an unknown reason
        history.push(JSON.stringify(newHistoryEntry));
        newState.history = history;
        this.setState(newState);
    };

    maxScore = (players) => {
        let maxScore = players[0].points;
        _.forEach(players, (player) => {
            maxScore = Math.max(maxScore, player.points);
        });
        return maxScore;
    };

    pointsLeft = (balls) => {
        let pointsLeft = 0;
        for (let i = 1; i <= this.ballCount; i++) {
            if (balls[i].active) {
                pointsLeft += balls[i].points;
            }
        }
        return pointsLeft;
    };

    refreshActivePlayers = (players, balls)  => {
        const maxScore = this.maxScore(players);
        const pointsLeft = this.pointsLeft(balls);
        for (let i = 0; i < players.length; i++) {
            players[i].active = (players[i].points + pointsLeft) >= maxScore;
        }
        return players;
    };

    addPlayer = (name) => {
        const players = this.state.players.slice();
        players.push({
            name: name,
            active: true,
            points: 0
        });
        this.setState({ players: players });
    };

    deletePlayer = (index) => {
        let players = this.state.players.slice();
        const name = players[index].name;
        players.splice(index, 1);
        const newState = {
            players: players
        };

        if (this.state.gameStarted) {
            if (this.state.players.length > 1) {
                if (window.confirm(`Remove ${name}?`)) {
                    if (this.state.currentPlayer > index) {
                        newState.currentPlayer = this.state.currentPlayer - 1
                    }

                    if (this.state.currentPlayer === index && players.length > 0) {
                        newState.currentPlayer = this.getNextPlayer(players, this.state.currentPlayer - 1);
                    }

                    newState.playLog = this.addLogEntry(`${name} removed`);

                    this.setGameState(newState);
                }
            }
            else {
                window.alert('The last player cannot be removed. Use the start game button.');
            }
        }
        else {
            this.setState({ players: players });
        }
    };

    getNextBall = (balls) => {
        let nextBall = this.state.currentBall;
        let counter = 0;
        while (!balls[nextBall].active && counter < this.ballCount) {
            nextBall = (nextBall % this.ballCount) + 1;
            counter++;
        }
        return nextBall;
    };

    getNextPlayer = (players, currentPlayer = this.state.currentPlayer) => {
        let nextPlayer = (currentPlayer + 1) % players.length;
        while (!players[nextPlayer].active) {
            nextPlayer = (nextPlayer + 1) % players.length;
        }
        return nextPlayer;
    };

    showBallGrid = (legalPort) => {
        this.setState({ballGridActive: true, ballGridLegal: legalPort});
    };

    play = (type, number=this.state.currentBall) => {
        const typeLog = {
            hit: 'hit',
            foulHit: 'foul hit',
            port: 'ported',
            miss: 'missed',
            portCurrentBallAndWhiteBall: `ported ${this.state.currentBall} and then ported the white ball`
        };
        let players = this.state.players.slice();
        let currentPlayer = this.state.players[this.state.currentPlayer];
        const balls = Object.assign({}, this.state.balls);

        let logEntry = `${currentPlayer.name} ${typeLog[type]} ${number || this.state.currentBall}`;

        if (type === 'portCurrentBallAndWhiteBall') {
            logEntry = `${currentPlayer.name} ${typeLog[type]}`;
        }

        const state = {
            currentPlayer: this.getNextPlayer(this.state.players),
            ballGridActive: false,
            playLog: this.addLogEntry(logEntry, type),
        };
        
        switch(type) {
            case 'foulHit':
                currentPlayer = players[this.state.currentPlayer];
                if (this.ballHasBeenPorted(this.state.balls)) {
                    const foulBall = this.state.balls[number];
                    currentPlayer.points -= foulBall.points;
                    players = this.refreshActivePlayers(players, this.state.balls);
                }
                // update state
                Object.assign(state, {
                    players,
                    currentPlayer: this.getNextPlayer(players),
                    ballGridActive: false,
                });
                break;
            
            case 'port':
                const portedBall = balls[number];
                currentPlayer = players[this.state.currentPlayer];
                currentPlayer.points += portedBall.points;
                portedBall.active = false;
                players = this.refreshActivePlayers(players, balls);

                Object.assign(state, {
                    players,
                    balls,
                    currentBall: this.getNextBall(balls),
                    ballGridActive: false,
                    currentPlayer: this.state.currentPlayer
                });
                break;
            
            case 'miss':
                currentPlayer = players[this.state.currentPlayer];
                if (this.ballHasBeenPorted(balls)) {
                    const missedBall = balls[this.state.currentBall];
                    currentPlayer.points -= missedBall.points;
                    players = this.refreshActivePlayers(players, balls);
                }

                Object.assign(state, {
                    players,
                    balls,
                    currentPlayer: this.getNextPlayer(players),
                    ballGridActive: false,
                });
                break;

            case 'portCurrentBallAndWhiteBall':
                const currentBall = balls[this.state.currentBall];
                currentBall.active = false;
                Object.assign(state, {
                    currentPlayer: this.getNextPlayer(players),
                    currentBall: this.getNextBall(balls)
                });
                break;
            default:
                break;
        }
        
        this.setGameState(state);
    };

    ballHasBeenPorted = (balls) => {
        let ballHasBeenPorted = false;
        _.forOwn(balls, (ball) => {
            if (!ball.active) {
                ballHasBeenPorted = true;
                return false;
            }
        });
        return ballHasBeenPorted;
    };

    winner = () => {
        const maxScore = this.maxScore(this.state.players);
        return this.state.players.filter((player) => player.points === maxScore)[0];
    };

    gameOver = () => {
        return this.pointsLeft(this.state.balls) === 0;
    };

    startGame = () => {
        this.setGameState({
            gameStarted: true,
            playLog: this.addLogEntry("Game Started")
        });
    };

    addLogEntry = (log, type='none') => {
        const playLog = this.state.playLog.slice();
        playLog.push({ log, type });
        return playLog;
    };

    undo = () => {
        const history = this.state.history.slice(0, -1);
        const prevState = JSON.parse(history[history.length - 1]);
        prevState.history = history;
        this.setState(prevState);
    };

    resetGame = () => {
        if (this.gameOver() || window.confirm('Start New Game? This cannot be undone')) {
            // reset localStorage
            if (window.localStorage) window.localStorage.clear();
            this.setState(this.defaultGameState());
        }
    };

    render() {
        let display;
        const playerForm = <PlayerForm onSubmit={this.addPlayer}/>;
        if (this.state.gameStarted) {
            if (this.gameOver()) {
                display = (
                    <div className="action-section">
                        <h1>{this.winner().name} Wins!</h1>
                    </div>
                );
            } else {
                display = (
                    <div className="action-section">
                        <h3>Current Player: <span className="current-player">{this.state.players[this.state.currentPlayer].name}</span></h3>
                        <h3>Current Ball: {this.state.currentBall}</h3>

                        <Button onClick={() => this.showBallGrid(true)} size="lg" block context="success" title="Port"/>
                        {this.state.ballGridActive && this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={true} onClick={(number) => this.play('port', number)}/> :
                            null
                        }
                        <Button onClick={() => this.play('hit')} size="lg" block context="info" title="Hit" />
                        <Button onClick={() => this.play('miss')} size="lg" block context="danger" title="Miss" />
                        <Button onClick={() => this.showBallGrid(false)} size="lg" block context="danger" title="Foul Hit" />
                        { this.state.ballGridActive && !this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={false} onClick={(number) => this.play('foulHit', number)}/> :
                            null
                        }
                        <Button onClick={() => this.play('portCurrentBallAndWhiteBall')} size="lg" block context="danger" title={`Port #${this.state.currentBall} and white ball`} />
                    </div>
                );
            }
        }
        else {
            display = (
                <div className="action-section">
                    <h3>Add Players</h3>
                    { playerForm }
                    { this.state.players.length > 1
                        ? <Button onClick={this.startGame} block outline context="primary" title="Start Game"/>
                        : null }
                </div>
            );
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
                    { display }
                    </div>
                    <div className="col-sm-6">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link active" data-toggle="tab" href="#player-list" role="tab">Players</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#leaderboard" role="tab">Leaderboard</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#play-log" role="tab">Log</a>
                            </li>
                        </ul>

                        <div className="tab-content">
                            <div className="tab-pane active" id="player-list" role="tabpanel">
                                <PlayerList
                                    players={this.state.players}
                                    onDelete={this.deletePlayer}
                                    currentPlayer={this.state.currentPlayer}
                                />
                                {this.state.gameStarted
                                    ? <div>
                                        <Button onClick = {this.resetGame} outline context="primary" title="New Game"/>
                                        &nbsp;
                                        <button type="button" className="btn btn-outline-info" data-toggle="modal" data-target="#playerModal">
                                            Add Players
                                        </button>
                                        <PlayerModal>
                                            { playerForm }
                                        </PlayerModal>
                                    </div>
                                    : null }
                            </div>
                            <div className="tab-pane" id="leaderboard" role="tabpanel">
                                <PlayerList
                                    players={this.state.players.slice().sort((a, b) => {
                                        return a.points < b.points ? 1 : a.points > b.points ? -1 : 0;
                                    })}
                                    currentPlayer={this.state.currentPlayer}
                                />
                            </div>
                            <div className="tab-pane" id="play-log" role="tabpanel">
                                <ol className="play-log">
                                    {this.state.playLog.map((playLog, i) => <li className={playLog.type} key={i}>{ playLog.log }</li>)}
                                </ol>
                                { this.state.history.length > 1
                                    ? <Button onClick = { this.undo } block outline context="warning" title='Undo'/>
                                    : null
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
