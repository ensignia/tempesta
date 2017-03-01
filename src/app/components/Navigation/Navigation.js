import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.removeListener = this.context.store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    const { showWeatherOverview } = this.context.store.getState();

    return (
      <div className={cx(s.navigation, this.props.className)} role="navigation">
        <Link
          className={cx(s.link, s.edgeicons)}
          to="#"
          onClick={() => {
            this.context.store.dispatch(showWeatherOverview ? 'hideWeatherOverview' : 'showWeatherOverview');
          }}
        >
          <Icon name={`${showWeatherOverview ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}`} />
        </Link>
        <div className={s.middleicons}>
          <Link className={s.link} to="#" onClick={() => { this.context.store.dispatch('showLayerModal'); }}>
            <Icon name="layers" />
            <span>Layers</span>
          </Link>
          <Link className={s.link} to="#" onClick={() => { this.context.store.dispatch('showModelModal'); }}>
            <Icon name="timeline" />
            <span>Model</span>
          </Link>
          <Link className={s.link} to="#">
            <Icon name="settings" />
            <span>Settings</span>
          </Link>
        </div>
        <Link className={cx(s.link, s.edgeicons)} to="#">
          <Icon name="my_location" />
        </Link>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
