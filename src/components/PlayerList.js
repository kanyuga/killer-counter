import React from 'react';

export default function PlayerList(props) {
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
