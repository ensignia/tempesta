import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Icon.css';

class Icon extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
  };

  static sizes = [18, 24, 36, 48];

  render() {
    const { name, size } = this.props;
    const sizeClass = Icon.sizes.includes(size) ? `md-${size}` : '';

    return <i className={cx(s['material-icons'], s[sizeClass])}>{name}</i>;
  }
}

export default withStyles(s)(Icon);
