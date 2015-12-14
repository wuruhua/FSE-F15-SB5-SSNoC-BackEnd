var server = require("../../server");
var dao = require("./dao.js");
var dao = new dao();
var stop = ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your"];

var message = function(content, src, dest, type, status, ismsg,istest) {
    this.type = type;
    this.content = content;
    this.status = status;
    this.src = src;
    this.dest = dest;
    this.ismsg = ismsg;
    this.istest = istest;
    //console.log("message constructor get called, content: "+this.content);
};

message.prototype.verify = function(messages, next) {
    //var info = req.info;
    var info = messages.split(" ");
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

message.prototype.saveMessage = function(next) {

    dao.saveMsg(this, function(isSuccessed) {

        if (isSuccessed) {
            next(true);
        }
    });
};
message.prototype.getMessages = function(next) {
    dao.getMsg(this, function(messages) {
        var msglist = [];
        messages.forEach(function(row) {
            msglist.push(row);
        });
        next(msglist);
    });
};
message.prototype.searchMessages = function(info, next) {
        dao.search(info, this, function(messages) {
            var msglist = [];
            if (messages.length > 0) {
                messages.forEach(function(row) {
                    msglist.push(row);
                });
            }
            next(msglist);
        });

    };





    module.exports = message;
