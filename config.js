const path = require('path');

var config = {
  port: 3000,
  dbUrl: 'mongodb://localhost:27017/PNAPP',
  key: '332-123.assda123',
  DIRPATH: path.join(__dirname,'uploads/')
}

module.exports = {config:config}
