/* eslint-disable no-console, class-methods-use-this */
import pureimage from 'pureimage';
import fs from 'fs';
import Layer from './Layer.js';

const IMAGE_SIZE = 256; // TODO hello fren how u inherit from Layer?


class CapeLayer extends Layer {

  async isSupportedSource(dataSourceName) {
    return dataSourceName === 'gfs' || dataSourceName === 'hrrr';
  }

  /** Fulfills tile data request with dataSource argument, tiles dumped
  into the outputPath directory */
  async getTile(outputPath, dataSource, tileX, tileY, tileZ) {
    console.log(`Generating CAPE tile for ${tileX}/${tileY}/${tileZ}`);

    const data = dataSource.getData('cape', 0);


    // bounds of tile and angular tile/pixel metrics
    const leftLongitude = Layer.tileToLongitude(tileX, tileZ);
    const rightLongitude = Layer.tileToLongitude(tileX + 1, tileZ);
    const topLatitude = Layer.tileToLatitude(tileY, tileZ);
    const bottomLatitude = Layer.tileToLatitude(tileY + 1, tileZ);
    const angularTileWidth = Math.abs(rightLongitude - leftLongitude);
    const angularTileHeight = Math.abs(topLatitude - bottomLatitude);
    const angularPixelWidth = angularTileWidth / IMAGE_SIZE;
    const angularPixelHeight = angularTileHeight / IMAGE_SIZE;

    // console.log('Top-left: (' + topLatitude + ', ' + leftLongitude + ')');
    // console.log('Bottom-right: (' + bottomLatitude + ', ' + rightLongitude + ')');
    // console.log('Angular pixel scale: ' + angularPixelHeight + ', ' + angularPixelWidth);
    // console.log('\n');

    const image = pureimage.make(IMAGE_SIZE, IMAGE_SIZE);
    const ctx = image.getContext('2d');

    for (let yPixel = 0; yPixel < IMAGE_SIZE; yPixel += 1) {
      for (let xPixel = 0; xPixel < IMAGE_SIZE; xPixel += 1) {
        const pixelLatitude = topLatitude - (angularPixelHeight * yPixel);
        const pixelLongitude = leftLongitude + (angularPixelWidth * xPixel);

        const pixelValue = data.simpleNeighborAverage(pixelLatitude, pixelLongitude);
        const val = this.colorer.render(pixelValue, 2500, 0x0000FF00, 0xFF000000, true, 0xFF);
        ctx.compositePixel(xPixel, yPixel, val);
      }
    }

    ctx.fillStyle = 'rgba(200, 200, 200, 1)';
    ctx.setFont('Source Sans Pro', 20);
    ctx.fillText(`Tile ${tileX}/${tileY}/${tileZ}`, 10, 50);

    return await new Promise(resolve => {
      pureimage.encodePNG(image, fs.createWriteStream(outputPath), err => resolve(!err));
    });
  }

}

export default CapeLayer;
