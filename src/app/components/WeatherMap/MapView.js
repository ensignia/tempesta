import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import { connect } from '../store.js';
import MapDarkTheme from './config/MapDarkTheme.json';
import MapLightTheme from './config/MapLightTheme.json';
import { api } from '../../../config.js';

const DEFAULT_CENTER = {
  lat: 0.5,
  lng: 0.5,
};

const DEFAULT_ZOOM = 11;

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

  static createLayerHelper(google, modelName, layerName, index) {
    const layer = new google.maps.ImageMapType({
      getTileUrl(coord, zoom) {
        const normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord) {
          return null;
        }
        return `/api/map/${modelName}/${layerName}/${zoom}/${normalizedCoord.x}/${normalizedCoord.y}/tile.png`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 11,
      minZoom: 0,
      radius: 1738000,
      name: modelName,
    });
    let visible = false;

    return {
      layer,
      index,
      isVisible() {
        return visible;
      },
      addLayer() {
        if (visible) return;
        visible = true;
        google.map.overlayMapTypes.setAt(index, layer);
      },
      removeLayer() {
        if (!visible) return;
        visible = false;
        google.map.overlayMapTypes.setAt(index, null);
      },
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      layers: {},
      mapLoaded: false,
      shouldUpdateLocation: false,
    };

    this.createMapOptions = this.createMapOptions.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Activate correct layers in google maps overview
    Object.keys(this.state.layers).forEach((layerName) => {
      const layer = this.state.layers[layerName];
      const isActive = nextProps.layers.includes(layerName);

      if (!layer) return; // Layer doesn't exist

      Object.keys(layer).forEach((modelName) => {
        if (!isActive || modelName !== nextProps.model) layer[modelName].removeLayer();
      });

      if (isActive && layer[nextProps.model]) layer[nextProps.model].addLayer();
    });

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

  onGoogleApiLoaded(google) {
    this.setState({
      layers: {
        cape: {
          gfs: MapView.createLayerHelper(google, 'gfs', 'cape', 1),
          hrrr: MapView.createLayerHelper(google, 'hrrr', 'cape', 1),
        },
        wind: {
          gfs: MapView.createLayerHelper(google, 'gfs', 'wind', 2),
        },
      },
      mapLoaded: true,
    });

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
    const keys = {
      key: api.google.maps,
    };

    const { className, location } = this.props;

    const markersEl = [];
    [].forEach((marker) => {
      markersEl.push(<Marker key={`${marker.lat}-${marker.lng}`} lat={marker.lat} lng={marker.lng} />);
    });

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={keys}
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
}))(MapView);
