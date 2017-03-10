import colormap from 'colormap';

const NUM_SHADES = 0;

class Colorer {
  constructor() {
    this.colorScalesHex = {
      jet: colormap({ colormap: 'jet', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      rainbow: colormap({ colormap: 'rainbow', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      plasma: colormap({ colormap: 'plasma', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
      hsv: colormap({ colormap: 'hsv', nshades: NUM_SHADES, format: 'hex', alpha: 1 }),
    };
    this.colorScales = {};

    Object.keys(this.colorScalesHex).forEach((scaleName) => {
      const scale = this.colorScalesHex[scaleName];
      const res = [];
      for (let i = 0; i < scale.length; i += 1) {
        res[i] = (parseInt(scale[i].substring(1), 16) * 256) & 0xFFFFFF00;
      }
      this.colorScales[scaleName] = res;
    });
  }

  getScale(colorMap) {
    return this.colorScalesHex[colorMap];
  }

  render(dataValue, normalizationRange, colorMap, fixedAlpha) {
    // normalize data
    const normValue = dataValue >= normalizationRange ? 1 : (dataValue / normalizationRange);
    const scaleIndex = ~~(normValue * NUM_SHADES) - 1;
    let opacityCoefficient = 0;

    if (fixedAlpha !== undefined) opacityCoefficient = fixedAlpha;
    else opacityCoefficient = normValue > 0.8 ? 0.8 : normValue;

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
