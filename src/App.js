import React, {Component} from 'react';
import './App.css';
import * as _ from "lodash";


class BallGrid extends Component {
    render() {
        let buttons = [];

        const className = this.props.legal ? 'btn-outline-success' : 'btn-outline-warning';

        _.forOwn(this.props.balls, (ball, number) =>
            buttons.push(<div key={number} className="col-sm-4 text-center">
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
                        let className = !player.active ? 'text-muted' : (i === this.props.currentPlayer ? 'table-info' : '');

                        return <tr key={i} className={className}>
                            <th>{player.name}:</th>
                            <td>{player.points}</td>
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
        const balls = {};
        const players = [];
        const names = 'ABCDE';
        for (let i = 0; i < names.length; i++) {
            players.push({
                name: names[i],
                points: 0,
                active: true
            });
        }

        for (let i = 1; i <= this.ballCount; i++) {
            balls[i] = {
                active: true,
                points: (i < 3 ? i + this.ballCount : (i === 3 ? 6 : i))
            }
        }

        this.state = {
            players: players,
            balls: balls,
            currentBall: 3,
            currentPlayer: 0,
            ballGridActive: false,
            ballGridLegal: null
        }
    }

    getNextBall = (balls) => {
        let nextBall = this.state.currentBall;
        while (!balls[nextBall].active) {
            nextBall = (nextBall % this.ballCount) + 1;
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
            currentPlayer: (this.state.currentPlayer + 1) % this.state.players.length,
            ballGridActive: false
        });
    };

    foulHit = (number) => {
        const foulBall = this.state.balls[number];
        const players = this.state.players.slice();
        const current_player = players[this.state.currentPlayer];
        current_player.points -= foulBall.points;
        this.setState({
            players: players,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false
        })

    };

    port = (number) => {
        const players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const current_player = players[this.state.currentPlayer];
        const ported_ball = balls[number];
        current_player.points += ported_ball.points;
        ported_ball.active = false;
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
        const players = this.state.players.slice();
        const balls = Object.assign({}, this.state.balls);
        const current_player = players[this.state.currentPlayer];
        const current_ball = balls[this.state.currentBall];
        current_player.points -= current_ball.points;
        this.setState({
            players: players,
            balls: balls,
            currentPlayer: this.getNextPlayer(players),
            ballGridActive: false
        });
    };

    render() {

        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">
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
                        <button onClick={() => this.showBallGrid(false) }
                                className={'btn btn-danger btn-lg btn-block' + (this.state.ballGridActive ? ' active' : '')}>
                            Foul Hit
                        </button>
                        {this.state.ballGridActive && !this.state.ballGridLegal ?
                            <BallGrid balls={this.state.balls} legal={false} onClick={this.foulHit}/> :
                            null
                        }
                    </div>
                    <div className="col-sm-3">
                        <PlayerList players={this.state.players} currentPlayer={this.state.currentPlayer}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
