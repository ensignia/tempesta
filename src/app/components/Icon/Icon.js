import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Icon.css';

class Icon extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.num,
  };

  render() {
    const { name, size } = this.props;
    const sizeClass = [18, 24, 36, 48].includes(size) ? `md-${size}` : '';
    return <i className={cx(s['material-icons'], sizeClass)}>{name}</i>;
  }
}

export default withStyles(s)(Icon);
