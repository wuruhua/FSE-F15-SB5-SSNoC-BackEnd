/* ------------------------------------*
 *          include libraries 
 * ------------------------------------*/
var http = require('http'),
    path = require('path'),
    express = require('express');
//sqlite3 = require('sqlite3').verbose(),
//db = new sqlite3.Database('wordy');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var port = 5000;
var userBiz = require('./app/controller/userBiz');
var publicMsgBiz = require('./app/controller/publicMsgBiz');
var privMsgBiz = require('./app/controller/privMsgBiz');
var PerfMonBiz = require('./app/controller/perfMonBiz');

/*var userDao = require("./app/model/userDao")(db);*/
var bodyParser = require('body-parser');
//setup dababase
var fs = require("fs");
var file = "./chatroom.db";

var users = {};
var inpriv = {};
var mode;
var performance_on;
var exists = fs.existsSync(file);
if (!exists) {
    //console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var DB = new sqlite3.Database(file);
//initialize the userBiz

var PublicMessageDao = require("./app/model/PublicMessageDao");
var userDao = require("./app/model/userDao");
userBiz = new userBiz(DB);
PublicMessageDao = new PublicMessageDao(DB);
publicMsgBiz = new publicMsgBiz(DB);
privMsgBiz = new privMsgBiz(DB);
userDao = new userDao(DB);
PerfMonBiz = new PerfMonBiz(DB);

//initialize the router
app.use(require('body-parser').urlencoded({
    extended: true
}));
require('./routes')(app, DB, userBiz, publicMsgBiz, privMsgBiz, PerfMonBiz);
/* -------------------------------------------*
 *             set up homepage
 * -------------------------------------------*/
app.engine('.html', require('ejs').__express); //ejs : Embedded JavaScript
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.get('/', function(req, res) {
    //res.render('contactlist');
    res.render('login');
});
app.use(express.static(path.join(__dirname, 'public/')));
// app.use(bodyParser.urlencoded({limit: '50mb'}));
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser({limit: '500mb'}));
// app.use(bodyParser.json({limit: '500mb'}));
//  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   limit: '500mb',
//    extended: true

//  }));
//  console.log('Limit file size: '+limit);

//var rows= [];
/*module.exports.emitUser = function(username,newuser){
	console.log("-----------------in-----------");
    // this function expects a socket_io connection as argument
	PublicMessageDao.getMessages();
	io.sockets.on('connection',function(socket){
    	io.sockets.emit('welcomeMessage', {name:username, NewUser:newuser});
	});
}*/
/* -------------------------------------------*
 *             Listen to client
 * -------------------------------------------*/
io.sockets.on('connection', function(socket) {
    /*module.exports.emitPrivMsgHistory = function(rows,username,touser){
        // this function expects a socket_io connection as argument
        // now we can do whatever we want:
        console.log("inpriv[username] " +inpriv[username] +username);
        	    console.log("inpriv[touser] " +inpriv[touser] +touser);

    	if(inpriv[username] == true)
    	{
    		console.log("sending priv from "+username);
    		users[username].emit('load priv msgs', rows,username,touser);
    	}
    	if(inpriv[touser] == true)
    	{	
    		console.log("sending priv to "+touser);	
    		users[touser].emit('load priv msgs', rows,username,touser);
    	}
    }*/
    module.exports.emitAnHistory = function(rows) {
        // this function expects a socket_io connection as argument
        // now we can do whatever we want:
        //PublicMessageDao.getMessages();
        // console.log(rows);
        io.sockets.emit('load announce', rows);

    };

    module.exports.emitUserList = function(rows) {
        // this function expects a socket_io connection as argument
        // now we can do whatever we want:
        //console.log("emit user row?" + rows.length)
            //PublicMessageDao.getMessages();
        //console.log("rows" + rows);
        io.sockets.emit('updateUserList', rows);

    };

    socket.on('PerfCheck', function() {
        if (performance_on == 1)
            socket.emit("PerfGet", "All");
    });


    socket.on('newuser', function(username) {
        socket.nickname = username;
        users[socket.nickname] = socket;
        inpriv[socket.nickname] = false;
        //privmsgcnt[socket.nickname] = 0;
    });

    socket.on('disconnect', function() {
        //console.log("Loading messages" + socket.nickname);
        //socket.close();
        delete users[socket.nickname];
        delete inpriv[socket.nickname];
    });


    /*socket.on('sendPrivMsg', function(data){
		console.log("Loading ************ private messages"+ socket.nickname);
		console.log("data.name" +data.name);
		console.log("data.toname" +data.toname);
		//PrivateMessageDao.savePrivMessages(data);
		//if(inpriv[data.toname] == false
		if(inpriv[data.toname] == false)
		{
			users[data.toname].emit('inc priv msg',data.toname, data.name);
		}
		//console.log("get all user:"+rows.length);    
		//callback(rows);
		//userBiz.updatePrivUser();
		privMsgBiz.savePrivMessages(data);
		userBiz.getAllUser();
	});*/

    socket.on("sendPrivateMessage", function(msg) {
        var authorSelf = msg.author + 'self';
        //console.log("author"+msg.author);
        //console.log("targ"+msg.targ);
        io.sockets.emit(msg.author, msg);
        io.sockets.emit(msg.targ, msg);
        //io.sockets.emit('privateChat', msg);
        //console.log("emit sendPrivateMessage");
        //console.log(msg.author);
        //console.log(msg.targ);
    });

    // load all history announcement
    socket.on('sendAn', function() {
        //console.log("Loading announcements");
        publicMsgBiz.getAnnouncements();

    });
    // refresh userlist
    socket.on('sendstatus', function() {
        //console.log("Loading status");
        userBiz.getAllUser();

    });

    socket.on('changeStatus', function(data) {
        userBiz.updateUserStatus(data.name, data.status);
        userBiz.getAllUser();
    });

    socket.on('postAnnouncement', function(data) {
        //console.log("postannounce");
        publicMsgBiz.saveAnnouncement(data);
        //console.log("data" + data.msg);
        if (data.msg == "performance on") {
            performance_on = 1;
        }
        io.sockets.emit('announcement', data);
    });

    socket.on('stopmeasure', function() {
        //console.log("postannounce");
        //publicMsgBiz.saveAnnouncement(data);
        performance_on = 0;
        io.sockets.emit('chatroom', "All");
    });

    //get the message from a user and broadcast it
    socket.on("sendWallMessage", function(msg) {
        io.sockets.emit("getWallMessage", msg);
        //console.log("emit getWallMessage");
    });
    // socket.on('sendDialog', function(data){
    // 	inpriv[socket.nickname] = false;
    // 	/* Add to message table */
    //        publicMsgBiz.saveMessage(data);
    // 	/*Broadcast*/
    // 	//io.sockets.emit('dialog_entry',{name:data.name, msg:data.msg, time:data.time});
    // 	//users[socket.nickname].emit('load old msgs', rows);
    // 	for(var k in users)
    // 	{
    // 	  if(inpriv[k] == false)
    // 		users[k].emit('dialog_entry',{name:data.name, msg:data.msg, time:data.time});
    // 	}
    // });
    socket.on('logoutUser', function(msg) {
        userBiz.updateOnline(msg.name, 0);
        userBiz.getAllUser();
    });


    //support for uploading video/image
    socket.on('uploadfile', function(msg) {
        console.log("received event and emit uploadfile to client!");
        console.log("server receive username: "+msg.name);
       // console.log("server receive message: "+msg.msg);
        // console.log("server receive file type: "+data.type);

        io.sockets.emit('newfile', msg);
    });
});
/* ------------------------------------*
 *       listen upon connection
 * ------------------------------------*/
server.listen(port, function() {
    console.log('listening on localhost:' + port);
});
