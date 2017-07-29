import React, {Component} from 'react';
import './App.css';
import * as _ from "lodash";


class PlayerForm extends Component {

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
                    <input className="form-control" id="player_name" name="player_name" placeholder="Enter Name" required autoFocus={true} />
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

class BallGrid extends Component {
    render() {
        let buttons = [];

        const className = this.props.legal ? 'btn-outline-success' : 'btn-outline-warning';

        _.forOwn(this.props.balls, (ball, number) =>
            buttons.push(<div key={number} className="col-4 text-center">
                <button
                    className={'btn btn-ball ' + (ball.active ? className : 'btn-disabled')}
                    disabled={ !ball.active }
                    onClick={() => { this.props.onClick(number)}} >
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
    }
}

class PlayerList extends Component {
    render() {

        return (
            <div>
                <h3>Score Card</h3>
                <table className="table">
                    <tbody>
                    {this.props.players.map((player, i) => {
                        let className = !player.active ? 'text-muted eliminated-player' : (i === this.props.currentPlayer ? 'table-info current-player' : '');

                        return <tr key={i} className={className}>
                            <td>{player.name}:</td>
                            <td className="text-right">{player.points}</td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
}

class App extends Component {

    ballCount = 15;

    constructor(props) {
        super(props);
        this.state = this.defaultGameState();
    }

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

    refreshActivePlayers(players, balls) {
        const maxScore = this.maxScore(players);
        const pointsLeft = this.pointsLeft(balls);
        for (let i = 0; i < players.length; i++) {
            players[i].active = (players[i].points + pointsLeft) >= maxScore;
        }
        return players;
    }

    addPlayer = (name) => {
        const players = this.state.players;
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

    hit = () => {
        this.setState({
            currentPlayer: this.getNextPlayer(this.state.players),
            ballGridActive: false
        });
    };

    foulHit = (number) => {
        const foulBall = this.state.balls[number];
        let players = this.state.players.slice();
        const current_player = players[this.state.currentPlayer];
        current_player.points -= foulBall.points;
        players = this.refreshActivePlayers(players, this.state.balls);
        this.setState({
            players: players,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false
        })

    };

    port = (number) => {
        let players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const current_player = players[this.state.currentPlayer];
        const ported_ball = balls[number];
        current_player.points += ported_ball.points;
        ported_ball.active = false;
        players = this.refreshActivePlayers(players, balls);
        this.setState({
            players: players,
            balls: balls,
            currentBall: this.getNextBall(balls),
            ballGridActive: false
        });
    };

    showBallGrid = (legalPort) => {
        this.setState({ballGridActive: true, ballGridLegal: legalPort});
    };

    miss = () => {
        let players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const current_player = players[this.state.currentPlayer];
        const current_ball = balls[this.state.currentBall];
        current_player.points -= current_ball.points;
        players = this.refreshActivePlayers(players, balls);
        this.setState({
            players: players,
            balls: balls,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false
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
        this.setState({
            gameStarted: true
        });
    };

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
            gameStarted: false
        };
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

                        <button onClick={() => this.showBallGrid(true)}
                                className="btn btn-success btn-lg btn-block">
                            Port
                        </button>
                        {this.state.ballGridActive && this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={true} onClick={this.port}/> :
                            null
                        }
                        <button onClick={this.hit} className="btn btn-info btn-lg btn-block">Hit</button>
                        <button onClick={this.miss} className="btn btn-danger btn-lg btn-block">Miss</button>
                        <button onClick={() => this.showBallGrid(false)}
                                className={'btn btn-danger btn-lg btn-block' + (this.state.ballGridActive ? ' active' : '')}>
                            Foul Hit
                        </button>
                        {this.state.ballGridActive && !this.state.ballGridLegal ?
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
                        ? <button onClick={this.startGame} className="btn btn-block btn-outline-primary">Start Game</button>
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
                        <PlayerList players={this.state.players} currentPlayer={this.state.currentPlayer}/>

                        {this.state.gameStarted
                            ? <button onClick={this.resetGame} className="btn btn-block btn-outline-primary">New Game</button>
                            : null }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
