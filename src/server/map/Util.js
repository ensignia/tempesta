import fs from 'fs';

export function padLeft(number, zeroes, str) {
  return Array((zeroes - String(number).length) + 1).join(str || '0') + number;
}

/** Checks if file exists. Returns promise */
export function fsExists(file) {
  return new Promise(resolve => {
    fs.access(file, fs.F_OK, error => resolve(!error));
  });
}

export function fsStat(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stat) => {
      if (!error) resolve(stat);
      reject(error);
    });
  });
}