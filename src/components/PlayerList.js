import React from 'react';
import Button from './Button';

export default function PlayerList(props) {
    const isLeaderboard = !props.hasOwnProperty('onDelete');
    return (
        <div>
            <table className="table table-inverse">
                <tbody>
                {props.players.map((player, i) => {
                    let className = !player.active
                        ? 'text-muted eliminated-player'
                        : (i === props.currentPlayer && !isLeaderboard ? 'bg-info current-player' : '');

                    return <tr key={i} className={className}>
                        <td>{player.name}:</td>
                        <td className="text-right">
                            {player.points} &nbsp;
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
