var server = require("../../server");
var stop = ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your"];
var PublicMessageDao = function(db) {
    this.db = db;
};

PublicMessageDao.prototype.saveMessage = function(Message) {
    saveMsg(this.db, Message, 1);
};
PublicMessageDao.prototype.saveAnnouncement = function(Message) {
    saveMsg(this.db, Message, 2);
};
PublicMessageDao.prototype.getMessages = function(next) {
    //console.log("MSG GET"); 
    getMsg(this.db, 1, function(messages) {
        var msglist = [];
        messages.forEach(function(row) {
            msglist.push(row);
        });
        next(msglist);
    });

};
PublicMessageDao.prototype.search = function(info, type, src, dest, next) {

    //console.log("MSG GET"); 
    search(this.db, info, type, src, dest, function(messages) {
        var msglist = [];
        if (messages.length > 0) {
            messages.forEach(function(row) {
                msglist.push(row);
            });
        }
        next(msglist);
    });

};
PublicMessageDao.prototype.getAnnouncements = function(next) {
    getMsg(this.db, 2, function(messages) {
        var msglist = [];
        messages.forEach(function(row) {
            msglist.push(row);
        });
        next(msglist);
    });
};
PublicMessageDao.prototype.verify = function(message, next) {
    //var info = req.info;
    var info = message.split(" ");
    var m = 0;
    for (var i = 0, length = info.length; i < length; i++) {
        var flag = true;
        for (var j = 0, len = stop.length; j < len; j++) {
            if (info[i] == stop[j]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            m++;
        }
    }






    if (m > 0) {
        next(true);
    } else {
        next(false);
    }
};

function getMsg(db, type, next) {
    db.all("SELECT * FROM message where type = '" + type + "' and dest = 'All' order by gmt_create asc", function(err, rows) {
        if (err) {
            //console.log("error");
            throw err;
        }
        //console.log("rows:"+rows.length);
        // server.emitMsgHistory(rows);
        next(rows);
    });
}

function search(db, info, type, src, dest, next) {
    info = info.split(" ");
    var values = [];
    for (var i = 0, length = info.length; i < length; i++) {
        if (info[i].trim() !== "") {
            values.push(" content like'%" + info[i].trim() + "%'");
        }

    }
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

    sql = "SELECT * FROM message WHERE ( " + values.join(' or ') + ") and type = '" + type + "'"
        .concat(destsql).concat(srcsql).concat("order by gmt_create desc");

    //console.log(sql);
    var Objs = [];
    db.all(sql, function(err, rows) {
        //console.log(rows);
        next(rows);
    });
}
/*the lowest level function save and query
 */
function saveMsg(db, message, i) {
    // not sure about the table element
    //var timestamp = Date.parse(new Date())/1000; 
    //console.log(message);
    var date = new Date();
    //var timestamp = date.toLocaleTimeString();
    var timestamp = Date.parse(new Date()) / 1000;
    var stmt = db.prepare("INSERT INTO message (type,content, src, dest, gmt_create,usr_sts,ismsg) VALUES (?,?,?,?,?,?,?)");
    //console.log(message.msg.data);
    
    stmt.run(i, message.msg, message.name, "All", timestamp, message.usersts, message.ismsg);
    
    //console.log("message saved!");
    stmt.finalize();
}

module.exports = PublicMessageDao;
