function initialize() {
  return {
    showLayerModal: false,
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

export default { initialize, showLayerModal, hideLayerModal };
