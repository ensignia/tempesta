import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import moment from 'moment';
import { connect } from '../store.js';
import s from './WeatherOverview.css';
import fetch from '../../core/fetch';

const NUM_DAYS = 4;

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
      currently: {},
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
    const response = await fetch(`api/weather/${coords.latitude},${coords.longitude}`);
    const json = await response.json();

    this.setState({ daily: json.daily.data, currently: json.currently });
  }

  render() {
    const { daily, currently, hasData } = this.state;

    if (hasData) {
      const days = [];
      for (let i = 1; i <= Math.min(NUM_DAYS, daily.length); i += 1) {
        const day = daily[i];
        const dayName = moment(day.time).format('ddd');

        days.push(
          <div key={day.time} className={s.vertical}>
            <img src={`/WeatherIcons/${day.icon}.svg`} width="19" height="19" alt={day.icon} />
            <span className={s.dayName}>{dayName}</span>
          </div>);
      }

      return (
        <div className={s.weatherOverview}>
          <div className={cx(s.current, s.vertical)}>
            <span className={s.dayName}>Today</span>
            <span>{`${~~currently.temperature} °C`}</span>
          </div>
          <div className={s.currentIcon}>
            <img src={`/WeatherIcons/${currently.icon}.svg`} width="36" height="36" alt={currently.icon} />
          </div>
          <div className={s.forecast}>
            {days}
          </div>
        </div>
      );
    }

    return (
      <div className={s.weatherOverview}>
        <span>Loading...</span>
      </div>
    );
  }
}

export default connect((state) => ({
  location: state.location,
  locationStatus: state.locationStatus,
}))(withStyles(s)(WeatherOverview));
