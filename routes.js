

module.exports = function(app,db,userBiz){


  app.get('/users', userBiz.getAllUser);
  app.post('/user/login', userBiz.login);
  app.post('/user/register', userBiz.register);
  // //TestCase
   // app.get('/user/testregister', userBiz.testregister);
   //  app.get('/user/testlogin', userBiz.testlogin);
};


