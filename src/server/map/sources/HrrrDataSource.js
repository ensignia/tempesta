import path from 'path';
import DataSource from './DataSource.js';
import fetch from '../../../app/core/fetch';
import { server } from '../../../config.js';
import { padLeft } from '../Util.js';

const HRRR_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod/';

class HrrrDataSource extends DataSource {
  /**
   * Gets the HRRR url formatted
   * year, month, day and modelCycle (modelCycle may be 00-23)
   * are when the model was run
   * forecastHour is the prediction for up to 18 hours from the time the model was run (00-18)
   */
   // Data available http://www.nco.ncep.noaa.gov/pmb/products/hrrr/hrrr.t00z.wrfsfcf00.grib2.shtml
  static getURL(year, month, day, modelCycle, forecastHour) {
    return `${HRRR_BASE_URL}hrrr.${padLeft(year, 4)}${padLeft(month, 2)}${padLeft(day, 2)}/hrrr.t${padLeft(modelCycle, 2)}z.wrfsfcf${padLeft(forecastHour, 2)}.grib2`;
  }

  static getPath(year, month, day, modelCycle, forecastHour) {
    return path.join(__dirname, server.dataDirectory, `grib/hrrr-${year}-${month}-${day}-${modelCycle}-${forecastHour}.grib2`);
  }

  static async getAvailable() {
    try {
      const response = await fetch(HRRR_BASE_URL);
      const data = await response.text();

      const hrrrDirRegex = /"hrrr\.(\d{4})(\d{2})(\d{2})\/"/g;

      const result = [];
      const dirResult = [];
      let matches = hrrrDirRegex.exec(data);
      while (matches) {
        dirResult.push({
          year: matches[1],
          month: matches[2],
          day: matches[3],
        });
        matches = hrrrDirRegex.exec(data);
      }

      for (const date of dirResult) {
        const dayResponse = await fetch(`${HRRR_BASE_URL}hrrr.${date.year}${date.month}${date.day}`);
        const dayData = await dayResponse.text();

        const dayResultSet = new Set();
        const hrrrDayRegex = /"hrrr\.t(\d{2})z/g;
        let dayMatches = hrrrDayRegex.exec(dayData);
        while (dayMatches) {
          dayResultSet.add(dayMatches[1]);
          dayMatches = hrrrDayRegex.exec(dayData);
        }

        dayResultSet.forEach((modelCycle) => {
          result.push({
            year: parseInt(date.year, 10),
            month: parseInt(date.month, 10),
            day: parseInt(date.day, 10),
            modelCycle: parseInt(modelCycle, 10),
          });
        });
      }

      return result;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  static parseHrrrrBody(data) {
    const oLatitude = data.header.la1;             // grid origin (e.g. 0.0E, 90.0N)
    const oLongitude = data.header.lo1;
    const angularDy = data.header.dy;              // angular displacement of grid points in degrees
    const angularDx = data.header.dx;
    const yNum = data.header.ny;                   // number of grid points N-S and W-E (e.g., 144 x 73)
    const xNum = data.header.nx;
    const boundLat = oLatitude + ~~(yNum * angularDy);
    const boundLong = oLongitude + ~~(xNum * angularDx);

    // TODO if the bounds are wrong, the scan mode might not be 000
    // Scan mode 000 assumed. Longitude increases from oLongitude and latitude
    // decreases from oLatitude. This implies origin at top left corner of
    // coverage area. Values stored in row order.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    const gridResult = [];
    let index = 0;
    for (let y = 0; y < yNum; y += 1) {
      const row = [];
      for (let x = 0; x < xNum; x += 1, index += 1) {
        row[x] = data.data[index];
      }
      gridResult[y] = row;
    }

    return {boundLatitude: boundLat, boundLongitude: boundLong, grid: gridResult};
  }

  getForecastHours() {
    return process.env.NODE_ENV === 'production' ? 10 : 2;
  }

  getForecastHourStep() {
    return 1;
  }

  getMeta() {
    return {
      forecastHours: this.getForecastHours(),
      forecastHourStep: this.getForecastHourStep(),
      latest: this.meta,
    };
  }

  async parseData(forecastHour, filePath) {
    const capeData = await DataSource.parseGribFile(filePath, {
      category: 7, // Grib2 category number, equals to --fc 1
      parameter: 6, // Grib2 parameter number, equals to --fp 7
      surfaceType: 1, // Grib2 surface type, equals to --fs 103
      //surfaceValue: 10, // Grib2 surface value, equals to --fv 10
    }, HrrrDataSource.parseHrrrrBody);

    const windUData = await DataSource.parseGribFile(filePath, {
      category: 2, // Grib2 category number, equals to --fc 1
      parameter: 2, // 2 U-wind, 3 V-wind, 192 Vert speed sheer
      surfaceType: 100, // Isobar surface
      surfaceValue: 100000,
    }, HrrrDataSource.parseHrrrrBody);

    const windVData = await DataSource.parseGribFile(filePath, {
      category: 2, // Grib2 category number, equals to --fc 1
      parameter: 3, // 2 U-wind, 3 V-wind, 192 Vert speed sheer
      surfaceType: 100, // Isobar surface
      surfaceValue: 100000,
    }, HrrrDataSource.parseHrrrrBody);

    this.data[forecastHour] = {
      cape: capeData[0],
      windU: windUData[0],
      windV: windVData[0],
    };
  }

  async download() {
    console.log('Downloading HRRR Data');
    const available = await HrrrDataSource.getAvailable();

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
    for (let forecastHour = 0;
      forecastHour <= this.getForecastHours();
      forecastHour += this.getForecastHourStep()) {
      console.log(`Downloading HRRR data for ${latest.day}/${latest.month} cycle ${latest.modelCycle} and forecast hour +${forecastHour}`);
      const url = HrrrDataSource.getURL(latest.year, latest.month, latest.day, latest.modelCycle, forecastHour);
      const output = HrrrDataSource.getPath(latest.year, latest.month, latest.day, latest.modelCycle, forecastHour);
      await DataSource.downloadURL(url, output);
      console.log('Downloaded');
    }

    this.meta = latest;

    return true;
  }

  async load(args) {
    console.log('Parsing HRRR Data');

    for (let forecastHour = 0;
      forecastHour <= this.getForecastHours();
      forecastHour += this.getForecastHourStep()) {
      console.log(`Loading HRRR data for ${args.latest.day}/${args.latest.month} cycle ${args.latest.modelCycle} and forecast hour +${forecastHour}`);

      const filePath = HrrrDataSource.getPath(
        args.latest.year,
        args.latest.month,
        args.latest.day,
        args.latest.modelCycle,
        forecastHour);

      try {
        await this.parseData(forecastHour, filePath);
      } catch (e) {
        console.log(`Error parsing HRRR data for ${args.latest.day}/${args.latest.month} - cycle ${args.latest.modelCycle}`);
        console.log(e);
        return false;
      }
    }

    console.log('Loaded HRRR Data');
    this.meta = args.latest;
    this.loaded = true;

    return true;
  }

  getData(dataName, forecastHour) {
    if (!this.loaded) throw new Error('Data not loaded yet!');
    return this.data[forecastHour][dataName];
  }
}

export default HrrrDataSource;
