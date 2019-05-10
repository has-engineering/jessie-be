const { logLevels } = require('../config/constants');

module.exports.swapKeyWithValue = function swapKeyWithValue(arr) {
  const returnObject = {};
  for (let key in arr) {
    returnObject[arr[key]] = key;
  }
  return returnObject;
};

module.exports.log = function (message, level = logLevels.INFO) {
  // TODO: Setup this properly
  if (level === logLevels.TRACE) {
    return;
  }
  const logLevelsSwap = exports.swapKeyWithValue(logLevels);
  const timestamp = `[${new Date().toISOString()}]`;
  const preText = (logLevelsSwap[level.toString()] || '').substring(0, 4);

  if (!(message instanceof Error)) {
    message = JSON.stringify(message);
  } else {
    // For stack trace
    console.log(`${timestamp} ${message.stack}`);
  }
  if (level >= logLevels.WARNING) {
    console.warn(`${timestamp} ${preText}: ${message}`);
  } else {
    console.log(`${timestamp} ${preText}: ${message}`);
  }
};
