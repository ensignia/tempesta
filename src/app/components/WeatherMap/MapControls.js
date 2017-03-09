import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import moment from 'moment';
import { connect } from '../store.js';
import s from './MapControls.css';
import Icon from '../Icon/Icon.js';
import Slider from '../Slider/Slider.js';
import Link from '../Link/Link.js';

class MapControls extends React.Component {

  static propTypes = {
    mapActiveModel: PropTypes.string,
    mapActiveSpeed: PropTypes.number,
    mapMeta: PropTypes.object,
    actions: PropTypes.object,
  };

  constructor() {
    super();

    this.state = {
      maxValue: 1,
      sliderValue: 0,
      isPlaying: false,
      playbackSpeed: 1,
    };

    this.handleChange = this.handleChange.bind(this);
    this.playAnimation = this.playAnimation.bind(this);
    this.pauseAnimation = this.pauseAnimation.bind(this);
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { mapActiveModel, mapMeta, mapActiveSpeed } = nextProps;

    if (mapMeta !== null && mapMeta.sources[mapActiveModel] !== null) {
      const source = mapMeta.sources[mapActiveModel];
      this.setState({ maxValue: source.forecastHours / source.forecastHourStep });
    }

    if (this.state.playbackSpeed !== mapActiveSpeed) {
      this.setState({ playbackSpeed: mapActiveSpeed });
      if (this.state.isPlaying) this.playAnimation();
    }
  }

  handleChange(value) {
    const { actions } = this.props;

    if (value !== this.state.sliderValue) actions.setMapPlaybackIndex(value);

    this.setState({
      sliderValue: value,
    });
  }

  /**
   * Plays animation of current layers
   */
  playAnimation() {
    if (this.state.isPlaying) this.pauseAnimation();

    this.animation = setInterval(() => {
      const { sliderValue, maxValue } = this.state;

      this.handleChange((sliderValue + 1) % (maxValue + 1));
    }, 3000 / this.state.playbackSpeed);

    this.setState({ isPlaying: true });
  }

  /**
   * Stops all animation, position in animation is still stored
   */
  pauseAnimation() {
    clearInterval(this.animation);
    this.setState({ isPlaying: false });
  }

  toggleAnimation() {
    const { isPlaying } = this.state;

    if (isPlaying) this.pauseAnimation();
    else this.playAnimation();
  }

  render() {
    const { sliderValue, isPlaying, minValue, maxValue } = this.state;
    const { mapMeta, mapActiveModel, actions, mapActiveSpeed } = this.props;

    let dateOutput = 'Loading...';

    if (mapMeta !== null
      && mapMeta.sources[mapActiveModel] !== null
      && mapMeta.sources[mapActiveModel].latest != null) {
      const source = mapMeta.sources[mapActiveModel];
      const dateString = `${source.latest.year}-${source.latest.month}-${source.latest.day} ${source.latest.modelCycle}`;
      dateOutput = moment(dateString, 'YYYY-MM-DD H').format('dddd, MMMM Do YYYY, HH:mm');
    }

    return (
      <div className={cx(s.mapControls)}>
        <div className={s.play}>
          <Icon
            className={s.playButton}
            name={isPlaying ? 'pause' : 'play_arrow'}
            onClick={this.toggleAnimation}
            size={36}
          />
        </div>
        <div className={s.slider}>
          <div className={s.currentDate}>
            {dateOutput}
          </div>

          <Slider
            name="mapAnimationBar"
            min={minValue}
            max={maxValue}
            value={sliderValue}
            onChange={this.handleChange}
            onLabel={i => <div>{`+${i}`}</div>}
          />
        </div>
        <Link className={s.speed} to="#" onClick={() => { actions.showSpeedModal(); }}>
          <span>{mapActiveSpeed}x</span>
        </Link>
      </div>
    );
  }
}

export default connect((state) => ({
  mapActiveModel: state.mapActiveModel,
  mapMeta: state.mapMeta,
  mapActiveSpeed: state.mapActiveSpeed,
}))(withStyles(s)(MapControls));
