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
    isPage: PropTypes.bool,
  };

  render() {
    const { actions, showWeatherOverview, locationStatus, isPage } = this.props;

    if (isPage) {
      return (
        <div className={cx(s.navigation, this.props.className)} role="navigation">
          <Link
            className={cx(s.link, s.icon)}
            to="/"
          >
            <Icon name={'arrow_back'} />
          </Link>
        </div>
      );
    }

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
          <Icon name={'keyboard_arrow_down'} />
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
          <Link className={s.link} to="#" onClick={() => { actions.showSettingsModal(); }}>
            <Icon name="settings" />
            <span>Settings</span>
          </Link>
          <Link className={s.link} to="#">
            <Icon name="import_contacts" />
            <span>Guide</span>
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
