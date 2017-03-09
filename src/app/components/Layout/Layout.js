/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import normalize from 'normalize.css';
import mdl from 'material-design-lite/material.css';
import { connect } from '../store.js';
import s from './Layout.css';
import Header from '../Header/Header.js';
<<<<<<< a5f8709ae5cefe876b69a87ea04d2ed9818b3bda
import Modal from '../Modal/Modal.js';
import Link from '../Link/Link.js';
=======
>>>>>>> Made seperate slider

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    actions: PropTypes.object.isRequired,
    locationStatus: PropTypes.string.isRequired,
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
    const { children } = this.props;
    return (
      <div className={cx(s.page, s.container)}>
        <Header />
        <main className={cx(s.content, s.container)}>
          {children}
        </main>
      </div>
    );
  }
}

export default connect((state) => ({
  locationStatus: state.locationStatus,
}))(withStyles(normalize, mdl, s)(Layout));
