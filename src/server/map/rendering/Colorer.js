import colormap from 'colormap';

const NUM_SHADES = 40;

class Colorer {
  constructor() {
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-bitwise */
    this.colorScales = {
      jet: colormap({ colormap: 'jet', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      rainbow: colormap({ colormap: 'rainbow', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      plasma: colormap({ colormap: 'plasma', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      hsv: colormap({ colormap: 'hsv', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
    };
    for (const scale in this.colorScales) {
      if (Object.prototype.hasOwnProperty.call(this.colorScales, scale)) {
        for (let i = 0; i < this.colorScales[scale].length; i += 1) {
          this.colorScales[scale][i] =
              (parseInt(this.colorScales[scale][i].substring(1), 16) << 8) & 0xFFFFFF00;
        }
      }
    }
  }

  render = function render(dataValue, normalizationRange, colorMap) {
    // normalize data
    const normValue = dataValue >= normalizationRange ?
                    1 : (dataValue / normalizationRange);
    const scaleIndex = Math.floor(normValue * NUM_SHADES) - 1;
    const opacityCoefficient = normValue > 0.8 ? 0.8 : normValue;

    return this.colorScales[colorMap][scaleIndex] + (0xFF * opacityCoefficient);
  }

  drawVector(ctx, vectorData) {
    ctx.beginPath();
    ctx.moveTo(vectorData.originX, vectorData.originY);
    ctx.lineTo(vectorData.headX, vectorData.headY);
    ctx.lineTo(vectorData.arrowLeftCornerX, vectorData.arrowLeftCornerY);
    ctx.lineTo(vectorData.arrowRightCornerX, vectorData.arrowRightCornerY);
    ctx.lineTo(vectorData.headX, vectorData.headY);
    ctx.stroke();
  }
}

export default Colorer;
