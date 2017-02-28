import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';
import Modal from '../Modal/Modal.js';
import Checkbox from '../Checkbox/Checkbox.js';

class WeatherMap extends React.Component {

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
    const markers = [];
    markers.push({ lat: 0.5, lng: 0.5 });

    return (
      <div className={cx(s.content, s.container)}>
        <MapView className={cx(s.content, s.container, s.mapView)} markers={markers} />
        <MapControls className={cx(s.mapControls)} />
        <Modal
          title="Hello there"
          isOpen={this.context.store.getState().showLayerModal}
          onClose={() => { this.context.store.dispatch('hideLayerModal'); }}
        >
          <Checkbox name="test" label="Show convective available potential energy" />
          <Checkbox name="test" label="Show wind and fronts" />
          <Checkbox name="test" label="Show storm prediction centre reports" />
          <Checkbox name="test" label="Show lightning" />
        </Modal>
      </div>
    );
  }
}

export default withStyles(s)(WeatherMap);
