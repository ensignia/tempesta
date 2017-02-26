import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './WeatherMap.css';
import MapView from './MapView.js';
import MapControls from './MapControls.js';

class WeatherMap extends React.Component {
  render() {
    const markers = [];
    markers.push({ lat: 0.5, lng: 0.5 });

    return (
      <div className={cx(s.content, s.container)}>
        <MapView className={cx(s.content, s.container, s.mapView)} markers={markers} />
        <MapControls className={cx(s.mapControls)} />
      </div>
    );
  }
}

export default withStyles(s)(WeatherMap);
