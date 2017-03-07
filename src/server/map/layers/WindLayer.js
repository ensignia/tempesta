/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import stream from 'stream';
import Layer from './Layer.js';

class WindLayer extends Layer {

  static defaultOptions = {
    source: 'gfs',
    forecastHour: 0,
  }

  getOptions(options_) {
    const options = {
      ...WindLayer.defaultOptions,
      ...options_,
    };

    options.source = options.source.toLowerCase();

    if (!['gfs'].includes(options.source)) {
      throw new Error(`Source ${options.source} for WindLayer is invalid`);
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
    const meta = source.getMeta();
    return Layer.getFullPath(`wind-${options.source}-${meta.latest.year}-${meta.latest.month}-${meta.latest.day}-${meta.latest.modelCycle}-${options.forecastHour}-${tileX}-${tileY}-${tileZ}.png`);
  }

  async generateTile(tilePath, tileX, tileY, tileZ, options, res) {
    const dataU = this.getData().getDataSource(options.source).getData('windU', options.forecastHour);
    const dataV = this.getData().getDataSource(options.source).getData('windV', options.forecastHour);

    const { // Use object destructuring, only get what you need :)
      leftLongitude,
      topLatitude,
      angularPixelWidth,
      angularPixelHeight,
      angularVectorWidth,
      angularVectorHeight,
    } = Layer.getTileInfo(tileX, tileY, tileZ);

    const image = pureimage.make(Layer.TILE_SIZE, Layer.TILE_SIZE);
    const ctx = image.getContext('2d');

    // color gradient
    for (let yPixel = 0; yPixel < Layer.TILE_SIZE; yPixel += 1) {
      for (let xPixel = 0; xPixel < Layer.TILE_SIZE; xPixel += 1) {
        const pixelLatitude = topLatitude - (angularPixelHeight * yPixel);
        const pixelLongitude = leftLongitude + (angularPixelWidth * xPixel);

        const pixelValue = (dataU.bilinearInterpolation(pixelLatitude, pixelLongitude) ** 2)
          + (dataV.bilinearInterpolation(pixelLatitude, pixelLongitude) ** 2);
        const val = this.colorer.render(pixelValue, 300, 'jet');
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    for (let yVectorBlock = 0; yVectorBlock < Layer.TILE_VECTOR_BLOCKS; yVectorBlock += 1) {
      for (let xVectorBlock = 0; xVectorBlock < Layer.TILE_VECTOR_BLOCKS; xVectorBlock += 1) {
        // vector origin and magnitude
        const vector = {
          latitude: topLatitude - (angularVectorHeight * (yVectorBlock + 0.5)),
          longitude: leftLongitude + (angularVectorWidth * (xVectorBlock + 0.5)),
          y: null,
          x: null,
        };
        vector.y = dataV.bilinearInterpolation(vector.latitude, vector.longitude);
        vector.x = dataU.bilinearInterpolation(vector.latitude, vector.longitude);

        // vector data in terms of available pixels
        const vectorPixels = {
          centerY: Layer.PIXELS_PER_VBLOCK * (yVectorBlock + 0.5),
          centerX: Layer.PIXELS_PER_VBLOCK * (xVectorBlock + 0.5),
          lengthY: vector.y > Layer.PIXELS_PER_VBLOCK ? Layer.PIXELS_PER_VBLOCK : vector.y,
          lengthX: vector.x > Layer.PIXELS_PER_VBLOCK ? Layer.PIXELS_PER_VBLOCK : vector.x,
          originY: null,
          originX: null,
          headY: null,
          headX: null,
        };
        vectorPixels.originY = vectorPixels.centerY - (0.5 * vectorPixels.lengthY);
        vectorPixels.originX = vectorPixels.centerX - (0.5 * vectorPixels.lengthY);
        vectorPixels.headY = vectorPixels.centerY + (0.5 * vectorPixels.lengthY);
        vectorPixels.headX = vectorPixels.centerX + (0.5 * vectorPixels.lengthX);
        vectorPixels.arrowBaseY = vectorPixels.headY - (0.4 * vectorPixels.lengthY);
        vectorPixels.arrowBaseX = vectorPixels.headX - (0.4 * vectorPixels.lengthX);
        vectorPixels.arrowRightCornerY = vectorPixels.arrowBaseY + (0.15 * vectorPixels.lengthX);
        vectorPixels.arrowRightCornerX = vectorPixels.arrowBaseX - (0.15 * vectorPixels.lengthY);
        vectorPixels.arrowLeftCornerY = vectorPixels.arrowBaseY - (0.15 * vectorPixels.lengthX);
        vectorPixels.arrowLeftCornerX = vectorPixels.arrowBaseX + (0.15 * vectorPixels.lengthX);

        // draw vector on image
        this.colorer.drawVector(ctx, vectorPixels);
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

export default WindLayer;
