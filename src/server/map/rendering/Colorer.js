class Colorer {

  /** Returns an RGBA color value for a pixel based on a data value, the
  normalization range for the data it belongs to, and color scale settings. */
  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, maxOpacity) {
    /* eslint-disable no-bitwise */

    // set normalized color coefficient
    let normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    if (!isContinuous) normValue = Math.ceil(normValue * 10) / 10;

    // set opacity coefficient
    const opacityCoefficient = isContinuous ? 0.55 + (0.15 * normValue) : 0.65;

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

  renderRaw(dataValue, normalizationRange) { // eslint-disable-line class-methods-use-this
    const normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    return (0xFF * normValue);
  }
}

export default Colorer;
