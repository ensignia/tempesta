import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Radio.css';

let currentId = 1;

function id() {
  currentId += 1;
  return currentId;
}

class Radio extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor() {
    super();

    this.radioId = `radio-${id()}`;
  }

  render() {
    const { name, value, label, checked } = this.props;

    return (
      <label className={s.radio} htmlFor={this.radioId}>
        <input name={name} type="radio" value={value} id={this.radioId} checked={checked} onChange={this.props.onChange} />
        <span>{label}</span>
      </label>
    );
  }
}

export default withStyles(s)(Radio);
