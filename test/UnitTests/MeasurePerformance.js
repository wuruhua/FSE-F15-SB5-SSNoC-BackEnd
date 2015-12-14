var expect = require('expect.js');
var server = require('../../server');
var PerfMonDao = require('../../app/model/PerfMonDao.js');
var userDao = require('../../app/model/userDao.js');
var md5 = require('md5');
function getDate(timestamp){ 
	var tt=new Date(parseInt(timestamp) * 1000).toLocaleString();
	return tt; 
} 


suite('PerfMonDao Test', function(){
	//initial test
	var sqlite3 = require("sqlite3").verbose();
    var file = "./chatroom_test.db";
	var date = new Date;
	var length = 0;
	var dbSts = 0;
	var timestamp = Date.parse(new Date())/1000;
        
    var DB = new sqlite3.Database(file);
    PerfMonDao = new PerfMonDao(DB);
	
	var timestamp = Date.parse(new Date())/1000;
    var sendMsg =
    {
         cont : "Hello Unit testing",
         timestamp : getDate(timestamp)
    }
	//test 1: Create Database
    test('1.Create DataBase', function(done){  
        PerfMonDao.dbCreate(function(err,resp) {
			if(resp){
				console.log("1==========>"+resp);
				dbSts = resp;
			}
			if(err)
			{
				console.log("2============>"+err);
				dbSts=err;	
			}
		});	
		console.log("dbSts"+dbSts);
		expect(dbSts).to.be.equal("TestMessageTableCreated");
		done();
    }); 

    //test 2: Post Message to Database
    test('2.Post to DataBase', function(done){  
        PerfMonDao.insertTestMsg(sendMsg, function(err,resp) {
			if(resp){
				console.log("1==========>"+resp);
				dbSts = resp;
			}
			if(err)
			{
				console.log("2============>"+err);
				dbSts=err;	
			}
		});	
		console.log("dbSts"+dbSts);
		expect(dbSts).to.be.equal("Success");
		done();
    }); 

    //test 3: Get Message from Database
    test('3.Get from DataBase', function(done){  
        PerfMonDao.getTestMsg(
        	function(rows){
        	length = (rows.length-1);
			console.log("rows[i].src: "+length+ rows[length].msg);
			expect(rows[length].msg).to.be("Hello Unit testing");			
        	}, 
        	function(err,resp) {
			if(resp){
				console.log("1==========>"+resp);
				dbSts = resp;
			}
			if(err)
			{
				console.log("2============>"+err);
				dbSts=err;	
			}
		});	
		console.log("dbSts"+dbSts);
		done();
    }); 

    //test 4: Delete Database
    test('4.Delete DataBase', function(done){  
        PerfMonDao.dbDelete(function(err,resp) {
			if(resp){
				console.log("1==========>"+resp);
				dbSts = resp;
			}
			if(err)
			{
				console.log("2============>"+err);
				dbSts=err;	
			}
		});	
		console.log("dbSts"+dbSts);
		expect(dbSts).to.be.equal("success");
		done();
    }); 	
});
