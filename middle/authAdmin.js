const {Account} = require('./../db/schemas/Account.js');
const jwt = require('jsonwebtoken');
const {config} = require('./../config.js');

var authAdmin = (req,res,next) => {
var token = req.header('x-auth');

  Account.findByToken(token).then((bool)=>{
    if(bool)
    {
      try{
        var decode = jwt.verify(token,config.key);
      } catch(e){
        res.sendStatus(401);
      }

      Account.findOne({_id:decode._id,groupId:decode.groupId}).then((doc)=>{
        if(!doc) res.sendStatus(401);
        if(doc.groupId <= 4) res.sendStatus(401);
          req.user = doc;
          req.token = decode;
          next();
      }).catch((e)=>{
        res.sendStatus(401);
      })

    } else {
      res.sendStatus(401);
    }
  }).catch((e)=>{res.sendStatus(401)});
}

module.exports={authAdmin}
