const _ = require('lodash');
const {Account} = require('./../db/schemas/Account.js');

var checkAccount = (req,res,next) =>{
  var data = _.pick(req.body, ['email','user','password']);
  Account.checkAccount(data.user,data.email).then((status)=>{
    console.log(status);
    if(!status)
    {
      next();
    }
    else {
      res.status(400).send({status:status});
    }
  }).catch((e)=>{console.log(e)});
}

module.exports={checkAccount}
