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
// var publicMsgBiz = require('./app/controller/publicMsgBiz');
// var privMsgBiz = require('./app/controller/privMsgBiz');
var PerfMonBiz = require('./app/controller/perfMonBiz');
var adminBiz = require('./app/controller/adminBiz');
var controller = require('./app/controller/controller');
/*var userDao = require("./app/model/userDao")(db);*/
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//setup dababase
var fs = require("fs");
var file = "./chatroom.db";

/*var users = {};
var inpriv = {};*/
var users = {};
var inpriv = {};
var mode;
var performance_on = 0;
var performance_page = 'chat';
//var perf_src_page = {};
//var perf_dest_page = {};
var exists = fs.existsSync(file);
if (!exists) {
    //console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var md5 = require('md5');

var DB = new sqlite3.Database(file);
//initialize the userBiz

//var PublicMessageDao = require("./app/model/PublicMessageDao");
var userDao = require("./app/model/userDao");
userBiz = new userBiz(DB);

app.set('testing', true);

// PublicMessageDao = new PublicMessageDao(DB);
// publicMsgBiz = new publicMsgBiz(DB);
// privMsgBiz = new privMsgBiz(DB);
userDao = new userDao(DB);
PerfMonBiz = new PerfMonBiz(DB);
adminBiz = new adminBiz(DB,app);
controller = new controller();


//initialize the router
app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({extended: false}))
app.use(cookieParser());
require('./routes')(app, DB, userBiz,  PerfMonBiz, adminBiz, controller);



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
        io.sockets.emit('load announce', rows);

    };

    module.exports.emitUserList = function(rows) {
        io.sockets.emit('updateUserList', rows);
    };

    module.exports.emitPri = function(username, pri, cookie) {
        var data = {};
        data.username = username;
        data.pri = pri;
        data.cookie = cookie;
        io.sockets.emit('updatePri_' + username, data);
    };

    module.exports.emitLogout = function(emit) {
        console.log("kickout:" + emit.username);
        io.sockets.emit('Logout_' + emit.username, emit);
    };

    module.exports.emitAnnouncement = function(emit) {
        if (emit.msg == "performance on") {
            performance_on = 1;
        }
        io.sockets.emit('announcement', emit);
    };


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

    socket.on("sendPrivateMessage", function(msg) {
        var authorSelf = msg.author + 'self';

        io.sockets.emit(msg.author, msg);
        io.sockets.emit(msg.targ, msg);

    });
    // load all history announcement
    socket.on('sendAn', function() {
        //console.log("Loading announcements");
        controller.loadannouncement();
        //publicMsgBiz.getAnnouncements();

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

    socket.on('stopmeasure', function() {
        //console.log("postannounce");
        //publicMsgBiz.saveAnnouncement(data);
        io.sockets.emit('chatroom', performance_page);

        /*  for(var sock in perf_src_page)
            {
                console.log("sock"+sock);
                console.log("perf_src_page"+perf_src_page[sock]);
                io.sockets.emit('perf_src',perf_src_page[sock]);
            }

            for(var sock in perf_dest_page)
            {
                console.log("sock"+sock);
                console.log("perf_dest_page"+perf_dest_page[sock]);
                io.sockets.emit('perf_dest',perf_dest_page[sock]);
            }*/

        performance_on = 0;
    });


    socket.on('PerfCheck', function(data) {

        if (performance_on == 1) {
            //perf_dest_page[socket] = data;
            console.log("Emitting perfGet");
	performance_page = data;
           // console.log("=================>performance_page<====================" + perf_dest_page[socket]);

            io.sockets.emit("PerfGet", "All");
        }
    });

    //get the message from a user and broadcast it
    socket.on("sendWallMessage", function(msg) {
        io.sockets.emit("getWallMessage", msg);
        //console.log("emit getWallMessage");
    });

    socket.on('logoutUser', function(msg) {
        userBiz.updateOnline(msg.name, 0);
        userBiz.getAllUser();
    });


    //support for uploading video/image
    socket.on('uploadfile', function(msg) {
        console.log("received event and emit uploadfile to client!");
        console.log("server receive username: " + msg.name);
        // console.log("server receive message: "+msg.msg);
        // console.log("server receive file type: "+data.type);

        io.sockets.emit('newfile', msg);
    });
});

var PORT = process.env.PORT || 5000;

var serverInitialized = function(port) {
    //fs.writeFile('encode.txt', Date.parse(new Date()), 'utf8');
    console.log('listening on the localhost:' + port);
};

var app = server.listen(process.env.PORT || 5000, serverInitialized(process.env.PORT || 5000)).on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
        PORT++;
        HOST = 'http://localhost:' + PORT;
        app = server.listen(PORT, serverInitialized(PORT));
        //app = server.listen(port);
    }
});
module.exports.app = app;
