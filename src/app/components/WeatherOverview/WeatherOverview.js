import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WeatherOverview.css';
import cx from 'classnames';
import fetch from '../../core/fetch';

class WeatherOverview extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  constructor() {
    super();

    this.state = {
      data: [],
    };

    this.getData = this.getData.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    const data = [{name: "Monday", icon: "2"}, {name: "Tuesday", icon: "8" }, {name: "Wednesday", icon: "15" }, {name: "Thursday", icon: "18" }, {name: "Friday", icon: "19" }];
    this.setState({ data: data });

    // fetch("/api/weather/0.5,0.5").then(function(data) {
    //   console.log(data);
    // }).error(function(err) {
    //
    // });
  }

  render() {
    const date = new Date();
    const today = date.getDay();

    const days = [];
    this.state.data.forEach(function(day) {
      days.push(<li><div className={s.icon}><img src={`/WeatherIcons/${day.icon}.svg`} width="38" height="38" alt="SunnyDemo" /><span>{day.name}</span></div></li>);
    })

    return (
            <div role="overview">
              <ul>
                {days}
              </ul>
            </div>
        );
  }
}

// <li><div><img src={"/WeatherIcons/8.svg"} width="38" height="38" alt="CloudyDemo" /></div></li>
// <li><div><img src={"/WeatherIcons/15.svg"} width="38" height="38" alt="LightDemo" /></div></li>
// <li><div><img src={"/WeatherIcons/18.svg"} width="38" height="38" alt="RainDemo" /></div></li>
// <li><div><img src={"/WeatherIcons/19.svg"} width="38" height="38" alt="WindDemo" /></div></li>
// <li><div><img src={"/WeatherIcons/23.svg"} width="38" height="38" alt="SnowDemo" /></div></li>

export default withStyles(s)(WeatherOverview);
