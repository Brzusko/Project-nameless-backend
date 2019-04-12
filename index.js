const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const {config} = require('./config');
const {mongoose} = require('./db/mongoose.js');
const {Account} = require('./db/schemas/Account.js');
const {Article} = require('./db/schemas/Article.js');
const {Project} = require('./db/schemas/Project.js');
const {authAdmin} = require('./middle/authAdmin.js');
const multer = require('multer');
const {storage} = require('./files/storage.js')
const fs = require('fs');
const jwt = require('jsonwebtoken')
const {checkAccount} = require('./middle/checkAccount.js');

const upload = multer({storage:storage, limits:{
  fileSize: 3 * 100000
}});
const path = require('path');



var app = express();
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(cors());

//GET ROUTES

//GETTING ADMINS LIST ROUTE
app.get('/user/admins',(req,res)=>{
  Account.find().where('groupId').equals(5).then((result)=>{
    res.status(200).send(result);
  }).catch((e)=>res.sendStatus(500));
});

//GETTING ALL PROJESTCS LSIT WITH DETAILS
app.get('/projects',(req,res)=>{
  Project.find().then((object)=>{
    res.status(200).send(object);
  }).catch((e)=>res.status(404).send(e));
})

//GETTING PROJECT WITH ROUTE'S PARAM NAME
app.get('/project/:name',(req,res)=>{
  Project.findOne({name:req.params.name}).then((project)=>{
    res.status(200).send(project);
  }).catch((e)=>{res.status(404).send(e)})
})

//GETTING ALL ARTICLES LIST WITH DETAILS
app.get('/article',(req,res)=>{
  Article.find().then((obj)=>{
    res.send(obj)
  })
});

//POST ROUTES

//LOGIN ROUTE
app.post('/login',(req,res)=>{
  var body = _.pick(req.body, ['user','password']);
  Account.findOne({user:body.user}).then((account)=>{
    if(!account) return res.status(404).send({status: 2});
    bcrypt.compare(body.password,account.password,(err,ress)=>{
      if(err) return res.status(500).send({status: 1});
      if(ress === false) return res.status(401).send({status: 1});
      else{
        account.generateToken('auth',(err,token)=>{
          if(err) return res.status(500).send(err);
          res.header('x-auth', token);
          res.status(200).send({account:account,status: 0,token: token});
        })
      }
    })
  }).catch((e)=>{return res.status(500).send(e)})
});


//REGISTER ROUTE WITH CHECKING ACCOUNT INFO MIDDLEWARE THATS CONTAIN CHECKING IF EMAIL OR USERNAME IS TAKEM.
app.post('/register',checkAccount,(req,res)=>{
  var body = _.pick(req.body, ['email','password','user']);
  var user = new Account({
    email: body.email,
    user: body.user,
    password: body.user
  });
  user.save().then((doc)=>{
    res.status(200).send({status:0});
  }).catch((e)=>{res.status(400).send({status:4})});
});

//CREATING ARTICLE ROUTE WITH BACKGROUND UPLOAD, U HAVE TO BE ADMIN TO MAKE THAT REQUEST SUCCESSFUL.
app.post('/article', authAdmin, upload.single('article'),(req,res)=>{
  var body = _.pick(req.body, ['title','content']);
  var article = new Article({
    title: body.title,
    content: body.content,
    createdBy: req.user.user,
    imgPath: req.filepath
 });
 article.save().then(()=>{
   res.status(200).send('Article created');
 }).catch((e)=>res.send(e));
});

//CREATING PROJECT ROUTE< U HAVE TO BE ADMIN TO MAKE THAT REQUEST SUCCESSFUL

app.post('/project',authAdmin, (req,res)=>{
  var body = _.pick(req.body, ['title','desc','tags']);
  var project = new Project({
    name: body.title,
    desc: body.desc,
    tags: body.tags
  });
  project.save().then((doc)=>{
    res.status(200).send(doc);
  }).catch((e)=>res.send(e));
});

app.post('/test', upload.single('avatar') ,(req,res)=>{
  var body = _.pick(req.body,['test']);
  console.log(req.files);
  res.send(body.test);
})

//PUT ROUTES

//RESETING USER PASSWORD, U HAVE TO BE ADMIN TO DO THAT
app.put('/user/admin',authAdmin,(req,res)=>{
  var body = _.pick(req.body, ['user','newPassword']);
  Account.findOne({user:body.user}).then((doc)=>{
    if(!doc) return res.status(400).send('Cant find User');
    doc.password = body.newPassword;
    doc.save();
    res.status(200).send('Changed Password');
  }).catch((e)=>{res.sendStatus(500)});
})

//UPDATING USER'S GROUPID, U HAVE TO BE ADMIN TO DO THAT
app.put('/update',authAdmin, (req,res)=>{
  var body = _.pick(req.body, ['groupId','user']);
  Account.updateGroupId(body.user,body.groupId,(err,result)=>{
    if(err) return res.status(404).send('er');
    result.generateToken('auth',(errr,token)=>{
      if(errr) return res.status(404).send('err');
      res.header('x-auth',token);
      res.status(200).send({that:req.token,new:token});
    })
  })
}),

//DELETE ROUTES

//DELETING ARTICLE ROUTE, U HAVE TO BE ADMIN TO DO THAT

app.delete('/article', authAdmin,(req,res)=>{
  var body = _.pick(req.body,['title']);
  console.log(req.body);

  Article.findByTitleAndRemove(body.title).then((doc)=>{
    res.status(200).send(`Deleted Article with title ${doc.title}`)
  }).catch((e)=>{
    console.log(e);
    res.status(400).send(e);
  })
})


// Article.findByTitleAndRemove('Dupa jasia').then((doc)=>{
//   console.log(doc)
// }).catch((e)=>console.log(e));
// Account.checkAccount('Sprayd','wojtads1146@gmail.com').then((status)=>{
//
// }).catch((e)=>{console.log(e)});


console.log(config.port);
app.listen(8080,()=>{
  console.log(`Runnig app on port 80`);
});
