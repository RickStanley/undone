// const getUserHome = () => process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const { join } = require('path');
const { writeFileSync, existsSync: fileExists, writeFile } = require('fs');

const fileName = '.undone.json';
const settingsFilePath = join(__dirname, fileName);
const validValueTypes = ['number', 'boolean', 'string'];

let settingsCache = (() => {
  if (fileExists(settingsFilePath)) {
    return require(settingsFilePath);
  } else {
    writeFile(settingsFilePath, JSON.stringify({}));
    return {};
  }
})();

const isValidArray = array =>
  array.every(value => validValueTypes.includes(typeof value));;

/**
 * Save a setting.
 * @param {string} key 
 * @param {boolean | number | string} value 
 */
const setSetting = (key, value) => {
  return new Promise((_resolve, reject) => {

    if (typeof key !== 'string')
      throw new Error(`Key must be string, received: ${typeof key}`);

    if (!validValueTypes.includes(typeof value) || (Array.isArray(value) && !isValidArray(value)))
      throw new Error(`Value must be of type: ${validValueTypes} (or an array of these types), received: ${typeof value}`);

    if (/:/.test(key)) {

      const settingKeys = key.split(':');
      let _reference = settingsCache;
      for (const settingKey of settingKeys) {
        _reference = (settingKey in _reference) ? _reference[settingKey] : (_reference[settingKey] = {});
      }
      _reference = value;

    } else {
      settingsCache[key] = value;
    }

    try {
      writeFileSync(settingsFilePath, JSON.stringify(settingsCache));
    } catch (error) {
      reject(error);
    }

  });
};

/**
 * Set a setting.
 * @param {string} key 
 */
const getSetting = key => {
  return new Promise((resolve, reject) => {

    if (typeof key !== 'string')
      throw new Error(`Key must be string, received: ${typeof key}`);

    let setting;

    if (/:/.test(key)) {
      const settingKeys = key.split(':');
      const lastKey = settingKeys[settingKeys.length - 1];
      let _reference = settingsCache;

      for (const settingKey of settingKeys) {
        if (!settingKey in _reference) reject(`No key ${key} found in settings.`);
        _reference = _reference[settingKey];
      }

      setting = _reference[lastKey];

    } else {
      setting = settingsCache[key];
    }

    if (Array.isArray(setting))
      resolve(setting.slice())

    if (typeof setting === 'object')
      resolve({ ...setting });

    resolve(setting);
  });
};

/**
 * Load settings.
 */
const loadSettings = () => {
  return new Promise((resolve, reject) => {
    try {
      const settings = settingsCache || require(settingsFilePath);

      if (!settingsCache)
        settingsCache = { ...settings };

      resolve({ ...settings });
    } catch (error) {
      reject(error);
    }
  });
};

export {
  loadSettings,
  getSetting,
  setSetting
};