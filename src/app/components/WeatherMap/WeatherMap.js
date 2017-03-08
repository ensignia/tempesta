import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { connect } from '../store.js';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';
import Modal from '../Modal/Modal.js';
import Checkbox from '../Checkbox/Checkbox.js';
import Radio from '../Radio/Radio.js';

class WeatherMap extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    showLayerModal: PropTypes.bool.isRequired,
    showModelModal: PropTypes.bool.isRequired,
    mapActiveLayers: PropTypes.array,
    mapActiveModel: PropTypes.string,
    actions: PropTypes.object,
  };

  constructor() {
    super();

    this.layerOnChange = this.layerOnChange.bind(this);
    this.modelOnChange = this.modelOnChange.bind(this);
  }

  componentWillMount() {
    this.props.actions.requestLocation();
  }

  layerOnChange(e) {
    const { actions } = this.props;
    const { mapActiveLayers } = this.props;

    if (e.target.value && !mapActiveLayers.includes(e.target.name)) {
      actions.setActiveLayers(mapActiveLayers.concat(e.target.name));
    } else {
      actions.setActiveLayers(mapActiveLayers.filter(l => l !== e.target.name));
    }
  }

  modelOnChange(e) {
    const { actions } = this.props;
    const { mapActiveModel } = this.props;

    if (mapActiveModel !== e.target.value) {
      actions.setActiveModel(e.target.value);
    }
  }

  render() {
    const { actions, showLayerModal, showModelModal, mapActiveLayers, mapActiveModel } = this.props;

    return (
      <div className={cx(s.content, s.container)}>
        <MapView className={cx(s.content, s.container, s.mapView)} />
        <MapControls />
        <Modal
          title="Layers"
          isOpen={showLayerModal}
          onClose={() => { actions.hideLayerModal(); }}
        >
          <Checkbox name="cape" label="Convective available potential energy" checked={mapActiveLayers.includes('cape')} onChange={this.layerOnChange} />
          <Checkbox name="wind" label="Wind vectors and wind fronts" checked={mapActiveLayers.includes('wind')} onChange={this.layerOnChange} />
          <Checkbox name="spc" label="Storm Prediction Centre reports" checked={mapActiveLayers.includes('spc')} onChange={this.layerOnChange} />
          <Checkbox name="lightning" label="Lightning radar" checked={mapActiveLayers.includes('lightning')} onChange={this.layerOnChange} />
        </Modal>
        <Modal
          title="Models"
          isOpen={showModelModal}
          onClose={() => { actions.hideModelModal(); }}
        >
          <Radio name="model" value="gfs" label="Global Forecast System" checked={mapActiveModel === 'gfs'} onChange={this.modelOnChange} />
          <Radio name="model" value="hrrr" label="HRRR" checked={mapActiveModel === 'hrrr'} onChange={this.modelOnChange} />
        </Modal>
      </div>
    );
  }
}

export default connect((state) => ({
  showLayerModal: state.showLayerModal,
  showModelModal: state.showModelModal,
  mapActiveLayers: state.mapActiveLayers,
  mapActiveModel: state.mapActiveModel,
}))(withStyles(s)(WeatherMap));
