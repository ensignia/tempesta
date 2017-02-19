/**
 * This file exports a function that can be passed to webpack as a DefinePlugin handler.
 * It reads a bash-like environment file full of export statements and maps each to a
 * property like 'process.env.FOO' to emulate the way Node.js handles environment vars.
 * If your shell has environment variables set, they are given preference over variables
 * in the environment file.
 */
import fs from 'fs';

const parseEnvFile = (file) => {
  let contents;
  try {
    contents = fs.readFileSync(file, 'utf-8');
  } catch (e) {
    return {};
  }

  const environmentObject = {};
  contents = contents.split('\n');

  contents.forEach((line) => {
    // strip comments
    const strippedLine = line.replace(/(^#| #)(.+?)$/, '');

    // skip empty lines
    if (strippedLine.trim() === '') {
      return;
    }

    // split on NAME=value. Lines may start with "export "
    const lineParts = strippedLine.match(/^(export )?([^=]+)=(.+?)$/);

    // map 'NAME=value' to {NAME: value}
    environmentObject[lineParts[2]] = lineParts[3];
  });

  return environmentObject;
};

/**
 * Return environment variables and lines from an environment-looking file
 * in a format that can be used by Webpack's DefinePlugin. Returns an object
 * full of key-value pairs like:
 * {'process.env.ENV_VAR': '"string value"'}
 *
 * @see https://webpack.github.io/docs/list-of-plugins.html#defineplugin
 *
 */
module.exports = function parseEnv(envFile) {
  const environmentFromFile = parseEnvFile(envFile);
  const combinedEnv = {};

  // Add
  Object.keys(environmentFromFile).forEach((key) => {
    combinedEnv[`process.env.${key}`] = JSON.stringify(environmentFromFile[key]);
  });

  // Prefer actual environment variables over anything from the file.
  Object.keys(process.env).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(environmentFromFile, key)) {
      combinedEnv[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
  });

  console.log(combinedEnv);

  return combinedEnv;
};
