import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import WeatherMap from '../../components/WeatherMap/WeatherMap.js';
import s from './Home.css';

class Home extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <WeatherMap />
    );
  }
}

export default withStyles(s)(Home);
