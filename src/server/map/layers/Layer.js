import Colorer from '../rendering/Colorer.js';

class Layer {

  constructor() {
    this.colorer = new Colorer();
  }

  /** Converts a google maps tile number to the longitude value
  of its upper left corner */
  static tileToLongitude(x, z) {
    return (((x / (2 ** z)) * 360) - 180);
  }

  /** Converts a google maps tile number to the latitude value
  of its upper left corner */
  static tileToLatitude(y, z) {
    const n = Math.PI - (2 * Math.PI * (y / (2 ** z)));
    return ((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

}

export default Layer;
