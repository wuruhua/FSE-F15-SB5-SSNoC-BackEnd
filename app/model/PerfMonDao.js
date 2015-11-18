var server = require("../../server");
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database('chat.db');
var count = 0;
var save_count = 0;
var get_count = 0;

var PerfMonDao = function(dbHelper) {
    this.dbHelper = dbHelper;
}

PerfMonDao.prototype.dbCreate = function(callback) {
    //console.log("Inside dbCreate function");
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS chat (msg TEXT,  time TEXT)");
    });
    save_count = 0;
    get_count = 0;
    count = 0;
    callback(null, "TestMessageTableCreated");
}

PerfMonDao.prototype.dbDelete = function(callback) {
    //console.log("Inside dbDelete function");
    db = new sqlite3.Database('chat.db');
    db.serialize(function() {
        db.run("DROP TABLE IF EXISTS chat");
    });
    callback(null, "success");
}

PerfMonDao.prototype.insertTestMsg = function(msg, callback) {
    saveMsg(db, msg);
    save_count++;
    //console.log("save_count" + save_count);
    if (save_count > 10000) {
        callback(null, "Out Of Memory");
        save_count = 0;
    } else {
        callback(null, "Success");
    }
}

PerfMonDao.prototype.getTestMsg = function(next, callback) {
    getMsg(db, function(messages) {
        var msglist = [];
        messages.forEach(function(row) {
            msglist.push(row);
        });
        next(msglist);
    });
}

function getMsg(db, next) {
    db.all("SELECT * FROM chat", function(err, rows) {
        if (err) {
            //console.log("error");
            return err;
        }
        next(rows);
    });
}
/*the lowest level function save and query
 */
function saveMsg(db, message) {
    // not sure about the table element
    //var timestamp = Date.parse(new Date())/1000; 
    count++;
    if (count > 10000) {
        //console.log("count if" + count);
        db.all("DELETE FROM chat WHERE EXISTS ( SELECT * from chat)", function(err, rows) {
            if (err) {
                //console.log("error");
                return err;
            }
        });
        count = 0;
    }
    //console.log("count if" + count);
    var date = new Date;
    //var timestamp = date.toLocaleTimeString();
    var timestamp = Date.parse(new Date()) / 1000;
    var stmt = db.prepare("INSERT INTO chat (msg,time) VALUES (?,?)");
    //console.log("Inside DB" + message.cont);
    //console.log("Inside DB" + message.timestamp);
    stmt.run(message.cont, message.timestamp, function(err) {
        if (err)
            return err;
    });
    stmt.finalize();
}

module.exports = PerfMonDao;
