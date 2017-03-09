import DataSource from './DataSource.js';
const seedrandom = require('seedrandom');

const STORM_INTENSITY = 200;                    // maximum strikes per storm per hour
const STORM_SPEED = 4;                          // maximum degrees of movement per hour
const STORM_SPREAD = 5;                         // maximum degrees of strike y/x distance from epicenter
const STORM_DEATH = 0.3;                        // probability per hour of a storm dying
const STORM_GENESIS = 0.3;                      // probability per hour of a storm starting
const STORM_MAXNUM = 6;

class LightningDataSource extends DataSource {
  constructor() {
    super();
    this.meta = {
      start: 0,                                 // start of current block
      end: 0,                                   // end of current block
    };
    this.data = [];                             // must contain 60 arrays of strikes
    this.random = {
      generator: new seedrandom('gooby'),
      epicenters: [],
      stormdeath: STORM_DEATH,
      stormgenesis: STORM_GENESIS,
    };
    this.random.generator(); // not sure why this is needed

    // todo make own method
    for (let epicenter = 0; epicenter < this.random.generator() * STORM_MAXNUM; epicenter += 1) {
      this.random.epicenters.push({
        latitude: this.random.generator() * 180,
        longitude: this.random.generator() * 360,
        speed: this.random.generator() * STORM_SPEED,
        intensity: this.random.generator() * STORM_INTENSITY,
        spread: this.random.generator() * STORM_SPREAD,
      })
    }
  }

  getMeta() {
    return {
      // todo do i need to fix this?
      latest: {},
    };
  }

  /**
   * Dummy method for compliance with datasource/datalayer system.
   * @returns {boolean} true
   */
  async download() {
    return true; // Triggers a load(args) call on all workers
  }

  /**
   * Generates an hour's worth of strikes, organized into blocks of length 1 minute.
   *
   * @param args metadata of this source as returned by getMeta
   * @returns {boolean} true todo error handling
   */
  async load(args) {
    console.log(`LIGHTNING: load -> ${this.random.epicenters.length} epicenters`);

    try {
      // move bounds forward by one hour
      this.meta.start = this.meta.start + 3600000;
      this.meta.end = this.meta.start + 3600000;

      // flush and rebuild strike data array
      this.data = [];
      for (let i = 0; i < 60; i += 1) {
        this.data[i] = [];
      }

      // for each epicenter, generate new data
      for (let epicenter = 0; epicenter < this.random.epicenters.length; epicenter += 1) {
        // storm death
        if (this.random.generator() < this.random.stormdeath) {
          this.random.epicenters.splice(epicenter);
          epicenter -= 1;
          continue;
        }
        // storm genesis
        if (this.random.generator() < this.random.stormgenesis) {
          this.random.epicenters.push({
            latitude: this.random.generator() * 90,
            longitude: this.random.generator() * 180,
            speed: this.random.generator() * STORM_SPEED,
            intensity: this.random.generator() * STORM_INTENSITY,
            spread: this.random.generator() * STORM_SPREAD,
          });
        }

        // move storm epicenters fixme moves randomly and only in positive direction
        this.random.epicenters[epicenter].latitude += (this.random.generator() * this.random.epicenters[epicenter].speed);
        this.random.epicenters[epicenter].longitude += (this.random.generator() * this.random.epicenters[epicenter].speed);
        // generate new strikes
        for (let strike = 0; strike < this.random.epicenters[epicenter].intensity; strike += 1) {
          const strikeTime = ~~(this.random.generator() * 3600000);
          this.data[~~(strikeTime / 60000)].push({
            latitude: this.random.epicenters[epicenter].latitude += (this.random.generator() * this.random.epicenters[epicenter].spread),
            longitude: this.random.epicenters[epicenter].latitude += (this.random.generator() * this.random.epicenters[epicenter].spread),
            time: strikeTime,
          });
        }
      }

      console.log(`LIGHTNING: loaded -> ${this.data.length} blocks, sample block length: ${this.data[0].length}`);
      this.loaded = true;
      return this.loaded;
    }
    catch (e) {
      console.log(e);
      return false;
    }
  }


  /**
   * Used for live lightning, returns an array of lightning strikes with from a time range with
   * millisecond precision
   *
   * @param sinceDate start of the range in milliseconds
   * @param toDate end of the range in milliseconds
   * @returns {Array} of form [{latitude, longitude, time}, ...]
   */
  getLightningBetween(sinceDate, toDate) {
    try {
      const lightningArray = [];

      const startMinute = ~~((sinceDate.getTime() % 60000) / 1000);
      const endMinute = ~~((toDate.getTime() % 60000) / 1000);
      console.log(`LIGHTNING: request -> minute ${startMinute}, minute ${endMinute}`);

      for (let block = 0; block < this.data.length; block += 1) {
        lightningArray.push.apply(lightningArray, this.data[block]);
      }

      /* first minute block
      for (let strike = 0; strike < this.data[startMinute].length; strike += 1) {
        if (this.data[startMinute][strike].time > sinceDate.getTime()) lightningArray.push(this.data[startMinute][strike]);
      }
      // middle minute blocks
      for (let block = startMinute + 1; block < endMinute; block += 1) {
        lightningArray.push.apply(lightningArray, this.data[block]);
      }
      // last minute block todo remove duplicated code
      for (let strike = 0; strike < this.data[startMinute].length; strike += 1) {
        if (this.data[endMinute][strike].time > sinceDate.getTime()) lightningArray.push(this.data[endMinute][strike]);
      } */

      console.log(lightningArray);


      return lightningArray;
    }
    catch (e) {
      if (!this.loaded) console.log('Lightning data not yet loaded!');
      console.log(e);
      return [];
    }
  }
}
export default LightningDataSource;
