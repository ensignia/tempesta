/* eslint-disable no-console */
import grib2json from 'grib2json';
import path from 'path';
import fs from 'fs';
import os from 'os';
import fetch from '../../../app/core/fetch';
import { fsExists, fsStat } from '../Util.js';

const isWin = /^win/.test(os.platform());

/** Returns JSON representation of grib2 file from grib2json library */
async function gribParser(filePath, options) {
  return await new Promise((resolve, reject) => {
    grib2json(filePath, {
      scriptPath: path.join(__dirname, `lib/grib2json/bin/grib2json${isWin ? '.cmd' : ''}`),
      ...options,
    }, (err, json) => {
      if (err) return reject(err);
      return resolve(json);
    });
  });
}


class DataSource {
  constructor() {
    // as of 08/03/2017, the structure of data is data[forecastHour].layerName
    this.loaded = false;
    this.data = {};
    this.meta = null;
  }


  /** HELPER: Download data from url into output if not exists */
  static async downloadURL(url, output) {
    try {
      const exists = await fsExists(output);

      const response = await fetch(url);

      if (exists) { // if file size matches, don't download
        const stat = await fsStat(output);
        // console.log(`Exists and lengths are ${stat.size} and ${response.headers.get('Content-Length')}`);
        if (parseInt(stat.size, 10) === parseInt(response.headers.get('Content-Length'), 10)) return output;
      }

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      const dest = fs.createWriteStream(output);
      response.body.pipe(dest);

      const onEnd = new Promise((resolve, reject) => {
        response.body.on('end', () => resolve(output));
        response.body.on('error', reject);
      });

      return await onEnd;
    } catch (e) {
      console.log('Error downloadURL()');
      console.log(e);
    }

    return null;
  }

  /** HELPER: Parses a grib file into useful data */
  static async parseGribFile(filePath, options, parserFunction) {
    const gribJson = await gribParser(filePath, {
      names: true, // (default false): Return descriptive names too
      data: true, // (default false): Return data, not just headers
      ...options,
    });

    return gribJson.map((data) => DataSource.parseGribData(data, parserFunction));
  }

  /** HELPER: Parses a block of grib2 data into a 2D array of data points */
  static parseGribData(data, parserFunction) {
    const header = data.header;
    const body = parserFunction(data);
    const info = body.info;
    const grid = body.grid;


    function bilinearInterpolation(latitude, longitude) {
      /* eslint-disable brace-style */

      // translate server standard lat/lon to grib2 header coordinates
      // see map/readme.md for rationale
      // assumes grib2 uses coordinate system rooted at top-left (90,0)
      const grib2lat = (-latitude) + 180;
      const grib2long = longitude + 180;

      // check lat/lon is within coverage bounds
      /* if (grib2lat < info.oLatitude || grib2lat > info.boundLatitude
        || grib2long < info.oLongitude || grib2long > info.boundLongitude) {
        return 0;
      } */

      // precise lat/long in grid scale
      const y = (grib2lat - 90) * (info.yNum / 180);
      const x = grib2long * (info.xNum / 360);

      // enclosing data points in grid scale lat/long (y1 is north )
      const y1 = ~~y;
      const y0 = y === y1 ? y1 : y1 + 1;
      const x0 = ~~x;
      const x1 = x === x0 ? x0 : x0 + 1;

      // no interpolation
      if (y1 === y0 && x1 === x0) {
        return grid[y][x];
      }
      // linear west -> east
      else if (y1 === y0) {
        return grid[y0][x0] + ((x - x0) * (grid[y0][x1] - grid[y0][x0]));
      }
      // linear south -> north
      else if (x1 === x0) {
        return grid[y0][x0] + ((y0 - y) * (grid[y1][x0] - grid[y0][x0]));
      }
      // bilinear (west -> east) -> north
      const y1x = grid[y1][x0] + ((x - x0) * (grid[y1][x1] - grid[y1][x0]));
      const y0x = grid[y0][x0] + ((x - x0) * (grid[y0][x1] - grid[y0][x0]));
      const yx = y0x + ((y - y0) * ((y1x - y0x) / (y1 - y0)));

      return yx;
    }

      const oLatitude = info.oLatitude;
      const oLongitude = info.oLongitude;
      const angularDy = info.angularDy;
      const angularDx = info.angularDx;
      const yNum = info.yNum;
      const xNum = info.xNum;
      const boundLatitude = info.boundLatitude;
      const boundLongitude = info.boundLongitude;
      const date = info.date;


    return {
      header,
      oLatitude,
      oLongitude,
      angularDy,
      angularDx,
      yNum,
      xNum,
      boundLatitude,
      boundLongitude,
      date,
      grid,
      bilinearInterpolation,
    };
  }
}

export default DataSource;