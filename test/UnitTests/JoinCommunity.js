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
    /**
    *Test case 1
    *Premise: no
    *Operation: add a new user by api with username and password
    *Expectation: the username can be found in the database
    */
    test('1.Register new citizen to database', function(done){
        //use timestamp as a username, so there will be no duplicated usernam
        //add new user
        userDao.addNewUser(user, function(isSuccessed){
			console.log("1 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal(true);
        });
		done();
       // setTimeout(function(){ done(); }, 500);
    });
	
	
	test('2.Login existing citizen with correct password', function(done){
        //use timestamp as a username, so there will be no duplicated username
       	userDao.getUser(user, function(isSuccessed){
			console.log("1 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal('success');
        });
		done();
       // setTimeout(function(){ done(); }, 500);
    });

	var wronguser = {
        username : "test",
        password : md5("1234")
    };
	test('3.Login existing citizen with wrong password', function(done){
        //use timestamp as a username, so there will be no duplicated username
       	userDao.getUser(wronguser, function(isSuccessed){
			console.log("2 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal('wrong_password');
        });
		done();
        //setTimeout(function(){ done(); }, 500);
    });

	var wronguser1 = {
        username : "test",
        password : md5("1234")
    };
	
	var wronguser2 = {
        username : "test122",
        password : md5("1234")
    };
	
	test('4.Check if citizen exists in database', function(done){
        //use timestamp as a username, so there will be no duplicated username
       	userDao.getUser(wronguser1, function(isSuccessed){
			console.log("2 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal('wrong_password');
        });
		
		userDao.getUser(wronguser2, function(isSuccessed){
			console.log("2 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal('user_not_exist');
        });
		
		userDao.getUser(user, function(isSuccessed){
			console.log("2 isSucceed"+isSuccessed);
            expect(isSuccessed).to.be.equal('success');
        });
		done();
        //setTimeout(function(){ done(); }, 500);
    });
		
	test('5.Check if online/offline status of citizen in database',function(done){
    var timestamp = Date.parse(new Date());
    var user = {
        username : "test"+timestamp+'3',
        password : md5("1111")
    };
    // add a new user
    userDao.addNewUser(user, function(isSuccessed){
        expect(isSuccessed).to.be.ok();
    });
    // update the online status
    userDao.updateOnline(user.username,0);
    //check the user
    userDao.getSpecificUser("username='"+user.username+"'", function(rows){
        expect(rows[0].is_online).to.be(0);
    });
    //make the data back to original, make sure the database has no dirty data
    userDao.updateOnline(user.username,1);
	    //check the user
    userDao.getSpecificUser("username='"+user.username+"'", function(rows){
        expect(rows[0].is_online).to.be(1);
    });
    done();
    });
	
	 //test 2: getAllUser
    test('6.Get all users in database', function(done){
        userDao.getAllUser(function(userList) {
            //userlist show be more than one
            expect(userList.length).to.be.above(0);
            //for loop to check every attributes
            for (var i=0;i < userList.length; i++){
                expect(userList[i].username).to.be.a('string');
                expect(userList[i].password).to.be.a('string');
                expect(userList[i].gmt_register).to.be.a('number');
                expect(userList[i].gmt_login).to.be.a('number');
                expect(userList[i].status).to.be.a('number');
                expect(userList[i].gmt_status).to.be.a('number');
                expect(userList[i].is_online).to.be.a('number');
            }
        });
        done();
    });
});
