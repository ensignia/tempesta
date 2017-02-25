/* eslint-disable no-console */
import grib2json from 'grib2json';
import path from 'path';
import fs from 'fs';
import os from 'os';
import fetch from '../../../app/core/fetch';

const isWin = /^win/.test(os.platform());

/** Returns the modulus of floor division a / n */
function floorMod(a, n) {
  return a - (n * (Math.floor(a / n)));
}

/** Returns JSON representation of grib2 file from grib2json library */
async function gribParser(filePath, options) {
  return await new Promise((resolve, reject) => {
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

class DataSource {

  constructor() {
    this.loaded = false;

    this.isLoaded = this.isLoaded.bind(this);
  }

  /** HELPER: Download data from url into output if not exists */
  static async downloadURL(url, output) {
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

  /** HELPER: Parses a grib file into useful data */
  static async parseGribFile(filePath, options) {
    const gribJson = await gribParser(filePath, {
      names: true, // (default false): Return descriptive names too
      data: true, // (default false): Return data, not just headers
      ...options,
    });

    return gribJson.map((data) => DataSource.parseGribData(data));
  }

  /** HELPER: Parses a block of grib2 data into a 2D array of data points */
  static parseGribData(data) {
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

    function bilinearInterpolation(pixelLon, pixelLat) {
      // translate longitude and latitude into 360x720 CAPE grid
      const x = Math.floor((pixelLon + 180) * 2);
      const y = Math.floor((-pixelLat + 90) * 2);

      let returnValue = Math.floor((((grid[y][x] + grid[y + 1][x + 1]) / 2) / 2000) * 256);
      if (returnValue > 256) returnValue = 256;
      return returnValue;
    }

    return {
      header,
      originX,
      originY,
      deltaX,
      deltaY,
      numX,
      numY,
      date,
      grid,
      bilinearInterpolation };
  }

  isLoaded() {
    return this.loaded;
  }
}

export default DataSource;
