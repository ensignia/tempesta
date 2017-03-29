import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { connect } from '../store.js';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';
import Modal from '../Modal/Modal.js';
import Radio from '../Radio/Radio.js';
import Link from '../Link/Link.js';

class WeatherMap extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    showLayerModal: PropTypes.bool.isRequired,
    showModelModal: PropTypes.bool.isRequired,
    showSpeedModal: PropTypes.bool.isRequired,
    mapActiveLayer: PropTypes.string,
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
    const { mapActiveLayer } = this.props;

    if (mapActiveLayer !== e.target.value) {
      actions.setActiveLayer(e.target.value);
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
      mapActiveLayer,
      mapActiveModel,
      mapActiveSpeed,
    } = this.props;

    console.log(mapActiveLayer === 'cape');

    return (
      <div className={cx(s.content, s.container)}>
        <MapView className={cx(s.content, s.container, s.mapView)} />
        <MapControls />
        <Modal
          title="Layers"
          isOpen={showLayerModal}
          className={s.modal}
          buttons={[
            {
              handler: () => {
                actions.setDefaultLayer(mapActiveLayer);
              },
              text: 'Set as Default',
            },
          ]}
          onClose={() => { actions.hideLayerModal(); }}
        >
          <Link className={cx(s.helpButton)} to="/guide/layers">
            <span name="guide">?</span>
          </Link>
          <Radio name="layer" value="cape" align="right" label="Convective available potential energy" checked={mapActiveLayer === 'cape'} onChange={this.layerOnChange} />
          <Radio name="layer" value="wind" align="right" label="Wind vectors and wind fronts" checked={mapActiveLayer === 'wind'} onChange={this.layerOnChange} />
          <Radio name="layer" value="temperature" align="right" label="Temperature" checked={mapActiveLayer === 'temperature'} onChange={this.layerOnChange} />
          <Radio name="layer" value="vorticity" align="right" label="Absolute vorticity" checked={mapActiveLayer === 'vorticity'} onChange={this.layerOnChange} />
          <Radio name="layer" value="spc" align="right" label="Storm Prediction Centre reports" checked={mapActiveLayer === 'spc'} onChange={this.layerOnChange} />
          <Radio name="layer" value="lightning" align="right" label="Lightning radar" checked={mapActiveLayer === 'lightning'} onChange={this.layerOnChange} />
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
  mapActiveLayer: state.mapActiveLayer,
  mapActiveModel: state.mapActiveModel,
  mapActiveSpeed: state.mapActiveSpeed,
}))(withStyles(s)(WeatherMap));
