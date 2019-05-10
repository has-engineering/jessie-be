// const express = require("express");
// const mongoose = require("mongoose");
// const logger = require("morgan");
// const router = require("./router");
// const app = express();

// const { log } = require("./helpers/logging");

// const config = {
//   DB_HOST: "mongodb://localhost:27017/jessie",
//   PORT: 3001
// };

// mongoose.connect(config.DB_HOST, { useNewUrlParser: true });

// // const fs = require("fs");
// // const files = fs.readdirSync("./models");
// // for (let i = 0; i < files.length; i++) {
// //   const fileName = files[i].split(".");
// //   if (fileName.length > 1 && fileName[1] === "js") {
// //     require("./models/" + fileName[0]);
// //   }
// // }

// // const server = app.listen(config.PORT);
// log(`Your server is running on port ${config.PORT}.`);
// app.use(logger("common"));

// // router(app);
// process.on("unhandledRejection", up => {
//   console.log(up); // Has to be console.log.
// });

// module.exports = server;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = require("./router");
// const config = require('./config/main');
const { log } = require("./helpers/logging");
const app = express();
const config = {
  DB_HOST: "mongodb://localhost:27017/jessie",
  PORT: 3001
};

app.use(bodyParser.json());

if (config.DB_PASS) {
  mongoose.connect(config.DB_HOST, {
    useNewUrlParser: true,
    user: config.DB_USER,
    pass: config.DB_PASS
  });
} else {
  mongoose.connect(config.DB_HOST, { useNewUrlParser: true });
}

let server;
server = app.listen(config.PORT);
log(`Server start at port ${config.PORT}`);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router(app);
process.on("unhandledRejection", up => {
  console.log(up); // Has to be console.log.
});

module.exports = server;
