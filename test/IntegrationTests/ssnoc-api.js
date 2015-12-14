var expect = require('expect.js');
var agent = require('superagent');
var server = require('../../server');
   var fs = require('fs');
var encode = fs.readFileSync("encode.txt", "utf-8");

 var md5 = require('md5');
var PORT = process.env.PORT | 5000;
var HOST = 'http://localhost:' + PORT;

// Initiate Server
var debug = require('debug')('Node-API-Testing');
var tt;

//////////////////////////////////


var username = "sandeep";
var password = "1234";
var username2 = username+"1";
var status = 1;
var registration = 0;
var timestamp = Date.parse(new Date())/1000; 
var sendMsg =
{
    cont : "1a1a1a1a1a1a1a1a1a1a",
    timestamp : timestamp
};

var data = 
{
    name : username,
    msg :  "First public message",
    time : timestamp,
    usersts : status,
    ismsg: 0
};

var privateMsg = 
{
    cont: "First private message",
    author: username,
    targ: username2,
    postedAt: timestamp,
    usersts: 1,
    ismsg:0
};

var announcedata = 
{
    name: username,
    msg: "Integration test announcement",
    ismsg: 0,
    time:timestamp,
};

var admindata = 
{
    username: username,
    pri: 2
};

var cookieval = md5("Administrator" + encode);

function expects(err, res){
  expect(err).to.not.be.ok();
  expect(res).to.have.property('statusCode');
  expect(res).to.have.property('body');
  expect(res.statusCode).to.equal(200);
}

function postgetpublic() {
  console.log("===>2.Posting public message ");
  agent.post(HOST+'/user/postPublicMsg')
  .send(data)
  .end(function(err, res){    
    expects(err,res);
    console.log("===>3. Get public message");
    agent.get(HOST+'/user/getPublicMessages')
    .end(function(err, res){    
      expects(err,res);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.not.equal(0);
      expect(res.body[(res.body.length -1)].content).to.be("First public message");
      
    });
  });
}

function postgetprivate() {
  console.log("===>2.Posting private message ");
  agent.post(HOST+'/user/postPrivateMessage')
  .send(privateMsg)
  .end(function(err, res){    
    expects(err,res);
    console.log("===>3. Get private message");
    agent.post(HOST+'/user/getPrivateMessage')
	.send({author: username,targ: username2})
    .end(function(err, res){    
     expects(err,res);
     expect(res.body).to.be.an('array');
     expect(res.body.length).to.not.equal(0);
     expect(res.body[(res.body.length -1)].content).to.be("First private message");
    });
  });
}


suite('PerfMon API', function(){
  
  test('INTEG_001:Register/Login user+postpublicMsg', function(done){
    registration =0;
    console.log("====>1a.login using name "+username + HOST);
    
	agent.post(HOST+'/user/login')
    .send({username:username2, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("====>1b.Register using name "+username2);
          agent.post(HOST+'/user/register')
                .send({username:username2, password: password, repassword: password})
                .end(function(err, res){    
          expects(err,res);
          postgetpublic();  
        });
      }      
      else if(res.body.code == 11)
      { 
        postgetpublic();
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 1");
    });
    });
	
	test('INTEG_002:Register/Login user+ post/get private message', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
                .send({username:username, password: password, repassword: password})
                .end(function(err, res){    
          expects(err,res);
          postgetprivate();  
        });
      }      
      else if(res.body.code == 11)
      { 
          postgetprivate();
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 2");
    }); 
    });  
	
	test('INTEG_003:Register/Login user + Share Status ++ post/get public message', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
		        expects(err,res);
		        agent.put(HOST+'/user/updateStatus')
		        .send({user:username,status:"1"})
				    .end(function(err, res){    
				    expects(err,res);
            postgetpublic(); 
				});
				
        });
      }      
      else if(res.body.code == 11)
      { 
		    agent.put(HOST+'/user/updateStatus')
		        .send({user:username,status:"1"})
				    .end(function(err, res){    
				    expects(err,res);
            postgetpublic();
				});
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 3");
    }); 
    }); 
	
	test('INTEG_004:Register/Login user+ Share Status + post/get private message', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
		        expects(err,res);
            agent.put(HOST+'/user/updateStatus')
		        .send({user:username,status:"1"})
				    .end(function(err, res){    
				    expects(err,res);
            postgetprivate(); 
				});
				
        });
      }      
      else if(res.body.code == 11)
      { 
		    agent.put(HOST+'/user/updateStatus')
		        .send({user:username,status:"1"})
				    .end(function(err, res){    
				     expects(err,res);
             postgetprivate();
				});
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 4");
    }); 
    }); 
	
	test('INTEG_005:Register/Login user + Post Announcement + post/get public message ', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
		        expects(err,res);
             agent.post(HOST+'/user/postAnnouncement')
            .send(announcedata)
            .end(function(err, res){    
            expects(err,res);
            if(res.body.success == false) 
            { 
                console.log("You don't have sufficient previege");
                postgetpublic();
            }
            else
            {
              console.log("Test fail");
            }
        });
				});
      }      
      else if(res.body.code == 11)
      {  
		        agent.put(HOST+'/user/updateStatus')
		        .send({user:username,status:"1"})
				    .end(function(err, res){    
				    expects(err,res);
                agent.post(HOST+'/user/postAnnouncement')
                .send(announcedata)
                .end(function(err, res){    
                expects(err,res);
                if(res.body.success == false) 
                { 
                    console.log("You don't have sufficient previege");
                    postgetpublic();
                }
                else
                {
                    console.log("Test fail");
                }
            });
				    }); 
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 5");
    }); 
    }); 

  test('INTEG_006:Register/Login user + Post Announcement + post/get private message ', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
             agent.post(HOST+'/user/postAnnouncement')
            .send(announcedata)
            .end(function(err, res){    
            expects(err,res);
            if(res.body.success == false) 
            { 
                console.log("You don't have sufficient previege");
                postgetprivate();
            }
            else
            {
              console.log("Test fail");
            }
        });
        });
      }      
      else if(res.body.code == 11)
      {  
            agent.put(HOST+'/user/updateStatus')
            .send({user:username,status:"1"})
            .end(function(err, res){    
            expects(err,res);
                agent.post(HOST+'/user/postAnnouncement')
                .send(announcedata)
                .end(function(err, res){    
                expects(err,res);
                if(res.body.success == false) 
                { 
                    console.log("You don't have sufficient previege");
                    postgetprivate();
                }
                else
                {
                    console.log("Test fail");
                }
            });
            }); 
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 6");
    }); 
    }); 

   test('INTEG_007:Register/Login user+  Search Userlist by status + Update Status + Search userlist by status', function(done){
    registration =0;
    console.log("===>login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/search/userlistbystatus')
                  .send({username:username, status: 1})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.userlist.length) {
                      for(var i=0;i< res.body.userlist.length;i++)
                        console.log("users "+ res.body.userlist[i].username);

                      console.log("===>Found username");
                   }
                   else
                   {
                    console.log("===>No username found");
                   }
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);
                   agent.post(HOST+'/search/userlistbystatus')
                  .send({username:username, status: 1})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.userlist.length) {
                     for(var i=0;i< res.body.userlist.length;i++)
                        console.log("users "+ res.body.userlist[i].username);
                      console.log("===>Found username");
                   }
                   else
                   {
                    console.log("===>No username found");
                   }
                  });
                });
            });         

        });
      }      
      else if(res.body.code == 11)
      { 
         agent.post(HOST+'/search/userlistbystatus')
                  .send({username:username, status: 1})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.userlist.length) {
                      for(var i=0;i< res.body.userlist.length;i++)
                        console.log("users "+ res.body.userlist[i].username);

                      console.log("===>Found username");
                   }
                   else
                   {
                    console.log("===>No username found");
                   }
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);
                   agent.post(HOST+'/search/userlistbystatus')
                  .send({username:username, status: 1})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.userlist.length) {
                     for(var i=0;i< res.body.userlist.length;i++)
                        console.log("users "+ res.body.userlist[i].username);
                      console.log("===>Found username");
                   }
                   else
                   {
                    console.log("===>No username found");
                   }
                  });
                });
            });                
       
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 7");
    }); 
    }); 
  
 
  test('INTEG_008:Register/Login user+  Search Public message +post/get public message + Search Public message', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
          
            agent.post(HOST+'/search/publicmsg')
                  .send({username:username, message: "First public message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.publicmsg.length) {
                      console.log("Found messages");
                       for(var i=0;i< res.body.publicmsg.length;i++)
                        console.log("users "+ res.body.publicmsg[i].content);
                   }
                   else
                   {
                    console.log("No results matched");
                   }
                   postgetpublic();
                   agent.post(HOST+'/search/publicmsg')
                  .send({username:username, message: "First public message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.publicmsg.length) {
                      for(var i=0;i< res.body.publicmsg.length;i++)
                        console.log("users "+ res.body.publicmsg[i].content);
                      console.log("Found messages");
                   }
                   else
                   {
                    console.log("No results matched");
                   }  

                });
            });         
        });
      }      
      else if(res.body.code == 11)
      {           
            agent.post(HOST+'/search/publicmsg')
                  .send({username:username, message: "First public message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.publicmsg.length) {
                      console.log("Found messages");
                       for(var i=0;i< res.body.publicmsg.length;i++)
                        console.log("users "+ res.body.publicmsg[i].content);
                   }
                   else
                   {
                    console.log("No results matched");
                   }
                   postgetpublic();
                   agent.post(HOST+'/search/publicmsg')
                  .send({username:username, message: "First public message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.publicmsg.length) {
                      for(var i=0;i< res.body.publicmsg.length;i++)
                        console.log("users "+ res.body.publicmsg[i].content);
                      console.log("Found messages");
                   }
                   else
                   {
                    console.log("No results matched");
                   }  

              
            });         
        });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 8");
    }); 
    }); 

  test('INTEG_009:Register/Login user+  Search private message +post/get private message + Search private message', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
          
            agent.post(HOST+'/search/privatemsg')
                  .send({username:username, message: "First private message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.privatemsg.length) {
                      console.log("Found messages");
                       for(var i=0;i< res.body.privatemsg.length;i++)
                        console.log("users "+ res.body.privatemsg[i].content);
                   }
                   else
                   {
                    console.log("No results matched");
                   }
                   postgetprivate();
                   agent.post(HOST+'/search/privatemsg')
                  .send({username:username, message: "First private message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.privatemsg.length) {
                      for(var i=0;i< res.body.privatemsg.length;i++)
                        console.log("users "+ res.body.privatemsg[i].content);
                      console.log("Found messages");
                   }
                   else
                   {
                    console.log("No results matched");
                   }  

                });
            });         
        });
      }      
      else if(res.body.code == 11)
      {           
            agent.post(HOST+'/search/privatemsg')
                  .send({username:username, message: "First private message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.privatemsg.length) {
                      console.log("Found messages");
                       for(var i=0;i< res.body.privatemsg.length;i++)
                        console.log("users "+ res.body.privatemsg[i].content);
                   }
                   else
                   {
                    console.log("No results matched");
                   }
                   postgetpublic();
                   agent.post(HOST+'/search/privatemsg')
                  .send({username:username, message: "First private message"})
                  .end(function(err, res){   
                  expects(err,res);
                   if (res.body.privatemsg.length) {
                      for(var i=0;i< res.body.privatemsg.length;i++)
                        console.log("users "+ res.body.privatemsg[i].content);
                      console.log("Found messages");
                   }
                   else
                   {
                    console.log("No results matched");
                   }  
            });         
        });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 9");
    }); 
    }); 

   test('INTEG_10:Register/Login as Monitor+ Create testdb + Post message + Get message + Delete testdb', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);
             agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
          
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                  });
                }); 
        });
      }      
      else if(res.body.code == 11)
      { 
                  agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                  .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                   agent.get(HOST+'/user/getTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                  agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                   }); 
      }
      //setTimeout(function(){ done(); }, 500); 
      console.log("Finished 10");
    }); 
            
            });
           
          });

        });
      }      
      else if(res.body.code == 11)
      {  
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1a"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')

            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2a"+res.body.success); 
            expect(res.body.success).to.be(true);
             agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
          
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                  });
                }); 
        });
      }      
      else if(res.body.code == 11)
      { 
                  agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                  .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                   agent.get(HOST+'/user/getTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                  agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                   }); 
      }
     // setTimeout(function(){ done(); }, 500); 
      console.log("Finished 10");
    }); 

            });
           
          });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 10");
    }); 
    });  
  
test('INTEG_011:Register/Login as Monitor+ Share status+ post/get public + post/get private+ Create testdb + Post message + Get message + Delete testdb', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);
                agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
          
           
        });
      }      
      else if(res.body.code == 11)
      { 
                      agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
      }
      //setTimeout(function(){ done(); }, 500); 
      console.log("Finished 11");
    }); 

            });
           
          });

        });
      }      
      else if(res.body.code == 11)
      {  
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1a"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')

            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2a"+res.body.success); 
            expect(res.body.success).to.be(true);
                agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
          
           
        });
      }      
      else if(res.body.code == 11)
      { 
                      agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
      }
     // setTimeout(function(){ done(); }, 500); 
      console.log("Finished 11");
    }); 

            });
           
          });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 11");
    }); 
    });  
 
/*test('INTEG_011:Register/Login as Monitor+ Share status+ post/get public + post/get private+ Create testdb + Post message + Get message + Delete testdb', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:username, password: password})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:username, password: password, repassword: password})
            .end(function(err, res){    
            expects(err,res);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
          
           
        });
      }      
      else if(res.body.code == 11)
      { 
                      agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"1"})
                  .end(function(err, res){    
                  expects(err,res);

            postgetpublic(); 
            postgetprivate(); 
            agent.post(HOST+'/user/perfSetup')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("TestMessageTableCreated");
                   agent.post(HOST+'/user/insertTestMsg')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body);
                  expect(res.body).to.be("Success");
                  agent.get(HOST+'/user/getTestMsg')
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  expect(res.body.lenght).to.not.equal(0);
                   agent.post(HOST+'/user/perfDelete')
                   .send(sendMsg)
                  .end(function(err, res){   
                  expects(err,res);
                  console.log("res"+res.body.length);
                  agent.put(HOST+'/user/updateStatus')
                  .send({user:username,status:"0"})
                  .end(function(err, res){    
                  expects(err,res);

                  //expect(res.body.lenght).to.not.equal(0);
                });
                });
                });
                });
                  });
                }); 
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 11");
    }); 
    }); */
  

    test('INTEG_12:Register/Login administrator+ Set user priority to citizen+check priority', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 0})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/iscitizen')
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });

        });
      }      
      else if(res.body.code == 11)
      {  
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 0})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/iscitizen')

            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 12");
    }); 
    });   
  
  test('INTEG_13:Register/Login administrator+ Set user priority to admin+check priority', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 1})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/isadmin')
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });

        });
      }      
      else if(res.body.code == 11)
      {  
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 1})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1a"+res.body.success);
             agent.get(HOST+'/admin/isadmin')

            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2a"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished INTEG_13");
    }); 
    }); 

    test('INTEG_14:Register/Login administrator+ Set user priority to monitor+check priority', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });

        });
      }      
      else if(res.body.code == 11)
      {  
            agent.post(HOST+'/admin/setpri')
            .send({username: username, pri: 3})
            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1a"+res.body.success);
             agent.get(HOST+'/admin/ismonitor')

            .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2a"+res.body.success); 
            expect(res.body.success).to.be(true);

            });
           
          });
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished INTEG_14");
    }); 
    });  


 test('INTEG_15:Register/Login administrator+ Set user active status', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
            agent.post(HOST+'/admin/setactive')
            .send({username: username, active: 0})
             .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success);
            expect(res.body.success).to.be(true);
            

          });

        });
      }      
      else if(res.body.code == 11)
      {  
               agent.post(HOST+'/admin/setactive')
            .send({username: username, active: 0})
             .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success);
            expect(res.body.success).to.be(true);
            
          });
       
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 15");
    }); 
    });

   test('INTEG_16:Register/Login administrator+ Set user userinfo', function(done){
    registration =0;
    console.log("===>1a.login using name "+username);
    agent.post(HOST+'/user/login')
    .send({username:"SSNAdmin", password: "admin"})
    .end(function(err, res){   
      expects(err,res);
      if(res.body.code == 12) { 
          console.log("===>1b.Register using name "+username);
          agent.post(HOST+'/user/register')
            .send({username:"SSNAdmin", password: "admin", repassword: "admin"})
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body1"+res.body.success);
            agent.post(HOST+'/admin/setuserinfo')
            .send( {old: username , username: "Sandy"+timestamp, password: "1234"})
             .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success);
            expect(res.body.success).to.be(true);
            

          });

        });
      }      
      else if(res.body.code == 11)
      {  
               agent.post(HOST+'/admin/setuserinfo')
              .send( {old: username , username: "Sandy"+timestamp, password: "1234"})
             .set('Cookie', 'pri= '+cookieval)
            .end(function(err, res){    
            expects(err,res);
            console.log("res.body2"+res.body.success);
            expect(res.body.success).to.be(true);
            
          });
       
      }
      setTimeout(function(){ done(); }, 500); 
      console.log("Finished 16");
    }); 
    });
 
  
});
