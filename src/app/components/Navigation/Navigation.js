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
  };

  render() {
    const { actions, showWeatherOverview } = this.props;
    return (
      <div className={cx(s.navigation, this.props.className)} role="navigation">
        <Link
          className={cx(s.link, s.edgeicons)}
          to="#"
          onClick={() => {
            if (showWeatherOverview) actions.hideWeatherOverview();
            else actions.showWeatherOverview();
          }}
        >
          <Icon name={`${showWeatherOverview ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}`} />
        </Link>
        <div className={s.middleicons}>
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
        <Link className={cx(s.link, s.edgeicons)} to="#">
          <Icon name="my_location" />
        </Link>
      </div>
    );
  }
}

export default connect((state) => ({
  showWeatherOverview: state.showWeatherOverview,
}))(withStyles(s)(Navigation));
