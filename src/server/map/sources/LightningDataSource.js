import DataSource from './DataSource.js';
const seedrandom = require('seedrandom');

const STORM_INTENSITY = 350;                    // maximum strikes per storm per hour
const STORM_SPEED = 4;                          // maximum degrees of movement per hour
const STORM_SPREAD = 5;                         // maximum degrees of strike y/x distance from epicenter
const STORM_DEATH = 0.3;                        // probability per hour of a storm dying
const STORM_GENESIS = 0.3;                      // probability per hour of a storm starting
const STORM_MAXNUM = 6;                         // maximum number of storms on map
const HOUR_MILLIS = 3600000;                    // milliseconds in an hour

class LightningDataSource extends DataSource {
  constructor() {
    super();
    this.meta = {
      start: (new Date()).getTime() - HOUR_MILLIS,                   // start of current block
      end: (new Date()).getTime(),                                   // end of current block
    };
    this.data = [];                                                  // must contain 60 arrays of strikes
    this.random = {
      generator: new seedrandom((new Date()).getTime()),             // todo make repeatable
      epicenters: [],
      stormdeath: STORM_DEATH,
      stormgenesis: STORM_GENESIS,
    };
    this.random.generator(); // not sure why this is needed

    for (let epicenter = 0; epicenter < this.random.generator() * STORM_MAXNUM; epicenter += 1) {
      this.random.epicenters.push({
        latitude: (this.random.generator() * 180) - 90,
        longitude: (this.random.generator() * 360) - 180,
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
    console.log(`LIGHTNING: epicenter sample ->`);
    console.log(this.random.epicenters[0]);

    try {
      // move bounds forward by one hour
      this.meta.start = this.meta.start + HOUR_MILLIS;
      this.meta.end = this.meta.start + HOUR_MILLIS;
      // console.log(`LIGHTNING: new bounds -> ${this.meta.start}, ${this.meta.end}`);

      // flush and rebuild data array
      this.data = [];
      for (let minute = 0; minute < 60; minute += 1) {
        this.data.push([]);
      }
      // console.log(`LIGHTNING: flushed old data -> ${this.data.length}`);
      // console.log(this.data);

      // for each minute block, generate data
      for (let minute = 0; minute < 60; minute += 1) {
        // console.log(`LIGHTNING: generating data -> ${minute}`);

        // iterate over epicenters
        for (let epicenter = 0; epicenter < this.random.epicenters.length; epicenter += 1) {
          // epicenter death and birth todo better at end of loop?
          if (this.random.generator() < this.random.stormdeath / 60) {
            this.random.epicenters.splice(epicenter, 1);
            epicenter -= 1;
            continue;
          }
          else if (this.random.generator() < this.random.stormgenesis / 60) {
            this.random.epicenters.push({
              latitude: (this.random.generator() * 180) - 90,
              longitude: (this.random.generator() * 360) - 180,
              speed: this.random.generator() * STORM_SPEED,
              intensity: this.random.generator() * STORM_INTENSITY,
              spread: this.random.generator() * STORM_SPREAD,
            });
          }

          // move epicenter
          this.random.epicenters[epicenter].latitude +=
            (this.random.generator() * 2 * this.random.epicenters[epicenter].speed) - this.random.epicenters[epicenter].speed;
          this.random.epicenters[epicenter].longitude +=
            (this.random.generator() * 2 * this.random.epicenters[epicenter].speed) - this.random.epicenters[epicenter].speed;

          // generate strikes
          for (let strike = 0; strike < this.random.epicenters[epicenter].intensity / 60; strike += 1) {
            this.data[minute].push({
              latitude: this.random.epicenters[epicenter].latitude +=
                (this.random.generator() * this.random.epicenters[epicenter].spread * 2)
                - this.random.epicenters[epicenter].spread,
              longitude: this.random.epicenters[epicenter].longitude +=
                (this.random.generator() * this.random.epicenters[epicenter].spread * 2)
                - this.random.epicenters[epicenter].spread,
              time: new Date(this.meta.start + (minute * 60000) + (this.random.generator() * 60000)).getTime(),
            });
          }
        }
      }

      // console.log(`LIGHTNING: loaded -> ${this.data.length} blocks, sample block length: ${this.data[0].length}`);
      // console.log(this.data)
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

      const startMinute = ~~((sinceDate.getTime() - this.meta.start) / 60000);
      const endMinute = ~~((toDate.getTime() - this.meta.start) / 60000);

      // console.log(`LIGHTNING: request -> minute ${startMinute}, minute ${endMinute}`);

      // first minute block
      for (let strike = 0; strike < this.data[startMinute].length; strike += 1) {
        if (this.data[startMinute][strike].time > sinceDate.getTime()) lightningArray.push(this.data[startMinute][strike]);
      }
      // middle minute blocks
      for (let block = startMinute + 1; block < endMinute; block += 1) {
        lightningArray.push.apply(lightningArray, this.data[block]);
      }
      // last minute block todo remove duplicated code
      for (let strike = 0; strike < this.data[endMinute].length; strike += 1) {
        if (this.data[endMinute][strike].time > sinceDate.getTime()) lightningArray.push(this.data[endMinute][strike]);
      }

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
