const { log } = require("../helpers/logging");
const { logLevels } = require("../config/constants");
const User = require("../models/user");
const UserProfile = require("../models/userProfile");

module.exports.promiseWrapper = promise =>
  promise
    .then(data => ({ data, error: null }))
    .catch(error => ({ data: null, error }));

module.exports.sleep = async (seconds = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), seconds * 1000);
  });
};

module.exports.setUserInfo = function(request) {
  return {
    _id: request._id,
    email: request.email,
    roles: request.roles,
    isAdmin: request.isAdmin,
    firstName: request.userProfile ? request.userProfile.firstName : ""
  };
};

module.exports.isObjectId = function(str) {
  return /^[a-f\d]{24}$/i.test(str);
};

module.exports.isDateNiceString = function(str) {
  return /\d{4}-\d{2}-\d{2}/.test(str);
};

module.exports.stringInterpolation = function(input, ...params) {
  for (let i = 0; i < params.length; i++) {
    input = input.replace("${" + i + "}", params[i]);
  }
  return input;
};

module.exports.censorObjectField = function(
  obj,
  censoredFields = [],
  censorPlaceholder = "******"
) {
  let keys = Object.keys(obj);
  let retObj = {};
  for (let i = 0; i < keys.length; i++) {
    if (censoredFields.includes(keys[i])) {
      retObj[keys[i]] = censorPlaceholder;
    } else {
      retObj[keys[i]] = obj[keys[i]];
    }
  }
  return retObj;
};

module.exports.swapKeyWithValue = function swapKeyWithValue(arr) {
  var retArr = {};
  for (var key in arr) {
    retArr[arr[key]] = key;
  }
  return retArr;
};

module.exports.dateToISO8601String = function(inputDate) {
  if (inputDate.constructor.name !== "Date") {
    return log("Input must be date");
  } else {
    return (
      inputDate.getFullYear() +
      "-" +
      (inputDate.getMonth() + 1 >= 10
        ? inputDate.getMonth() + 1
        : "0" + (inputDate.getMonth() + 1)) +
      "-" +
      (inputDate.getDate() >= 10
        ? inputDate.getDate()
        : "0" + inputDate.getDate())
    );
  }
};

module.exports.addDaysToDate = function addDaysToDate(inputDate, days) {
  let startDate = new Date(inputDate);
  startDate.setDate(startDate.getDate() + parseInt(days));
  return exports.dateToISO8601String(startDate);
};

module.exports.generateDateArray = function generateDateArray(
  startDate,
  endDate
) {
  if (
    !exports.isDateNiceString(startDate) ||
    !exports.isDateNiceString(endDate)
  ) {
    log("Start/End date is not in expected format bruh", logLevels.FATAL);
    throw "Start/End Date is not in expected format bruh";
  }
  if (startDate > endDate) {
    let swapper = startDate;
    startDate = endDate;
    endDate = swapper;
  }
  let pointer = startDate.toString();
  let retArr = [];
  while (pointer < endDate) {
    retArr.push(pointer);
    pointer = exports.addDaysToDate(pointer, 1);
  }
  return retArr;
};
module.exports.generateDateQuery = function(
  startDate,
  endDate,
  isBookingLogic = true
) {
  if (
    !exports.isDateNiceString(startDate) ||
    !exports.isDateNiceString(endDate)
  ) {
    log("Start/End date is not in expected format bruh", logLevels.FATAL);
    throw new Error("Start/End Date is not in expected format bruh");
  }
  if (isBookingLogic) {
    return {
      $or: [
        {
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gt: startDate } }
          ]
        },
        {
          $and: [
            { startDate: { $gte: startDate } },
            { startDate: { $lt: endDate } }
          ]
        }
      ]
    };
  } else {
    return {
      $or: [
        {
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gte: startDate } }
          ]
        },
        {
          $and: [
            { startDate: { $gte: startDate } },
            { startDate: { $lte: endDate } }
          ]
        }
      ]
    };
  }
};

module.exports.makeArrObjUnique = function makeArrObjUnique(arr, path = "") {
  let obj = {};
  let pathArr = [];
  if (path !== "") {
    pathArr = path.split(".");
  }
  arr.forEach(a => {
    let pointer = a;
    if (pathArr.length > 0) {
      pathArr.forEach(pathA => {
        pointer = pointer[pathA];
        if (pointer === null || pointer === undefined) {
          throw new Error("Invalid Path");
        }
      });
    }
    obj[pointer.toString()] = a;
  });
  return Object.keys(obj).map(key => obj[key]);
};

module.exports.uniqueArray = function uniqueArray(a) {
  return [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
};

module.exports.differenceBetweenDates = function differenceBetweenDates(
  date1,
  date2
) {
  if (date1 > date2) {
    let temp = date2;
    date2 = date1;
    date1 = temp;
  }
  return (new Date(date2) - new Date(date1)) / 86400000;
};
module.exports.validateRequire;

module.exports.getWeekShoulders = function getWeekShoulders(
  startDate,
  endDate
) {
  let curDate = startDate;
  const daystoWeekShoulder = 5 - new Date(curDate).getDay();
  const weekShoulders = [];
  if (daystoWeekShoulder > 0) {
    curDate = exports.addDaysToDate(startDate, daystoWeekShoulder);
  } else if (daystoWeekShoulder < 0) {
    curDate = exports.addDaysToDate(startDate, -1);
  }

  while (curDate <= endDate) {
    weekShoulders.push({
      startDate: curDate,
      endDate: exports.addDaysToDate(curDate, 1)
    });
    curDate = exports.addDaysToDate(curDate, 7);
  }
  return weekShoulders;
};

exports.getSystemUser = function() {
  return new Promise((resolve, reject) => {
    User.findOne({
      username: "system",
      deletedAt: null
    })
      .then(user => {
        if (user) {
          return resolve(user);
        } else {
          let systemProfile = new UserProfile({
            firstName: "System",
            lastName: "System",
            createdAt: new Date()
          });

          systemProfile
            .save()
            .then(createdProfile => {
              let newUser = new User({
                email: "engineering@hostastay.com",
                username: "system",
                password: "systemadminf244e81ab006410d9d3ffe246e08e51f",
                userProfile: createdProfile._id,
                isAdmin: true,
                createdAt: new Date()
              });
              newUser
                .save()
                .then(savedUser => {
                  return resolve(savedUser);
                })
                .catch(ex => {
                  return reject(ex);
                });
            })
            .catch(ex => {
              return reject(ex);
            });
        }
      })
      .catch(ex => {
        return reject(ex);
      });
  });
};

module.exports.getUserHostId = user =>
  (user.roles && user.roles[0] && user.roles[0].host) || "";

module.exports.averagePricePerDay = (startDate, endDate, baseFee = 0) => {
  const timeDiff = Math.abs(
    new Date(endDate).getTime() - new Date(startDate).getTime()
  );
  const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  let days = {};
  let amountLeft = baseFee;
  for (let i = 0; i < diffDays; i++) {
    const date = exports.addDaysToDate(new Date(startDate), i);
    // If last day, then assign all amount left to it
    if (i === diffDays - 1) {
      days[date] = { amount: Number(amountLeft.toFixed(2)) };
    } else {
      const calculatedFee = Number(Number(baseFee / diffDays).toFixed(2));
      days[date] = { amount: calculatedFee };
      amountLeft = amountLeft - calculatedFee;
    }
  }
  return days;
};

module.exports.convertConstantObjToString = (constObj, stringKey = "code") =>
  Object.keys(constObj).map(key => constObj[key][stringKey]);

module.exports.rounds = (value, decimals) => {
  return Number(
    `${Math.round(`${Number(value).toFixed(20)}e${decimals}`)}e-${decimals}`
  );
};

module.exports.defaultToTrueIfNotExist = value =>
  typeof value === "boolean" ? value : true;

module.exports.makeCamelCaseIntoSnakeCase = camel => {
  let snake = "";
  for (let x in camel) {
    if (camel[x].match(/[A-Z]/)) {
      snake += "_" + camel[x].toLowerCase();
    } else {
      snake += camel[x];
    }
  }
  return snake;
};

module.exports.checkIsOverlapped = (dateA1, dateA2, dateB1, dateB2) => {
  const startDateA = dateA1 < dateA2 ? dateA1 : dateA2;
  const endDateA = dateA1 < dateA2 ? dateA2 : dateA1;

  const startDateB = dateB1 < dateB2 ? dateB1 : dateB2;
  const endDateB = dateB1 < dateB2 ? dateB2 : dateB1;

  return startDateA < endDateB && startDateB < endDateA;
};
