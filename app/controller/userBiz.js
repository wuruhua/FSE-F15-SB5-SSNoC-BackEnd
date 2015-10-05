//use userDao function to realize the login and register function

module.exports = function(db) {

var userDao = require("../model/userDao");
var userDao = new userDao(db);

return{
  //user login
    login :function(req,res) {
      var user = {
        name : req.body.name,
        password : req.body.password
      };
      // use userDao.getUser function to get the result
     userDao.getUser(user,function(status) {
        console.log("get the user");
        var data = {};

        //if the password and username matches, store it in response
        if (status === "success") {
          data.user = user;
          data.code = 200;
          res.json(data);

        // if the password is wrong, return the wrong password message
        } else if (status === "wrong_password"){
          data.code = 400; 
          res.send(data, "wrong password, please login again");

        // if the username is not in the database, ask the user to register as new
        } else if (status === "user_not_exist"){
          data.code = 404;
          res.send(data, "user not found, please register");

        } else {//means internal error for unknown status
           data.code = 500;
          res.send(data, "unknown error");
        }
        res.end();
      });
    },
   // //TestCase
 // testlogin :function(req,res) {
 //      var user = {
 //        name : "ssLL",
 //        password : "SS"
 //      };
 //      // use userDao.getUser function to get the result
 //      userDao.getUser(user,function(status) {
 //        console.log("get the user");
 //        var data = {};

 //        //if the password and username matches, store it in response
 //        if (status === "success") {
 //          data.user = user;
 //          data.code = 200;
 //          res.json(data);

 //        // if the password is wrong, return the wrong password message
 //        } else if (status === "wrong_password"){
 //          data.code = 400; 
 //          res.send(data, "wrong password, please login again");

 //        // if the username is not in the database, ask the user to register as new
 //        } else if (status === "user_not_exist"){
 //          data.code = 404;
 //          res.send(data, "user not found, please register");

 //        } else {//means internal error for unknown status
 //           data.code = 500;
 //          res.send(data, "unknown error");
 //        }
 //        res.end();
 //      });
 //    },

// testregister : function(req,res) {
//       var user = {
//         name : "AX",
//         password : "SS"
//       };
//       userDao.addNewUser(user,function(isSuccessed) {
//         console.log("prepare add new user");
//         var data={}
//         if (isSuccessed) {
//           data.user = user;
//           data.code = 200;
//           res.json(data);
//         } else {
//           data.code = 400;
//           res.send(data,"duplicate username");
//         }
//         res.end();
//       });
//     },


//new user register
    register : function(req,res) {
      var user = {
        name : req.body.name,
        password : req.body.password
      };
      userDao.addNewUser(user,function(isSuccessed) {
        console.log("prepare add new user");
        var data={}
        if (isSuccessed) {
          data.user = user;
          data.code = 200;
          res.json(data);
        } else {
          data.code = 400;
          res.send(data,"duplicate username");
        }
        res.end();
      });
    },


//get all users 
    getAllUser : function(req,res) {
       console.log("Get All Users");
        userDao.getAllUser(function(userList) {
        var data= {};
        data.userList = userList;
        res.json(data);
        res.end();
      }
      );
     
    
   }
 };

};

   
   