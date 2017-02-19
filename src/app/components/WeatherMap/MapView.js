import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import MapDarkTheme from './config/MapDarkTheme.json';
import { api } from '../../../config.js';

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
    LIGHT: MapDarkTheme,
    DARK: [],
  };

  static defaultProps = {
    center: { lat: 59.95, lng: 30.33 },
    zoom: 11,
    theme: MapView.Theme.LIGHT,
  };

  constructor(props) {
    super(props);
    this.state = { theme: props.theme };

    this.createMapOptions = this.createMapOptions.bind(this);
  }

  createMapOptions(maps) {
    return {
      styles: this.state.theme,
      zoomControl: true,
      zoomControlOptions: {
        position: maps.ControlPosition.RIGHT_TOP,
      },
    };
  }

  render() {
    const keys = {
      key: api.google.maps,
    };

    const markers = [];
    this.props.markers.forEach((marker) => {
      markers.push(<Marker lat={marker.lat} lng={marker.lng} />);
    });

    return (
      <GoogleMapReact
        bootstrapURLKeys={keys}
        defaultCenter={this.props.center}
        defaultZoom={this.props.zoom}
        options={this.createMapOptions}
      >
        {markers}
      </GoogleMapReact>
    );
  }
}

export default MapView;
