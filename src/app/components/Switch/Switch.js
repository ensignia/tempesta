import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Switch.css';

let currentId = 1;

function id() {
  currentId += 1;
  return currentId;
}

class Switch extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    enabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor() {
    super();

    this.switchId = `switch-${id()}`;
  }

  render() {
    const { name, label, enabled } = this.props;

    return (
      <label className={s.switchLabel} htmlFor={this.switchId}>
        <span>{label}</span>
        <input name={name} type="checkbox" id={this.switchId} checked={enabled} onChange={this.props.onChange} />
        <div className={s.switch}>
          <div className={s.slider} />
        </div>
      </label>
    );
  }
}

export default withStyles(s)(Switch);
