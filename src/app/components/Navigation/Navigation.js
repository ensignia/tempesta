import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onToggleOverview: PropTypes.func,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className={cx(s.navigation, this.props.className)} role="navigation">
        <Link className={s.link} to="#" onClick={this.props.onToggleOverview}>Show WeatherOverview</Link>
        <Link className={s.link} to="/">
          <Icon name="face" />
          <span>Tempesta</span>
        </Link>
        <Link className={s.link} to="/about">About</Link>
        <Link className={s.link} to="#" onClick={() => { this.context.store.dispatch('showLayerModal'); }}>Layers</Link>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
