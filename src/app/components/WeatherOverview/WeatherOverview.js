import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WeatherOverview.css';
import fetch from '../../core/fetch';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class WeatherOverview extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  constructor() {
    super();

    this.state = {
      daily: [],
    };

    this.getData = this.getData.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const response = await fetch('/api/weather/0.5,0.5');
    const json = await response.json();

    this.setState({ daily: json.daily.data });
  }

  render() {
    const days = [];
    this.state.daily.forEach((day) => {
      // day is a darksky data point object, look here for details https://darksky.net/dev/docs/response#data-point
      const dayName = dayNames[new Date(day.time * 1000).getDay()];
      const dayIconName = day.icon;

      days.push(<li><div key={day.time} className={dayIconName}><img src={`/WeatherIcons/${day.icon}.svg`} width="38" height="38" alt="lol" /><span>{dayName}</span></div></li>);
    });

    return (
      <div>
        <ul>
          {days}
        </ul>
      </div>
    );
  }
}

export default withStyles(s)(WeatherOverview);
