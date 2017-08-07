import React, { Component } from 'react';

import PropTypes from 'prop-types';

export default class PlayerForm extends Component {
    constructor (props) {
        super(props);
        this.state = {
            name: ''
        };
    }

    handleChange = (e) => {
        this.setState({ name: e.target.value });
    };


    handleSubmit = (e) => {
        e.preventDefault();
        this.props.onSubmit(this.state.name);
        this.setState({ name: '' });
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
                           autoFocus
                           value={this.state.name}
                           onChange={this.handleChange}
                    />
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