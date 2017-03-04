import colormap from 'colormap';

class Colorer {
  constructor() {
    this.colorMaps = ['jet', 'hsv', 'hot', 'cool', 'spring', 'YIGnBu'];
  }

  /** Returns an RGBA color value for a pixel based on a data value, the
  normalization range for the data it belongs to, and color scale settings. */
  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, maxOpacity) {
    /* eslint-disable no-bitwise */

    // set normalized color coefficient
    let normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    if (!isContinuous) normValue = Math.ceil(normValue * 10) / 10;

    // set opacity coefficient
    // 0.55 + (0.15 * normValue)
    let opacityCoefficient = isContinuous ? normValue : 0.65;
    if (opacityCoefficient > 0.8) opacityCoefficient = 0.8;

    return isContinuous ?
          ((scaleTop * normValue) & scaleTop)
          + ((scaleBottom * (1 - normValue)) & scaleBottom)
          + (maxOpacity * opacityCoefficient)
          + ((0x00FF0000 * Math.abs(0.5 - normValue)) & 0x00FF0000)
          :
          ((scaleTop * normValue) & scaleTop)
          + ((scaleBottom * (1 - normValue)) & scaleBottom)
          + (maxOpacity * opacityCoefficient)
          + ((0x00FF0000 * Math.abs(0.5 - normValue)) & 0x00FF0000);

    /* Hybrid rendering that uses three-color discrete colors scale
    combined with a continuous opacity scale (colors are red, blue, purple)

    (scaleTop * Math.ceil(normValue))
    + (scaleBottom * Math.ceil(1 - normValue))
    + (maxOpacity * normValue);

    */
  }

  renderRaw(dataValue, normalizationRange) {
    const normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    return (0xFF * normValue);
  }

  renderCM(dataValue, normalizationRange, colorMap, shades) {
    // generate color scale
    const colorScale = colormap({
      colormap: colorMap,
      nshades: shades,
      format: 'rgbaString',
      alpha: 1,
    });

    // normalize data
    const normValue = dataValue > normalizationRange ?
                    shades : (dataValue / normalizationRange) * shades;

    return colorScale[Math.ceil(normValue)];
  }
}

export default Colorer;
