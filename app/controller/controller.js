module.exports = function() {
    var server = require("../../server");
    var publicmsg = require("./publicmsg.js");
    var privatemsg = require("./privatemsg.js");
    var announcement = require("./announcement.js");
    var md5 = require('md5');
    var fs = require('fs');
    var encode = fs.readFileSync("encode.txt", "utf-8");
    return {
        chatpublic: function(req, res) {
            var bean = req.body;
            var publicMsg = new publicmsg(bean.msg, bean.usersts, bean.name, bean.ismsg,"no");
            publicMsg.saveMessage(function(isSuccessed) {
                if (isSuccessed) {
                    res.status(200);
                    res.end();
                }
            });
        },

        chatprivate: function(req, res) {
            var bean = req.body;
            var privateMsg = new privatemsg(bean.cont, bean.usersts, bean.author, bean.targ, bean.ismsg,"no");
            privateMsg.saveMessage(function(isSuccessed) {
                if (isSuccessed) {
                    res.status(200);
                    res.end();
                }
            });
            
        },

        loadpublicmsg: function(req, res) {
            var publicMsg = new publicmsg(null, null, null, null,"no");
            // console.log("using new code");
            publicMsg.getMessages(function(msglist) {
                res.status(200).json(msglist);
                res.end();
            });
        },

        loadprivatemsg: function(req, res) {
            var chatter = req.body;
            var privateMsg = new privatemsg(null, null, chatter.author, chatter.targ, null,"no");
            privateMsg.getMessages(function(msglist) {
                res.status(200).json(msglist);
                res.end();
            });
        },

        /*postannounce : function(bean,next) {
            
            var Announcement = new announcement(bean.msg,bean.usersts,bean.name,bean.ismsg);
              console.log(Announcement.type);
            Announcement.saveMessage(function(isSuccessed){

             if(isSuccessed){
               next(true);
             }
            });
        },*/

        postAnnouncement: function(req, res) {
            var bean = req.body;
            var data = {};
            var Announcement = new announcement(bean.msg, bean.usersts, bean.name, bean.ismsg,"no");
            console.log("monitor:"+md5("Monitor" + encode));
            console.log("msg:"+req.body.msg);
            if (req.cookies.pri === md5("Administrator" + encode) || req.cookies.pri === md5("Coordinator" + encode)||((req.cookies.pri === md5("Monitor"+encode))&&(req.body.msg === "performance on"))) {
                Announcement.saveMessage(function(isSuccessed) {
                    if (isSuccessed) {
                        server.emitAnnouncement(bean);
                        res.status(200);
                        res.end();
                    }
                });
            } else {
                res.status(200);
                data.success = false;
                data.message = "You don't have the privilege!";
                res.json(data);
                res.end();
            }
        },

        loadannouncement: function() {
            var Announcement = new announcement(null, null, null, null,"no");
            // console.log("using new code");
            Announcement.getMessages(function(msglist) {
                // res.status(200).json(msglist);
                server.emitAnHistory(msglist);
            });
        },

        searchpublicmsg: function(req, res) {
            var publicMsg = new publicmsg(null, null, null, 0,"no");
            var info = req.body.message;
            var data = {};
            publicMsg.verify(info, function(isValid) {
                if (!isValid) {
                    data.publicmsg = [];
                    data.message = "Invalid search!";
                    res.json(data);
                    res.end();
                } else {
                    //console.log(m);
                    publicMsg.searchMessages(info, function(msglist) {
                        if (msglist.length === 0) {
                            data.publicmsg = [];
                            data.message = "No matched results!";
                        } else {
                            data.publicmsg = msglist;
                            data.message = "Here are the results!";
                        }
                        res.json(data);
                        res.end();
                    });
                }
            });
        },

      searchprivatemsg: function(req, res) {
       // content, status, src, dest, ismsg
            var privateMsg = new privatemsg(null, null, req.body.username,"private", 0,"no");
            var info = req.body.message;
            var data = {};
            privateMsg.verify(info, function(isValid) {
                if (!isValid) {
                    data.privatemsg = [];
                    data.message = "Invalid search!";
                    res.json(data);
                    res.end();
                } else {
                    privateMsg.searchMessages(info, function(msglist) {
                        if (msglist.length === 0) {
                            data.privatemsg = [];
                            data.message = "No matched results!";
                        } else {
                            data.privatemsg = msglist;
                            data.message = "Here are the results!";
                        }
                        res.json(data);
                        res.end();
                    });
                }
            });
        },

        searchannouncement: function(req, res) {
            var Announcement = new announcement(null, null, null, 0,"no");
            var info = req.body.announcement;
            var data = {};
            Announcement.verify(info, function(isValid) {
                if (!isValid) {
                    data.announcement = [];
                    data.message = "Invalid search!";
                    res.json(data);
                    res.end();
                } else {
                    //console.log(m);
                    Announcement.searchMessages(info, function(msglist) {
                        if (msglist.length === 0) {
                            data.announcement = [];
                            data.message = "No matched results!";
                        } else {
                            data.announcement = msglist;
                            data.message = "Here are the results!";
                        }
                        res.json(data);
                        res.end();
                    });
                }
            });
        },
    };
};
