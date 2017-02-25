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

  static async download(year, month, day, modelCycle, forecastHour) {
    const url = GfsDataSource.getURL(year, month, day, modelCycle, forecastHour);
    const output = path.join(__dirname, server.dataDirectory, `grib/gfs-${year}-${month}-${day}-${modelCycle}-${forecastHour}.grib2`);

    return await DataSource.downloadURL(url, output);
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

  async load() {
    console.log('Loading GFS Data');

    const available = await GfsDataSource.getAvailable();

    // Use latest data
    // FIXME: Temp fix
    const latest = available[available.length - 2];
    for (let hour = 0; hour < 3; hour += 3) {
      console.log(`Loading GFS data for ${latest.day}/${latest.month} cycle ${latest.modelCycle} and forecast hour +${hour}`);
      const filePath = await GfsDataSource.download(
        latest.year,
        latest.month,
        latest.day,
        latest.modelCycle,
        hour);

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

      this.data[hour] = {
        cape: capeData[0],
        windU: windUData[0],
        windV: windVData[0],
      };
    }

    console.log('Loaded GFS Data');
    this.loaded = true;
  }

  getData(dataName, forecastHour) {
    return this.data[forecastHour][dataName];
  }
}

export default GfsDataSource;