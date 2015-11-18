//get required Nodes
var getNode = function(s){
  return document.getElementById(s);
}
var chat_board = getNode('chat_board');
var user_board = getNode('user_board');
var showbutton = getNode('showButton');
var perfButton = getNode('perfButton');
var input_content = getNode('input_content');
var input_content_an = getNode('input_content_an');
var normalinput_mode = getNode('normalinput_mode');
var announce_table = getNode('announce_table');
var announce_mode = getNode('announce_mode');
var search_mode = getNode('search_mode');
var sharestatue_mode = getNode('sharestatue_mode');
var dialog_table = getNode('dialog_table');
var input_content_an = getNode('input_content_an');
var normalinput_mode = getNode('normalinput_mode');
var announce_table = getNode('announce_table');
var announce_mode = getNode('announce_mode');
var sharestatue_mode = getNode('sharestatue_mode');
var status_type = getNode('status_type');

var from = getNode('from');
var to = getNode('to');
var users_list = getNode('list');
var socket = io.connect();
var in_private=false;
var performance_on = 0;

var currentUserSts = 0;
var currentUserGmtSts = 0;
var no_privmsg=0 ;
var privmsgname =0;

 //obtained when chatroom.html is brought up
var local_user_list = {};
var whitespacePattern = /^\s*$/; //used to test if a string is only consist of spaces

var is_first = $.cookie('is_first');
var user_name = $.cookie('user');
var chatName = user_name;

console.log("**********chat Name************"+chatName);

from.textContent=chatName;
toName = "All";
to.textContent="all client!";

$( document ).ready(function() {
    console.log( "ready!" );

    socket.emit('PerfCheck', "All");

    //Receive and update user list. Note: the user list can only be added or updated. No deleted is of user case
	socket.on('PerfGet', function(){
	//local_user_list[nameCard.name] = nameCard.status;
	//console.log("update list");
	$(window.location).attr('href', '/perfmon_msg'); 
	
	});


    //post request of login
    $.ajax({
      url: '/user/getPublicMessages',
      type: 'get',
      crossDomain: true, 
      dataType:"json"
	  }).done (function (rows) {

    if(rows != null)
    {
        console.log("REST API sent successfully");

        document.getElementById("dialog_table").innerHTML="";
        var message = document.createElement('div');
	    document.clear();

		for (var i=0;i < rows.length; i++)
		{	  
		    message = document.createElement('div');
    		message.setAttribute('class','dialog_entry');
			console.log("rows[i].is_online" + rows[i].is_online);
			console.log("rows[i].usersts" + rows[i].usr_sts);
			
			//if(rows[i].is_online === undefined)
		//	{
		//		message.textContent = "(" + getDate(rows[i].gmt_create) + ")\t"+ rows[i].src + ": " + rows[i].content;
		//	}
		//	else
			{
				message.textContent = "(" + getDate(rows[i].gmt_create) + ")\t"+ rows[i].src + rows[i].usr_sts+": " + rows[i].content;
			}
			dialog_table.appendChild(message);
			dialog_table.insertBefore(message, null);
			updateScroll(dialog_table);
		}
	}
	else
	{
		console.log("No messages on public wall");
	}

      }).fail(function(){
         	console.log("Fail to get wall messages");
      });
});
		
socket.emit('sendstatus',"All");
socket.emit('sendAn',"All");

//chat private
var namelist = new Array();
var countlist = new Array();
var count=0;
$('#status_type').hide();

socket.on('dialog_entry', function(dialog_entry){
    //

    //console.log(dialog_entry);
    var message = document.createElement('div');
    message.setAttribute('class','dialog_entry');
    message.textContent = "(" + dialog_entry.time + ")\t"+ dialog_entry.name + ": " + dialog_entry.msg;

    //append message to the last
	dialog_table.appendChild(message);
	dialog_table.insertBefore(message, null);
	updateScroll(dialog_table);
});


//Receive and update user list. Note: the user list can only be added or updated. No deleted is of user case
socket.on('updateUserList', function(list){
	//local_user_list[nameCard.name] = nameCard.status;
	//console.log("update list");
	sortAndUpdateUserList(list);
});

socket.on('inc priv msg', function(username, fromname){
	var flag = true;
	console.log("count:"+count);
	if(username == chatName)
	{
		
		if(isNaN(countlist[count])){
			countlist[count]=0;
		}

		if(namelist.length==0){
			namelist[count] = fromname;
			countlist[count] = 1;
		}else{
			for(var i=0;i<namelist.length;i++){
				if(namelist[i]==fromname){
					countlist[count] = countlist[count]+1;
					namelist[count] = fromname;
					flag = false;
					break;
				}
			}
			if(flag){
				console.log("new user?");
				count++;
				countlist[count] = 1;
				namelist[count] = fromname;
			}
		}
	}
	//local_user_list[nameCard.name] = nameCard.status;
	//console.log("username"+username);
		/*no_privmsg++;
		privmsgname = fromname;
		console.log("No of private messages"+no_privmsg);*/
	//sortAndUpdateUserList(list);
});


function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}


var ul = document.getElementById('list');
ul.onclick = function(event){
	var target = getEventTarget(event);
	var usr=[];
	
	usr = target.innerHTML.split("(");
	toName = usr[0];
	no_privmsg = 0;

	//reset count when click the name
	for(var i=0;i<namelist.length;i++){
		if(namelist[i]==toName){
			namelist[i]="";
		}
	}

	//console.log("********toName"+toName);
	
    //post request of login
	document.getElementById("dialog_table").innerHTML="";
	//console.log("Sending private message"+ chatName);
	in_private =true;
	var chatter = {author : chatName, targ : toName};

    console.log("FE fromuser" + chatter.author);
    console.log("FE touser"+ chatter.targ);

	$.ajax({
			url : '/user/getPrivateMessage',
			type : 'post',
			data : chatter,
			crossDomain: true, 
			dataType : 'json'
		}).done(function(rows){
			if(rows != null)
			{
				console.log("Private message get success");

				 document.getElementById("dialog_table").innerHTML="";
				 var message = document.createElement('div');

				for (var i=0;i < rows.length; i++){	  
				//console.log("time"+ rows[i].gmt_create + "name"+ rows[i].src +"msg"+ rows[i].content);
				message = document.createElement('div');
	
    			message.setAttribute('class','dialog_entry');
    			message.textContent = "(" + getDate(rows[i].gmt_create) + ")\t"+ rows[i].src + rows[i].usr_sts +": " + rows[i].content;

    			//append message to the last
				//console.log("Message"+message);
				dialog_table.appendChild(message);
				dialog_table.insertBefore(message, null);
				updateScroll(dialog_table);
			    }
				//updatePrivateMessages(privateMessages);
			}
		}).fail(function(){
			console.log('fail to get wall messages');
		});


	//socket.emit('sendPrivMsgHist',chatName,toName,in_private);
	socket.emit('sendstatus',"All");
	to.textContent=toName; 
};


// monitor input dialog and send to server
input_content.addEventListener('keydown', function(event) {
    var self = this;
    var timestamp = Date.parse(new Date())/1000; 
    if(event.which === 13 && event.shiftKey === false && self.textContent!="" && !whitespacePattern.test(self.textContent)) {
      //console.log('name is: ' + chatName);
      //console.log('msg is: ' + self.textContent);
      //console.log('time is: ' + getDate(timestamp));
      socket.emit('sendDialog', {
        name : chatName,
        msg : self.textContent,
        time : getDate(timestamp)
      });
      input_content.textContent = '';
      event.preventDefault();
    }
});

// when user click "Hide" Button on the left of "user list" panel, the user_board becomes hidden
function hideSideBar(){
  user_board.style.display = "none";
  chat_board.style.width = "97%";
  chat_board.style.right = "18px"
  showbutton.style.display = "block";
}

function chatpublic(){
	//console.log("Chat publicly");
	socket.emit('sendMsg',chatName);
	socket.emit('sendstatus',"All");
	in_private = false;
	toName = "All";
	to.textContent="all client!";
}

// when user click "Show" Button on the top-right of page, the user_board becomes shown
function showSideBar(){
  user_board.style.display = "block";
  //chat_board.style.right = "200px";
   chat_board.style.width = "70%";
  showbutton.style.display = "none";
}

// when user click "Send message" tab, show sending message window only
function showSendingMessageWin(){
	console.log("In showmessage");
		
	console.log("Chat publicly");
	//socket.emit('sendMsg',chatName);


	$.ajax({
      url: '/user/getPublicMessages',
      type: 'get',
      crossDomain: true, 
      dataType:"json"
	  }).done (function (rows) {

    if(rows != null)
    {
        console.log("REST API sent successfully");

        document.getElementById("dialog_table").innerHTML="";
        var message = document.createElement('div');
	    document.clear();

		for (var i=0;i < rows.length; i++)
		{	  
		    message = document.createElement('div');
    		message.setAttribute('class','dialog_entry');
    		message.textContent = "(" + getDate(rows[i].gmt_create) + ")\t"+ rows[i].src + rows[i].usr_sts+ ": " + rows[i].content;
			dialog_table.appendChild(message);
			dialog_table.insertBefore(message, null);
			updateScroll(dialog_table);
		}
	}
	else
	{
		console.log("No messages on public wall");
	}

      }).fail(function(){
         	console.log("Fail to get wall messages");
      });
	socket.emit('sendstatus',"All");
	in_private = false;
	toName = "All";
	to.textContent="all client!";
	search_mode.style.display = "none";
	normalinput_mode.style.display = "block";
	announce_mode.style.display = "none";
	sharestatue_mode.style.display = "none";
	

}

// when user click "Announce message" tab, show sending announce window onluy
function showAnnounceMessageWin(){
	console.log("In Announce");
	search_mode.style.display = "none";
	normalinput_mode.style.display = "none";
	announce_mode.style.display = "block";
	sharestatue_mode.style.display = "none";
	
}

// when user click "Share status" tab, show share status window only
function showShareStatusWin(){
		//console.log("In showShareStatusWin");
	search_mode.style.display = "none";
	normalinput_mode.style.display = "none";
	announce_mode.style.display = "none";
	sharestatue_mode.style.display = "block";
}

//receive the private message broadcast from server
var author = chatName;
var authorSelf = author+'self';
console.log(authorSelf);
console.log(author);


socket.on(authorSelf, function(dialog_entry){
	var message = document.createElement('div');
    message.setAttribute('class','dialog_entry');
    message.textContent = "(" + dialog_entry.postedAt + ")\t"+ dialog_entry.author + dialog_entry.usersts+ ": " + dialog_entry.cont;
    console.log("Displaying message on own wall1");

    //append message to the last
	dialog_table.appendChild(message);
	dialog_table.insertBefore(message, null);
	updateScroll(dialog_table);


	console.log('self called!!!');
});
	
socket.on(author, function(dialog_entry){
	if(dialog_entry.author == toName)
	{
		var message = document.createElement('div');
    	message.setAttribute('class','dialog_entry');
    message.textContent = "(" + dialog_entry.postedAt + ")\t"+ dialog_entry.author + dialog_entry.usersts+ ": " + dialog_entry.cont;
    console.log("Displaying message on own wall2");

    //append message to the last
	dialog_table.appendChild(message);
	dialog_table.insertBefore(message, null);
	updateScroll(dialog_table);
	}
	else
		alert(dialog_entry.author+' has sent you a message!');
console.log('other called!!!');
});

//receive the wall message broadcast from server
socket.on('getWallMessage', function(dialog_entry){
	console.log("in_private"+in_private);
	console.log("dialog_entry.name"+dialog_entry.name);
	console.log("chatName"+chatName);
	if(((chatName != dialog_entry.name) && (in_private == false)) || (chatName == dialog_entry.name))
	{
	var message = document.createElement('div');
    message.setAttribute('class','dialog_entry');
    message.textContent = "(" + dialog_entry.time + ")\t"+ dialog_entry.name + dialog_entry.usersts + ": " +dialog_entry.msg;
    console.log("Displaying message on own wall3");

    //append message to the last
	dialog_table.appendChild(message);
	dialog_table.insertBefore(message, null);
	updateScroll(dialog_table);
	}
});
// When user click "Send" Button on the bottom of page, message will be pushed to server
function perfMeasureButton(){
	console.log("perfMeasureButton");
	{
		var date = new Date;
		var timestamp = Date.parse(new Date())/1000;
		//console.log('chatName is ' + chatName);
		//console.log('input_content_an is' + input_content_an.textContent);
		//console.log('time is: ' + date.toLocaleTimeString());
		socket.emit('postAnnouncement', {
			name : chatName,
			msg : "performance on",
			time : getDate(timestamp)
		});
	//	input_content_an.textContent = '';
	}

}
// when user click "search" tab, show share search window only
function showSearchWin(){
	search_mode.style.display = "block";
	normalinput_mode.style.display = "none";
	announce_mode.style.display = "none";
	sharestatue_mode.style.display = "none";
}

// When user click "Send" Button on the bottom of page, message will be pushed to server
function sendMessageButton(){
	if(input_content.textContent!="" && !whitespacePattern.test(input_content.textContent)){
		console.log("current textcontent: " + input_content.textContent);
		var date = new Date;
		var timestamp = Date.parse(new Date())/1000;
		var user = document.createElement('li');
		
		if(currentUserSts !=0)
		{
			console.log("Get status" + currentUserSts);
		}
		if(currentUserGmtSts != 0)
		{
			console.log("Get GMT status" + currentUserGmtSts);
		}
		input_content.className = 'ligreen';
		
		if(currentUserSts !=0 && currentUserGmtSts!=0 )
		{
			switch(currentUserSts)
			{
				//New field status = "ok", 'help', 'emergency' or 'undefined'
				case 1 	: {user.textContent = '(Status: OK @'+currentUserGmtSts+')';user.className = "ligreen";break;}
				case 2 	: {user.textContent = '(Status: Help @'+currentUserGmtSts+')';user.className = "liyellow";break;}
				case 3 	: {user.textContent = '(Status: Emergency @'+currentUserGmtSts+')';user.className = "lired";break;}
				default : {user.textContent = chatName;user.className = "ligrey";break;}
			}
		}
		 
		//user.textContent = user.textContent + input_content.textContent;
		
      	if(in_private == false)
		{	
		var wallMsg = 
        {
            name : chatName,
            msg : input_content.textContent,
            time : getDate(timestamp),
			usersts : user.textContent 
      	};
      	socket.emit('sendWallMessage', wallMsg);

		$.ajax({
			url : '/user/postPublicMsg',
			type : 'post',
			crossDomain: true, 
			data : {
            name : chatName,
            msg :  input_content.textContent,
            time : getDate(timestamp),
			usersts : user.textContent
      	    },
			dataType : 'json'
		}).done(function(){
		    console.log('post on wall success');
		}).fail(function(){
			console.log('post on wall fail');
		});
			
		}
		else
		{
			var privateMsg = {
			cont : input_content.textContent,
			author : chatName,
			targ : toName,
			postedAt : getDate(timestamp),
			usersts : user.textContent
			};

			socket.emit('sendPrivateMessage', privateMsg);
			//inputPrivateMessage.val('');
			$.ajax({
				url : '/user/postPrivateMessage',
				type : 'post',
				crossDomain: true, 
				data : privateMsg,
	 			dataType : 'json'
			}).done(function(){
				console.log('post private message success');
			}).fail(function(){
				console.log('post private message fail');
			});

			//private count

		}
  		input_content.textContent = '';

  		//private message count
  		
	}
}


//Update variable user_list and update the content of user_list on client side
function sortAndUpdateUserList(rows){
	console.log("namelist:"+namelist);
	console.log("countlist:"+countlist);
	//sort the user list
	users_list.textContent = '';
	for (var i=0;i < rows.length; i++){
		var user = document.createElement('li');
		//console.log(rows[i].username + ' ' + rows[i].is_online+' '+ rows[i].status);
		//Liyuan (Oct 15) Updated for Task: share status
		switch(rows[i].is_online){ //Change to is_online 1 stands for 'online'; 0 --> 'offline'
			case 1 : {
				user.style.color = "#33F";
				switch (rows[i].status){ //New field status = "ok", 'help', 'emergency' or 'undefined'
					case 1 		: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "ligreen";break;}
					case 2 		: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "liyellow";break;}
					case 3 		: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "lired";break;}
					default 	: {user.id =rows[i].username;user.textContent = rows[i].username;user.className = "ligrey";break;}
				}
			}
			case 0 : {
				switch (rows[i].status){
					case 1 		: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "ligreen";break;}
					case 2 		: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "liyellow";break;}
					case 3 	 	: {user.id =rows[i].username;user.textContent = rows[i].username+'('+getShortDate(rows[i].gmt_status)+')';user.className = "lired";break;}
					default 	: {user.id =rows[i].username;user.textContent = rows[i].username;user.className = "ligrey";break;}
				}
			}
			if(rows[i].username == chatName)
			{
				currentUserSts = rows[i].status;
				currentUserGmtSts = getShortDate(rows[i].gmt_status);
			}
			for(var j=0;j<namelist.length;j++){
				if(namelist[j] == rows[i].username){
					user.textContent = user.textContent + '(' + countlist[j] + ')';
				}
			}
		}

		if(no_privmsg && rows[i].username == privmsgname && in_private==false)
			user.textContent = user.textContent + '('+no_privmsg+')';
		
		//user.textContent = rows[i].username + ' (Okay)';
		users_list.appendChild(user);
		users_list.insertBefore(user, null);
	}

/*	var list_okay = [];
	var list_offline = [];
	var list_dead = [];
	console.log(local_user_list);
	for (var user in local_user_list){
		console.log(username);
		switch(local_user_list[status]){
			case '1' 	: {list_okay.push(user); break;}
			case '0'	: {list_offline.push(user);break;}
			default  		: {list_dead.push(user);break;}
		}
	}
	list_okay.sort();
	list_offline.sort();
	list_dead.sort();

	//update the web list
	users_list.textContent = '';
	var index;
	for(index = 0; index < list_okay.length;index++){ // update all Okay guys
		var user = document.createElement('li');
		user.textContent = list_okay[index] + ' (Okay)';
		users_list.appendChild(user);
		users_list.insertBefore(user, null);
	}
	for(index = 0; index < list_offline.length;index++){// update all offline guys
		var user = document.createElement('li');
		user.textContent = list_offline[index] + ' (Offline)';
		users_list.appendChild(user);
		users_list.insertBefore(user, null);
	}
	for(index = 0; index < list_dead.length;index++){//update all dead guys
		var user = document.createElement('li');
		user.textContent = list_dead[index] + ' (Dead)';
		users_list.appendChild(user);
		users_list.insertBefore(user, null);
	}*/
}

function updateScroll(element){
    element.scrollTop = element.scrollHeight;
}

// When user click "Logout" Button on the bottom of page, username will be pushed to server
// Note: Need back end to redirect to login page
function logoutButton(){
	socket.emit('logoutUser', {
        	name : chatName,
        	status : 0
      	}); 
	// Check in console to see if the correct chatName has been sent to server
    //alert(chatName);
    $(window.location).attr('href', '/login'); 
}

//change timestamp to normal time
function getDate(timestamp){ 
	var tt=new Date(parseInt(timestamp) * 1000).toLocaleString();
	return tt; 
} 

//change timestamp to normal short time
function getShortDate(timestamp){
	var localeSpecificTime=new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
    return localeSpecificTime;
}

//receive announce_entry from server, and display
socket.on('announcement', function(announce_entry){
    //console.log("**annouce: "+announce_entry);
    var messageAnnounce = document.createElement('div');
    messageAnnounce.setAttribute('class','announce_entry');
    messageAnnounce.textContent = "(" + announce_entry.time + ")\t"+ announce_entry.name + ": " + announce_entry.msg;

    //append announced message to the last
	announce_table.appendChild(messageAnnounce);
	announce_table.insertBefore(messageAnnounce, null);
	updateScroll(announce_table);
	if(announce_entry.msg == "performance on")
	{
		if(announce_entry.name == chatName )
		{
			$(window.location).attr('href', '/perfmon');
		}
		else
		{
			$(window.location).attr('href', '/perfmon_msg');
		}
	}
	
});

socket.on('load announce', function(rows){
	//console.log("char_room_rows:"+rows.length);
    //console.log("Receiving old announcemessages");
    document.getElementById("announce_table").innerHTML="";
    var messageAnnounce = document.createElement('div');
	//document.clear();

	//console.log("Length is" + rows.length);

	for (var i=0;i < rows.length; i++){	  
	//console.log("time"+ rows[i].gmt_create + "name"+ rows[i].src +"msg"+ rows[i].content);
	messageAnnounce = document.createElement('div');
	
    messageAnnounce.setAttribute('class','announce_entry');
    messageAnnounce.textContent = "(" + getDate(rows[i].gmt_create) + ")\t"+ rows[i].src + ": " + rows[i].content;

    //append message to the last
	//console.log("Announcement"+messageAnnounce);
	announce_table.appendChild(messageAnnounce);
	announce_table.insertBefore(messageAnnounce, null);
	updateScroll(announce_table);
	}
});

// monitor input announcement and send to server
input_content_an.addEventListener('keydown', function(event) {
    var self = this;
    var timestamp = Date.parse(new Date())/1000; 
    if(event.which === 13 && event.shiftKey === false && self.textContent!="" && !whitespacePattern.test(self.textContent)) {
      //console.log('name is: ' + chatName);
      //console.log('msg is: ' + self.textContent);
      //console.log('time is: ' + getDate(timestamp));
      socket.emit('postAnnouncement', {
        name : chatName,
        msg : input_content_an.textContent,
        time : getDate(timestamp)
      });
      input_content_an.textContent = '';
      event.preventDefault();
    }
});

// When click "Announce" Button, an announcement will be pushed to server
function postAnnoucementButton(){
	//console.log('test postAnnoucementButton');
	//console.log('chatName is ' + chatName);
	if(input_content_an.textContent!="" && !whitespacePattern.test(input_content_an.textContent)){
		var date = new Date;
		var timestamp = Date.parse(new Date())/1000;
  		//console.log('chatName is ' + chatName);
  		//console.log('input_content_an is' + input_content_an.textContent);
  		//console.log('time is: ' + date.toLocaleTimeString());
  		socket.emit('postAnnouncement', {
        	name : chatName,
        	msg : input_content_an.textContent,
        	time : getDate(timestamp)
      	});
  		input_content_an.textContent = '';
	}
}

// When user select a status button, the status will be pushed to server
function changestatusTo(newstatus){
	var user_name = $.cookie('user');
	var data = {"user":user_name,"status":newstatus};
	$.ajax({
		url: '/user/updateStatus/',
		type: 'PUT',
		data: data,
		success: function(data) {
			if(data && data.user  && data.status && data.gmt_string){
				socket.emit('sendstatus',"All");
			}
		}
	});
  		
	
}

$("#search").click(function(){
	var search_result = "";
	var search_content = $('#search_content').val();
	$("#dialog_table").html("");
	if($('#search_type').val() == ""){
		$("#dialog_table").html("Please choice a search type!");
	}else if(search_content == "" && $('#search_type').val()!="userlistbystatus"){
		$("#dialog_table").html("Please enter what you want to search!");
	}else{
		if($('#search_type').val() == "userlistbyname"){
			search_result = "<h1>----------Search Result----------</h1></br>";
			$.ajax({
				url: '/search/userlistbyname',
				type: 'post',
				crossDomain: true, 
				data: {
				  username:search_content
				},
				dataType:"json",
				success: function (data) {
				search_result+="&nbsp;&nbsp;<span style='color:blue;'>"+data.message+"</span></br></br>";	
					for(var i=0;i<data.userlist.length;i++){
						search_result+="&nbsp;&nbsp;Username: " + redword(search_content,data.userlist[i].username) + "</br>";
						search_result+="&nbsp;&nbsp;Is_online: " + getisonline(data.userlist[i].is_online) + "</br>";
						search_result+="&nbsp;&nbsp;Status: " + getstatus(data.userlist[i].status) + "</br></br>";
					}
					$("#dialog_table").html(search_result);
				},error:function(){
				//alert("Server Error!")
				}
	    	});
		}

		if($('#search_type').val() == "userlistbystatus"){
			search_result = "<h1>----------Search Result----------</h1></br>";
			$.ajax({
				url: '/search/userlistbystatus',
				type: 'post',
				crossDomain: true, 
				data: {
				  status:$('#status_type').val()
				},
				dataType:"json",
				success: function (data) {
					search_result+="&nbsp;&nbsp;<span style='color:blue;'>"+data.message+"</span></br></br>";
					for(var i=0;i<data.userlist.length;i++){
						search_result+="&nbsp;&nbsp;Username: " + data.userlist[i].username + "</br>";
						search_result+="&nbsp;&nbsp;Is_online: " + getisonline(data.userlist[i].is_online) + "</br>";
						search_result+="&nbsp;&nbsp;Status: " + getstatus(data.userlist[i].status) + "</br></br>";
					}
					$("#dialog_table").html(search_result);
				},error:function(){
				//alert("Server Error!")
				}
	    	});
		}

		if($('#search_type').val() == "announcement"){
			search_result = "<h1>----------Search Result----------</h1></br>";
			$.ajax({
				url: '/search/announcement',
				type: 'post',
				crossDomain: true, 
				data: {
				  announcement:search_content
				},
				dataType:"json",
				success: function (data) {
					search_result+="&nbsp;&nbsp;<span style='color:blue;'>"+data.message+"</span></br></br>";
					var count=0;
					if(data.announcement.length>10){
						for(var i=0;i<10;i++){
								search_result = show_announce(search_content,data,search_result,i);
							}
							$("#dialog_table").append(search_result);
							count=count+10;
							$("#load_more").show();
					}else{
						for(var i=0;i<data.announcement.length;i++){
							search_result = show_announce(search_content,data,search_result,i);
						}
						$("#dialog_table").append(search_result);
					}
					$("#load_more").click(function(){
						$("#load_more").hide();
						if(count<data.announcement.length){
							for(var i=count;i<count+10;i++){
								if(i<data.announcement.length){
									search_result = show_announce(search_content,data,search_result,i);
								}
							}
							count=count+10;
							if(count<data.announcement.length){
								$("#load_more").show();
							}
						}
						$("#dialog_table").html(search_result);
					});
				},error:function(){
				//alert("Server Error!")
				}
	    	});
		}

		if($('#search_type').val() == "publicchat"){
			search_result = "<h1>----------Search Result----------</h1></br>";
			$.ajax({
				url: '/search/publicmsg',
				type: 'post',
				crossDomain: true, 
				data: {
				  message:search_content
				},
				dataType:"json",
				success: function (data) {
					search_result+="&nbsp;&nbsp;<span style='color:blue;'>"+data.message+"</span></br></br>";
					var count=0;
					if(data.publicmsg.length>10){
						for(var i=0;i<10;i++){
								search_result = show_public(search_content,data,search_result,i);
							}
							$("#dialog_table").append(search_result);
							count=count+10;
							$("#load_more").show();
					}else{
						for(var i=0;i<data.publicmsg.length;i++){
							search_result = show_public(search_content,data,search_result,i);
						}
						$("#dialog_table").append(search_result);
					}
					$("#load_more").click(function(){
						$("#load_more").hide();
						if(count<data.publicmsg.length){
							for(var i=count;i<count+10;i++){
								if(i<data.publicmsg.length){
									search_result = show_public(search_content,data,search_result,i);
								}
							}
							count=count+10;
							if(count<data.publicmsg.length){
								$("#load_more").show();
							}
						}
						$("#dialog_table").html(search_result);
					});
				},error:function(){
				//alert("Server Error!")
				}
	    	});
		}

		if($('#search_type').val() == "privatechat"){
			search_result = "<h1>----------Search Result----------</h1></br>";
			$.ajax({
				url: '/search/privatemsg',
				type: 'post',
				crossDomain: true, 
				data: {
				  message:search_content,
				  username:user_name
				},
				dataType:"json",
				success: function (data) {
					search_result+="&nbsp;&nbsp;<span style='color:blue;'>"+data.message+"</span></br></br>";
					var count=0;
					if(data.privatemsg.length>10){
						for(var i=0;i<10;i++){
								search_result = show_private(search_content,data,search_result,i);
							}
							$("#dialog_table").append(search_result);
							count=count+10;
							$("#load_more").show();
					}else{
						for(var i=0;i<data.privatemsg.length;i++){
							search_result = show_private(search_content,data,search_result,i);
						}
						$("#dialog_table").append(search_result);
					}
					$("#load_more").click(function(){
						$("#load_more").hide();
						if(count<data.privatemsg.length){
							for(var i=count;i<count+10;i++){
								if(i<data.privatemsg.length){
									search_result = show_private(search_content,data,search_result,i);
								}
							}
							count=count+10;
							if(count<data.privatemsg.length){
								$("#load_more").show();
							}
						}
						$("#dialog_table").html(search_result);
					});
				},error:function(){
				//alert("Server Error!")
				}
	    	});
		}
	}
});

var scroll_count=300;
$("#scroll_up").click(function(){
	$("#dialog_table").scrollTop(scroll_count);
	scroll_count-=300;
	if(scroll_count<0){
		scroll_count=0;
	}
})

$("#scroll_down").click(function(){
	$("#dialog_table").scrollTop(scroll_count);
	scroll_count+=300;
	if(scroll_count<0){
		scroll_count=0;
	}
})

//translate status from number to string
function getstatus(status){
	if(status==0){
		return "Not defined!";
	}
	if(status==1){
		return "Ok!";
	}
	if(status==2){
		return "Help!";
	}
	if(status==3){
		return "Emergency!";
	}
}

//translate is_online from number to string
function getisonline(is_online){
	if(is_online==0){
		return "offline!";
	}
	if(is_online==1){
		return "online!";
	}
}

//red the search word
function redword(key, content){
	var arr = key.split(" ");
	for(var i=0;i<arr.length;i++){
		content = content.replace(arr[i], "<span style='color:red;'>"+arr[i]+"</span>");
	}
	return content;
}

function show_announce(search_content,data,search_result,i){
	search_result+="&nbsp;&nbsp;Sender: " + data.announcement[i].src + "</br>";
	search_result+="&nbsp;&nbsp;Date: " + getDate(data.announcement[i].gmt_create) + "</br>";
	search_result+="&nbsp;&nbsp;Location: " + data.announcement[i].location + "</br>";
	search_result+="&nbsp;&nbsp;Anouncement: " + redword(search_content,data.announcement[i].content) + "</br></br>";
	return search_result;
}

function show_private(search_content,data,search_result,i){
	search_result+="&nbsp;&nbsp;Receiver: " + data.privatemsg[i].dest + "</br>";
	search_result+="&nbsp;&nbsp;Date: " + getDate(data.privatemsg[i].gmt_create) + "</br>";
	search_result+="&nbsp;&nbsp;Location: " + data.privatemsg[i].location + "</br>";
	search_result+="&nbsp;&nbsp;Message: " + redword(search_content,data.privatemsg[i].content) + "</br></br>";
	return search_result;
}

function show_public(search_content,data,search_result,i){
	search_result+="&nbsp;&nbsp;Sender: " + data.publicmsg[i].src + "</br>";
	search_result+="&nbsp;&nbsp;Date: " + getDate(data.publicmsg[i].gmt_create) + "</br>";
	search_result+="&nbsp;&nbsp;Location: " + data.publicmsg[i].location + "</br>";
	search_result+="&nbsp;&nbsp;Message: " + redword(search_content,data.publicmsg[i].content) + "</br></br>";
	return search_result;
}

//
$("#search_type").change(function(){
	$("#status_type").hide();
	$('#search_content').show();
	if($("#search_type").val()=="userlistbystatus"){
		$("#status_type").show();
		$('#search_content').hide();
	}else{
		$("#status_type").hide();
		$('#search_content').show();
	}
})
