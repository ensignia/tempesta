/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import normalize from 'normalize.css';
import mdl from 'material-design-lite/material.css';
import { connect } from '../store.js';
import s from './Layout.css';
import Header from '../Header/Header.js';


class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    actions: PropTypes.object.isRequired,
    locationStatus: PropTypes.string.isRequired,
    isPage: PropTypes.boolean,
  };

  constructor() {
    super();

    this.requestLocation = this.requestLocation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { actions } = this.props;

    if (nextProps.locationStatus === 'REQUESTED') {
      this.requestLocation();
      actions.setLocationStatus('REQUESTING');
    }
  }

  requestLocation() {
    const { actions } = this.props;

    if ('geolocation' in navigator) {
      const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          actions.updateLocation({ latitude, longitude });
          actions.setLocationStatus('DONE');
        });
      };

      setTimeout(getLocation, 1000); // Delay location for cool factor
    }
  }

  render() {
    const { children, isPage } = this.props;

    const mainClasses = cx({
      [s.content]: true,
      [s.container]: true,
      [s.main]: !!isPage,
    });

    return (
      <div className={cx(s.page, s.container)}>
        <Header isPage={isPage} />
        <main className={mainClasses}>
          {children}
        </main>
      </div>
    );
  }
}

export default connect((state) => ({
  locationStatus: state.locationStatus,
}))(withStyles(normalize, mdl, s)(Layout));
