/* eslint-disable no-console */
import grib2json from 'grib2json';
import path from 'path';
import fs from 'fs';
import os from 'os';
import fetch from '../../../app/core/fetch';

const isWin = /^win/.test(os.platform());

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

    // console.log('Grid origin: ' + originLatitude + ', ' + originLongitude);
    // console.log('Angular grid resolution ' + angularGridResY + ', ' + angularGridResX);
    // console.log('Grid size ' + gridHeightNum + ', ' + gridWidthNum);
    // console.log('Grid bound: ' + gridLatitudeBound + ', ' + gridLongitudeBound);

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
        row[x] = data.data[index];
      }
      grid[y] = row;
    }

    // latitude between 90(N) and -90(S), longitude between -180(W) and 180(E)
    // grid origin assumed at google(0,0) i.e. lat,long(90,-180)
    function simpleDiscreteMapping(latitude, longitude) {
      // translate server standard lat/lon to grib2 header coordinates
      // see map/readme.md for rationale
      // assumes grib2 uses coordinate system rooted at top-left (90,0)
      // TODO move conversion to its own method
      const grib2lat = (-latitude) + 180;
      const grib2long = longitude + 180;

      // check lat/lon is within coverage bounds
      if (grib2lat < originLatitude || grib2lat > gridLatitudeBound
        || grib2long < originLongitude || grib2long > gridLongitudeBound) {
        return 0;
      }

      // convert grib2 lat/lon to grid indices
      const y = Math.floor((grib2lat - 90) * (gridHeightNum / 180));
      const x = Math.floor((grib2long) * (gridWidthNum / 360));

      // return simple value
      return grid[y][x];
    }

    // averages four surrounding data points
    function simpleNeighborAverage(latitude, longitude) {
      // translate server standard lat/lon to grib2 header coordinates
      // see map/readme.md for rationale
      // assumes grib2 uses coordinate system rooted at top-left (90,0)
      // TODO move conversion to its own method
      const grib2lat = (-latitude) + 180;
      const grib2long = longitude + 180;

      // check lat/lon is within coverage bounds
      if (grib2lat < originLatitude || grib2lat > gridLatitudeBound
        || grib2long < originLongitude || grib2long > gridLongitudeBound) {
        return 0;
      }

      // convert grib2 lat/lon to grid indices
      const yFloor = Math.floor((grib2lat - 90) * 2);
      const xFloor = Math.floor((grib2long) * 2);
      const yCeil = Math.ceil((grib2lat - 90) * 2);
      const xCeil = Math.ceil((grib2long) * 2);

      if (grid[yCeil] != null) {
        return (grid[yFloor][xFloor] + grid[yFloor][xCeil]
          + grid[yCeil][xFloor] + grid[yCeil][xCeil]) / 4;
      }
      return grid[yFloor][xFloor];
    }

    function bilinearInterpolation(latitude, longitude) {
      // translate server standard lat/lon to grib2 header coordinates
      // see map/readme.md for rationale
      // assumes grib2 uses coordinate system rooted at top-left (90,0)
      // TODO move conversion to its own method
      const grib2lat = (-latitude) + 180;
      const grib2long = longitude + 180;

      // check lat/lon is within coverage bounds
      if (grib2lat < originLatitude || grib2lat > gridLatitudeBound
        || grib2long < originLongitude || grib2long > gridLongitudeBound) {
        return 0;
      }

      // precise lat/long in grid scale
      // TODO this works for a 360x720 grid
      const y = (grib2lat - 90) * (gridHeightNum / 180);
      const x = grib2long * (gridWidthNum / 360);

      // enclosing data points in grid scale lat/long (note y1 is north )
      const y1 = Math.floor(y);
      const y0 = Math.ceil(y);
      const x0 = Math.floor(x);
      const x1 = Math.ceil(x);

      /* eslint-disable brace-style */ // fak u Ryan :)
      // no interpolation
      if (Number.isInteger(y) && Number.isInteger(x)) {
        return grid[y][x];
      }
      // linear interpolation west -> east
      else if (Number.isInteger(y)) {
        return grid[y0][x0] + ((x - x0) * ((grid[y0][x1] - grid[y0][x0]) / (x1 - x0)));
      }
      // linear interpolation south -> north
      else if (Number.isInteger(x)) {
        return grid[y0][x0] + ((y - y0) * ((grid[y1][x0] - grid[y0][x0]) / (y1 - y0)));
      }
      // bilinear interpolation west -> east, south -> north
      const y1x = grid[y1][x0] + ((x - x0) * ((grid[y1][x1] - grid[y1][x0]) / (x1 - x0)));
      const y0x = grid[y0][x0] + ((x - x0) * ((grid[y0][x1] - grid[y0][x0]) / (x1 - x0)));
      const yx = y0x + ((y - y0) * ((y1x - y0x) / (y1 - y0)));

      return yx;
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
      simpleDiscreteMapping,
      simpleNeighborAverage,
      bilinearInterpolation,
    };
  }

  isLoaded() {
    return this.loaded;
  }
}

export default DataSource;
