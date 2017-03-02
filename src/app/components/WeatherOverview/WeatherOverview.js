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

      days.push(<li key={day.time}><div key={day.time} className={dayIconName}><img src={`/WeatherIcons/${day.icon}.svg`} width="38" height="38" alt="lol" /><span>{dayName}</span></div></li>);
    });

    return (
      <div className={s.weatherOverview}>
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
