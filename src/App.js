import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';
import * as _ from "lodash";


export const Button = (props) => {
    let classNames = ['btn'];
    if (props.hasOwnProperty('block') && props.block) {
        classNames.push('btn-block');
    }
    if (props.hasOwnProperty('context') && props.context) {
        let context = props.context;
        if (props.outline) {
            context = 'outline-' + props.context;
        }
        classNames.push('btn-' + context);
    }
    if (props.hasOwnProperty('size') && props.size) {
        classNames.push('btn-' + props.size);
    }

    return <button onClick={props.onClick} className = {classNames.join(' ')}> {props.title} </button>;
};

Button.propTypes = {
    block: PropTypes.bool,
    outline: PropTypes.bool,
    context: PropTypes.oneOf(['primary', 'secondary', 'success', 'info', 'warning', 'link', 'danger']),
    size: PropTypes.oneOf(['lg', 'sm']),
    title: PropTypes.string.isRequired
};

export class PlayerForm extends Component {

    handleSubmit = (e) => {
        e.preventDefault();
        let inputField = document.getElementById("player_name");
        let name = inputField.value;
        inputField.value = null;
        this.props.onSubmit(name);
    };

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="input-group">
                    <input className="form-control"
                           id="player_name"
                           name="player_name"
                           placeholder="Enter Name"
                           required
                           autoFocus />
                    <span className="input-group-btn">
                        <button className="btn btn-primary" type="submit">
                            Add Player
                        </button>
                    </span>
                </div>
            </form>
        );
    }
}

PlayerForm.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export const BallGrid = (props) => {
    let buttons = [];

    const className = props.legal ? 'btn-outline-success' : 'btn-outline-warning';

    _.forOwn(props.balls, (ball, number) =>
        buttons.push(<div key={number} className="col-4 text-center">
            <button
                className={'btn btn-ball ' + (ball.active ? className : 'btn-disabled')}
                disabled={ !ball.active }
                onClick={() => { props.onClick(number)}} >
                {number}
            </button>
        </div>)
    );

    //push 1 & 2 to the end

    buttons = buttons.slice(2).concat(buttons.slice(0, 2));

    return (
        <div className="row">
            {buttons}
        </div>
    );
};

BallGrid.propTypes = {
    onClick: PropTypes.func.isRequired,
    balls: PropTypes.shape().isRequired

};


export const PlayerList = (props) => {
    return (
        <div>
            <h3>Score Card</h3>
            <table className="table table-inverse">
                <tbody>
                {props.players.map((player, i) => {
                    let className = !player.active
                        ? 'text-muted eliminated-player'
                        : (i === props.currentPlayer ? 'bg-info current-player' : '');

                    return <tr key={i} className={className}>
                        <td>{player.name}:</td>
                        <td className="text-right">{player.points}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    );
};

class App extends Component {

    ballCount = 15;

    constructor(props) {
        super(props);
        this.state = this.defaultGameState();
    }

    defaultGameState = () =>  {
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
        //stringify to remove references. cloneDeep didn't work here for an unknown reason
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

    getNextBall = (balls) => {
        let nextBall = this.state.currentBall;
        let counter = 0;
        while (!balls[nextBall].active && counter < this.ballCount) {
            nextBall = (nextBall % this.ballCount) + 1;
            counter++;
        }
        return nextBall;
    };

    getNextPlayer = (players) => {
        let nextPlayer = (this.state.currentPlayer + 1) % players.length;
        while (!players[nextPlayer].active) {
            nextPlayer = (nextPlayer + 1) % players.length;
        }
        return nextPlayer;
    };

    showBallGrid = (legalPort) => {
        this.setState({ballGridActive: true, ballGridLegal: legalPort});
    };

    hit = () => {
        const current_player = this.state.players[this.state.currentPlayer];
        this.setGameState({
            currentPlayer: this.getNextPlayer(this.state.players),
            ballGridActive: false,
            playLog: this.addLogEntry(current_player.name + ' hit ' + this.state.currentBall)
        });
    };

    foulHit = (number) => {
        const foulBall = this.state.balls[number];
        let players = this.state.players.slice();
        const currentPlayer = players[this.state.currentPlayer];
        currentPlayer.points -= foulBall.points;
        players = this.refreshActivePlayers(players, this.state.balls);
        this.setGameState({
            players: players,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false,
            playLog: this.addLogEntry(currentPlayer.name + ' foul hit ' + number)
        })
    };

    port = (number) => {
        let players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const currentPlayer = players[this.state.currentPlayer];
        const portedBall = balls[number];
        currentPlayer.points += portedBall.points;
        portedBall.active = false;
        players = this.refreshActivePlayers(players, balls);
        this.setGameState({
            players: players,
            balls: balls,
            currentBall: this.getNextBall(balls),
            ballGridActive: false,
            playLog: this.addLogEntry(currentPlayer.name + ' ported ' + number)
        });
    };

    miss = () => {
        let players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const currentPlayer = players[this.state.currentPlayer];
        const missedBall = balls[this.state.currentBall];
        currentPlayer.points -= missedBall.points;
        players = this.refreshActivePlayers(players, balls);
        this.setGameState({
            players: players,
            balls: balls,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false,
            playLog: this.addLogEntry(currentPlayer.name + ' missed ' + this.state.currentBall)
        });
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

    addLogEntry = (logEntry) => {
        const playLog = this.state.playLog.slice();
        playLog.push(logEntry);
        return playLog;
    };

    undo = () => {
        const history = this.state.history.slice(0, -1);
        const prevState = JSON.parse(history[history.length - 1]);
        prevState.history = history;
        this.setState(prevState);
    };

    resetGame = () => {
        this.setState(this.defaultGameState());
    };

    render() {
        let display;
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
                        <h3>Current Player: {this.state.players[this.state.currentPlayer].name}</h3>
                        <h3>Current Ball: {this.state.currentBall}</h3>

                        <Button onClick={() => this.showBallGrid(true)} size="lg" block context="success" title="Port"/>
                        {this.state.ballGridActive && this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={true} onClick={this.port}/> :
                            null
                        }
                        <Button onClick={this.hit} size="lg" block context="info" title="Hit" />
                        <Button onClick={this.miss} size="lg" block context="danger" title="Miss" />
                        <Button onClick={() => this.showBallGrid(false)} size="lg" block context="danger" title="Foul Hit" />
                        { this.state.ballGridActive && !this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={false} onClick={this.foulHit}/> :
                            null
                        }

                    </div>

                );
            }
        }
        else {
            display = (
                <div className="action-section">
                    <h3>Add Players</h3>
                    <PlayerForm onSubmit={this.addPlayer}/>

                    { this.state.players.length > 0
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
                    <div className="col-6 col-sm-3">
                        <PlayerList players={this.state.players} currentPlayer={this.state.currentPlayer}/>
                        {this.state.gameStarted
                            ? <Button onClick = {this.resetGame} block outline context="primary" title="New Game"/>
                            : null }
                    </div>
                    <div className="col-6 col-sm-3">
                        <h3>Log</h3>
                        <ul>
                            {this.state.playLog.map((playLog) => <li>{ playLog }</li>)}
                        </ul>
                        { this.state.history.length > 1
                            ? <Button onClick = { this.undo } block outline context="warning" title='Undo'/>
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
