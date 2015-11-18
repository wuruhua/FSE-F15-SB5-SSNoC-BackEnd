var server = require("../../server");

var PrivateMessageDao = function(db) {
    this.db = db;
}

PrivateMessageDao.prototype.savePrivMessages = function(Message) {
    savePrivMsg(this.db, Message);
}

PrivateMessageDao.prototype.getPrivMessages = function(fromuser, touser, next) {
    //console.log("fromuser===" + fromuser); 
    //console.log("touser====" + touser);
    //console.log("next===" + next);
    //getPrivMsg(this.dbHelper,fromuser, touser);	
    //console.log("MSG GET"); 
    getPrivMsg(this.db, fromuser, touser, function(messages) {
        var msglist = [];
        messages.forEach(function(row) {
            msglist.push(row);
        });
        next(msglist, fromuser, touser);
    });
}

function getPrivMsg(db, fromuser, touser, next) {
    var cmd = "SELECT * FROM message where (src='" + fromuser + "' and dest='" + touser + "') or (src='" + touser + "' and dest='" + fromuser + "')";
    //console.log("getPrivMsg Cmd"+cmd);
    db.all(cmd, function(err, rows) {
        if (err) {
            //console.log("error"); 	
            //	throw err;
        }
        //console.log("rows:"+rows.length);
        //server.emitPrivMsgHistory(rows);
        next(rows, fromuser, touser);
    });
}

/*the lowest level function save and query
 */
function savePrivMsg(db, message) {
    // not sure about the table element
    //var timestamp = Date.parse(new Date())/1000; 
    //console.log("======message.name"+message.author);
    //console.log("=======message.tonname"+message.targ);
    var date = new Date;
    //var timestamp = date.toLocaleTimeString();
    var timestamp = Date.parse(new Date()) / 1000;
    var stmt = db.prepare("INSERT INTO message (content, src, dest, gmt_create,type,usr_sts) VALUES (?,?,?,?,?,?)");
    stmt.run(message.cont, message.author, message.targ, timestamp, 1, message.usersts);
    stmt.finalize();
}

module.exports = PrivateMessageDao;
