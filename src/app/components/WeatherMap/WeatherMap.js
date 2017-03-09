import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { connect } from '../store.js';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';
import Modal from '../Modal/Modal.js';
import Switch from '../Switch/Switch.js';
import Radio from '../Radio/Radio.js';
import Link from '../Link/Link.js';

class WeatherMap extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    showLayerModal: PropTypes.bool.isRequired,
    showModelModal: PropTypes.bool.isRequired,
    showSpeedModal: PropTypes.bool.isRequired,
    mapActiveLayers: PropTypes.array,
    mapActiveModel: PropTypes.string,
    mapActiveSpeed: PropTypes.number,
    actions: PropTypes.object,
  };

  constructor() {
    super();

    this.layerOnChange = this.layerOnChange.bind(this);
    this.modelOnChange = this.modelOnChange.bind(this);
    this.speedOnChange = this.speedOnChange.bind(this);
  }

  componentDidMount() {
    this.props.actions.requestLocation();
  }

  layerOnChange(e) {
    const { actions } = this.props;
    const { mapActiveLayers } = this.props;

    if (e.target.checked && !mapActiveLayers.includes(e.target.name)) {
      actions.setActiveLayers(mapActiveLayers.concat(e.target.name));
    } else if (mapActiveLayers.includes(e.target.name)) {
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

  speedOnChange(e) {
    const { actions } = this.props;
    const { mapActiveSpeed } = this.props;
    const value = parseInt(e.target.value, 10);

    if (mapActiveSpeed !== value) {
      actions.setMapActiveSpeed(value);
    }
  }

  render() {
    const {
      actions,
      showLayerModal,
      showModelModal,
      showSpeedModal,
      mapActiveLayers,
      mapActiveModel,
      mapActiveSpeed,
    } = this.props;

    return (
      <div className={cx(s.content, s.container)}>
        <MapView className={cx(s.content, s.container, s.mapView)} />
        <MapControls />
        <Modal
          title="Layers"
          isOpen={showLayerModal}
          className={s.modal}
          onClose={() => { actions.hideLayerModal(); }}
        >
          <Link className={cx(s.helpButton)} to="/guide/layers">
            <span name="guide">?</span>
          </Link>
          <Switch name="cape" label="Convective available potential energy" enabled={mapActiveLayers.includes('cape')} onChange={this.layerOnChange} />
          <Switch name="wind" label="Wind vectors and wind fronts" enabled={mapActiveLayers.includes('wind')} onChange={this.layerOnChange} />
          <Switch name="temperature" label="Temperature" enabled={mapActiveLayers.includes('temperature')} onChange={this.layerOnChange} />
          <Switch name="spc" label="Storm Prediction Centre reports" enabled={mapActiveLayers.includes('spc')} onChange={this.layerOnChange} />
          <Switch name="lightning" label="Lightning radar" enabled={mapActiveLayers.includes('lightning')} onChange={this.layerOnChange} />
        </Modal>
        <Modal
          title="Models"
          isOpen={showModelModal}
          className={s.modal}
          onClose={() => { actions.hideModelModal(); }}
        >
          <Link className={cx(s.helpButton)} to="/guide/models">
            <span name="guide">?</span>
          </Link>
          <Radio name="model" value="gfs" label="Global Forecast System" checked={mapActiveModel === 'gfs'} onChange={this.modelOnChange} />
          <Radio name="model" value="hrrr" label="HRRR" checked={mapActiveModel === 'hrrr'} onChange={this.modelOnChange} />
        </Modal>
        <Modal
          title="Map Speeds"
          isOpen={showSpeedModal}
          className={s.modal}
          onClose={() => { actions.hideSpeedModal(); }}
        >
          <Radio name="speeds" value="1" label="1x" checked={mapActiveSpeed === 1} onChange={this.speedOnChange} />
          <Radio name="speeds" value="2" label="2x" checked={mapActiveSpeed === 2} onChange={this.speedOnChange} />
        </Modal>
      </div>
    );
  }
}

export default connect((state) => ({
  showLayerModal: state.showLayerModal,
  showModelModal: state.showModelModal,
  showSpeedModal: state.showSpeedModal,
  mapActiveLayers: state.mapActiveLayers,
  mapActiveModel: state.mapActiveModel,
  mapActiveSpeed: state.mapActiveSpeed,
}))(withStyles(s)(WeatherMap));
