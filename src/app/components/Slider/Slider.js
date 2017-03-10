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
    onLabel: PropTypes.func,
  };

  static defaultProps = {
    min: 0,
    max: 1,
    step: 1,
    value: 0,
  }

  constructor() {
    super();

    this.sliderId = `slider-${id()}`;
    this.sliderPos = 0;
    this.handlePos = 0;

    this.getPositionFromValue = this.getPositionFromValue.bind(this);
    this.getValueFromPosition = this.getValueFromPosition.bind(this);
    this.updatePos = this.updatePos.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updatePos);
    this.updatePos();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePos);
  }

  getPositionFromValue = (value) => {
    const { min, max } = this.props;
    this.updatePos();

    const limit = this.sliderPos - this.handlePos;
    const percentage = (value - min) / (max - min);
    const pos = Math.round(percentage * limit);

    return pos;
  }

  getValueFromPosition = (pos) => {
    const { min, max, step } = this.props;
    this.updatePos();

    const limit = this.sliderPos - this.handlePos;
    const percentage = (Math.min(Math.max(pos, 0), limit) / (limit || 1));
    const baseVal = step * Math.round(percentage * ((max - min) / step));

    const value = Math.min(Math.max(baseVal + min, min), max);

    return value;
  }

  updatePos() {
    const newSliderPos = this.sliderEl ? this.sliderEl.offsetWidth : 0;
    const newHandlePos = this.handleEl ? this.handleEl.offsetWidth : 0;

    if (Math.abs(newSliderPos - this.sliderPos) > 2) {
      this.sliderPos = newSliderPos;
    }

    if (Math.abs(newHandlePos - this.handlePos) > 2) {
      this.handlePos = newHandlePos;
    }
  }

  handleStart() {
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleEnd);
  }

  handleDrag(e) {
    e.stopPropagation();
    e.preventDefault();

    const { onChange } = this.props;

    const grab = this.handlePos / 2;
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
    const { name, value, min, max, onLabel } = this.props;

    const position = this.getPositionFromValue(value);
    const fillStyle = { width: `${position}px` };
    const handleStyle = { left: `${position}px` };

    const labels = [];
    if (onLabel && this.sliderEl && this.handleEl) {
      for (let i = min; i <= max; i += 1) {
        const el = onLabel(i);
        if (el != null) {
          labels.push(<div className={s.label} key={`label-${i}`} style={{ left: `${this.getPositionFromValue(i)}px` }} >{el}</div>);
        }
      }
    }

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
        <div className={s.labels}>
          {labels}
        </div>
      </label>
    );
  }
}

export default withStyles(s)(Slider);
