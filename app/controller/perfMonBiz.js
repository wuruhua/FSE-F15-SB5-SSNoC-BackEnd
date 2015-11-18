module.exports = function(db) {

    var PerfMonDao = require("../model/PerfMonDao");
    var server = require("../../server");
    var PerfMonDao = new PerfMonDao(db);

    return {
        perfSetup: function(req, res) {
            //console.log("Setting up data base for performance measurement");
            PerfMonDao.dbCreate(function(err, resp) {
                if (resp) {
                    res.status(200).json(resp);
                }
            });
        },

        insertTestMsg: function(req, res) {
            //console.log("Inserting message to test database" + req.body);
            PerfMonDao.insertTestMsg(req.body, function(err, resp) {
                if (resp) {
                    res.status(200).json(resp);
                }
            });
        },

        getTestMsg: function(req, res) {
            PerfMonDao.getTestMsg(function(msglist) {
                //if(resp){
                res.status(200).json(msglist);
                //}
            });
        },

        perfDelete: function(req, res) {
            //console.log("Deleting database for performance measurement");
            var response = "TestMessageTableDeleted";
            PerfMonDao.dbDelete(function(err, body) {
                if (body) {
                    res.status(200).json(response);
                }
            });
        },
    };
};
