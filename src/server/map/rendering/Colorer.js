class Colorer {

  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, opacity) {
    /* eslint-disable no-bitwise */

    const normValue = dataValue > normalizationRange ? 1 : dataValue / normalizationRange;
    const opacityCoefficient = isContinuous ? 0.3 + (0.7 * normValue) : 0.7;

    return isContinuous ?
          ((scaleTop * normValue) & scaleTop)
          + ((scaleBottom * (1 - normValue)) & scaleBottom)
          + (opacity * opacityCoefficient)
          :
          (scaleTop * Math.ceil(normValue))
          + (scaleBottom * Math.ceil(1 - normValue))
          + (opacity * normValue);
  }
}

export default Colorer;
