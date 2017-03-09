import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import Icon from '../Icon/Icon.js';
import s from './Marker.css';

class Marker extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    opacity: PropTypes.number,
  };

  render() {
    const { type, opacity } = this.props;

    switch (type) {
      case 'LOCATION':
        return (<div className={s.locationIcon} />);
      case 'LIGHTNING':
        return (<div className={s.lightningIcon} style={{ opacity }} />);
      default:
        return null;
    }
  }
}

export default withStyles(s)(Marker);
