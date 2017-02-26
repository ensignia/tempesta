import React from 'react';
import Collapse from 'react-collapse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Navigation from '../Navigation/Navigation.js';
import WeatherOverview from '../WeatherOverview/WeatherOverview.js';

class Header extends React.Component {

  constructor() {
    super();

    this.onToggleOverview = this.onToggleOverview.bind(this);

    this.state = { showWeatherOverview: false };
  }

  onToggleOverview() {
    this.setState({ showWeatherOverview: !this.state.showWeatherOverview });
  }

  render() {
    return (
      <div className={s.header}>
        <Collapse isOpened={this.state.showWeatherOverview} fixedHeight={50} keepCollapsedContent>
          <WeatherOverview />
        </Collapse>
        <Navigation onToggleOverview={this.onToggleOverview} />
      </div>
    );
  }
}

export default withStyles(s)(Header);
