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
import { server } from '../../config.js';
import { fsExists } from './Util.js';

const DATA_DIR = path.join(__dirname, server.dataDirectory);
const TILES_DIR = path.join(DATA_DIR, 'tiles');
const GRIB_DIR = path.join(DATA_DIR, 'grib');

/**
 * Tracks layers and models, and dispatches tile requests. Periodically issues a call to
 * load data.
 */
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

  async isCached(tilePath) {
    return await fsExists(tilePath);
  }

  /** Passes the tile data request on to the correct Layer, returns
   path to the output png file for the tile */
  async getTile(layerName, tileX, tileY, tileZ, options, req, res) {
    const layer = this.layers[layerName];

    const validatedOptions = layer.getOptions(options);
    const tilePath = layer.getPath(tileX, tileY, tileZ, validatedOptions);

    if (req.fresh) {
      res.status(304);
      // use client cache
    } else if (await this.isCached(tilePath)) {
      // is cached, send that
      res.status(200).set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(tilePath).pipe(res);
    } else {
      // generate the tile
      res.status(200).set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      });
      await layer.generateTile(tilePath, tileX, tileY, tileZ, validatedOptions, res);
    }
  }

  /** Calls load() on every registered data source */
  async download(callback) {
    Object.keys(this.sources).forEach(async (sourceName) => {
      if (await this.sources[sourceName].download()) {
        callback(sourceName, this.sources[sourceName].getMeta());
      }
    });
  }

  load(sourceName, args) {
    if (this.getDataSource(sourceName) != null) {
      this.getDataSource(sourceName).load(args);
    }
  }
}

export default Data;
