function initialize() {
  return {
    showLayerModal: false,
    showModelModal: false,
    showSettingsModal: false,
    showWeatherOverview: false,
    showSpeedModal: false,

    location: { latitude: -1, longitude: -1 },
    locationStatus: 'UNKNOWN',

    temperatureUnits: 'celsius',
    units: 'metric',
    theme: 'light',

    mapMeta: null,
    mapActiveSpeed: 1,
    mapPlaybackIndex: 0,
    mapActiveLayers: ['cape'],
    mapActiveModel: 'gfs',
  };
}

/**
 * Settings
 */
function setTemperatureUnits(state, temperatureUnits) {
  return {
    ...state,
    temperatureUnits,
  };
}

function setUnits(state, units) {
  return {
    ...state,
    units,
  };
}

function setTheme(state, theme) {
  return {
    ...state,
    theme,
  };
}

function setMapActiveSpeed(state, mapActiveSpeed) {
  return {
    ...state,
    mapActiveSpeed,
  };
}


/**
 * Map meta
 */
function setMapMeta(state, mapMeta) {
  return {
    ...state,
    mapMeta,
  };
}

function setActiveModel(state, mapActiveModel) {
  return {
    ...state,
    mapActiveModel,
  };
}

function setActiveLayers(state, mapActiveLayers) {
  return {
    ...state,
    mapActiveLayers,
  };
}

function setMapPlaybackIndex(state, mapPlaybackIndex) {
  return {
    ...state,
    mapPlaybackIndex,
  };
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
 * Settings Modal
 */
function showSettingsModal(state) {
  if (state.showModelModal || state.showLayerModal || state.showSpeedModal) return state;
  return {
    ...state,
    showSettingsModal: true,
  };
}

function hideSettingsModal(state) {
  return {
    ...state,
    showSettingsModal: false,
  };
}

/**
 * Layer Modal
 */
function showLayerModal(state) {
  if (state.showModelModal || state.showSettingsModal || state.showSpeedModal) return state;
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
  if (state.showLayerModal || state.showSettingsModal || state.showSpeedModal) return state;
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

/**
 * Speed Overview
 */
function showSpeedModal(state) {
  if (state.showModelModal || state.showLayerModal || state.showSettingsModal) return state;
  return {
    ...state,
    showSpeedModal: true,
  };
}

function hideSpeedModal(state) {
  return {
    ...state,
    showSpeedModal: false,
  };
}

export default {
  initialize,
  showSpeedModal,
  hideSpeedModal,
  showLayerModal,
  hideLayerModal,
  showModelModal,
  hideModelModal,
  showSettingsModal,
  hideSettingsModal,
  showWeatherOverview,
  hideWeatherOverview,
  updateLocation,
  setLocationStatus,
  requestLocation,
  setMapMeta,
  setActiveModel,
  setActiveLayers,
  setMapPlaybackIndex,
  setTemperatureUnits,
  setUnits,
  setTheme,
  setMapActiveSpeed,
};
