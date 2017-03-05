import React, { PropTypes } from 'react';
import Collapse from 'react-collapse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import { connect } from '../store.js';
import Navigation from '../Navigation/Navigation.js';
import WeatherOverview from '../WeatherOverview/WeatherOverview.js';

class Header extends React.Component {

  static propTypes = {
    showWeatherOverview: PropTypes.bool.isRequired,
  };

  render() {
    const { showWeatherOverview } = this.props;

    return (
      <div className={s.header}>
        <Collapse
          isOpened={showWeatherOverview}
          fixedHeight={50}
          keepCollapsedContent
        >
          <WeatherOverview />
        </Collapse>
        <Navigation />
      </div>
    );
  }
}

export default connect((state) => ({
  showWeatherOverview: state.showWeatherOverview,
}))(withStyles(s)(Header));
