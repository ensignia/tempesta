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


/** Converts server standard lat/long to grib2 and data grid coordinates */
function getGrib2Coordinates(latitude, longitude) {
  // assumes grib2 uses coordinate system rooted at top-left (90,0)
  return {
    latitude: (-latitude) + 180,
    longitude: longitude + 180,
  };
}


class DataSource {
  constructor() {
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
        console.log(`Exists and lengths are ${stat.size} and ${response.headers.get('Content-Length')}`);
        console.log(parseInt(stat.size, 10) === parseInt(response.headers.get('Content-Length'), 10));
        if (parseInt(stat.size, 10) === parseInt(response.headers.get('Content-Length'), 10)) return output;
      }

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
    // the grid's origin (e.g., 0.0E, 90.0N)
    const originLatitude = header.la1;
    const originLongitude = header.lo1;
    // angular resolution of grid, i.e. angular deltaY and deltaX between grid points
    const angularGridResY = header.dy;
    const angularGridResX = header.dx;
    // number of grid points N-S and W-E (e.g., 144 x 73)
    const gridHeightNum = header.ny;
    const gridWidthNum = header.nx;
    // bottom and right bounds of data
    const gridLatitudeBound = originLatitude + Math.floor(gridHeightNum * angularGridResY);
    const gridLongitudeBound = originLongitude + Math.floor(gridWidthNum * angularGridResX);


    const date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    // TODO if the bounds are wrong, the scan mode might not be 000
    // Scan mode 000 assumed. Longitude increases from originLongitude and latitude
    // decreases from originLatitude. This implies origin at top left corner of
    // coverage area. Values stored in row order.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    const grid = [];
    let index = 0;
    for (let y = 0; y < gridHeightNum; y += 1) {
      const row = [];
      for (let x = 0; x < gridWidthNum; x += 1, index += 1) {
        row[x] = {value: data.data[index]};

        if (y > 0) row[x].ygradient = grid[y - 1][x].value - row[x].value;
        if (x > 0) row[x - 1].xgradient = row[x].value - row[x - 1].value;
      }
      grid[y] = row;
    }

    /** Obtains a bilinearly interpolated data value for the given latitude and longitude */
    function bilinearInterpolation(latitude, longitude) {
      /* eslint-disable brace-style */
      /* eslint-disable no-bitwise */
      const grib2coord = getGrib2Coordinates(latitude, longitude);

      // check if within coverage bounds
      if (grib2coord.latitude < originLatitude || grib2coord.latitude > gridLatitudeBound
        || grib2coord.longitude < originLongitude || grib2coord.longitude > gridLongitudeBound) {
        return 0;
      }

      // precise lat/long in grid scale
      const y = (grib2coord.latitude - 90) * (gridHeightNum / 180);
      const x = grib2coord.longitude * (gridWidthNum / 360);

      // todo this fails to detect when sitting on row or column
      const y1 = y | 0;                   // index of row for top bound
      const y0 = y1 + 1;                  // index of row for bottom bound
      const x0 = x | 0;                   // index of column for left bound
      const x1 = x0 + 1;                  // index of column for right bound
      const q1 = grid[y0][x0];            // bottom-left data point
      const q3 = grid[y1][x0];            // top-left data point

      const deltay = y0 - y;
      const deltax = x - x0;

      // no interpolation
      // todo conditions will never be true
      if (y1 === y0 && x1 === x0) {
        return q1.value;
      }
      // west -> east
      else if (y1 === y0) {
        return q1.value + (deltax * (q1.xgradient));
      }
      // south -> north
      else if (x1 === x0) {
        return q1.value + (deltay * q1.ygradient);
      }
      // west -> east, south -> north
      const q34 = q3.value + (deltax * q3.xgradient);
      const q12 = q1.value + (deltax * q1.xgradient);
      const result = q12 + (deltay * (q34 - q12));

      return result;
    }

    return {
      header,
      originLatitude,
      originLongitude,
      angularGridResY,
      angularGridResX,
      gridHeightNum,
      gridWidthNum,
      gridLatitudeBound,
      gridLongitudeBound,
      date,
      grid,
      bilinearInterpolation,
    };
  }
}

export default DataSource;
