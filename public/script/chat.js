var socket = io.connect();
var input_content = getNode('input_content');
var dialog_table = getNode('dialog_table');
var navbar_name = getNode("navbar_name");
var announcement_table = getNode('announcement_table');
var chat_title = getNode('chat_title');
var in_private = false;

var user_name = $.cookie('user');
var to_name = $.cookie('audience');

var message_container;
var message_frame;
var message;

var socket = io.connect();

var whitespacePattern = /^\s*$/; //used to test if a string is only consist of spaces
socket.emit('sendAn', "All");

$.ajax({
    url: '/users',
    type: 'get',
    crossDomain: true,
    success: function(data) {
        //reload the page on the success
    }
});

$(document).ready(function() {
    if ($.cookie("audience") && $.cookie("audience") != "private") {
        in_private = true;
    }
    if(to_name !== null && to_name.length>0){
        $("#uploadfile_id").hide();
    }
    console.log("ready!");
    console.log("chat Name:" + user_name + " Audience:" + to_name);
    console.log("Emitting PerfCheck");
    socket.emit('PerfCheck', "chat");

    socket.on('newuser', user_name);
    //Receive and update user list. Note: the user list can only be added or updated. No deleted is of user case
    socket.on('PerfGet', function() {
        //local_user_list[nameCard.name] = nameCard.status;
        //console.log("update list");
        $(window.location).attr('href', '/perfmon_msg');

    });

    //     navbar_name.textContent = 'Hi ' + user_name;

    //     if (to_name) {

    //         getPrivateMessage(to_name);
    //         chat_title.textContent = 'Chat with ' + to_name;
    //     } else {

    //         getPublicMessage();
    //         chat_title.textContent = 'Public Chat';
    //     }
    //     socket.emit('sendstatus', "All");
    // });

    navbar_name.textContent = 'Hi ' + user_name;
    if (to_name) {
        getPrivateMessage(to_name);
        chat_title.textContent = 'Chat with ' + to_name;
    } else {

        getPublicMessage();
        chat_title.textContent = 'Public Chat';
    }
    socket.emit('sendstatus', "All");
});


$('#perfmon').on('click', function() {

    checkmonitor();
    console.log("perfmon clicked");

    console.log("perfMeasureButton"); {
        var date = new Date();
        var timestamp = Date.parse(new Date()) / 1000;

        var announcedata = {
            name: user_name,
            ismsg: 0,
            msg: "performance on",
            time: getDate(timestamp),
            page: "chat"
        };

        $.ajax({
            url: '/user/postAnnouncement',
            type: 'post',
            crossDomain: true,
            data: announcedata,
            dataType: 'json',
            success: function(data) {
                //reload the page on the success
                if (data.success === false) {
                    alert(data.message);
                }
            }
        });
    }

});

$('#send').on('click', function() {
    var textMsg = $(input_content).val();
    //console.log("Inside send" + textMsg);
    if (textMsg !== "" && !whitespacePattern.test(textMsg)) {
        //console.log("Sent message valid");
        var date = new Date();
        var timestamp = Date.parse(new Date()) / 1000;
        var user;
        //console.log("currentUserSts:" + currentUserSts);
        if (currentUserSts !== 0 && currentUserGmtSts !== 0) {
            switch (currentUserSts) {
                //New field status = "ok", 'help', 'emergency' or 'undefined'
                case 1:
                    {
                        user = '(Status: OK @' + currentUserGmtSts + ')';
                        break;
                    }
                case 2:
                    {
                        user = '(Status: Help @' + currentUserGmtSts + ')';
                        break;
                    }
                case 3:
                    {
                        user = '(Status: Emergency @' + currentUserGmtSts + ')';
                        break;
                    }
                default:
                    {
                        user = user_name;
                        break;
                    }
            }
        } else {
            user = '(Status: OK @' + currentUserGmtSts + ')';
        }

        if (to_name === null || to_name.length === 0) {
            var wallMsg = {
                name: user_name,
                msg: textMsg,
                ismsg: 0,
                time: timestamp,
                usersts: user
            };

            socket.emit("sendWallMessage", wallMsg);

            $.ajax({
                url: '/user/postPublicMsg',
                type: 'post',
                crossDomain: true,
                data: wallMsg,
                dataType: 'json',
                success: function(data) {
                    //reload the page on the success
                    location.reload();
                }
            });

        } else {

            var privateMsg = {
                cont: textMsg,
                author: user_name,
                targ: to_name,
                postedAt: getDate(timestamp),
                usersts: user,
                ismsg: 0
            };

            socket.emit('sendPrivateMessage', privateMsg);

            $.ajax({
                url: '/user/postPrivateMessage',
                type: 'post',
                crossDomain: true,
                data: privateMsg,
                dataType: 'json',
                success: function(data) {
                    //reload the page on the success
                    location.reload();
                }
            });
        }
        //clean text in input_content
        $(input_content).val('');
    }
});

socket.on('updateUserList', function(list) {
    //local_user_list[nameCard.name] = nameCard.status;
    //console.log("update list");
    sortAndUpdateUserList(list);
});

socket.on(user_name, function(data) {
    if (to_name !== null && to_name.length > 0) { //in chat_private mode
        if (to_name === data.author) { // currently chat with data.author
            addMessageForSelfWall(data.author, data.ismsg, data.cont, data.postedAt, data.usersts);
        } else { //currently chat with person other than data.author
            if (data.author === user_name) { // if user_name initiate the private talk
                addMessageForSelfWall(data.author, data.ismsg, data.cont, data.postedAt, data.usersts);
            } else {
                $.notify({
                    message: "<string>" + data.author + "<strong> sent you a private message <button type='text' onclick=privateChatwith('" + data.author + "')>Chat</button>"
                }, {
                    type: 'success',
                    offset: {
                        x: 20,
                        y: 55
                    },
                    delay: 50000,
                });
                createCookie('new_msg_' + data.author, 1, 100);
            }

        }

    } else { //in chat_public mode
        $.notify({
            message: "<string>" + data.author + "<strong> sent you a private message <button type='text' onclick=privateChatwith('" + data.author + "')>Chat</button>"
        }, {
            type: 'success',
            offset: {
                x: 20,
                y: 55
            },
            delay: 50000,
        });
        createCookie('new_msg_' + data.author, 1, 100);
    }
});

//socket.on('dialog_entry', function(dialog_entry){
//  console.log('See dialog_entry');
//console.log(dialog_entry);
//var message = document.createElement('div');
//message.setAttribute('class','dialog_entry');
//message.textContent = "(" + dialog_entry.time + ")\t"+ dialog_entry.name + ": " + dialog_entry.msg;

//append message to the last
//dialog_table.appendChild(message);
//dialog_table.insertBefore(message, null);
//dialog_table.scrollTop = dialog_table.scrollHeight;
//});

//receive the wall message broadcast from server
socket.on('getWallMessage', function(data) {
    //console.log("dialog_entry.name" + dialog_entry.name);
    //console.log("user_name" + user_name);
    if (to_name === null || to_name.length === 0) {
        addMessageForSelfWall(data.name, data.ismsg, data.msg, data.time, data.usersts);
    }
    //if(to_name){
    /*  if(dialog_entry.name == to_name) 
     {
     console.log("From others");
     addMessageFromOthers(dialog_entry);
     }
     if(dialog_entry.name == user_name)
     {
     console.log("From self");
     addMessageFromSelf(dialog_entry);
     }*/
    //}
});



socket.on('load announce', function(rows) {
    //console.log("char_announcement_rows:" + rows.length);
    //console.log("Receiving old announcemessages");
    for (var i = 0; i < rows.length; i++) {
        addAnnouncementMsg(rows[i].content, rows[i].src, rows[i].gmt_create);
    }
});


socket.on('announcement', function(data) {


    addAnnouncementMsg(data.msg, data.name, data.time);

    if (data.msg == "performance on") {
        if (data.name == user_name) {
            $.cookie("perf_master", "chat");
            $(window.location).attr('href', '/perfmon');
        } else {
            $.cookie("perf_slave", "chat");
            $(window.location).attr('href', '/perfmon_msg');

        }
    }

});
socket.on('newfile', function(msg) {
    console.log("received newfile event");

    var username = msg.name;
    // var formdata = new FormData(msg.msg);
    //var data = msg.msg;
    // console.log("username of file: "+ username);
    // console.log("file: "+data.data);
    // console.log("filetype: "+data.filetype);

    displayUploadFile(username, msg.msg, msg.ismsg);
    console.log("finished newfile event!");
});

function getShortDate(timestamp) {
    var localeSpecificTime = new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
    return localeSpecificTime;
}

//Update variable user_list and update the content of user_list on client side
function sortAndUpdateUserList(rows) {
    //console.log("namelist:");

    //sort the user list
    //users_list.textContent = '';
    for (var i = 0; i < rows.length; i++) {
        //console.log(rows[i].username + ' ' + rows[i].is_online+' '+ rows[i].status);
        //Liyuan (Oct 15) Updated for Task: share status
        if (rows[i].is_online) { //Change to is_online 1 stands for 'online'; 0 --> 'offline'
            if (rows[i].username == user_name) {
                currentUserSts = rows[i].status;
                currentUserGmtSts = getShortDate(rows[i].gmt_status);
            }

        }

    }
}


function getPrivateMessage(from_who) {
    console.log("getPrivateMessage");
    var chatter = {
        author: user_name,
        targ: from_who
    };
    $.ajax({
        url: '/user/getPrivateMessage',
        type: 'post',
        data: chatter,
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows !== null) {

           
            dialog_table.innerHTML = "";

            for (var i = 0; i < rows.length; i++) {
                if (rows[i].src == user_name) {
                    addMessageFromSelf(rows[i].src, rows[i].ismsg, rows[i].content, rows[i].gmt_create, rows[i].usr_sts);
                } else {
                    addMessageFromOthers(rows[i].src, rows[i].ismsg, rows[i].content, rows[i].gmt_create, rows[i].usr_sts);
                }
            }
        }
    }).fail(function() {
        console.log("Fail to get wall messages");
    });

}


function getPublicMessage() {
    //console.log("getPublicMessage");
    $.ajax({
        url: '/user/getPublicMessages',
        type: 'get',
        crossDomain: true,
        dataType: "json"
    }).done(function(rows) {

        if (rows !== null) {
            console.log("REST API sent successfully");

            dialog_table.innerHTML = "";

            for (var i = 0; i < rows.length; i++) {
                // console.log(rows[i].content);
                if (rows[i].src == user_name) {
                    addMessageFromSelf(rows[i].src, rows[i].ismsg, rows[i].content, rows[i].gmt_create, rows[i].usr_sts);
                } else {
                    addMessageFromOthers(rows[i].src, rows[i].ismsg, rows[i].content, rows[i].gmt_create, rows[i].usr_sts);
                }
            }
        } else {
            console.log("No messages on public wall");
        }

    }).fail(function() {
        console.log("Fail to get wall messages");
    });
}

function addMessageForSelfWall(name, ismsg, msg, time, usersts) {
    //console.log("For Self Wall=======>");
    //console.log("data.name: " + data.name);
    //console.log("data.usersts: " + data.usersts);
    //console.log("data.msg " + data.msg);
    //console.log("check data.time " + data.time);

    if (name == user_name) {
        addMessageFromSelf(name, ismsg, msg, time, usersts);
    } else {
        addMessageFromOthers(name, ismsg, msg, time, usersts);
    }
}

function addMessageFromSelf(name, ismsg, content, time, status) {
    //console.log("rows[i].is_online: " + rows[i].is_online);
    //console.log("From Self=======>");

    //console.log("rows[i].usersts: " + data.usr_sts);

    avatar_message_container = document.createElement('div');
    avatar_message_container.setAttribute('class', 'row msg_container base_sent');

    message_frame = document.createElement('div');
    message_frame.setAttribute('class', 'col-md-10 col-xs-10');
    message_frame.setAttribute('style', 'padding-right:0px;');
    message = document.createElement('div');
    message.setAttribute('class', 'messages msg_sent');


    // console.log("data.msg" + content);

    msg_content = document.createElement('p');
    // msg_content.textContent = content;
    if (ismsg == 1) {
        msg_content.innerHTML = '<a href="' + content + '" target="_blank"> <img src="' + content + '" width ="100" /></a>';
    } else if (ismsg == 2) {
        msg_content.innerHTML = '<video width="400" controls><source src="' + content + '" type="video/mp4"></video>';
    } else {
        msg_content.textContent = content;
    }
    msg_usertime = document.createElement('time');
    msg_usertime.textContent = name + ' • ' + formatAMPM(time) + ' ';
    msg_status = document.createElement('span');
    //console.log("data userstsssss-======>"+data.usr_sts);

    console.log(status);
    if (status) {
        if (status.indexOf('OK') > 0) {
            console.log("1");
            msg_status.setAttribute('class', 'label label-success');
            msg_status.textContent = 'OK';
        } else if (status.indexOf('Help') > 0) {
            console.log("2");
            msg_status.setAttribute('class', 'label label-warning');
            msg_status.textContent = 'Help';
        } else if (status.indexOf('Emergency') > 0) {
            console.log("3");
            msg_status.setAttribute('class', 'label label-danger');
            msg_status.textContent = 'Emergency';
        }
    } else {
        console.log("4");
        msg_status.setAttribute('class', 'label label-default');
        msg_status.textContent = 'Undefined';
    }


    avatar_frame = document.createElement('div');
    avatar_frame.setAttribute('class', 'col-md-2 col-xs-2 avatar');
    avatar_frame.setAttribute('style', 'padding-left:5px;');
    avatar_img = document.createElement('img');
    avatar_img.setAttribute('src', 'img/head.png');
    avatar_img.setAttribute('class', 'img-responsive');

    // console.log("msg_status" + msg_status.textContent);
    // console.log("msg_content" + msg_content.textContent);
    // console.log("msg_usertime" + msg_usertime.textContent);
    // console.log("message" + message.textContent);

    // if (filetype== 1) {
    //     msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<img src="' + file + '" width="100" height="150"/>';
    // } else if (filetype==2) {
    //     msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<video width="400" controls><source src="'+ file + '" type="video/mp4"></video>';
    // } 



    msg_usertime.appendChild(msg_status);
    message.appendChild(msg_content);
    message.appendChild(msg_usertime);
    message_frame.appendChild(message);
    avatar_frame.appendChild(avatar_img);
    avatar_message_container.appendChild(message_frame);
    avatar_message_container.appendChild(avatar_frame);
    dialog_table.appendChild(avatar_message_container);
    dialog_table.insertBefore(avatar_message_container, null);

    dialog_table.scrollTop = dialog_table.scrollHeight;
}

function addMessageFromOthers(name, ismsg, content, time, status) {
    console.log("From others=======>");
    //console.log("content :" + content);
    console.log("name: " + name);
    console.log("time: " + time);
    console.log("status: " + status);

    avatar_message_container = document.createElement('div');
    avatar_message_container.setAttribute('class', 'row msg_container base_receive');

    avatar_frame = document.createElement('div');
    avatar_frame.setAttribute('class', 'col-md-2 col-xs-2 avatar');
    avatar_frame.setAttribute('style', 'padding-right:5px;');
    avatar_img = document.createElement('img');
    avatar_img.setAttribute('src', 'img/head.png');
    avatar_img.setAttribute('class', 'img-responsive');

    message_frame = document.createElement('div');
    message_frame.setAttribute('class', 'col-md-10 col-xs-10');
    message_frame.setAttribute('style', 'padding-left:0px;');
    message = document.createElement('div');
    message.setAttribute('class', 'messages msg_sent');

    // msg_content = document.createElement('p');
    // msg_content.textContent = content;
    msg_content = document.createElement('p');
    // msg_content.textContent = content;
    if (ismsg == 1) {
        msg_content.innerHTML = '<a href="' + content + '" target="_blank"> <img src="' + content + '" width ="100" /></a>';
    } else if (ismsg == 2) {
        msg_content.innerHTML = '<video width="400" controls><source src="' + content + '" type="video/mp4"></video>';
    } else {
        msg_content.textContent = content;
    }

    msg_usertime = document.createElement('time');
    msg_usertime.textContent = name + ' • ' + formatAMPM(time) + ' ';

    msg_status = document.createElement('span');

    console.log(status);
    if (status) {
        if (status.indexOf('OK') > 0) {
            console.log("is Okay");
            msg_status.setAttribute('class', 'label label-success');
            msg_status.textContent = 'OK';
        } else if (status.indexOf('Help') > 0) {
            console.log("is Help");
            msg_status.setAttribute('class', 'label label-warning');
            msg_status.textContent = 'Help';
        } else if (status.indexOf('Emergency') > 0) {
            console.log("is Emergency");
            msg_status.setAttribute('class', 'label label-danger');
            msg_status.textContent = 'Emergency';
        }
    } else {
        console.log("is Undefined");
        msg_status.setAttribute('class', 'label label-default');
        msg_status.textContent = 'Undefined';
    }

    msg_usertime.appendChild(msg_status);
    message.appendChild(msg_content);
    message.appendChild(msg_usertime);
    message_frame.appendChild(message);
    avatar_frame.appendChild(avatar_img);
    avatar_message_container.appendChild(avatar_frame);
    avatar_message_container.appendChild(message_frame);
    dialog_table.appendChild(avatar_message_container);
    dialog_table.insertBefore(avatar_message_container, null);

    dialog_table.scrollTop = dialog_table.scrollHeight;
}

function addAnnouncementMsg(content, src, gmt_create) {

    announce_frame = document.createElement('p');

    announce_name = document.createElement('Strong');
    announce_name.textContent = src + ': ';

    announce_message = document.createElement('span');
    announce_message.textContent = '(' + formatAMPM(gmt_create) + ') ' + content;

    announce_frame.appendChild(announce_name);
    announce_frame.appendChild(announce_message);
    //console.log(announce_frame);
    announcement_table.appendChild(announce_frame);
    announcement_table.insertBefore(announce_frame, null);

    announcement_table.scrollTop = announcement_table.scrollHeight;
}

function openWindow() {
    document.getElementById("uploadfile").onchange();

}

function uploadFile(input) {
    console.log("enter upload button process!");
    if (input.files && input.files[0]) {
        var file = input.files[0];
        // if(file.size >307200){
        //    console.log("oversized") ;

        // }
        // console.log(file.size);
        var filetype = checkFileType(file);

        var reader = new FileReader();
        // var username = user_name;

        reader.fileName = file.name;

        reader.onload = function(event) {
            // this.value = '';
            // console.log("emit event to server for uploadfile!");
            // console.log("username of file: "+username);
            // console.log("filetype from reader: "+filetype);

            var date = new Date();
            // var filename = encodeURIComponent(reader.result);
            var filename = event.target.fileName;
            console.log("filename = " + filename);

            //construct form data
            // var fd = new FormData();
            // fd.append('filename', filename);
            // fd.append('data', event.target.result);
            // fd.append('filetype', filetype);

            // console.log("event.target.result: "+event.target.result);

            // var msg = {
            //     filename: filename,
            //     data: event.target.result,
            //     filetype: filetype
            // };

            var timestamp = Date.parse(date) / 1000;
            var user;
            //console.log("currentUserSts:" + currentUserSts);
            if (currentUserSts !== 0 && currentUserGmtSts !== 0) {
                switch (currentUserSts) {
                    //New field status = "ok", 'help', 'emergency' or 'undefined'
                    case 1:
                        {
                            user = '(Status: OK @' + currentUserGmtSts + ')';
                            break;
                        }
                    case 2:
                        {
                            user = '(Status: Help @' + currentUserGmtSts + ')';
                            break;
                        }
                    case 3:
                        {
                            user = '(Status: Emergency @' + currentUserGmtSts + ')';
                            break;
                        }
                    default:
                        {
                            user = user_name;
                            break;
                        }
                }
            } else {
                user = '(Status: OK @' + currentUserGmtSts + ')';
            }

            var wallMsg = {
                name: user_name,
                msg: event.target.result,
                //msg: msg,
                ismsg: filetype,
                time: timestamp,
                usersts: user
            };

            socket.emit("uploadfile", wallMsg);

            $.ajax({
                url: '/user/postPublicMsg',
                type: 'post',
                crossDomain: true,
                data: wallMsg,
                dataType: 'json',
                // success: function(data) {
                //     //reload the page on the success
                //     location.reload();
                // }
            });

            // socket.emit('uploadfile', username, data);
            // displayUploadFile('me', e.target.result, filetype);
        };
        reader.readAsDataURL(file);
    }
}


function displayUploadFile(user, file, filetype) {
    console.log("now diplay upload file!");
    // console.log("username: "+user);
    // console.log("filetype: "+filetype);

    var msgToDisplay = document.createElement('p'),
        date = new Date().toTimeString().substr(0, 8);
    // msgToDisplay.style.color = color || '#000';
    if (filetype == 1) {
        msgToDisplay.innerHTML = user + '<span>(' + date + '): </span> <br/>' + '<a href="' + file + '" target="_blank"> <img src="' + file + '" width ="100" /></a>';
    } else if (filetype == 2) {
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<video width="400" controls><source src="' + file + '" type="video/mp4"></video>';
    }
    // msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<video width="400" controls><source src="'+ file + '" type="video/mp4"></video>';
    dialog_table.appendChild(msgToDisplay);

    dialog_table.scrollTop = dialog_table.scrollHeight;
    //this.getPublicMessage();
}


function checkFileType(file) {
    if (file.type.match('image.*')) {
        return 1;
    }
    if (file.type.match('video.*')) {
        return 2;
    }
    return -1;
}
