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
  };

  static Theme = {
    LIGHT: MapLightTheme,
    DARK: MapDarkTheme,
  };

  static defaultProps = {
    zoom: 3,
    theme: MapView.Theme.LIGHT,
  };

  constructor(props) {
    super(props);
    this.state = { center: this.props.center };

    this.requestLocation = this.requestLocation.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.createMapOptions = this.createMapOptions.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);

    if (!this.props.center) { // If a center was given to us, then use that
      this.requestLocation();
    }
  }

  componentWillUnmount() {
    // empty
  }

  onGoogleApiLoaded(google) {
    this.testMapType = new google.maps.ImageMapType({
      getTileUrl(coord, zoom) {
        const normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord) {
          return null;
        }
        return `/api/map/gfs/cape/${zoom}/${normalizedCoord.x}/${normalizedCoord.y}/tile.png`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 9,
      minZoom: 0,
      radius: 1738000,
      name: 'Test',
    });

    google.map.overlayMapTypes.insertAt(0, this.testMapType);
  }

  requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        this.updateLocation({ lat: latitude, lng: longitude });
      });
    }
  }

  updateLocation(location) {
    this.setState({ center: { lat: location.lat, lng: location.lng } });
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

    const markers = [];
    this.props.markers.forEach((marker) => {
      markers.push(<Marker key={`${marker.lat}-${marker.lng}`} lat={marker.lat} lng={marker.lng} />);
    });

    return (
      <div className={this.props.className}>
        <GoogleMapReact
          bootstrapURLKeys={keys}
          defaultZoom={this.props.zoom}
          defaultCenter={DEFAULT_CENTER}
          center={this.state.center}
          options={this.createMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={this.onGoogleApiLoaded}
        >
          {markers}
        </GoogleMapReact>
      </div>
    );
  }
}

export default MapView;
