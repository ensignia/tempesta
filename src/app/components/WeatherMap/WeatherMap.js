import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WeatherMap.css';
import MapView from './MapView.js';

class WeatherMap extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    const markers = [];
    markers.push({ lat: 0.5, lng: 0.5 });

    return (
      <div className={s.weatherMap}>
        <MapView markers={markers} />
      </div>
    );
  }
}

export default withStyles(s)(WeatherMap);
