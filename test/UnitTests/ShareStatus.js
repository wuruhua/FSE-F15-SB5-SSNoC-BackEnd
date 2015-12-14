/**
 * Testcase of UserDao.js
 * @author liyuan.ding@sv.cmu.edu<br/>
 * 2015-10-14
 */
var expect = require('expect.js');
var userDao = require('../../app/model/userDao.js');
var md5 = require('md5');
var fs = require("fs");

function test_resource_setup(db){

	db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS message (id INT(11),  content VARCHAR(2048), src VARCHAR(100), dest VARCHAR(100), gmt_create INT(11), type INT(2), location VARCHAR(50), usr_sts VARCHAR(50), ismsg INT(2))", function(err){
		if(err)
		{
			console.log("Error in creation of message table");
		}
	});
	
	db.run("CREATE TABLE IF NOT EXISTS user (id INT(11),  username VARCHAR(50), password VARCHAR(50), gmt_register INT(11), gmt_login INT(11), gmt_status INT(11), is_online INT(2))", function(err){
		if(err)
		{
			console.log("Error in creation of user table");
		}
	});
	});
	
}

suite('JoinCommunity Test', function(){
	
    //initial test
	var sqlite3 = require("sqlite3").verbose();
    var file = "./chatroom_test.db";
	var exists = fs.existsSync(file);
	if (!exists) {
		//console.log("Creating DB file.");
		fs.openSync(file, "w");
	}
	var timestamp = Date.parse(new Date());
    var user = {
        username : "test"+timestamp+'1',
        password : md5("1111")
    };

	
    var DB = new sqlite3.Database(file);
	test_resource_setup(DB);
    userDao = new userDao(DB);
	console.log("2");
 
	test('7.Default citizen status is "undefined"',function(done){
    var timestamp = Date.parse(new Date());
    var user = {
        username : "test"+timestamp+'4',
        password : md5("1111")
    };
    // add a new user
    userDao.addNewUser(user, function(isSuccessed){
        expect(isSuccessed).to.be.ok();
    });

    //check the user
    userDao.getSpecificUser("username='"+user.username+"'", function(rows){
        expect(rows[0].status).to.be(0);
    });
   
    done();
    });
	
	test('8.Update citizen status to OK, Help, Emergency',function(done){
    var timestamp = Date.parse(new Date());
    var user = {
        username : "test"+timestamp+'5',
        password : md5("1111")
    };
    // add a new user
    userDao.addNewUser(user, function(isSuccessed){
        expect(isSuccessed).to.be.ok();
    });

    //check the user
    userDao.getSpecificUser("username='"+user.username+"'", function(rows){
        expect(rows[0].status).to.be(0);
    });
	
    userDao.updateUserStatus(user.username, 1);

	userDao.getSpecificUser("username='"+user.username+"'", function(rows){
            expect(rows[0].status).to.be(1);
    });
	
	userDao.updateUserStatus(user.username, 2);

	userDao.getSpecificUser("username='"+user.username+"'", function(rows){
            expect(rows[0].status).to.be(2);
    });
	
	userDao.updateUserStatus(user.username, 3);

	userDao.getSpecificUser("username='"+user.username+"'", function(rows){
            expect(rows[0].status).to.be(3);
    });
	
    done();
    });
	
	 
});
