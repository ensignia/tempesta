/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import stream from 'stream';
import Layer from './Layer.js';

class CapeLayer extends Layer {

  static defaultOptions = {
    source: 'gfs',
    forecastHour: 0,
  }

  getOptions(options_) {
    const options = {
      ...CapeLayer.defaultOptions,
      ...options_,
    };

    options.source = options.source.toLowerCase();

    if (!['gfs', 'hrrr'].includes(options.source)) {
      throw new Error(`Source ${options.source} for CapeLayer is invalid`);
    }

    const source = this.getData().getDataSource(options.source);

    if (options.forecastHour < 0
      || options.forecastHour > source.getForecastHours()
      || options.forecastHour % source.getForecastHourStep() !== 0) {
      throw new Error(`Forecast hour ${options.forecastHour} for data source is invalid`);
    }

    return options;
  }

  getPath(tileX, tileY, tileZ, options) {
    const source = this.getData().getDataSource(options.source);
    const latest = source.getMeta().latest || {};
    return Layer.getFullPath(`cape-${options.source}-${latest.year}-${latest.month}-${latest.day}-${latest.modelCycle}-${options.forecastHour}-${tileX}-${tileY}-${tileZ}.png`);
  }

  async generateTile(tilePath, tileX, tileY, tileZ, options, res) {
    const data = this.getData().getDataSource(options.source).getData('cape', options.forecastHour);

    const { // Use object destructuring, only get what you need :)
      leftLongitude,
      topLatitude,
      angularPixelWidth,
      angularPixelHeight,
    } = Layer.getTileInfo(tileX, tileY, tileZ);

    const image = pureimage.make(Layer.TILE_SIZE, Layer.TILE_SIZE);
    const ctx = image.getContext('2d');

    for (let yPixel = 0; yPixel < Layer.TILE_SIZE; yPixel += 1) {
      for (let xPixel = 0; xPixel < Layer.TILE_SIZE; xPixel += 1) {
        const pixelLatitude = topLatitude - (angularPixelHeight * yPixel);
        const pixelLongitude = leftLongitude + (angularPixelWidth * xPixel);

        const pixelValue = data.bilinearInterpolation(pixelLatitude, pixelLongitude);
        const val = this.colorer.render(pixelValue, 2500, 'jet');
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    await new Promise(resolve => {
      const output = new stream.PassThrough();
      output.pipe(fs.createWriteStream(tilePath));
      output.pipe(res);
      pureimage.encodePNG(image, output, err => resolve(!err));
    });
  }
}

export default CapeLayer;
