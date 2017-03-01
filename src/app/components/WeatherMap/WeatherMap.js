import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';
import Modal from '../Modal/Modal.js';
import Checkbox from '../Checkbox/Checkbox.js';
import Radio from '../Radio/Radio.js';

class WeatherMap extends React.Component {

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor() {
    super();

    this.state = {
      layers: ['cape'],
      model: 'gfs',
    };

    this.layerOnChange = this.layerOnChange.bind(this);
    this.modelOnChange = this.modelOnChange.bind(this);
  }

  componentWillMount() {
    this.removeListener = this.context.store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  layerOnChange(e) {
    if (e.target.value && !this.state.layers.includes(e.target.name)) {
      this.setState({ layers: this.state.layers.concat(e.target.name) });
    } else {
      this.setState({ layers: this.state.layers.filter(l => l !== e.target.name) });
    }
  }

  modelOnChange(e) {
    if (this.state.model !== e.target.value) {
      this.setState({ model: e.target.value });
    }
  }

  render() {
    const markers = [];
    markers.push({ lat: 0.5, lng: 0.5 });

    return (
      <div className={cx(s.content, s.container)}>
        <MapView
          className={cx(s.content, s.container, s.mapView)}
          layers={this.state.layers}
          markers={markers}
        />
        <MapControls className={s.mapControls} />
        <Modal
          title="Layers"
          isOpen={this.context.store.getState().showLayerModal}
          onClose={() => { this.context.store.dispatch('hideLayerModal'); }}
        >
          <Checkbox name="cape" label="Show convective available potential energy" checked={this.state.layers.includes('cape')} onChange={this.layerOnChange} />
          <Checkbox name="wind" label="Show wind and fronts" checked={this.state.layers.includes('wind')} onChange={this.layerOnChange} />
          <Checkbox name="spc" label="Show storm prediction centre reports" checked={this.state.layers.includes('spc')} onChange={this.layerOnChange} />
          <Checkbox name="lightning" label="Show lightning" checked={this.state.layers.includes('lightning')} onChange={this.layerOnChange} />
        </Modal>
        <Modal
          title="Models"
          isOpen={this.context.store.getState().showModelModal}
          onClose={() => { this.context.store.dispatch('hideModelModal'); }}
        >
          <Radio name="model" value="gfs" label="Global Forecast System" checked={this.state.model === 'gfs'} onChange={this.modelOnChange} />
          <Radio name="model" value="hrrr" label="HRRR" checked={this.state.model === 'hrrr'} onChange={this.modelOnChange} />
        </Modal>
      </div>
    );
  }
}

export default withStyles(s)(WeatherMap);
