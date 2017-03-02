import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import MapDarkTheme from './config/MapDarkTheme.json';
import MapLightTheme from './config/MapLightTheme.json';
import { api } from '../../../config.js';

const DEFAULT_CENTER = {
  lat: 0.5,
  lng: 0.5,
};

const DEFAULT_ZOOM = 3;

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
    center: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    zoom: PropTypes.number,
    theme: PropTypes.array,
    markers: PropTypes.array,
    className: PropTypes.string,
    layers: PropTypes.array,
  };

  static Theme = {
    LIGHT: MapLightTheme,
    DARK: MapDarkTheme,
  };

  static defaultProps = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
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
      maxZoom: 9,
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
    };

    this.createMapOptions = this.createMapOptions.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    Object.keys(this.state.layers).forEach((key) => {
      if (!this.state.layers[key]) return;

      if (nextProps.layers.includes(key)) {
        this.state.layers[key].gfs.addLayer();
      } else {
        this.state.layers[key].gfs.removeLayer();
      }
    });
  }

  onGoogleApiLoaded(google) {
    this.state.layers.cape = {
      gfs: MapView.createLayerHelper(google, 'gfs', 'cape', 1),
    };

    Object.keys(this.state.layers).forEach(() => {
      google.map.overlayMapTypes.push(null);
    });

    // Force update of layers, as google api loads after first props
    this.componentWillReceiveProps(this.props);

    // Because GoogleMapReact is stupid
    this.panTo = (center) => {
      google.map.panTo(center);
    };

    this.panTo(this.props.center);
  }

  createMapOptions(maps) {
    return {
      styles: this.props.theme,
      zoomControl: true,
      zoomControlOptions: {
        position: maps.ControlPosition.RIGHT_TOP,
      },
      disableDefaultUI: true,
    };
  }

  render() {
    const keys = {
      key: api.google.maps,
    };

    const { zoom, center, markers, className } = this.props;

    const markersEl = [];
    markers.forEach((marker) => {
      markersEl.push(<Marker key={`${marker.lat}-${marker.lng}`} lat={marker.lat} lng={marker.lng} />);
    });

    if (this.panTo) this.panTo(center);

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={keys}
          defaultZoom={DEFAULT_ZOOM}
          defaultCenter={DEFAULT_CENTER}
          zoom={zoom}
          center={center}
          options={this.createMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={this.onGoogleApiLoaded}
        >
          {markersEl}
        </GoogleMapReact>
      </div>
    );
  }
}

export default MapView;
