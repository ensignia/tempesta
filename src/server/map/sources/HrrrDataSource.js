import path from 'path';
import DataSource from './DataSource.js';
import fetch from '../../../app/core/fetch';
import { server } from '../../../config.js';

const HRRR_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod/';

function padLeft(number, zeroes, str) {
  return Array((zeroes - String(number).length) + 1).join(str || '0') + number;
}

class HrrrDataSource extends DataSource {

  constructor() {
    super();
    this.data = {};
  }

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

  static async download(year, month, day, modelCycle, forecastHour, forceDownload = false) {
    const url = HrrrDataSource.getURL(year, month, day, modelCycle, forecastHour);
    const output = path.join(__dirname, server.dataDirectory, `grib/hrrr-${year}-${month}-${day}-${modelCycle}-${forecastHour}.grib2`);

    return await DataSource.downloadURL(url, output, forceDownload);
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

  getForecastHours() {
    return process.env.NODE_ENV === 'production' ? 18 : 2;
  }

  getForecastHourStep() {
    return 1;
  }

  async parseData(forecastHour, filePath) {
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

  async load() {
    console.log('Loading HRRR Data');

    const available = await HrrrDataSource.getAvailable();

    // Use latest data
    const latest = available[available.length - 1];

    for (let forecastHour = 0; forecastHour <= this.getForecastHours(); forecastHour += this.getForecastHourStep()) {
      console.log(`Loading HRRR data for ${latest.day}/${latest.month} cycle ${latest.modelCycle} and forecast hour +${forecastHour}`);
      let filePath = await HrrrDataSource.download(
            latest.year,
            latest.month,
            latest.day,
            latest.modelCycle,
            forecastHour);

      try {
        await this.parseData(forecastHour, filePath);
      } catch (e) {
        if (e.message.includes('NullPointerException')) { // Failed likely due to corrupt data
          console.log(`Failed HRRR data for ${latest.day}/${latest.month} - cycle ${latest.modelCycle} - hour +${forecastHour}: Retrying with forced download`);
          // Try again but force a download
          filePath = await HrrrDataSource.download(
            latest.year,
            latest.month,
            latest.day,
            latest.modelCycle,
            forecastHour,
            true);

          await this.parseData(forecastHour, filePath);
        }
      }
    }

    console.log('Loaded HRRR Data');
    this.loaded = true;
  }

  getData(dataName, forecastHour) {
    if (!this.loaded) throw new Error('Data not loaded yet!');
    return this.data[forecastHour][dataName];
  }
}

export default HrrrDataSource;
