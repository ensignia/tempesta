class Colorer {

  /** Returns an RGBA color value for a pixel based on a data value, the
  normalization range for the data it belongs to, and color scale settings. */
  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, maxOpacity) {
    /* eslint-disable no-bitwise */

    const normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    const opacityCoefficient = isContinuous ? 0.3 + (0.7 * normValue) : 0.7;

    return isContinuous ?
          ((scaleTop * normValue) & scaleTop)
          + ((scaleBottom * (1 - normValue)) & scaleBottom)
          + (maxOpacity * opacityCoefficient)
          :
          (scaleTop * Math.ceil(normValue))
          + (scaleBottom * Math.ceil(1 - normValue))
          + (maxOpacity * normValue);
  }
}

export default Colorer;
