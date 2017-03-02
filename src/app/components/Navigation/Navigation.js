import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from '../store.js';
import s from './Navigation.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    showWeatherOverview: PropTypes.bool,
    actions: PropTypes.object,
    locationStatus: PropTypes.string,
  };

  render() {
    const { actions, showWeatherOverview, locationStatus } = this.props;

    return (
      <div className={cx(s.navigation, this.props.className)} role="navigation">
        <Link
          className={cx(s.link, s.icon, { [s.rotateArrow]: showWeatherOverview })}
          to="#"
          onClick={() => {
            if (showWeatherOverview) actions.hideWeatherOverview();
            else actions.showWeatherOverview();
          }}
        >
          <Icon name={'keyboard_arrow_up'} />
        </Link>

        <div className={s.main}>
          <Link className={s.link} to="#" onClick={() => { actions.showLayerModal(); }}>
            <Icon name="layers" />
            <span>Layers</span>
          </Link>
          <Link className={s.link} to="#" onClick={() => { actions.showModelModal(); }}>
            <Icon name="timeline" />
            <span>Model</span>
          </Link>
          <Link className={s.link} to="#">
            <Icon name="settings" />
            <span>Settings</span>
          </Link>
        </div>

        <Link className={cx(s.link, s.icon, { [s.pulse]: locationStatus !== 'DONE' })} to="#" onClick={() => { actions.requestLocation(); }}>
          <Icon name="my_location" />
        </Link>
      </div>
    );
  }
}

export default connect((state) => ({
  showWeatherOverview: state.showWeatherOverview,
  locationStatus: state.locationStatus,
}))(withStyles(s)(Navigation));
