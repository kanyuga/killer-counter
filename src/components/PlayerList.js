import React from 'react';
import Button from './Button';
import { connect } from "react-redux";
import { deletePlayer } from "../actions";

let PlayerList = (props) => {
  let players = props.players.slice();
  const isLeaderboard = props.hasOwnProperty('sorted');
  if (isLeaderboard) {
    players = players.sort((player1, player2) => player2.score - player1.score);
  }
  return (
    <div>
      <table className="table table-inverse">
        <tbody>
        {players.map((player, i) => {
          let className = !player.active
            ? 'text-muted eliminated-player'
            : (player.current && !isLeaderboard ? 'bg-info current-player' : '');

          return <tr key={i} className={className}>
            <td>{player.name}:</td>
            <td className="text-right">
              {player.score} &nbsp;
              {!isLeaderboard
                ? <Button onClick={() => props.onDelete(i)} title="&times;" context="danger" size="sm"/>
                : null
              }
            </td>
          </tr>
        })}
        </tbody>
      </table>
    </div>
  );
};

const mapStateToProps = state => ({ players: state.players });
const mapDispatchToProps = dispatch => ({ onDelete: id => dispatch(deletePlayer(id))});

PlayerList = connect(mapStateToProps, mapDispatchToProps)(PlayerList);
export default PlayerList;