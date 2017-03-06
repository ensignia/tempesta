/* eslint-disable no-console */
import pureimage from 'pureimage';
import path from 'path';
import fs from 'fs-extra';
import CapeLayer from './layers/CapeLayer.js';
import WindLayer from './layers/WindLayer.js';
import LightningProbabilityLayer from './layers/LightningProbabilityLayer.js';
import GfsDataSource from './sources/GfsDataSource.js';
import HrrrDataSource from './sources/HrrrDataSource.js';
import LightningDataSource from './sources/LightningDataSource.js';
// import NamDataSource from './sources/NamDataSource.js';
import { server } from '../../config.js';

const DATA_DIR = path.join(__dirname, server.dataDirectory);
const TILES_DIR = path.join(DATA_DIR, 'tiles');
const GRIB_DIR = path.join(DATA_DIR, 'grib');

/** Data objects track available data sources and data layers. Tile data
requests are passed on to the appropriate Layer object. */
class Data {
  constructor() {
    this.registerLayer = this.registerLayer.bind(this);
    this.registerDataSource = this.registerDataSource.bind(this);
    this.getTile = this.getTile.bind(this);
    this.load = this.load.bind(this);

    this.layers = {};
    this.sources = {};
    this.cache = [];

    const fnt = pureimage.registerFont('public/server/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    fnt.loadSync();

    fs.ensureDir(TILES_DIR, err => {
      if (err) console.log(err);
    });

    fs.ensureDir(GRIB_DIR, err => {
      if (err) console.log(err);
    });

    this.registerLayer('cape', new CapeLayer(this));
    this.registerLayer('wind', new WindLayer(this));
    this.registerLayer('lightningProbability', new LightningProbabilityLayer(this));
    this.registerDataSource('gfs', new GfsDataSource());
    this.registerDataSource('hrrr', new HrrrDataSource());
    this.registerDataSource('lightning', new LightningDataSource());

    this.load();
    setInterval(() => {
      this.load();
    }, 60 * 60 * 1000); // Check for new data every hour
  }

  registerLayer(layerName, layer) {
    this.layers[layerName] = layer;
  }

  registerDataSource(dataSourceName, dataSource) {
    this.sources[dataSourceName] = dataSource;
  }

  getDataSource(dataSourceName) {
    return this.sources[dataSourceName];
  }

  getMeta() {
    const sources = {};
    Object.keys(this.sources).forEach((sourceName) => {
      sources[sourceName] = this.sources[sourceName].getMeta();
    });

    const layers = Object.keys(this.layers);

    return {
      sources,
      layers,
    };
  }

  isCached(tilePath) {
    // Keep cached list in memory, faster than disk lookup
    // const exists = await fsExists(tilePath);
    // const isCached = exists && process.env.NODE_ENV === 'production';
    return process.env.NODE_ENV === 'production' ? this.cache.includes(tilePath) : false;
  }

  setCached(tilePath) {
    this.cache.push(tilePath);
  }

  /**
   * Clears cache where the cache item contains the item phrase
   * TODO: Better cache matching?
   */
  clearCache(item) {
    this.cache = this.cache.filter(p => !p.includes(item));
  }

  /** Passes the tile data request on to the correct Layer, returns
  path to the output png file for the tile */
  async getTile(layerName, tileX, tileY, tileZ, options) {
    console.log(`Serving ${layerName} tile for ${tileX}/${tileY}/${tileZ} options ${options}`);
    const layer = this.layers[layerName];

    const validatedOptions = layer.getOptions(options);
    const tilePath = layer.getPath(tileX, tileY, tileZ, validatedOptions);

    if (!this.isCached(tilePath)) {
      await layer.generateTile(tilePath, tileX, tileY, tileZ, validatedOptions);
      this.setCached(tilePath);
    }

    return tilePath;
  }

  /** Calls load() on every registered data source */
  async load() {
    Object.values(this.sources).forEach((source) => {
      if (source.load()) this.clearCache(source); // Clear cache on new data
    });
  }
}

export default Data;
