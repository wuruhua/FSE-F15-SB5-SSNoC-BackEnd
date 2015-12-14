module.exports = function(app, db, userBiz,  perfMonBiz, adminBiz, controller) {
    //var publicMsgBiz  = require("./app/controller/publicMsgBiz");

    app.get('/users', userBiz.getAllUser);
    app.post('/user/login', userBiz.login);
    app.post('/user/register', userBiz.register);
    app.post('/admin/setpri', adminBiz.setpri);
    app.post('/admin/setactive', adminBiz.setactive);
    app.post('/admin/setuserinfo', adminBiz.setuserinfo);
    app.get('/admin/iscitizen', adminBiz.iscitizen);
    app.get('/admin/isadmin', adminBiz.isadmin);
    app.get('/admin/ismonitor', adminBiz.ismonitor);

    app.post('/user/setAudience', function(req, res) {
        // console.log("Inside setAudience=============>");
        userBiz.setAudience(req, res);
    });
    app.get('/perfmon', function(req, res) {
        res.render('perfmon');
        //res.render('perfmon');
    });
    app.get('/perfmon_msg', function(req, res) {
        res.render('perfmon_msg');
    });
    app.get('/login', function(req, res) {
        res.render('login');
        //res.render('chatroom');
    });
    app.get('/welcome', function(req, res) {
        res.render('welcome');
    });
    app.get('/chat', function(req, res) {
        res.render('chat');
    });
    app.get('/contactlist', function(req, res) {
        res.render('contactlist');
    });
    app.get('/announcement', function(req, res) {
        res.render('announcement');
    });
    app.get('/404', function(req, res) {
        res.render('404');
    });
    app.get('/administrator', function(req, res) {
        res.render('administrator');
    });
    app.get('/db/delete', userBiz.delDB);
    app.get('/user/getPublicMessages', function(req, res) {
        controller.loadpublicmsg(req, res);
    });

    app.post('/user/postPublicMsg', function(req, res) {
        controller.chatpublic(req, res);
    });

    app.post('/user/postAnnouncement', function(req, res) {
        controller.postAnnouncement(req, res);
    });
    //TestCase
    app.post('/search/userlistbyname', userBiz.searchbyName);
    app.post('/search/userlistbystatus', userBiz.searchbyStatus);
    //app.post('/search/announcement', publicMsgBiz.searchAnnouncements);
    app.post('/search/announcement', controller.searchannouncement);
   //app.post('/search/publicmsg', publicMsgBiz.searchPublicMsgs);
    app.post('/search/publicmsg', controller.searchpublicmsg);
    //app.post('/search/privatemsg', privMsgBiz.searchPrivMsgs);
    app.post('/search/privatemsg', controller.searchprivatemsg);
    
    app.post('/user/getPrivateMessage', function(req, res) {
        //console.log("Calling privMsgBiz.getPrivMessages for ");
        //privMsgBiz.getPrivMessages(req, res);
        controller.loadprivatemsg(req, res);
    });

    app.post('/user/postPrivateMessage', function(req, res) {
        //console.log("Calling privMsgBiz.getPrivMessages for ");
        // privMsgBiz.savePrivMessages(req, res);
        controller.chatprivate(req, res);
    });

    app.post('/user/perfSetup', function(req, res) {
        //console.log("Calling  perfMonBiz.perfSetup ");
        perfMonBiz.perfSetup(req, res);
    });

    app.post('/user/insertTestMsg', function(req, res) {
        //console.log("Calling  perfMonBiz.insertTestMsg ");
        perfMonBiz.insertTestMsg(req, res);
    });

    app.get('/user/getTestMsg', function(req, res) {
        //console.log("Calling  perfMonBiz.getTestMsg");
        perfMonBiz.getTestMsg(req, res);
    });

    app.post('/user/perfDelete', function(req, res) {
        //console.log("Calling  perfMonBiz.perfDelete ");
        perfMonBiz.perfDelete(req, res);
    });

    // REST API for share status
    app.put('/user/updateStatus', function(req, res) {
        //console.log("Calling userBiz.updateUserStatus ");
        userBiz.updateUserStatus(req, res);
    });
};
