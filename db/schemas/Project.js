const mongoose = require('mongoose');
const _ = require('lodash')
const {config} = require('./../../config.js');




var ProjectSchema = new mongoose.Schema({
  name: {
    type:String,
    minlength:3,
    trim:true,
    unique:true,
    required:true
  },
  desc: {
    type:String,
    minlength:5,
    trim: true,
    required:true
  },
  imgPath: {
    type:String,
    trim: true
  },
  tags: [
    {tag: {
      type:String,
    }}
  ]
});

ProjectSchema.methods = {
  toJSON: function(){
    var object = this.toObject();
    return _.pick(object,['name','desc','tags']);
  }
}

//Instance Methods




var Project = mongoose.model('Project', ProjectSchema);
module.exports = {Project}
