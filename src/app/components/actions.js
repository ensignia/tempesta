function initialize() {
  return {
    showLayerModal: false,
    showModelModal: false,
    showWeatherOverview: false,
    location: { latitude: -1, longitude: -1 },
    locationStatus: 'UNKNOWN',
    mapAnimationStatus: 'PAUSED',
  };
}

/**
 * Map animation
 */
function setMapAnimationStatus(state, mapAnimationStatus) {
  switch (mapAnimationStatus) {
    case 'PLAYING':
    case 'PAUSED':
      return {
        ...state,
        mapAnimationStatus,
      };
    default:
      return state;
  }
}

function toggleAnimationStatus(state) {
  if (state.mapAnimationStatus === 'PLAYING') {
    return setMapAnimationStatus(state, 'PAUSED');
  }
  return setMapAnimationStatus(state, 'PLAYING');
}

/**
 * Location
 */
function updateLocation(state, coords) {
  return {
    ...state,
    location: coords,
  };
}

function setLocationStatus(state, locationStatus) {
  switch (locationStatus) {
    case 'REQUESTED':
    case 'REQUESTING':
    case 'DONE':
      return {
        ...state,
        locationStatus,
      };
    default:
      return state;
  }
}

function requestLocation(state) {
  return setLocationStatus(state, 'REQUESTED');
}

/**
 * Layer Modal
 */
function showLayerModal(state) {
  if (state.showModelModal) return state;
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
  if (state.showLayerModal) return state;
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
  updateLocation,
  setLocationStatus,
  requestLocation,
  setMapAnimationStatus,
  toggleAnimationStatus,
};
