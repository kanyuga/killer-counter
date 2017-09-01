import React, {Component} from 'react';
import {connect} from "react-redux";

import BallGrid from './components/BallGrid';
import Button from './components/Button';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import PlayerModal from './components/PlayerModal';

import './App.css';
import {hit, miss, newGame, portCurrentAndWhiteBall, startGame, undo} from "./actions";
import {getCurrentBall, getCurrentPlayer, getMaxScore, playLogClasses, pointsLeft} from "./helpers";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ballGridActive: false,
      ballGridLegal: false
    };
  }

  showBallGrid = (legalPort) => {
    this.setState({ballGridActive: true, ballGridLegal: legalPort});
  };

  winner = () => {
    const maxScore = getMaxScore(this.props.players);
    return this.props.players.filter((player) => player.score === maxScore)[0];
  };

  gameOver = () => {
    return pointsLeft(this.props.balls) === 0;
  };

  resetGame = () => {
    if (this.gameOver() || window.confirm('Start New Game? This cannot be undone')) {
      this.props.dispatch(newGame());
    }
  };

  render() {
    let display;
    const playerForm = <PlayerForm />;
    if (this.props.started) {
      if (this.gameOver()) {
        display = (
          <div className="action-section">
            <h1>{this.winner().name} Wins!</h1>
          </div>
        );
      } else {
        display = (
          <div className="action-section">
            <h3> Current Play: {this.props.players[getCurrentPlayer(this.props.players)].name} for #{getCurrentBall(this.props.balls)}</h3>

            <Button onClick={() => this.showBallGrid(true)} size="lg" block context="success" title="Port"/>
            {this.state.ballGridActive && this.state.ballGridLegal ?
              <BallGrid legal={true} /> :
              null
            }
            <Button onClick={() => this.props.dispatch(hit())} size="lg" block context="info" title="Hit" />
            <Button onClick={() => this.props.dispatch(miss())} size="lg" block context="danger" title="Miss" />
            <Button onClick={() => this.showBallGrid(false)} size="lg" block context="danger" title="Foul Port" />
            { this.state.ballGridActive && !this.state.ballGridLegal ?
              <BallGrid legal={false} /> :
              null
            }
            <Button onClick={() => this.props.dispatch(portCurrentAndWhiteBall())} size="lg" block context="danger" title={`Port #${getCurrentBall(this.props.balls)} and white ball`} />
          </div>
        );
      }
    }
    else {
      display = (
        <div className="action-section">
          <h3>Add Players</h3>
          { playerForm }
          { this.props.players.length > 1
            ? <Button onClick={() => this.props.dispatch(startGame())} block outline context="primary" title="Start Game"/>
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
                <PlayerList />
                {this.props.started
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
                <PlayerList sorted={true} />
              </div>
              <div className="tab-pane" id="play-log" role="tabpanel">
                <ol className="play-log">
                  {this.props.playLog.map((playLog, i) => <li className={playLogClasses[playLog.type]} key={i}>{ playLog.log }</li>)}
                </ol>
                { this.props.history.length
                  ? <Button onClick = {() => this.props.dispatch(undo()) } block outline context="warning" title='Undo'/>
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

App = connect(state => state)(App);

export default App;
