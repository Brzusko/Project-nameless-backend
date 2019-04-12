

var addSomething = (arg1,arg2,callback) => {
  var result = arg1 + arg2;
  return callback(result);
}

addSomething(3,2,(res)=>{
  console.log(res);
})

var addSome2 = (arg1,arg2) => {
  return new Promise((rej,res)=>{
    var result = arg1 + arg2;
    res(result);
  })
}

addSome2(1,2).then((res)=>{
  console.log(res);
}).catch((e)=>console.log(e));
