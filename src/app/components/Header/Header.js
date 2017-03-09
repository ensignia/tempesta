import React, { PropTypes } from 'react';
import Collapse from 'react-collapse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import { connect } from '../store.js';
import Navigation from '../Navigation/Navigation.js';
import WeatherOverview from '../WeatherOverview/WeatherOverview.js';
import Modal from '../Modal/Modal.js';
import Switch from '../Switch/Switch.js';
import Link from '../Link/Link.js';

class Header extends React.Component {

  static propTypes = {
    actions: PropTypes.object,
    showWeatherOverview: PropTypes.bool.isRequired,
    showSettingsModal: PropTypes.bool.isRequired,
    temperatureUnits: PropTypes.string,
    units: PropTypes.string,
    theme: PropTypes.string,
  };

  render() {
    const { actions, showWeatherOverview, showSettingsModal, temperatureUnits, units, theme } = this.props;

    console.log(temperatureUnits);
    return (
      <div className={s.header}>
        <Collapse
          isOpened={showWeatherOverview}
          keepCollapsedContent
        >
          <WeatherOverview />
        </Collapse>
        <Navigation />
        <Modal
          title="Settings"
          isOpen={showSettingsModal}
          className={s.modal}
          onClose={() => { actions.hideSettingsModal(); }}
        >
          <Link className={s.helpButton} to="/guide">
            <span name="guide">?</span>
          </Link>

          <Switch
            name="temperatureUnits"
            label="°C/°F"
            enabled={temperatureUnits === 'celsius'}
            onChange={(e) => {
              console.log('changed' + e.target.value);
              actions.setTemperatureUnits(e.target.value ? 'celsius' : 'farenheit');
            }}
          />

          <Switch
            name="units"
            label="Metric/Imperial"
            enabled={units === 'metric'}
            onChange={(e) => {
              actions.setUnits(e.target.value ? 'metric' : 'imperial');
            }}
          />

          <Switch
            name="theme"
            label="Light/Dark"
            enabled={theme === 'light'}
            onChange={(e) => {
              actions.setTheme(e.target.value ? 'light' : 'dark');
            }}
          />

        </Modal>
      </div>
    );
  }
}

export default connect((state) => ({
  showWeatherOverview: state.showWeatherOverview,
  showSettingsModal: state.showSettingsModal,
  temperatureUnits: state.temperatureUnits,
  units: state.units,
  theme: state.theme,
}))(withStyles(s)(Header));
