/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import stream from 'stream';
import Layer from './Layer.js';

class LightningProbabilityLayer extends Layer {
  /** Allows checking if given data source is supported for this layer */
  static defaultOptions = {
    forecastHour: 0,
  }

  getMeta() {
    return {};
  }

  getOptions(options_) {
    const options = {
      ...LightningProbabilityLayer.defaultOptions,
      ...options_,
    };

    const source = this.getData().getDataSource('lightning');

    if (options.forecastHour < 0
      || options.forecastHour > source.getForecastHours()
      || options.forecastHour % source.getForecastHourStep() !== 0) {
      throw new Error(`Forecast hour ${options.forecastHour} for data source is invalid`);
    }

    return options;
  }

  getPath(tileX, tileY, tileZ, options) {
    return Layer.getFullPath(`lightning-${options.forecastHour}-${tileX}-${tileY}-${tileZ}.png`);
  }

  /** Fulfills tile data request with dataSource argument, tiles dumped
  into the outputPath directory */
  async getTile(tilePath, tileX, tileY, tileZ, options, res) {
    const data = this.getData().getDataSource('lightning').getData('probability', options.forecastHour);

    const {
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
        const val = this.colorer.render(pixelValue, 2500, 0x0000FF00, 0xFF000000, true, 0xFF);
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

export default LightningProbabilityLayer;
