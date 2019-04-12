const multer = require('multer');
const _ = require('lodash')
const {Article} = require('./../db/schemas/Article.js')

var storage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null,'uploads');
  },
  filename: (req,file,cb) =>{
    var ext = file.originalname.slice(file.originalname.indexOf('.'),file.originalname.length);
    var plik = Math.random().toString(36).replace(/[^a-z]+/g, '') + ext;
    var filepath = 'http://127.0.0.1:8080/' + plik;
    req.filepath = filepath;
    console.log(filepath);
    cb(null, plik);
  }
});

module.exports = {storage}
