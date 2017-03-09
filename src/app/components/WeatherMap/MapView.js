import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import { connect } from '../store.js';
import MapDarkTheme from './config/MapDarkTheme.json';
import MapLightTheme from './config/MapLightTheme.json';
import fetch from '../../core/fetch';

function toQueryString(obj) {
  return Object.keys(obj).map((k) => {
    return `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`;
  }).join('&');
}

const DEFAULT_CENTER = {
  lat: 0.5,
  lng: 0.5,
};
const DEFAULT_ZOOM = 3;

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  let y = coord.y; // eslint-disable-line prefer-const
  let x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  const tileRange = 1 << zoom; // eslint-disable-line no-bitwise

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange;
  }

  return { x, y };
}

class MapView extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    locationStatus: PropTypes.string,
    mapPlaybackIndex: PropTypes.number,
    mapAnimationStatus: PropTypes.string,
    mapActiveLayers: PropTypes.array,
    mapActiveModel: PropTypes.string,
    className: PropTypes.string,
    theme: PropTypes.string,
    actions: PropTypes.object,
  };

  static Theme = {
    light: MapLightTheme,
    dark: MapDarkTheme,
  };

  static defaultProps = {
    theme: 'light',
  };

  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      shouldUpdateLocation: false,
      lightning: [],
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this);
    this.loadMeta = this.loadMeta.bind(this);
    this.createLayerHelper = this.createLayerHelper.bind(this);
    this.createOverlays = this.createOverlays.bind(this);
    this.updateOverlays = this.updateOverlays.bind(this);
    this.createMapOptions = this.createMapOptions.bind(this);
  }

  /**
   * On mounted, load meta data
   */
  componentWillMount() {
    this.loadMeta();

    // Render markers on map
    fetch(`/api/lightning/${(new Date()).getTime() - 120000}`) // last 2 minutes for demo purposes fixme
      .then((response) => {
        console.log(`LIGHTNING: server response -> ${response.ok} ${response.status}`);
        return response.json();
      })
      .then((response) => {
        const strikes = [];
        for (let i = 0; i < response.data.length; i += 1) {
          strikes.push(<Marker key={`${response.data[i].latitude}-${response.data[i].longitude}`}
                               type="LIGHTNING"
                               lat={response.data[i].latitude}
                               lng={response.data[i].longitude} />);
        }
        this.setState({lightning: strikes});
      });
  }

  componentWillReceiveProps(nextProps) {
    // Update overlays
    this.updateOverlays(nextProps);

    // Pan to location when requested
    if (nextProps.locationStatus === 'REQUESTING' || nextProps.locationStatus === 'REQUESTED') {
      this.setState({ shouldUpdateLocation: true });
    } else if (nextProps.locationStatus === 'DONE' && this.state.shouldUpdateLocation && this.state.mapLoaded) {
      const { latitude, longitude } = nextProps.location;

      this.panTo({ lat: latitude, lng: longitude });
      this.setZoom(DEFAULT_ZOOM);

      this.setState({ shouldUpdateLocation: false });
    }
  }

  onGoogleApiLoaded(google) {
    this.setState({ mapLoaded: true });

    this.googleApi = google;

    // Because GoogleMapReact
    this.panTo = (center) => {
      google.map.panTo(center);
    };

    this.setZoom = (zoom) => {
      google.map.setZoom(zoom);
    };

    this.updateOverlays(this.props);
  }

  async loadMeta() {
    const response = await fetch('/api/map');
    const json = await response.json();

    this.props.actions.setMapMeta(json);

    this.updateOverlays(this.props);
  }

  /**
   * Helper for creating google map Api layers
   */
  createLayerHelper(layerName, index, options) {
    const google = this.googleApi;
    const layer = new google.maps.ImageMapType({
      getTileUrl(coord, zoom) {
        const normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord) {
          return null;
        }
        const queryString = options !== null ? `?${toQueryString(options)}` : '';
        return `/api/map/${layerName}/${zoom}/${normalizedCoord.x}/${normalizedCoord.y}/tile.png${queryString}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 11,
      minZoom: 0,
      name: layerName,
    });

    return {
      layer,
      index,
      addLayer() {
        google.map.overlayMapTypes.setAt(index, layer);
      },
      removeLayer() {
        if (google.map.overlayMapTypes.getAt(index) === layer) {
          google.map.overlayMapTypes.setAt(index, null);
        }
      },
    };
  }

  /**
   * Creates the google map overlay layers
   */
  createOverlays(meta) {
    const overlays = [];
    let zIndex = 0;

    Object.keys(meta.layers).forEach((layerName) => {
      const layerMeta = meta.layers[layerName]; // Get layer meta data
      zIndex += 1; // Increase zIndex for layer, each layer on new index

      // If supportedSources exist create overlays for each one
      if (layerMeta.supportedSources) {
        layerMeta.supportedSources.forEach((sourceName) => {
          const sourceMeta = meta.sources[sourceName];

          // Each forecast hour map layer for this layer/source
          const mapLayers = [];
          for (let hour = 0; hour <= sourceMeta.forecastHours; hour += sourceMeta.forecastHourStep) {
            mapLayers.push(
              this.createLayerHelper(layerName, zIndex, {
                source: sourceName,
                forecastHour: hour,
              }),
            );
          }

          overlays.push({
            sourceName,
            layerName,
            currentMapLayer: 0,
            mapLayers,
          });
        });
      } else {
        // Else the layer is not dependent on a source, omit sourceName and create a single layer
        // overlays.push({
        //   layerName,
        //   currentMapLayer: 0,
        //   mapLayers: [MapView.createLayerHelper(this.googleApi, sourceName, layerName, hour, layerMeta.zIndex)],
        // });
      }
    });

    // Save overlays into state
    this.setState({ overlays });

    // Create placeholder layers in google maps array
    for (let i = 0; i < zIndex; i += 1) {
      this.googleApi.map.overlayMapTypes.push(null);
    }
  }

  /**
   * Creates the overlays when meta and google map is loaded
   */
  updateOverlays(nextProps) {
    const { mapActiveLayers, mapActiveModel, mapMeta, mapPlaybackIndex } = nextProps;

    if (!mapMeta || !this.state.mapLoaded) return;

    if (!this.state.overlays) this.createOverlays(mapMeta);

    // Activate correct layers in google maps overview
    this.state.overlays.forEach((overlay) => {
      const isActive = mapActiveLayers.includes(overlay.layerName)
        && (!overlay.sourceName || overlay.sourceName === mapActiveModel);

      const overlayIndex = mapPlaybackIndex % overlay.mapLayers.length;

      if (isActive) {
        overlay.mapLayers[overlayIndex].addLayer();
      } else {
        // TODO: Improve overlay, make it keep track of currently visible layer ( this may cause bugs? )
        overlay.mapLayers[overlayIndex].removeLayer();
      }
    });
  }

  /**
   * Creates a google maps options object with map defaults
   */
  createMapOptions(maps) {
    return {
      styles: MapView.Theme[this.props.theme],
      zoomControl: true,
      zoomControlOptions: {
        position: maps.ControlPosition.RIGHT_TOP,
      },
      disableDefaultUI: true,
      minZoom: 3,
    };
  }

  render() {
    const { className, location, locationStatus } = this.props;

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.BROWSER ? window.env.google.maps : null }}
          defaultZoom={DEFAULT_ZOOM}
          defaultCenter={DEFAULT_CENTER}
          options={this.createMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={this.onGoogleApiLoaded}
        >
          {locationStatus !== 'UNKNOWN' ? <Marker key="location" type="LOCATION" lat={location.latitude} lng={location.longitude} /> : null}
          {this.state.lightning}
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect((state) => ({
  mapMeta: state.mapMeta,
  mapActiveLayers: state.mapActiveLayers,
  mapActiveModel: state.mapActiveModel,
  mapAnimationStatus: state.mapAnimationStatus,
  mapPlaybackIndex: state.mapPlaybackIndex,
  theme: state.theme,
  location: state.location,
  locationStatus: state.locationStatus,
}))(MapView);
