var fs = require("fs");
var file = "././chatroom.db";
var testfile = "././chatroom_test.db";
var exists = fs.existsSync(file);
var testexists = fs.existsSync(testfile);

if (!exists) {
   
    fs.openSync(file, "w");
}


if (!testexists) {
   
    fs.openSync(testfile, "w");
}


var sqlite3 = require("sqlite3").verbose();

var db;
var testdb;


var dao = function() {
    createDb();
    createTestDb();
    test_resource_setup(testdb);
};


//create project db
function createDb() {
    db = new sqlite3.Database(file, createTable);
}


function createTable() {
    console.log("load Table");
    // db.run("CREATE TABLE IF NOT EXISTS message (type TEXT,status TEXT,content TEXT,src TEXT,dest TEXT, gmt_create TEXT)");
}

//create test db
function createTestDb() {
   
    testdb = new sqlite3.Database(testfile, createTable());
    
}


function test_resource_setup(testdb){

    testdb.serialize(function() {
    testdb.run("CREATE TABLE IF NOT EXISTS message (id INT(11),  content VARCHAR(2048), src VARCHAR(100), dest VARCHAR(100), gmt_create INT(11), type INT(2), location VARCHAR(50), usr_sts VARCHAR(50), ismsg INT(2),pri INT(2),is_active INT(2))", function(err){
        if(err)
        {
            console.log("Error in creation of message table");
        }
    });
    
    testdb.run("CREATE TABLE IF NOT EXISTS user (id INT(11),  username VARCHAR(50), password VARCHAR(50), gmt_register INT(11), gmt_login INT(11), gmt_status INT(11), is_online INT(2))", function(err){
        if(err)
        {
            console.log("Error in creation of user table");
        }
    });
    });
    
}

dao.prototype.saveMsg = function(message, next) {

    var date = new Date();
    var timestamp = Date.parse(new Date()) / 1000;

    if(message.istest == "no"){
          var stmt = db.prepare("INSERT INTO message (type,content, src, dest, gmt_create,usr_sts,ismsg) VALUES (?,?,?,?,?,?,?)");
    }else{
          var stmt = testdb.prepare("INSERT INTO message (type,content, src, dest, gmt_create,usr_sts,ismsg) VALUES (?,?,?,?,?,?,?)");
    }


    stmt.run(message.type, message.content, message.src, message.dest, timestamp, message.status, message.ismsg);
    next(true);
  
    stmt.finalize();
};

dao.prototype.getMsg = function(message, next) {

    var sql = "";
    if (message.src === null) {
        sql = "SELECT * FROM message where type = '" + message.type +
            "' and dest = '" + message.dest + "' and src not in (select username from user where is_active =0) and dest not in (select username from user where is_active =0) order by gmt_create asc";
    } else {
        sql = "SELECT * FROM message where type = '" + message.type +
            "' and (src = '" + message.src + "' and dest = '" + message.dest + "') or (src='" + message.dest + "' and dest='" + message.src + "') and src not in (select username from user where is_active =0) and dest not in (select username from user where is_active =0) order by gmt_create asc";
    }

    if(message.istest == "no"){
           db.all(sql, function(err, rows) {
            if (err) {
                
                throw err;
            }
            
            next(rows);
          });
    }else{
         testdb.all(sql, function(err, rows) {
         if (err) {  
            throw err;
         }
          next(rows);
         });
    }

    
};


dao.prototype.search = function(info, message, next) {
        info = info.split(" ");
        var values = [];
        for (var i = 0, length = info.length; i < length; i++) {
            if (info[i].trim() !== "") {
                values.push(" content like'%" + info[i].trim() + "%'");
            }

        }
        var type = message.type;
        var src = message.src;
        var dest = message.dest;
        var ismsg = message.ismsg;

        var sql = null;
        var destsql = "";
        var srcsql = "";

        if (src !== null) {
            srcsql = "and (src = '" + src + "' or dest ='" + src + "') ";
        }
        if (dest !== null) {
            if (dest === "private") {
                destsql = "and dest != 'All'";
            } else {
                destsql = "and dest = '" + dest + "'";
            }
        }

        sql = "SELECT * FROM message WHERE ( " + values.join(' or ') + ") and type = '" +
         type + "' and ismsg = '"+ismsg+
         "' and src not in (select username from user where is_active =0) and dest not in (select username from user where is_active =0) "
            .concat(destsql).concat(srcsql).concat("order by gmt_create desc");
        
        var Objs = [];
        if(message.istest == "no"){
                 db.all(sql, function(err, rows) {
                    //console.log(rows);
                    next(rows);
                 });

        }else{
                    testdb.all(sql, function(err, rows) {
                    //console.log(rows);
                    next(rows);
                    });

        }
        
    };
    /*the lowest level function save and query
     */

module.exports = dao;
