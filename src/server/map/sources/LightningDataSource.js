import DataSource from './DataSource.js';


class LightningDataSource extends DataSource {
  constructor() {
    super();
    this.data = {};
  }

  getMeta() {
    return {
      latest: {},
    };
  }

  async download() {
    return true; // Triggers a load(args) call on all workers
  }

  async load(args) {
    console.log('Generating lighting Data');

    // Generates a 1-dimensional array of lightning strike recors
    function generateStrikeData() {
      const lightningArray = {};
      lightningArray.timestamp = new Date();

      for (let i = 0; i < 100; i += 1) {
        lightningArray[i] = { latitude: i, longitude: i + 1, striketime: new Date() };
      }
    }

    // Generates a 360x720 map of lightning probability values.
    function generateProbabilityMap() {
      const probabilityArray = {};
      probabilityArray.timestamp = new Date();

      for (let i = 0; i < 360; i += 1) {
        const row = {};
        for (let j = 0; j < 720; j += 1) {
          row[j] = { value: Math.random() };
        }
        probabilityArray[i] = row;
      }
    }


    // TODO put this in loop for hours
    this.data[0] = {
      strikes: generateStrikeData(),
      probability: generateProbabilityMap(),
    };

    console.log('Generated lighting Data');
    this.loaded = true;

    return true;
  }



  // Used for live lightning
  getLightningBetween(sinceDate, toDate) {
    // TODO: Implement
    return [];
  }
}

export default LightningDataSource;
