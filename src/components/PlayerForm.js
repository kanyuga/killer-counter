import React from 'react';
import { connect } from 'react-redux';
import { addPlayer } from '../actions';

let PlayerForm  = ({dispatch}) => {
  let input;
  return (
    <form onSubmit={e => {
      e.preventDefault();
      if (input.value.trim()) {
        dispatch(addPlayer(input.value));
        input.value = '';
      }
    }}>
      <div className="input-group">
        <input className="form-control"
               id="player_name"
               name="player_name"
               placeholder="Enter Name"
               required
               autoFocus
               ref={ node => { input = node }}
        />
        <span className="input-group-btn">
          <button className="btn btn-primary" type="submit">
              Add Player
          </button>
        </span>
      </div>
    </form>
  );
};

PlayerForm = connect()(PlayerForm);

export default PlayerForm;