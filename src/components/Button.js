import React from 'react';

import PropTypes from 'prop-types';

export default function Button(props) {
    let classNames = ['btn'];
    if (props.block) {
        classNames.push('btn-block');
    }
    if (props.context) {
        let context = props.context;
        if (props.outline) {
            context = 'outline-' + props.context;
        }
        classNames.push('btn-' + context);
    }
    if (props.size) {
        classNames.push('btn-' + props.size);
    }

    return <button onClick={props.onClick} className={classNames.join(' ')}> {props.title} </button>;
};

Button.propTypes = {
    block: PropTypes.bool,
    outline: PropTypes.bool,
    context: PropTypes.oneOf(['primary', 'secondary', 'success', 'info', 'warning', 'link', 'danger']),
    size: PropTypes.oneOf(['lg', 'sm']),
    title: PropTypes.string.isRequired
};