import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
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
    align: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    align: 'left',
  }

  constructor() {
    super();

    this.radioId = `radio-${id()}`;
  }

  render() {
    const { name, value, label, align, checked } = this.props;

    const labelClass = cx({
      [s['left-align']]: align === 'left',
      [s['right-align']]: align === 'right',
    });

    return (
      <label className={s.radio} htmlFor={this.radioId}>
        <input name={name} type="radio" value={value} id={this.radioId} checked={checked} onChange={this.props.onChange} />
        <span className={labelClass}>{label}</span>
      </label>
    );
  }
}

export default withStyles(s)(Radio);
