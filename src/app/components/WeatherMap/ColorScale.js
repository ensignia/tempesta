/* eslint-disable no-param-reassign */
import React, { PropTypes } from 'react';

function hex2rgba(hexa, stop) {
  const r = parseInt(hexa.slice(0, 2), 16);
  const g = parseInt(hexa.slice(2, 4), 16);
  const b = parseInt(hexa.slice(4, 6), 16);
  // const a = parseInt(hexa.slice(6, 8), 16) / 255;

  return `rgba(${r}, ${g}, ${b}, ${stop > 0.8 ? 0.8 : stop})`;
}

class ColorScale extends React.Component {
  static propTypes = {
    layerName: PropTypes.string,
    colors: PropTypes.array,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    width: PropTypes.width,
    height: PropTypes.height,
    className: PropTypes.string,
  };

  componentDidMount() {
    const ctx = this.canvasEl && this.canvasEl.getContext('2d');
    if (ctx) this.draw(ctx);
  }

  draw(ctx) {
    const { colors, width, height } = this.props;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    for (let i = 0; i < colors.length; i += 1) {
      // `#${colors[i].slice(0, 6)}`
      const stop = i / (colors.length - 1);
      gradient.addColorStop(stop, hex2rgba(colors[i], stop)); // hex2rgba(colors[i], maxValue)
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  render() {
    const ctx = this.canvasEl && this.canvasEl.getContext('2d');
    if (ctx) this.draw(ctx);

    return (<canvas
      ref={(el) => { this.canvasEl = el; }}
      width={this.props.width}
      height={this.props.height}
      className={this.props.className}
    />);
  }
}

export default ColorScale;
