/* eslint-disable max-len */
export const analytics = {

  // https://analytics.google.com/
  google: {
    trackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

};

export const server = {

  dataDirectory: process.env.DATA_DIRECTORY || '../data',

};

export const api = {
  // https://developers.google.com/maps/
  google: {
    maps: process.env.GOOGLE_MAPS_API_KEY,
  },

  darksky: process.env.DARK_SKY_API_KEY,
};

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'FooBar' },

};
