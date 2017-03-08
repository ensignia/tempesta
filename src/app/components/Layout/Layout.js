/* eslint-disable css-modules/no-unused-or-extra-class */
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import normalize from 'normalize.css';
import mdl from 'material-design-lite/material.css';
import { connect } from '../store.js';
import s from './Layout.css';
import Header from '../Header/Header.js';
import Modal from '../Modal/Modal.js';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    locationStatus: PropTypes.string.isRequired,
    showSettingsModal: PropTypes.bool.isRequired,
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
    const { actions, showSettingsModal } = this.props;
    return (
      <div className={cx(s.page, s.container)}>
        <Header />
        <main className={cx(s.content, s.container)}>
          {this.props.children}
        </main>

        <Modal
          title="Settings"
          isOpen={showSettingsModal}
          onClose={() => { actions.hideSettingsModal(); }}
        >

        <div className={cx(s.temperature)}>
          <span>°C  </span>
          <label className={cx(s.switch)}>
            <input type="checkbox" />
            <div className={cx(s.sliderRound, s.slider)} />
          </label>
          <span>  °F</span>
        </div>

        <div className={cx(s.scales)}>
          <span>Metric  </span>
          <label className={cx(s.switch)}>
            <input type="checkbox" />
            <div className={cx(s.sliderRound, s.slider)} />
          </label>
          <span>  Imperial</span>
        </div>
        </Modal>
      </div>
    );
  }
}

export default connect((state) => ({
  locationStatus: state.locationStatus,
  showSettingsModal: state.showSettingsModal,
}))(withStyles(normalize, mdl, s)(Layout));
