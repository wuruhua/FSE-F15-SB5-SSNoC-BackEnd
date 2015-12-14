var user_name = $.cookie('user');
var perf_page = $.cookie('perf_page');

var user = getNode("user");
var dropdown_status = getNode("dropdown_status");

var contactlist = getNode("contact-list");
var navbar_name = getNode("navbar_name");

var socket = io.connect();

$(document).ready(function() {
    //$.cookie("chat-type", "");
    console.log("ready!");
    console.log("chat Name:" + user_name);

    socket.emit('PerfCheck', "contactlist");
    socket.on('PerfGet', function() {
        //local_user_list[nameCard.name] = nameCard.status;
        //console.log("update list");
        $(window.location).attr('href', '/perfmon_msg');

    });
    //Receive and update user list. Note: the user list can only be added or updated. No deleted is of user case



    //change name on Nav bar
    console.log(navbar_name.textContent);
    navbar_name.textContent = 'Hi ' + user_name;

    //change name to user
    console.log(user.textContent);
    user.textContent = user_name;
});



$('#perfmon').on('click', function() {
    console.log("perfmon clicked");

    console.log("perfMeasureButton"); {
        var date = new Date();
        var timestamp = Date.parse(new Date()) / 1000;

        var announcedata = {
            name: user_name,
            ismsg: 0,
            msg: "performance on",
            time: getDate(timestamp),
            page: "contactlist"
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

socket.emit('sendstatus', "All");

//receive announce_entry from server, and display
socket.on('announcement', function(data) {

    console.log("contactlist page: data.msg" + data.msg);
    console.log("contactlist page: data.name" + data.name);
    console.log("user_name" + user_name);

    if (data.msg == "performance on") {
        if (data.name == user_name) {
            $.cookie("perf_master", "contactlist");
            $(window.location).attr('href', '/perfmon');
        } else {
            $.cookie("perf_slave", "contactlist");
            $(window.location).attr('href', '/perfmon_msg');

        }
    }

});

socket.on(user_name, function(data) {
    if (user_name != data.author) {
        $.notify({
            message: "<string>" + data.author + "<strong> sent you a private message <button type='text' onclick=privateChatwith('" + data.author + "')>Chat</button>"
        }, {
            type: 'success',
            offset: {
                x: 20,
                y: 55
            },
            delay: 10000,
        });
    }
    createCookie('new_msg_' + data.author, 1, 100);
    var privateTalkBtn = getNode('privateTalkBtn_' + data.author);
    privateTalkBtn.setAttribute('class', 'btn btn-danger');
    privateTalkBtn.textContent = 'New Msg';
});

function getShortDate(timestamp) {
    var localeSpecificTime = new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
    return localeSpecificTime;
}

function updateScroll(element) {
    element.scrollTop = element.scrollHeight;
}


socket.on('updateUserList', function(rows) {
    //local_user_list[nameCard.name] = nameCard.status;
    console.log("update list");
    updateUserList(rows);
});

//Update variable user_list and update the content of user_list on client side
function updateUserList(rows) {
    contactlist.textContent = "";
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].username == user_name) {
            updateSelf(rows[i]);
        } else {
            updateSingleUser(rows[i]);
        }
    }
}

function updateSelf(row) {
    user.textContent = row.username;
    var status_class = "";
    if (row.status == "0") {
        status_class = "btn btn-xs btn-default dropdown-toggle";
        dropdown_status.textContent = "Undefined ";
    }
    if (row.status == "1") {
        status_class = "btn btn-xs btn-success dropdown-toggle";
        dropdown_status.textContent = "Okay ";
    }
    if (row.status == "2") {
        status_class = "btn btn-xs btn-warning dropdown-toggle";
        dropdown_status.textContent = "Help ";
    }
    if (row.status == "3") {
        status_class = "btn btn-xs btn-danger dropdown-toggle";
        dropdown_status.textContent = "Emergency ";
    }

    caret = document.createElement('span');
    caret.setAttribute('class', 'caret');

    dropdown_status.setAttribute('class', status_class);
    dropdown_status.appendChild(caret);
}

function updateSingleUser(row) {

    console.log(row);

    usr_frame = document.createElement('li');
    usr_frame.setAttribute('class', 'list-group-item');

    //---------------usr_avatar_img-----------------------
    usr_avatar_img = document.createElement('div');
    if (row.is_online == 1) {
        usr_avatar_img.setAttribute('class', 'col-xs-3 col-sm-3 li-online');
    } else {
        usr_avatar_img.setAttribute('class', 'col-xs-3 col-sm-3 li-offline');
    }

    usr_avatar_img_sub = document.createElement('img');
    usr_avatar_img_sub.setAttribute('src', 'img/head.png');
    usr_avatar_img_sub.setAttribute('class', 'img-responsive img-circle');
    //usr_avatar_img_sub.setAttribute('alt',row.username);

    //---------------------usr_info-----------------------
    usr_info = document.createElement('div');
    usr_info.setAttribute('class', 'col-xs-5 col-sm-5');

    usr_info_name = document.createElement('span');
    usr_info_name.setAttribute('class', 'name');
    usr_info_name.textContent = row.username;


    usr_br = document.createElement('br');

    usr_info_status = document.createElement('span');

    //console.log(row.status);
    switch (row.status) {
        case 1:
            {
                //console.log('To 1');
                usr_info_status.setAttribute('class', 'label label-success');
                usr_info_status.textContent = 'Okay';
                break;
            }
        case 2:
            {
                //console.log('To 2');
                usr_info_status.setAttribute('class', 'label label-warning');
                usr_info_status.textContent = 'Help';
                break;
            }
        case 3:
            {
                //console.log('To 3');
                usr_info_status.setAttribute('class', 'label label-danger');
                usr_info_status.textContent = 'Emergency';
                break;
            }
        default:
            {
                //console.log('To 4');
                usr_info_status.setAttribute('class', 'label label-default');
                usr_info_status.textContent = 'Undefined';
            }
    }

    //---------------------usr_chat_button----------------
    usr_chat_button = document.createElement('div');
    usr_chat_button.setAttribute('class', 'col-xs-3 col-sm-3');

    var user_sent_new_msg = $.cookie('new_msg_' + row.username);

    usr_chat_button_sub = document.createElement('button');
    usr_chat_button_sub.setAttribute('type', 'button');
    usr_chat_button_sub.setAttribute('id', 'privateTalkBtn_' + row.username);
    usr_chat_button_sub.setAttribute('onclick', "privateChatwith('" + row.username + "')");

    if (user_sent_new_msg > 0) {
        usr_chat_button_sub.setAttribute('class', 'btn btn-danger');
        usr_chat_button_sub.textContent = 'New Msg';
    } else {
        usr_chat_button_sub.setAttribute('class', 'btn btn-info');
        usr_chat_button_sub.textContent = 'Talk';
    }

    //---------------------clearfix------------------------
    usr_clearfix = document.createElement('div');
    usr_clearfix.setAttribute('class', 'clearfix');

    //-------------------put things together--------------
    usr_avatar_img.appendChild(usr_avatar_img_sub);
    usr_info.appendChild(usr_info_name);
    usr_info.appendChild(usr_br);
    usr_info.appendChild(usr_info_status);
    usr_chat_button.appendChild(usr_chat_button_sub);

    usr_frame.appendChild(usr_avatar_img);
    usr_frame.appendChild(usr_info);
    usr_frame.appendChild(usr_chat_button);
    usr_frame.appendChild(usr_clearfix);

    contactlist.appendChild(usr_frame);
    contactlist.insertBefore(usr_frame, null);

}


$('#pchat').on('click', function() {

    console.log("Start public Chat");


    $.ajax({
        url: '/user/setAudience',
        type: 'post',
        data: {
            audience: "All"
        },
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows !== null) {
            console.log("Public message get success");
            //  $(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        console.log('fail to get wall messages');
    });
});
