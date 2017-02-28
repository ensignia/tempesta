import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MapControls.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';

class MapControls extends React.Component {

  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    return (
      <div className={cx(s.mapControls, ...this.props.className)}>
        <Link className={cx(s.link, s.playButton)} to="/">
          <Icon name="play_arrow" size={48} />
        </Link>
      </div>
    );
  }
}

export default withStyles(s)(MapControls);
