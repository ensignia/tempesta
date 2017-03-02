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
    locationStatus: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor() {
    super();

    this.requestLocation = this.requestLocation.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { actions } = this.props;

    if (nextProps.locationStatus === 'REQUESTED') {
      this.requestLocation();
      actions.setLocationState('REQUESTING');
    }
  }

  requestLocation() {
    const { actions } = this.props;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        actions.updateLocation({ latitude, longitude });
        actions.setLocationState('DONE');
      });
    }
  }

  render() {
    return (
      <div className={cx(s.page, s.container)}>
        <Header />
        <main className={cx(s.content, s.container)}>
          {this.props.children}
        </main>
      </div>
    );
  }
}

export default connect((state) => ({
  locationStatus: state.locationStatus,
}))(withStyles(normalize, mdl, s)(Layout));
