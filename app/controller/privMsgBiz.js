module.exports = function(db) {

    var PrivateMessageDao = require("../model/PrivateMessageDao");
    var server = require("../../server");
    var PublicMessageDao = require("../model/PublicMessageDao");
    var PrivateMessageDao = new PrivateMessageDao(db);
    var PublicMessageDao = new PublicMessageDao(db);

    return {
        getPrivMessages: function(req, res) {
            //console.log("Get All Messages in Priv");

            var fromuser = req.body.author;
            var touser = req.body.targ;

            //console.log("from user" + fromuser);
            //console.log("to user" + touser);

            PrivateMessageDao.getPrivMessages(fromuser, touser,
                function(msglist, fromuser, touser) {
                    //console.log("fruser" + fromuser);
                    //console.log("toruser" + touser);
                    res.status(200).json(msglist);
                    // server.emitPrivMsgHistory(msglist, fromuser, touser);
                });
        },

        savePrivMessages: function(req, res) {
            //console.log("save private messages in Priv");
            PrivateMessageDao.savePrivMessages(req.body);
        },

        searchPrivMsgs: function(req, res) {
            //console.log("search private messages in Priv");
            var msg = req.body.message;
            var src = req.body.username;
            //var dest = req.body.dest;
            // var info =["hello"];

            PublicMessageDao.verify(msg, function(isValid) {
                var data = {};
                if (!isValid) {
                    data.privatemsg = [];
                    data.message = "Invalid search!";
                    res.json(data);
                    res.end();
                } else {
                    //console.log(m);
                    PublicMessageDao.search(msg, 1, src, "private", function(msglist) {
                        if (msglist.length == 0) {
                            data.privatemsg = [];
                            data.message = "No matched results!"
                        } else {
                            data.privatemsg = msglist;
                            data.message = "Here are the results!"
                        }
                        res.json(data);
                    });
                }
            })
        },
    };
};
