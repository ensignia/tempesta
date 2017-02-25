class Colorer {

  render(dataValue, normalizationRange, scaleBottom, scaleTop, isContinuous, opacity) {
    const normValue = dataValue > normalizationRange
                  ? normalizationRange : dataValue / normalizationRange;

    if (isContinuous === true) {
      return ((scaleTop * normValue) & scaleTop) // eslint-disable-line no-bitwise
            + ((scaleBottom * (normValue - 1)) & scaleBottom) // eslint-disable-line no-bitwise
            + opacity;
    }
    return (scaleTop * Math.ceil(normValue)) + (scaleBottom * Math.ceil(normValue - 1)) + opacity;
  }
}

export default Colorer;
