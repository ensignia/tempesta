function initialize() {
  return {
    showLayerModal: false,
    showModelModal: false,
    showWeatherOverview: false,
  };
}

/**
 * Layer Modal
 */
function showLayerModal(state) {
  return {
    ...state,
    showLayerModal: true,
  };
}

function hideLayerModal(state) {
  return {
    ...state,
    showLayerModal: false,
  };
}

/**
 * Model Modal
 */
function showModelModal(state) {
  return {
    ...state,
    showModelModal: true,
  };
}

function hideModelModal(state) {
  return {
    ...state,
    showModelModal: false,
  };
}

/**
 * Weather Overview
 */
function showWeatherOverview(state) {
  return {
    ...state,
    showWeatherOverview: true,
  };
}

function hideWeatherOverview(state) {
  return {
    ...state,
    showWeatherOverview: false,
  };
}

export default {
  initialize,
  showLayerModal,
  hideLayerModal,
  showModelModal,
  hideModelModal,
  showWeatherOverview,
  hideWeatherOverview,
};
