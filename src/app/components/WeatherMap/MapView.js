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

class MapView extends React.Component {
  static propTypes = {
    center: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    zoom: PropTypes.number,
    theme: PropTypes.array,
    markers: PropTypes.array,
  };

  static Theme = {
    LIGHT: MapLightTheme,
    DARK: MapDarkTheme,
  };

  static defaultProps = {
    zoom: 11,
    theme: MapView.Theme.LIGHT,
  };

  constructor(props) {
    super(props);
    this.state = { center: this.props.center };

    this.requestLocation = this.requestLocation.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.createMapOptions = this.createMapOptions.bind(this);

    if (!this.props.center) { // If a center was given to us, then use that
      this.requestLocation();
    }
  }

  componentWillUnmount() {
    // empty
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
      <GoogleMapReact
        bootstrapURLKeys={keys}
        defaultZoom={this.props.zoom}
        defaultCenter={DEFAULT_CENTER}
        center={this.state.center}
        options={this.createMapOptions}
      >
        {markers}
      </GoogleMapReact>
    );
  }
}

export default MapView;
