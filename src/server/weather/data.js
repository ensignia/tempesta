import grib2json from 'grib2json';

const NAM_BASE_URL = 'https://nomads.ncdc.noaa.gov/data/meso-eta-hi/';
const HRRR_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod/';
const GFS_BASE_URL = 'http://www.nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/';

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
   */
  static getGfsURL(year, month, day, modelCycle, forecastHour) {
    return `${GFS_BASE_URL}gfs.${year}${month}${day}${modelCycle}/gfs.t${modelCycle}z.pgrb2.0p50.f${forecastHour}`;
  }

  load() {
    grib2json('./data/gfs/sample.grib2', {
      scriptPath: '../lib/grib2json/grib2json/bin/grib2json',
      names: true, // (default false): Return descriptive names too
      data: true, // (default false): Return data, not just headers
      category: 2, // Grib2 category number, equals to --fc 1
      parameter: 3, // Grib2 parameter number, equals to --fp 7
      surfaceType: 103, // Grib2 surface type, equals to --fs 103
      surfaceValue: 10, // Grib2 surface value, equals to --fv 10
    }, (err, json) => {
      if (err) return console.error(err);
      console.log(json);
      this.data.gfs = json;
    });
  }
}

export default Data;
