import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MapControls.css';

class MapControls extends React.Component {

  render() {
    return (
      <div className={cx(s.scrollBar)} role="navigation">
         hello
      </div>
    );
  }
}

export default withStyles(s)(MapControls);
