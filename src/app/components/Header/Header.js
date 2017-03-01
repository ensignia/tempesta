import React, { PropTypes } from 'react';
import Collapse from 'react-collapse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Navigation from '../Navigation/Navigation.js';
import WeatherOverview from '../WeatherOverview/WeatherOverview.js';

class Header extends React.Component {

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.removeListener = this.context.store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    return (
      <div className={s.header}>
        <Collapse
          isOpened={this.context.store.getState().showWeatherOverview}
          fixedHeight={50}
          keepCollapsedContent
        >
          <WeatherOverview />
        </Collapse>
        <Navigation onToggleOverview={this.onToggleOverview} />
      </div>
    );
  }
}

export default withStyles(s)(Header);
