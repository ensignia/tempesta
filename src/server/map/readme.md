## BASIC MAP RENDERING DOCUMENTATION

### COORDINATE SYSTEMS
1. **Google Tiles**: quad tiles with integer (x,y) coordinates. Origin (0,0) is in
  map top left corner. X grows to the right (east) and Y grows downward (south).

2. **Server standard latitude/longitude convention**: (y,x) coordinate system with origin (0,0)
  at intersection of Equator and Prime Meridian. Y (latitude) ranges between 90(N)
  and -90(S), while X (longitude) ranges between -180(W) and 180(E). Thus it's
  a simple (x,y) diagram, with the difference that values are expressed in (y,x)
  form.

3. **Grib2 latitude/longitude conventions**: may vary from file to file. Server lat/lon
  values need to be mapped into the grib2 range to check if lat/lon is within
  coverage area. CAPE marks top-left corner as (y,x) = (90, 0), so the Bottom-right
  right coverage corner can be obtained as (270, 360). This second point is
  not absolute, it's simply relative to the origin.

4. **Saved data grid convention**: data stored in 2d array in (row,column) order
  (that is y,x). grid[0][0] is at the origin of the grib2 coverage area, and
  grid[n][m] is at the bottom right corner of the grib2 coverage area.


### CONVERSION BETWEEN COORDINATE SYSTEMS
1. **Google Tile** to **server standard**: tileToLatitude and tileToLongitude in Layer.js
  give the latitude and longitude of a Google Tile's top left corner.

2. **Server standard** to **grib2** *(assuming scan mode 000)*: grib2 files have *probably*
  the convention of marking the top-left corner of the map as (90,0), corresponding
  to server standard coordinates (90,-180). Using the deltaY/deltaX values and
  the number of data points, the bounds of the coverage area can be calculated
  in terms of the grib2 origin (90,0). In scan mode 000 latitude values grow
  southwards (unlike server standard, in which they grow northwards) and longitude
  values grow eastwards. Thus to map server standard to grib2, latitude needs to
  be reflected and translated, while longitude only needs to be translated.

  grib2 latitude = (-serverStdLat) + 180;     <- maps 90 server to 90 grib2 and -90 server to 270 grib2

  grib2 longitude = serverStdLong + 180;     <- maps -180 server to 0 grib2 and 180 server to 360 grib2

  The grib2 values thus obtained can then be checked against the bounds of the
  data.

3. **Grib2** to saved **data grid index**: translate latitude by -90 to range (0-180), then
  normalize on height of data grid. Longitude can be normalized to width of data
  grid directly.


### DATA VALUE MANIPULATIONS
1. **simpleDiscreteMapping**: lat/long is scaled precisely into the coordinate
    system defined by the data array's indices. The values are then rounded downward
    to the nearest integer to obtain valid array indices. This is effectively equal
    to a *nearest northwestern datapoint* scheme.
2. **simpleNeighborAverage**: lat/long is scaled precisely into the coordinate
    system defined by the data array's indices. Both the floors and ceilings of
    the values are calculated, obtaining indices for the 4 enclosing data points.
    Their average is returned. *Note that this is equivalent to bilinear interpolation
    for the special case in which the point to be bilinearly interpolated is exactly
    in the center of the four data points*. Thus every pixel in the area enclosed
    by the four nearest data points gets the value given by the bilinear
    interpolation of the center. *Crucially, this means that the pixel colors have
    smoother transitions, but it does NOT improve the data resolution!*
3. **bilinearInterpolation**: lat/long is scaled precisely into the coordinate system
    defined by the data array's indices. The four enclosing data points are obtained
    in the same way as in the simpleNeighborAverage function. Now a proper bilinear
    interpolation is carried out using the precise lat/long values in the data array
    index format. *This smooths out the data at any level of zoom. It's important
    to understand that at high levels of zoom, the data is ESTIMATED based on
    certain assumptions*.

### WEATHER INDICATORS
1. **Storm prediction center**
  1. *convective outlooks*: http://www.spc.noaa.gov/products/outlook/
  2. *convective watches*: http://www.spc.noaa.gov/products/watch/
  3. *mesoscale discussions*: http://www.spc.noaa.gov/products/md/
2. **Global Forecast System**
3. **HRRR**
4 **NAM**?
