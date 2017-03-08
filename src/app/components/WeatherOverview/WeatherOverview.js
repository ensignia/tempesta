import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from '../store.js';
import s from './WeatherOverview.css';
import fetch from '../../core/fetch';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class WeatherOverview extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    location: PropTypes.object,
    locationStatus: PropTypes.string,
  };

  constructor() {
    super();

    this.state = {
      daily: [],
      hasData: false,
    };

    this.getData = this.getData.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.hasData && nextProps.locationStatus === 'DONE') {
      this.getData(nextProps.location);
      this.setState({ hasData: true });
    }
  }

  async getData(coords) {
    const response = await fetch(`/api/weather/${coords.latitude},${coords.longitude}`);
    const json = await response.json();

    this.setState({ daily: json.daily.data });
  }

  render() {
    const days = [];
    this.state.daily.forEach((day) => {
      // day is a darksky data point object, look here for details https://darksky.net/dev/docs/response#data-point
      const dayName = dayNames[new Date(day.time * 1000).getDay()];
      const dayIconName = day.icon;

      days.push(<li><div key={day.time} className={dayIconName}><img className={s.dayIcon} src={`/WeatherIcons/${day.icon}.svg`} width="19" height="19" alt="lol" /><span className={s.Name}>{dayName}</span></div></li>);
    });


    const todayTemp = this.state.daily.length !== 0 ? this.state.daily[0].temperature : '0 °C';
    const todayWeather = this.state.daily.length !== 0 ? <img src={`/WeatherIcons/${this.state.daily[0].icon}.svg`} width="36" height="36" alt="lol" /> : null;
    return (
      <div className={s.weatherOverview}>
        <div className={s.Current}>
          <span className={s.Name}>TODAY</span>
          <span>{todayTemp}</span>
        </div>
        <div>
          {todayWeather}
        </div>
        <ul>
          {days}
        </ul>
      </div>
    );
  }
}

export default connect((state) => ({
  location: state.location,
  locationStatus: state.locationStatus,
}))(withStyles(s)(WeatherOverview));
