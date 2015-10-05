var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var userDao = require("./app/model/userDao")(db);
var userBiz = require('./app/controller/userBiz');

//set up database

var fs = require("fs");
var file = "./chatroom.db";

var exists = fs.existsSync(file);
if (!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);


//create user table 
db.serialize(function() {
  //create table
  db.run("CREATE TABLE IF NOT EXISTS User (name TEXT,password TEXT)");
});
db.close();

var DB = new sqlite3.Database(file);
//initialize the userBiz


userBiz = new userBiz(DB);
//initialize the router
 require('./routes')(app,DB,userBiz);

//express setup
app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


// /*this part of code is mainly about the user directory, generally, first use userbiz to 
// get all the users in database, then use socket.io to get all the online users, then merge them together, but I'm
// not quite sure about this part of code, so I only wrote the code to use socket to get the online users' list*/

// //use this list to store online users
// var onlineUsers = {};
// //nums of users online
// //var onlineCount = 0;


// io.on('connection', function(socket){
// //when user log in, store their name in a list
//         socket.on('login', function(user){
            
//             socket.name = user.name;
            
//             if(!onlineUsers.hasOwnProperty(user.name)) {
//               onlineUsers[user.name] = user.name;
//              //onlineCount++;
//             }
            
// //tell other users that a new user login
//             io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
//             console.log(obj.username+'enter the room');
//           });

// });




