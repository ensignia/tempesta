/* eslint-disable no-console */
import grib2json from 'grib2json';
import path from 'path';
import fs from 'fs';
import os from 'os';
// import gm from 'gm';
import pureimage from 'pureimage';
import fetch from '../../app/core/fetch';

const NAM_BASE_URL = 'https://nomads.ncdc.noaa.gov/data/meso-eta-hi/';
const HRRR_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod/';
const GFS_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/';

const DATA_DIRECTORY = '../data';

const isWin = /^win/.test(os.platform());

/** Returns JSON representation of grib2 file from grib2json library */
function gribParser(filePath, options) {
  return new Promise((resolve, reject) => {
    grib2json(filePath, {
      scriptPath: path.join(__dirname, `../lib/grib2json/bin/grib2json${isWin ? '.cmd' : ''}`),
      ...options,
    }, (err, json) => {
      if (err) return reject(err);
      return resolve(json);
    });
  });
}

/** Checks if file exists. Returns promise */
function fsExists(file) {
  return new Promise(resolve => {
    fs.access(file, fs.F_OK, error => resolve(!error));
  });
}

/** Returns the modulus of floor division a / n */
function floorMod(a, n) {
  return a - (n * (Math.floor(a / n)));
}

/** Converts a google maps tile number to the longitude value
of its upper left corner */
function tile2long(x, z) {
  return (((x / (2 ** z)) * 360) - 180);
}

/** Converts a google maps tile number to the latitude value
of its upper left corner */
function tile2lat(y, z) {
  const n = Math.PI - (2 * Math.PI * (y / (2 ** z)));
  return ((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

class Data {

  constructor() {
    this.data = {};
  }

  /**
   * Gets the NAM url formatted
   * year, month, day and modelCycle (modelCycle may be 0000, 0006, 0012, 0018)
   * are when the model was run
   * forecastHour is the prediction for up to 84 hours from the time the model was run (000-084)
   */
  static getNamURL(year, month, day, modelCycle, forecastHour) {
    return `${NAM_BASE_URL}${year}${month}/${year}${month}${day}/nam_218_${year}${month}${day}_${modelCycle}_${forecastHour}.grb`;
  }

  /**
   * Gets the HRRR url formatted
   * year, month, day and modelCycle (modelCycle may be 00-23)
   * are when the model was run
   * forecastHour is the prediction for up to 18 hours from the time the model was run (00-18)
   */
   // Data available http://www.nco.ncep.noaa.gov/pmb/products/hrrr/hrrr.t00z.wrfsfcf00.grib2.shtml
  static getHrrrURL(year, month, day, modelCycle, forecastHour) {
    return `${HRRR_BASE_URL}hrrr.${year}${month}${day}/hrrr.t${modelCycle}z.wrfsfcf${forecastHour}.grib2`;
  }

  /**
   * Gets the GFS url formatted
   * year, month, day and modelCycle (modelCycle may be 00, 06, 12, 18)
   * are when the model was run
   * forecastHour is the prediction for up to 18 hours from the time the model was run (000-384)
   * in mutliples of 3
   */
  static getGfsURL(year, month, day, modelCycle, forecastHour) {
    return `${GFS_BASE_URL}gfs.${year}${month}${day}${modelCycle}/gfs.t${modelCycle}z.pgrb2.0p50.f${forecastHour}`;
  }

  static async downloadGfs(year, month, day, modelCycle, forecastHour) {
    const url = Data.getGfsURL(year, month, day, modelCycle, forecastHour);
    const output = path.join(__dirname, DATA_DIRECTORY, `grib/gfs-${year}-${month}-${day}-${modelCycle}-${forecastHour}.grib2`);

    return await Data.download(url, output);
  }

  static async getGfsAvailable() {
    try {
      const response = await fetch(GFS_BASE_URL);
      const data = await response.text();

      const gfsDirRegex = /"gfs\.(\d{4})(\d{2})(\d{2})(\d{2})\/"/g;

      const result = [];
      let matches = gfsDirRegex.exec(data);
      while (matches) {
        result.push({
          year: matches[1],
          month: matches[2],
          day: matches[3],
          modelCycle: matches[4],
        });
        matches = gfsDirRegex.exec(data);
      }

      return result;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  /** Download data from url into output if not exists */
  static async download(url, output) {
    try {
      const exists = await fsExists(output);
      if (exists) return output;

      const response = await fetch(url);
      const dest = fs.createWriteStream(output);
      response.body.pipe(dest);

      const onEnd = new Promise((resolve, reject) => {
        response.body.on('end', () => resolve(output));
        response.body.on('error', reject);
      });

      return await onEnd;
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  /** Parses a block of data into a 2D array of data points */
  static parseData(data) {
    const header = data.header;
    const originX = header.lo1; // the grid's origin (e.g., 0.0E, 90.0N)
    const originY = header.la1;
    const deltaX = header.dx; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    const deltaY = header.dy;
    const numX = header.nx; // number of grid points W-E and N-S (e.g., 144 x 73)
    const numY = header.ny;

    const date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from originX, and latitude decreases from originY
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    const grid = [];
    let index = 0;
    for (let y = 0; y < numY; y += 1) {
      const row = [];
      for (let x = 0; x < numX; x += 1, index += 1) {
        row[x] = data.data[index];
      }
      grid[y] = row;
    }

    function getNearest(lon, lat) {
      // calculate longitude index in wrapped range [0, 360]
      const x = floorMod(lon - originX, 360) / deltaX;
      // calculate latitude index in direction +90 to -90
      const y = (originY - lat) / deltaY;

      // TODO: Add bilinear interpolation instead of nearest?
      return grid[y] ? grid[y][x] : null;
    }

    return { header, originX, originY, deltaX, deltaY, numX, numY, date, grid, getNearest };
  }

  async load() {
    const fnt = pureimage.registerFont('public/server/SourceSansPro-Regular.ttf', 'Source Sans Pro');
    fnt.loadSync();

    const dataDir = path.join(__dirname, DATA_DIRECTORY);
    let exists = await fsExists(dataDir);
    if (!exists) fs.mkdirSync(dataDir);

    exists = await fsExists(path.join(dataDir, 'grib'));
    if (!exists) fs.mkdirSync(path.join(dataDir, 'grib'));

    exists = await fsExists(path.join(dataDir, 'tiles'));
    if (!exists) fs.mkdirSync(path.join(dataDir, 'tiles'));

    const gfsAvailable = await Data.getGfsAvailable();
    const latestGfsFile = gfsAvailable[gfsAvailable.length - 1];

    const filePath = await Data.downloadGfs(latestGfsFile.year, latestGfsFile.month, latestGfsFile.day, latestGfsFile.modelCycle, '000');
    console.log(filePath);
    const result = await gribParser(filePath, {
      names: true, // (default false): Return descriptive names too
      data: true, // (default false): Return data, not just headers
      category: 7, // Grib2 category number, equals to --fc 1
      parameter: 6, // Grib2 parameter number, equals to --fp 7
      surfaceType: 1, // Grib2 surface type, equals to --fs 103
      //surfaceValue: 10, // Grib2 surface value, equals to --fv 10
    });

    // Ground level CAPE
    this.gfs = {
      cape: Data.parseData(result[0]),
    };
  }

  async getTile(dataSource, layer, tileX, tileY, tileZ) {
    // libs: pureImage
    // images need alpha component
    if (!this[dataSource]) throw new Error('Data source not yet loaded');

    const data = this[dataSource][layer];
    const tilePath = path.join(__dirname, DATA_DIRECTORY, `tiles/gfs-${tileX}-${tileY}-${tileZ}.png`);

    const exists = await fsExists(tilePath);
    if (!exists) {
      await new Promise((resolve, reject) => {
        console.log(`Generating tile ${tileX}/${tileY}/${tileZ}`);

        const startLong = tile2long(tileX, tileZ);
        const endLong = tile2long(tileX + 1, tileZ);
        const startLat = tile2lat(tileY, tileZ);
        const endLat = tile2lat(tileY + 1, tileZ);

        console.log(startLong + endLong + startLat + endLat);

        const image = pureimage.make(256, 256);
        const ctx = image.getContext('2d');

        for (let yPixel = 0; yPixel < 256; yPixel += 1) {
          for (let xPixel = 0; xPixel < 256; xPixel += 1) {
            const pixelData = data.getNearest((xPixel / 256) * 360, (yPixel / 256) * 90);
            const val = 0x00222288 + (pixelData << 16); // eslint-disable-line no-bitwise
            ctx.compositePixel(xPixel, yPixel, val);
          }
        }

        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.setFont('Source Sans Pro', 20);
        ctx.fillText(`Tile ${tileX}/${tileY}/${tileZ}`, 10, 50);

        pureimage.encodePNG(image, fs.createWriteStream(tilePath), (err) => {
          if (err) return reject(err);
          return resolve();
        });
      });
    }

    return tilePath;
  }
}

export default Data;
