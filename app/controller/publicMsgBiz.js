module.exports = function(db) {

    var PublicMessageDao = require("../model/PublicMessageDao");
    var server = require("../../server");
    var PublicMessageDao = new PublicMessageDao(db);

    return {
        getMessages: function(req, res) {
            //console.log("Get All Messages in Public");
            PublicMessageDao.getMessages(function(msglist) {
                res.status(200).json(msglist);
            });
        },

        getAnnouncements: function() {
            //console.log("Get All Announce in Public");
            PublicMessageDao.getAnnouncements(function(msglist) {
                server.emitAnHistory(msglist);
            });
        },

        saveMessage: function(req, res) {
            //console.log("Save Message in Public");
            //console.log(req);
            PublicMessageDao.saveMessage(req.body);
            //console.log(req.body);
            // var data = {};
            // data.success = true;
            // data.code = 11;
            // data.message = "login success!";
            // console.log("Sending response");
            // res.status(200).json(data);
            this.getMessages;
        },

        saveAnnouncement: function(message) {
            //console.log("save announce in Public");
            PublicMessageDao.saveAnnouncement(message);
        },

        searchPublicMsgs: function(req, res) {
            var msg = req.body.message;
            //var info =["your","a"];
            var data = {};
            PublicMessageDao.verify(msg, function(isValid) {
                if (!isValid) {
                    data.publicmsg = [];
                    data.message = "Invalid search!"
                    res.json(data);
                    res.end();
                } else {
                    //console.log(m);
                    PublicMessageDao.search(msg, 1, null, "All", function(msglist) {
                        if (msglist.length == 0) {
                            data.publicmsg = [];
                            data.message = "No matched results!"
                        } else {
                            data.publicmsg = msglist;
                            data.message = "Here are the results!"
                        }
                        res.json(data);
                    });
                }
            })
        },

        searchAnnouncements: function(req, res) {
            var msg = req.body.announcement;
            // var info =["hello"];

            PublicMessageDao.verify(msg, function(isValid) {
                var data = {};
                if (!isValid) {
                    data.announcement = [];
                    data.message = "Invalid search!"
                    res.json(data);
                    res.end();
                } else {
                    //console.log(m);
                    PublicMessageDao.search(msg, 2, null, "All", function(msglist) {
                        if (msglist.length == 0) {
                            data.announcement = [];
                            data.message = "No matched results!"
                        } else {
                            data.announcement = msglist;
                            data.message = "Here are the results!"
                        }
                        res.json(data);
                    });
                }
            })
        }
    };
};
