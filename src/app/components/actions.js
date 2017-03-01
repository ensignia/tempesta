function initialize() {
  return {
    showLayerModal: false,
    showModelModal: false,
  };
}


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

export default { initialize, showLayerModal, hideLayerModal, showModelModal, hideModelModal };
