import path from 'path';
import DataSource from './DataSource.js';
import fetch from '../../../app/core/fetch';
import { server } from '../../../config.js';

const GFS_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/';

function padLeft(number, zeroes, str) {
  return Array((zeroes - String(number).length) + 1).join(str || '0') + number;
}


class GfsDataSource extends DataSource {
  constructor() {
    super();
    this.data = {};
    this.meta = null;
  }

  /**
   * Gets the GFS url formatted
   * year, month, day and modelCycle (modelCycle may be 00, 06, 12, 18)
   * are when the model was run
   * forecastHour is the prediction for up to 18 hours from the time the model was run (000-384)
   * in mutliples of 3
   */
  static getURL(year, month, day, modelCycle, forecastHour) {
    return `${GFS_BASE_URL}gfs.${padLeft(year, 4)}${padLeft(month, 2)}${padLeft(day, 2)}${padLeft(modelCycle, 2)}/gfs.t${padLeft(modelCycle, 2)}z.pgrb2.0p50.f${padLeft(forecastHour, 3)}`;
  }

  static getPath(year, month, day, modelCycle, forecastHour) {
    return path.join(__dirname, server.dataDirectory, `grib/gfs-${year}-${month}-${day}-${modelCycle}-${forecastHour}.grib2`);
  }

  static async getAvailable() {
    try {
      const response = await fetch(GFS_BASE_URL);
      const data = await response.text();

      const gfsDirRegex = /"gfs\.(\d{4})(\d{2})(\d{2})(\d{2})\/"/g;

      const result = [];
      let matches = gfsDirRegex.exec(data);
      while (matches) {
        result.push({
          year: parseInt(matches[1], 10),
          month: parseInt(matches[2], 10),
          day: parseInt(matches[3], 10),
          modelCycle: parseInt(matches[4], 10),
        });
        matches = gfsDirRegex.exec(data);
      }

      return result;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  getForecastHours() {
    return process.env.NODE_ENV === 'production' ? 24 : 6;
  }

  getForecastHourStep() {
    return 3;
  }

  getMeta() {
    return {
      forecastHours: this.getForecastHours(),
      forecastHourStep: this.getForecastHourStep(),
      latest: this.meta,
    };
  }

  async parseData(forecastHour, filePath) {
    this.data[forecastHour] = {};

    const capeData = await DataSource.parseGribFile(filePath, {
      category: 7, // Grib2 category number, equals to --fc 1
      parameter: 6, // Grib2 parameter number, equals to --fp 7
      surfaceType: 1, // Grib2 surface type, equals to --fs 103
      //surfaceValue: 10, // Grib2 surface value, equals to --fv 10
    });

    const windUData = await DataSource.parseGribFile(filePath, {
      category: 2, // Grib2 category number, equals to --fc 1
      parameter: 2, // 2 U-wind, 3 V-wind, 192 Vert speed sheer
      surfaceType: 100, // Isobar surface
      surfaceValue: 100000,
    });

    const windVData = await DataSource.parseGribFile(filePath, {
      category: 2, // Grib2 category number, equals to --fc 1
      parameter: 3, // 2 U-wind, 3 V-wind, 192 Vert speed sheer
      surfaceType: 100, // Isobar surface
      surfaceValue: 100000,
    });

    this.data[forecastHour] = {
      cape: capeData[0],
      windU: windUData[0],
      windV: windVData[0],
    };
  }

  async download() {
    console.log('Downloading GFS data');
    const available = await GfsDataSource.getAvailable();
    // Use latest data
    const latest = available[available.length - 1];

    if (this.meta &&
      this.meta.year === latest.year &&
      this.meta.month === latest.month &&
      this.meta.day === latest.day &&
      this.meta.modelCycle === latest.modelCycle) {
      // We've already loaded the latest data
      return false;
    }

    // for every available hour, download data and place in this.data[hour]
    for (let forecastHour = 0; forecastHour <= this.getForecastHours(); forecastHour += this.getForecastHourStep()) {
      console.log(`Downloading GFS data for ${latest.day}/${latest.month} cycle ${latest.modelCycle} and forecast hour +${forecastHour}`);
      const url = GfsDataSource.getURL(latest.year, latest.month, latest.day, latest.modelCycle, forecastHour);
      const output = GfsDataSource.getPath(latest.year, latest.month, latest.day, latest.modelCycle, forecastHour);
      await DataSource.downloadURL(url, output);
      console.log('Downloaded');
    }

    this.meta = latest;

    return true;
  }

  /**
   * Returns true if loaded new data, false otherwise
   */
  async load(args) {
    console.log('Parsing GFS Data');

    // for every available hour, download data and place in this.data[hour]
    for (let forecastHour = 0; forecastHour <= this.getForecastHours(); forecastHour += this.getForecastHourStep()) {
      console.log(`Parsing GFS data for ${args.latest.day}/${args.latest.month} cycle ${args.latest.modelCycle} and forecast hour +${forecastHour}`);
      const filePath = GfsDataSource.getPath(args.latest.year, args.latest.month, args.latest.day, args.latest.modelCycle, forecastHour);
      try {
        await this.parseData(forecastHour, filePath);
      } catch (e) {
        console.log(`Error parsing GFS data for ${args.latest.day}/${args.latest.month} cycle ${args.latest.modelCycle}`);
        return false;
      }
    }

    console.log('Loaded GFS Data');
    this.meta = args.latest;
    this.loaded = true;

    return true;
  }

  getData(dataName, forecastHour) {
    if (!this.loaded) throw new Error('Data not loaded yet!');
    return this.data[forecastHour][dataName];
  }
}

export default GfsDataSource;
