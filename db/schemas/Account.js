const mongoose = require('mongoose');
const vali = require('email-validator');
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const {config} = require('./../../config.js');




var AccountSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique:true,
    minlength:1,
    validate: [{isAsync: false, validator: value => vali.validate(value), msg:'Is invalid email.'}]
  },
  user:{
    type: String,
    trim: true,
    unique: true,
    minlength: 3
  },
  password: {
    type:String,
    minlength: 3,
    required: true
  },
  authToken: {
    token: '',
  },
  serverToken: {
    token: ''
  },
  groupId:{
    type: Number,
    default: 0
  },
  avatarPath:{
    type: String,
    default: ''
  }
});

//Instance Methods
AccountSchema.methods = {
  generateToken: function(type,callback){
    switch(type)
    {
      case 'auth':
          var token = jwt.sign({'_id': this._id.toHexString(),'groupId':this.groupId}, config.key).toString();
          this.authToken.token = token;
          this.save();
          return callback(undefined,this.authToken.token);
        break;
      case 'server':
        return console.log('Npe');
        break;
      default:
        return callback('Bad first argument of generateToken method. Try set to "auth" or "server"', undefined);
    }
  },
  toJSON: function(){
    var userObject = this.toObject();
    return _.pick(userObject,['_id', 'email','groupId','user']);
  },
}

AccountSchema.statics = {
  updateGroupId: function(userLogin,groupId,callback){
    this.findOne({user:userLogin}).then((user)=>{
      user.groupId = groupId;
      user.save();
      return callback(undefined,user);
    }).catch((e)=>{return callback(e,undefined)})
  },
  findByToken: function(token){
    return new Promise((resvole,reject)=>{
      try{
        var decoded = jwt.verify(token, config.key);
      }catch(err){
        return reject('dupa');
      }

      this.findOne({"authToken.token":token}).then((account)=>{
        if(!account){return reject(false)}
        return resvole(true);
      }).catch((e)=>{return reject(e)})
    })
  },
  checkAccount: function(u,e){
    var status = null;
    return new Promise((resvole,reject)=>{
      this.findOne({user:u}).then((doc)=>{
        if(doc)
        {
          status = 1;
        }
        this.findOne({email:e}).then((docs)=>{
          if(docs)
          {
            if(status == 1)
            {
              status = 3;
              resvole(status);
            }
            else {
              status = 2;
              resvole(status);
            }
          }
          else{
            resvole(status);
          }
        }).catch((e)=>{Promise.reject(e)})
      }).catch((e)=>{reject(e)});
    })
  }
}
//Middle fucntions
AccountSchema.pre('save', function(next){
  if(this.isModified('password'))
  {
    bcrypt.genSalt(10,(err,salt)=>{
      if(err) return console.log(err);
      bcrypt.hash(this.password, salt, (err,hash)=>{
        if(err) console.log(err);
        this.password = hash;
        next();
      })
    })
  }
  else{
    next();
  }
});

var Account = mongoose.model('Account', AccountSchema);
module.exports = {Account:Account}
