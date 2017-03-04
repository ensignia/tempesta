import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Icon.css';

class Icon extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
  };

  static sizes = [18, 24, 36, 48];

  render() {
    const { name, size, className, ...otherProps } = this.props;
    const classes = cx({
      [s['material-icons']]: true,
      [s[`md-${size}`]]: Icon.sizes.includes(size),
      [className]: true,
    });

    return <i {...otherProps} className={classes}>{name}</i>;
  }
}

export default withStyles(s)(Icon);
