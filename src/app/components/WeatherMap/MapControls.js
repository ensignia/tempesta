import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MapControls.css';

class MapControls extends React.Component {

  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    return (
      <div className={cx(s.mapControls, ...this.props.className)}>
         hello
      </div>
    );
  }
}

export default withStyles(s)(MapControls);
