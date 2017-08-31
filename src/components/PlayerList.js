import React from 'react';
import Button from './Button';
import { connect } from "react-redux";
import { deletePlayer } from "../actions";

let PlayerList = (props) => {
  const isLeaderboard = !props.hasOwnProperty('onDelete');
  return (
    <div>
      <table className="table table-inverse">
        <tbody>
        {props.players.map((player, i) => {
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