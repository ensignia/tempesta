import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import { connect } from '../store.js';
import MapDarkTheme from './config/MapDarkTheme.json';
import MapLightTheme from './config/MapLightTheme.json';

const DEFAULT_CENTER = {
  lat: 0.5,
  lng: 0.5,
};
const DEFAULT_ZOOM = 11;

// TODO: Should be provided by server depending on data available
const META_CONFIG = {
  models: {
    gfs: {
      // Hours from model of data available
      forecastHours: 6,
      // Interval of data in hours
      forecastHourStep: 3,
    },
    hrrr: {
      forecastHours: 2,
      forecastHourStep: 1,
    },
  },
  layers: {
    cape: {
      models: ['gfs', 'hrrr'],
      zIndex: 1,
    },
    wind: {
      models: ['gfs'],
      zIndex: 2,
    },
  },
};

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  let y = coord.y; // eslint-disable-line prefer-const
  let x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  const tileRange = 1 << zoom; // eslint-disable-line no-bitwise

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange;
  }

  return { x, y };
}

class MapView extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    locationStatus: PropTypes.string,
    mapAnimationStatus: PropTypes.string,
    className: PropTypes.string,
    theme: PropTypes.array,
    layers: PropTypes.array,
    model: PropTypes.string,
  };

  static Theme = {
    LIGHT: MapLightTheme,
    DARK: MapDarkTheme,
  };

  static defaultProps = {
    theme: MapView.Theme.LIGHT,
  };

  static createLayerHelper(google, modelName, layerName, forecastHour, index) {
    const layer = new google.maps.ImageMapType({
      getTileUrl(coord, zoom) {
        const normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord) {
          return null;
        }
        return `/api/map/${layerName}/${zoom}/${normalizedCoord.x}/${normalizedCoord.y}/tile.png?forecastHour=${forecastHour}&source=${modelName}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 11,
      minZoom: 0,
      name: layerName,
    });

    return {
      layer,
      index,
      addLayer() {
        google.map.overlayMapTypes.setAt(index, layer);
      },
      removeLayer() {
        google.map.overlayMapTypes.setAt(index, null);
      },
    };
  }

  static createLayers(google) {
    const result = {};
    const metaLayers = Object.keys(META_CONFIG.layers);
    const metaModels = Object.keys(META_CONFIG.models);

    metaLayers.forEach((layerName) => {
      const layerMeta = META_CONFIG.layers[layerName];
      result[layerName] = {};

      metaModels.forEach((modelName) => {
        const modelMeta = META_CONFIG.models[modelName];

        const overlays = [];
        for (let hour = 0; hour <= modelMeta.forecastHours; hour += modelMeta.forecastHourStep) {
          overlays.push(
            MapView.createLayerHelper(google, modelName, layerName, hour, layerMeta.zIndex),
          );
        }

        result[layerName][modelName] = {
          currentOverlay: 0,
          overlays,
        };
      });
    });

    return result;
  }

  constructor(props) {
    super(props);
    this.state = {
      layers: {},
      mapLoaded: false,
      playing: true,
      shouldUpdateLocation: false,
    };

    this.createMapOptions = this.createMapOptions.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.playAnimation = this.playAnimation.bind(this);
    this.pauseAnimation = this.pauseAnimation.bind(this);
  }

  componentWillMount() {
    this.playAnimation();
  }

  componentWillReceiveProps(nextProps) {
    // Activate correct layers in google maps overview
    Object.keys(this.state.layers).forEach((layerName) => {
      const layer = this.state.layers[layerName];
      const isActive = nextProps.layers.includes(layerName);

      if (!layer) return; // Layer doesn't exist

      Object.keys(layer).forEach((modelName) => {
        const overlay = layer[modelName];
        if (!isActive || modelName !== nextProps.model) {
          overlay.overlays[overlay.currentOverlay].removeLayer();
        }
      });

      const overlay = layer[nextProps.model];
      if (isActive && layer[nextProps.model]) overlay.overlays[overlay.currentOverlay].addLayer();
    });

    // Play/pause animation
    if ((nextProps.mapAnimationStatus === 'PLAYING') !== this.state.playing) {
      if (nextProps.mapAnimationStatus === 'PLAYING') {
        this.playAnimation();
      } else {
        this.pauseAnimation();
      }
    }

    // Pan to location when requested
    if (nextProps.locationStatus === 'REQUESTING' || nextProps.locationStatus === 'REQUESTED') {
      this.setState({ shouldUpdateLocation: true });
    } else if (nextProps.locationStatus === 'DONE' && this.state.shouldUpdateLocation && this.state.mapLoaded) {
      const { latitude, longitude } = nextProps.location;

      this.panTo({ lat: latitude, lng: longitude });
      this.setZoom(DEFAULT_ZOOM);

      this.setState({ shouldUpdateLocation: false });
    }
  }

  componentWillUnmount() {
    this.pauseAnimation();
  }

  onGoogleApiLoaded(google) {
    this.setState({
      layers: MapView.createLayers(google),
      mapLoaded: true,
    });

    // Create placeholder layers in google maps array
    Object.keys(this.state.layers).forEach(() => {
      google.map.overlayMapTypes.push(null);
    });

    // Because GoogleMapReact
    this.panTo = (center) => {
      google.map.panTo(center);
    };

    this.setZoom = (zoom) => {
      google.map.setZoom(zoom);
    };

    // Force update of layers, as google api loads after first props
    this.componentWillReceiveProps(this.props);
  }

  playAnimation() {
    this.animation = setInterval(() => {
      const { layers, model } = this.props;

      layers.forEach((layerName) => {
        const layer = this.state.layers[layerName];
        if (!layer) return; // Layer doesn't exist

        const overlay = layer[model];
        if (!layer[model]) return; // Layer does not support current model

        overlay.currentOverlay = (overlay.currentOverlay + 1) % overlay.overlays.length;
        overlay.overlays[overlay.currentOverlay].addLayer();
      });
    }, 2000);

    this.setState({ playing: true });
  }

  pauseAnimation() {
    clearInterval(this.animation);
    this.setState({ playing: false });
  }

  createMapOptions(maps) {
    return {
      styles: this.props.theme,
      zoomControl: true,
      zoomControlOptions: {
        position: maps.ControlPosition.RIGHT_TOP,
      },
      disableDefaultUI: true,
      minZoom: 2,
      minZoomOverride: true,
    };
  }

  render() {
    const { className, location } = this.props;

    const markersEl = [];
    [].forEach((marker) => {
      markersEl.push(<Marker key={`${marker.lat}-${marker.lng}`} lat={marker.lat} lng={marker.lng} />);
    });

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.BROWSER ? window.env.google.maps : null }}
          defaultZoom={DEFAULT_ZOOM}
          defaultCenter={DEFAULT_CENTER}
          options={this.createMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={this.onGoogleApiLoaded}
        >
          <Marker key="location" type="LOCATION" lat={location.latitude} lng={location.longitude} />
          {markersEl}
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect((state) => ({
  location: state.location,
  locationStatus: state.locationStatus,
  mapAnimationStatus: state.mapAnimationStatus,
}))(MapView);
