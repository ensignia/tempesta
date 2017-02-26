import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Checkbox.css';

let currentId = 1;

function id() {
  currentId += 1;
  return currentId;
}

class Checkbox extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool,
  };

  constructor() {
    super();

    this.checkboxId = `checkbox-${id()}`;
  }

  render() {
    const { name, label, checked } = this.props;

    return (
      <label className={s.checkbox} htmlFor={this.checkboxId}>
        <span>{label}</span>
        <input name={name} type="checkbox" id={this.checkboxId} checked={checked} />
        <svg width="18" height="18">
          <path className={s.checked} d="M16,0H2C0.9,0,0,0.9,0,2v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V2C18,0.9,17.1,0,16,0z M7,14L2,9l1.4-1.4L7,11.2l7.6-7.6L16,5L7,14z" />
          <path className={s.unchecked} d="M16,2v14H2V2H16 M16,0H2C0.9,0,0,0.9,0,2v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V2C18,0.9,17.1,0,16,0z" />
        </svg>
      </label>
    );
  }
}

export default withStyles(s)(Checkbox);
