module.exports = function(db,app) {

    var userDao = require("../model/userDao");
    var server = require("../../server");
    var fs = require('fs');
    var encode = fs.readFileSync("encode.txt", "utf-8");
    var md5 = require('md5');
	var test_mode = app.get('testing');
	userDao = new userDao(db);
   
    //var socket = io.connect();

    return {
        //user login
        setpri: function(req, res) {
            var data = {};
            //console.dir(req);
			console.log("9999999999999999999999999999999999999999999" + test_mode);
            if (req.cookies.pri === md5("Administrator" + encode)) {
                userDao.updateUserPriviliage(req.body.username, req.body.pri, function(callback) {
                    if (callback.code === 1) {
                        data.success = true;
                        data.code = 1;
						if(test_mode === false)
                        server.emitPri(req.body.username, req.body.pri, md5(id2pri(req.body.pri) + encode));
                        console.log("id2pri:" + id2pri(req.body.pri));
                    } else if (callback.message === 2) {
                        data.success = false;
                        data.code = 2;
                    }
                    data.message = callback.message;
                    res.json(data);
                    res.end();
                });

            } else {
                data.success = false;
                data.code = -1;
                data.message = "You don't have the privilege!";
                res.json(data);
                res.end();
            }

        },

        setactive: function(req, res) {
            var data = {};
            //console.dir(req);
            if (req.cookies.pri === md5("Administrator" + encode)) {
                userDao.updateUserActive(req.body.username, req.body.active, function(callback) {
                    if (callback.code === 1) {
                        data.success = true;
                        data.code = 1;
                    }
                    if (req.body.active === "0") {
                        console.log("api" + req.body.active);
                        var emitmsg = {};
                        emitmsg.username = req.body.username;
                        emitmsg.message = "Your account is set to be inactive. You will logout!";
						if(test_mode === false)
                        server.emitLogout(emitmsg);
                    }
                    data.message = callback.message;
                    res.json(data);
                    res.end();
                });

            } else {
                data.success = false;
                data.code = -1;
                data.message = "You don't have privilege!";
                res.json(data);
                res.end();
            }

        },

        setuserinfo: function(req, res) {
            var data = {};
            //console.dir(req);
            if (req.cookies.pri === md5("Administrator" + encode)) {
                userDao.updateUserInfo(req.body.old, req.body.username, md5(req.body.password), function(callback) {
                    if (callback.code === 1) {
                        data.success = true;
                        data.code = 1;
                        data.message = callback.message;
                        var emitmsg = {};
                        emitmsg.username = req.body.old;
                        emitmsg.message = "Your account has been changed, you need to login again";
						if(test_mode === false)
                        server.emitLogout(emitmsg);
                        res.json(data);
                        res.end();
                    } else if (callback.code === 2) {
                        data.success = false;
                        data.code = 2;
                        data.message = callback.message;
                        res.json(data);
                        res.end();
                    }
                });

            } else {
                data.success = false;
                data.code = -1;
                data.message = "You don't have privilege!";
                res.json(data);
                res.end();
            }
        },

        isadmin: function(req, res) {
            var data = {};
            //console.dir(req);
            if (req.cookies.pri === md5("Administrator" + encode)) {
                data.success = true;
                res.status = 200;
				res.json(data);
                res.end();
            } else {
                data.success = false;
                data.code = -1;
                data.message = "You don't have privilege!";
                res.json(data);
                res.end();
            }
        },

        ismonitor: function(req, res) {
            var data = {};
            //console.dir(req);
            if (req.cookies.pri === md5("Administrator" + encode) || req.cookies.pri === md5("Monitor" + encode)) {
                data.success = true;
                res.status = 200;
				res.json(data);
                res.end();
            } else {
                data.success = false;
                data.code = -1;
                data.message = "You don't have privilege!";
                res.json(data);
                res.end();
            }
        },

        iscitizen: function(req, res) {
            var data = {};
            //console.dir(req);
            if (req.cookies.pri === md5("Administrator" + encode) || req.cookies.pri === md5("Monitor" + encode) || req.cookies.pri === md5("Coordinator" + encode)|| req.cookies.pri === md5("Citizen" + encode)) {
                data.success = true;
                res.status = 200;
				res.json(data);
                res.end();
            } else {
                data.success = false;
                data.code = -1;
                data.message = "You need to login first";
                res.json(data);
                res.end();
            }
        },
    };
};

function id2pri(id) {
    if (id === "0") {
        return "Citizen";
    } else if (id === "1") {
        return "Administrator";
    } else if (id === "2") {
        return "Coordinator";
    } else if (id === "3") {
        return "Monitor";
    } else {
        return "";
    }
}
