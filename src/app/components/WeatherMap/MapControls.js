import React, { PropTypes } from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MapControls.css';
import Link from '../Link/Link.js';
import Icon from '../Icon/Icon.js';
import Slider from '../Slider/Slider.js';

class MapControls extends React.Component {

  static propTypes = {
    className: PropTypes.string,
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

    return (
      <div className={cx(s.mapControls)}>
        <Link className={cx(s.playButton)} to="/">
          <Icon name="play_arrow" size={48} />
        </Link>
        <div className={s.slider}>
          <Slider name="test" min={0} max={100} value={sliderValue} onChange={this.handleChange} />
        </div>
        <div className={s.speed}>
          <span>1x</span>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapControls);
