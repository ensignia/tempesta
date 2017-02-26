class Colorer {

  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, opacity) {
    const normValue = dataValue > normalizationRange
                  ? 1 : dataValue / normalizationRange;

    if (isContinuous === true) {
      const opacityCoefficient = 0.3 + (0.7 * normValue);

      return ((scaleTop * normValue) & scaleTop) // eslint-disable-line no-bitwise
            + ((scaleBottom * (1 - normValue)) & scaleBottom) // eslint-disable-line no-bitwise
            + (opacity * opacityCoefficient);
    }
    return (scaleTop * Math.ceil(normValue))
            + (scaleBottom * Math.ceil(1 - normValue))
            + (opacity * normValue);
  }
}

export default Colorer;
