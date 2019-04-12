const mongoose = require('mongoose');
const {config} = require('./../config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl);

module.exports = {
  mongoose: mongoose
};
