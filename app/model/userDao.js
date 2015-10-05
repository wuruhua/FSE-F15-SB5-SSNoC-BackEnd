

var uuid = require('node-uuid');
var userDao = function(db){
	this.db = db;

}

// save new user in database
userDao.prototype.addNewUser = function(user,next){
  var db = this.db;
  queryByName(db, user.name, function(isExist) {
    if (isExist) {
       next(false);
      console.log("duplicate username!!");
    }else {
     console.log("name can be registered!");
      save(db, user);
      next(true);
      
    }
  });

}

//verify if the user is exist in database
userDao.prototype.getUser = function(user,callback) {
  var db = this.db;
  query(db, user, function(users) {
    // if can't find any username matches the password
    if(users.length == 0 ) {
      //if the user name is in database, means the user got the wrong password
        queryByName(db, user.name,function(isExist){
          if (isExist) {
           callback("wrong_password");
       
        } else {
        // if there is no such user name in database, user should register as new
           callback("user_not_exist");
          
        }

        });
        
    }else {
       callback("success");
    } 
  });
}

//get all users in database(to create directory)
userDao.prototype.getAllUser = function(callback) {
  query(this.db, {}, function(users) {
    var userList = [];
    users.forEach(function (row) {
      userList.push(row.name);
    });
    callback(userList);
  });
}


/*the lowest level function save and query
*/
function save(db,user) {
 // not sure about the table element
   var stmt = db.prepare("INSERT INTO User (name, password) VALUES (?,?)");
  stmt.run(user.name, user.password);
   stmt.finalize();

}




function queryByName(db,name,callback) {
  var sql = "SELECT * FROM User WHERE name = '" + name + "'";
  //var flag = false;
  db.all(sql, function(err, row) {
    console.log(sql);
    if (row.length > 0) {
      
      callback(true);

    } else {
      
     callback(false);
    }
  });
   
}

function query(db,user,callback) {

  var keys = Object.keys(user);
  var values = [];
  for(var i=0,length = keys.length; i< length; i++) {
    values.push(keys[i]+" = '"+user[keys[i]]+"'");
  }
  var sql = null;
  if ( keys.length>0 ) {
    sql = "SELECT * FROM User WHERE "+values.join(' and ');
  }
  else {
    sql = "SELECT * FROM User";
  }
  console.log(sql);
  var Objs = [];

      db.all(sql, function(err, row) {
      callback(row);
 
  });
}

module.exports = userDao;
