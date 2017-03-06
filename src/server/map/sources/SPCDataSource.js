import path from 'path';
import DataSource from './DataSource.js';
import fetch from '../../../app/core/fetch';
import { server } from '../../../config.js';

class SPCDataSource extends DataSource {

  constructor() {
    super();
    this.data = {};
    this.meta = null;
  }

  getMeta() {
    return {
      latest: this.meta,
    };
  }

  async parseData(forecastHour, filePath) {
    // this.data[forecastHour] = {
    //   cape: capeData[0],
    //   windU: windUData[0],
    //   windV: windVData[0],
    // };
  }

  async load() {
    console.log('Loading SPC Data');

    // Use latest data
    // const latest = available[available.length - 1];

    // if (this.meta &&
    //   this.meta.year === latest.year &&
    //   this.meta.month === latest.month &&
    //   this.meta.day === latest.day &&
    //   this.meta.modelCycle === latest.modelCycle) {
    //   // We've already loaded the latest data
    //   return false;
    // }

    // for (let forecastHour = 0; forecastHour <= this.getForecastHours(); forecastHour += this.getForecastHourStep()) {
    //   console.log(`Loading HRRR data for ${latest.day}/${latest.month} cycle ${latest.modelCycle} and forecast hour +${forecastHour}`);
    //   let filePath = await HrrrDataSource.download(
    //         latest.year,
    //         latest.month,
    //         latest.day,
    //         latest.modelCycle,
    //         forecastHour);
    // }

    console.log('Loaded SPC Data');
    // this.meta = latest;
    this.loaded = true;

    return true;
  }

}

export default SPCDataSource;
