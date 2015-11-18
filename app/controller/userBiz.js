//use userDao function to realize the login and register function
module.exports = function(db) {

    var userDao = require("../model/userDao");
    var server = require("../../server");
    var md5 = require('md5');
    var userDao = new userDao(db);
    //var socket = io.connect();

    return {
        //user login
        login: function(req, res) {
            var user = {
                username: req.body.username,
                password: md5(req.body.password)
            };
            // use userDao.getUser function to get the result
            userDao.getUser(user, function(status) {
                //console.log("get the user");
                var data = {};

                //if the password and username matches, store it in response
                if (status === "success") {
                    data.success = true;
                    data.code = 11;
                    data.message = "login success!";
                    res.cookie("user", req.body.username, {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.cookie("md5", md5(req.body.username), {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.cookie("is_first", 0, {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.json(data);
                    //server.emitMsgHistory();
                    //use case 1: send welcome message to client
                    // if the password is wrong, return the wrong password message
                } else if (status === "wrong_password") {
                    data.success = false;
                    data.code = 13;
                    data.message = "username and password doesn't match!";
                    res.json(data);
                    // if the username is not in the database, ask the user to register as new
                } else if (status === "user_not_exist") {
                    data.success = false;
                    data.code = 12;
                    data.message = "user not existed, please register!";
                    res.json(data);
                } else { //means internal error for unknown status
                    data.code = 500;
                    res.send(data, "unknown error!");
                }
                res.end();
            });
        },

        //new user register
        register: function(req, res) {
            var user = {
                username: req.body.username,
                password: md5(req.body.password)
            };
            userDao.addNewUser(user, function(isSuccessed) {
                //console.log("prepare add new user");
                var data = {}
                if (isSuccessed) {
                    data.success = true;
                    data.user = user.username;
                    data.code = 21;
                    data.message = "register success!";
                    res.cookie("user", req.body.username, {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.cookie("md5", md5(req.body.username), {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.cookie("is_first", 1, {
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    });
                    res.json(data);
                    //server.emitMsgHistory();
                } else {
                    data.success = false;
                    data.user = user.username;
                    data.code = 22;
                    data.message = "duplicate username!"
                    res.json(data);
                }
                res.end();
            });
        },

        //set audience
        setAudience: function(req, res) {
            //console.log("audience:"+req.body.audience);
            res.cookie("audience", req.body.audience, {
                maxAge: 1000 * 60 * 60 * 24 * 30
            });
            var data = {};
            res.json(data);
            res.end();
        },

        //get all users 
        getAllUser: function(req, res) {
            //console.log("Get All Users");
            userDao.getAllUser(function(userList) {
                // var data= {};
                // data.userList = userList;
                // res.json(data);
                // res.end();
                server.emitUserList(userList);
            });
        },

        searchbyName: function(req, res) {

            var user = {
                //username : req.body.username
                username: req.body.username
            };
            userDao.search(user, 1, function(userList) {
                var data = {};
                if (userList == null) {
                    data.userlist = new Array();
                    data.message = "No users matches!"
                } else {
                    data.userlist = userList;
                    data.message = "Here are matched users:"
                }
                res.json(data);
            });
        },

        searchbyStatus: function(req, res) {
            //console.log("Get All Users");
            var user = {
                status: req.body.status
            };
            userDao.search(user, 0, function(userList) {
                var data = {};
                if (userList == null) {
                    data.userlist = new Array();
                    data.message = "No users matches!"
                } else {
                    data.userlist = userList;
                    data.message = "Here are matched users:"
                }
                res.json(data);
            });


        },
        // REST API for share status use case
        updateUserStatus: function(req, res) {
            //console.log("change status");
            var username = req.body.user;
            var status = req.body.status;
            var responseJSON = req.body;
            responseJSON["gmt_string"] = new Date().toLocaleString().split(" ")[1];
            responseJSON["gmt_string"] = responseJSON["gmt_string"].trim();
            userDao.updateUserStatus(username, status);
            res.status(200).json(responseJSON);
        },

        updateOnline: function(username, is_online) {
            //console.log("Get All Users");
            userDao.updateOnline(username, is_online);
        },

        delDB: function(req, res) {
            userDao.delDB(function() {
            });
            res.send("success!");
            res.end();
        },
    };
};
