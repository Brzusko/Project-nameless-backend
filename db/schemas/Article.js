const mongoose = require('mongoose');
const {config} = require('./../../config.js');
const fs = require('fs');
const path = require('path');
const {DIRPATH} = require('./../../index.js');


var ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 70,
    required:true,
    unique: true
  },
  content: {
    type: String
  },
  imgPath: {
    type:String,
    required: true
  },
  createdBy: {
    type:String
  },
});

//Instance Methods
ArticleSchema.methods = {
}
ArticleSchema.statics = {
  findByTitleAndRemove: function(title){
    return new Promise((resvole,reject)=>{
      var article;
      this.findOne({title:title}).then((doc)=>{
        if(!doc) return reject('cant');
        article = doc;
        var file = article.imgPath.slice(article.imgPath.lastIndexOf('/')+1,article.imgPath.length);
        this.findOneAndRemove({title:article.title}).then(()=>{
          fs.unlinkSync(config.DIRPATH + file);
          resvole(article);
        }).catch((er)=>{reject(er)});
      }).catch((e)=>{reject(e)});
    })
  }
}

//Middle fucntions
console.log(config.DIRPATH);

var Article = mongoose.model('Article', ArticleSchema);
module.exports = {Article}
