import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Icon.css';

class Icon extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };

  render() {
    const { name } = this.props;
    return <i className={s['material-icons']}>{name}</i>;
  }
}

export default withStyles(s)(Icon);
