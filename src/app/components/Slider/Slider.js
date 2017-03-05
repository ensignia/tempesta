import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slider.css';

let currentId = 1;

function id() {
  currentId += 1;
  return currentId;
}

class Slider extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number,
    step: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
    onChangeComplete: PropTypes.func,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    value: 0,
  }

  constructor() {
    super();

    this.sliderId = `slider-${id()}`;
    this.state = {
      grab: 0,
    };

    this.getPositionFromValue = this.getPositionFromValue.bind(this);
    this.getValueFromPosition = this.getValueFromPosition.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleUpdate);
    this.handleUpdate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleUpdate);
  }

  getPositionFromValue = (value) => {
    const { limit } = this.state;
    const { min, max } = this.props;
    const percentage = (value - min) / (max - min);
    const pos = Math.round(percentage * limit);

    return pos;
  }

  getValueFromPosition = (pos) => {
    const { limit } = this.state;
    const { min, max, step } = this.props;
    const percentage = (Math.min(Math.max(pos, 0), limit) / (limit || 1));
    const baseVal = step * Math.round(percentage * ((max - min) / step));

    const value = Math.min(Math.max(baseVal + min, min), max);

    return value;
  }

  handleUpdate() {
    const sliderPos = this.sliderEl.offsetWidth;
    const handlePos = this.handleEl.offsetWidth;

    this.setState({
      limit: sliderPos - handlePos,
      grab: handlePos / 2,
    });
  }

  handleStart() {
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleEnd);
  }

  handleDrag(e) {
    e.stopPropagation();
    e.preventDefault();
    const { grab } = this.state;
    const { onChange } = this.props;
    const coordinate = !e.touches ? e.clientX : e.touches[0].clientX;
    const direction = this.sliderEl.getBoundingClientRect().left;
    const pos = coordinate - direction - grab;
    const value = this.getValueFromPosition(pos);
    if (onChange) onChange(value);
  }

  handleEnd(e) {
    const { onChangeComplete } = this.props;
    if (onChangeComplete) onChangeComplete(e);
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleEnd);
  }

  render() {
    const { name, value, min, max } = this.props;

    const position = this.getPositionFromValue(value);
    const fillStyle = { width: `${position}px` };
    const handleStyle = { left: `${position}px` };

    return (
      <label className={s.sliderLabel} htmlFor={this.sliderId}>
        <input name={name} min={min} max={max} type="range" value={value} id={this.sliderId} />
        <div
          ref={(l) => { this.sliderEl = l; }}
          onMouseDown={this.handleDrag}
          onMouseUp={this.handleEnd}
          onTouchStart={this.handleDrag}
          onTouchEnd={this.handleEnd}
          className={s.slider}
        >
          <div
            className={s.sliderFill}
            style={fillStyle}
          />
          <div
            ref={(l) => { this.handleEl = l; }}
            className={s.sliderHandle}
            onMouseDown={this.handleStart}
            onTouchMove={this.handleDrag}
            onTouchEnd={this.handleEnd}
            style={handleStyle}
          />
        </div>
      </label>
    );
  }
}

export default withStyles(s)(Slider);
