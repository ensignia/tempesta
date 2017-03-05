import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import Icon from '../Icon/Icon.js';
import s from './Marker.css';

class Marker extends React.Component {
  static propTypes = {
    type: PropTypes.string,
  };

  render() {
    const { type } = this.props;

    switch (type) {
      case 'LOCATION':
        return (<div className={s.locationIcon} />);
      default:
        return null;
    }
  }
}

export default withStyles(s)(Marker);
