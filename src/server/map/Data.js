/* eslint-disable no-console */
import pureimage from 'pureimage';
import path from 'path';
import fs from 'fs';
import CapeLayer from './layers/CapeLayer.js';
import WindShearLayer from './layers/WindShearLayer.js';
import GfsDataSource from './sources/GfsDataSource.js';
// import HrrrDataSource from './sources/HrrrDataSource.js';
// import NamDataSource from './sources/NamDataSource.js';
import { server } from '../../config.js';

/** Checks if file exists. Returns promise */
function fsExists(file) {
  return new Promise(resolve => {
    fs.access(file, fs.F_OK, error => resolve(!error));
  });
}

const DATA_DIR = path.join(__dirname, server.dataDirectory);
const TILES_DIR = path.join(DATA_DIR, 'tiles');
const GRIB_DIR = path.join(DATA_DIR, 'grib');

class Data {
  constructor() {
    this.registerLayer = this.registerLayer.bind(this);
    this.registerDataSource = this.registerDataSource.bind(this);
    this.getTile = this.getTile.bind(this);
    this.load = this.load.bind(this);

    this.layers = {};
    this.sources = {};

    const fnt = pureimage.registerFont('public/server/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    fnt.loadSync();

    // Make data directory
    fsExists(DATA_DIR).then((exists) => {
      if (!exists) fs.mkdir(DATA_DIR);
    });

    // Make tiles directory
    fsExists(TILES_DIR).then((exists) => {
      if (!exists) fs.mkdir(TILES_DIR);
    });

    // Make grib directory
    fsExists(GRIB_DIR).then((exists) => {
      if (!exists) fs.mkdir(GRIB_DIR);
    });

    this.registerLayer('cape', new CapeLayer());
    this.registerLayer('windshear', new WindShearLayer());
    this.registerDataSource('gfs', new GfsDataSource());
    // this.registerDataSource('hrrr', new HrrrDataSource());
    // this.registerDataSource('nam', new NamDataSource());

    this.load();
  }

  registerLayer(layerName, layer) {
    this.layers[layerName] = layer;
  }

  registerDataSource(dataSourceName, dataSource) {
    this.sources[dataSourceName] = dataSource;
  }

  async getTile(dataSourceName, layerName, tileX, tileY, tileZ) {
    const tilePath = path.join(__dirname, server.dataDirectory, `tiles/${dataSourceName}-${layerName}-${tileX}-${tileY}-${tileZ}.png`);
    const exists = await fsExists(tilePath);

    if (!exists || process.env.NODE_ENV === 'development') {
      // Get data source i.e. Gfs, and get data for a layer from it i.e. cape
      const dataSource = this.sources[dataSourceName];
      if (dataSource == null || !dataSource.isLoaded()) {
        console.log(`Invalid data source ${dataSourceName}, or not yet loaded`);
        return null;
      }

      const layer = this.layers[layerName];
      if (!layer.isSupportedSource(dataSourceName)) {
        console.log(`Layer ${layerName} does not support data source ${dataSourceName}`);
        return null;
      }

      await layer.getTile(tilePath, dataSource, tileX, tileY, tileZ);
    }

    return tilePath;
  }

  async load() {
    Object.values(this.sources).forEach(source => source.load());
  }
}

export default Data;
