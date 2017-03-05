import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from '../store.js';
import s from './MapControls.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';
import Slider from '../Slider/Slider.js';

class MapControls extends React.Component {

  static propTypes = {
    mapAnimationStatus: PropTypes.string,
    actions: PropTypes.object,
  };

  constructor() {
    super();

    this.state = {
      sliderValue: 0,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({
      sliderValue: value,
    });
  }

  render() {
    const { sliderValue } = this.state;
    const { actions, mapAnimationStatus } = this.props;

    return (
      <div className={cx(s.mapControls)}>
        <Icon
          className={s.playButton}
          name={mapAnimationStatus === 'PLAYING' ? 'pause' : 'play_arrow'}
          onClick={actions.toggleAnimationStatus}
          size={48}
        />
        <div className={s.slider}>
          <div className={s.currentDate}>
              current date
          </div>

          <Slider name="mapAnimationBar" min={0} max={100} value={sliderValue} onChange={this.handleChange} />
        </div>
        <div className={s.speed}>
          <span>1x</span>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  mapAnimationStatus: state.mapAnimationStatus,
}))(withStyles(s)(MapControls));
