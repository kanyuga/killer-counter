import React from 'react';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import {foulPort, port} from "../actions";
import {connect} from "react-redux";

let BallGrid = (props) => {
  let buttons = [];

  let className = props.legal ? 'btn-success' : 'btn-danger';

  _.forOwn(props.balls, (ball, number) =>
    buttons.push(<div key={number} className="col-4 text-center">
      <button
        className={'btn btn-ball ' + (ball.active ? className : 'btn-disabled')}
        disabled={ !ball.active }
        onClick={() => {props.onClick(number)}} >
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
  balls: PropTypes.shape().isRequired,
  legal: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({ balls: state.balls });
const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: number => ownProps.legal ? dispatch(port(number)) : dispatch(foulPort(number))
});

BallGrid = connect(mapStateToProps, mapDispatchToProps)(BallGrid);

export default BallGrid;