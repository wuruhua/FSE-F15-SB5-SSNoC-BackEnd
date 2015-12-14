//var server = require("../../server");

var userDao = function(db) {
    this.db = db;

};

// save new user in database
userDao.prototype.addNewUser = function(user, next) {
        var db = this.db;
        queryByName(db, user.username, function(isExist) {
            if (isExist) {
                next(false);
                console.log("duplicate username!!");
            } else {
                console.log("name can be registered!");
                save(db, user);
                next(true);

            }
        });

    };
    //get specfic users in database
userDao.prototype.getSpecificUser = function(where, callback) {
    this.db.all("SELECT * FROM user where " + where, function(err, rows) {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

userDao.prototype.updateOnline = function(username, is_online) {
    chg_online(this.db, username, is_online);
};

userDao.prototype.updateUserStatus = function(username, status) {
    chg_status(this.db, username, status);
};

userDao.prototype.updateUserPriviliage = function(username, pri, callback) {
    chg_pri(this.db, username, pri, callback);
};

userDao.prototype.updateUserActive = function(username, active, callback) {
    chg_active(this.db, username, active, callback);
};

userDao.prototype.updateUserInfo = function(old, username, password, callback) {
    chg_userinfo(this.db, old, username, password, callback);
};



//verify if the user is exist in database
userDao.prototype.getUser = function(user, callback) {
    var data = {};
    var db = this.db;
    query(db, user, 0, function(users) {
        // if can't find any username matches the password
        if (users.length === 0) {
            //if the user name is in database, means the user got the wrong password
            queryByName(db, user.username, function(isExist) {
                if (isExist) {
                    data.code = 2;
                    data.message = "Username and password doesn't match!";
                    callback(data);

                } else {
                    // if there is no such user name in database, user should register as new
                    data.code = 3;
                    data.message = "User not existed, please register!";
                    callback(data);

                }

            });

        } else {
            if (users[0].is_active === 0) {
                data.code = 4;
                data.message = "Your account is inactive! You can't login anymore!";
                callback(data);
            } else {
                chg_online(db, user.username, 1);
                data.message = "Login success!";
                data.code = 1;
                data.pri = users[0].pri;
                callback(data);
            }
        }
    });
};
userDao.prototype.search = function(user, flag, callback) {
    var db = this.db;
    var data;
    query(db, user, flag, function(users) {
        if (users.length === 0) {
            callback(null);

        } else {
            callback(users);
        }
    });
};


//get all users in database(to create directory)
userDao.prototype.getAllUser = function(callback) {
    this.db.all("SELECT * FROM user order by is_online desc, status desc, username", function(err, rows) {
        if (err) {
            console.log("error");
            throw err;
        }
        console.log("get all user:" + rows.length);

        callback(rows);
        //server.emitUserList(rows);
    });
};

userDao.prototype.delDB = function() {

    this.db.all("delete FROM user where username!='SSNAdmin'", function(err, rows) {
        if (err) {
            console.log("error");
            throw err;
        }
    });

    this.db.all("delete FROM message", function(err, rows) {
        if (err) {
            console.log("error");
            throw err;
        }
    });
};


/*the lowest level function save and query
 */
function save(db, user) {

    var timestamp = Date.parse(new Date()) / 1000;
    var date = new Date();
    //console.log("Date"+ date);
    //var timestamp = date.toLocaleTimeString();
    console.log("timestamp" + timestamp);
    var stmt = db.prepare("INSERT INTO user (username, password,gmt_login,gmt_status,gmt_register,is_online,status) VALUES (?,?,?,?,?,?,?)");

    stmt.run(user.username, user.password, timestamp, timestamp, timestamp, 1, 0);
    stmt.finalize();
}

//set the status:
//online:1
//offline:0 
function chg_status(db, username, status) {
    var timestamp = Date.parse(new Date()) / 1000;
    var date = new Date();
    console.log("Date" + date);

    var stmt = db.prepare("UPDATE user set status =?, gmt_status = ? WHERE username=?");

    stmt.run(status, timestamp, username);
    console.log("last:" + status);
    console.log("last:" + timestamp);
    console.log("last:" + username);
    stmt.finalize();
}

function chg_online(db, username, is_online) {

    var stmt = db.prepare("UPDATE user set is_online =? WHERE username=?");

    stmt.run(is_online, username);
    console.log("last:" + is_online);

    console.log("last:" + username);
    stmt.finalize();
}

function chg_pri(db, username, pri, callback) {

    var sql = "SELECT * FROM user WHERE pri = 1 and username !='" + username + "'";
    var data = {};
    //var flag = false;

    db.all(sql, function(err, row) {
        if (row.length === 0 && pri !== 1) {
            data.message = "There should be at least one administrator!";
            data.code = 2;
            callback(data);
        } else {
            var stmt = db.prepare("UPDATE user set pri =? WHERE username=?");
            stmt.run(pri, username);
            stmt.finalize();
            data.message = "Set privilage success!";
            data.code = 1;
            callback(data);
        }
    });
}

function chg_active(db, username, active, callback) {

    var data = {};
    //var flag = false;
    var stmt = db.prepare("UPDATE user set is_active =? WHERE username=?");
    stmt.run(active, username);
    stmt.finalize();
    data.message = "Set active status success!";
    data.code = 1;
    callback(data);
}

function chg_userinfo(db, old, username, password, callback) {

    var sql = "SELECT * FROM user WHERE username = '" + username + "'";
    var sql1 = "";
    var data = {};
     var stmt ="";
    //var flag = false;
    console.log(password);
    db.all(sql, function(err, row) {
        if (row.length === 1 && old !== username) {
            data.code = 2;
            data.message = "Username duplicated!";
            callback(data);

        } else {
            if (username === "" && password !== "d41d8cd98f00b204e9800998ecf8427e") {
                console.log("1");
                stmt = db.prepare("UPDATE user set password=? WHERE username=?");
                stmt.run(password, old);
                stmt.finalize();
            } else if (username !== "" && password === "d41d8cd98f00b204e9800998ecf8427e") {
                console.log("2");
                 stmt = db.prepare("UPDATE user set username=? WHERE username=?");
                stmt.run(username, old);
                stmt.finalize();
            } else if (username !== "" && password !== "d41d8cd98f00b204e9800998ecf8427e") {
                console.log("3");
                stmt = db.prepare("UPDATE user set username=?, password=? WHERE username=?");
                stmt.run(username, password, old);
                stmt.finalize();
            }
            data.message = "Set user info success!";
            data.code = 1;
            callback(data);
        }
    });
}


function queryByName(db, name, callback) {
    var sql = "SELECT * FROM user WHERE username = '" + name + "'";
    //var flag = false;

    db.all(sql, function(err, row) {
        console.log("test:" + sql);
        if (row.length > 0) {
            // if(flag){
            //   callback(row);
            // }else{
            callback(true);
        } else {
            callback(false);
        }
    });

}


function query(db, user, flag, callback) {

    var keys = Object.keys(user);
    var values = [];
    for (var i = 0, length = keys.length; i < length; i++) {
        if (flag == 1) {
            if (user[keys[i]].trim() !== null) {
                values.push(keys[i] + " like'%" + user[keys[i]].trim() + "%'");
            }
        } else {
            values.push(keys[i] + " = '" + user[keys[i]] + "'");
        }
    }
    var sql = null;
    if (keys.length > 0) {
        sql = "SELECT * FROM user WHERE " + values.join(' and ') + "order by is_online desc, username asc";
    } else {
        sql = "SELECT * FROM user";
    }
    console.log(sql);
    var Objs = [];

    db.all(sql, function(err, row) {
        callback(row);

    });
}

module.exports = userDao;
