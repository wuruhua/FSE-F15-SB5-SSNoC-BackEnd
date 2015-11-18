var user_name = $.cookie('user');
var user = getNode("user");
var dropdown_status = getNode("dropdown_status");
var contactlist = getNode("contact-list");
var navbar_name = getNode("navbar_name");
var socket = io.connect();

$(document).ready(function() {
    //console.log( "ready!" );
    //console.log("chat Name:"+user_name);
    //change name on Nav bar
    //console.log(navbar_name.textContent);
    navbar_name.textContent = 'Hi ' + user_name;
    //change name to user
    //console.log(user.textContent);
    user.textContent = user_name;
});

socket.emit('sendstatus', "All");

function getShortDate(timestamp) {
    var localeSpecificTime = new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
    return localeSpecificTime;
}

function updateScroll(element) {
    element.scrollTop = element.scrollHeight;
}

socket.on('updateUserList', function(rows) {
    //local_user_list[nameCard.name] = nameCard.status;
    //console.log("update list");
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
    usr_info.setAttribute('class', 'col-xs-6 col-sm-6');

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
    usr_chat_button.setAttribute('class', 'col-xs-2 col-sm-2');

    usr_chat_button_sub = document.createElement('button');
    usr_chat_button_sub.setAttribute('class', 'btn btn-info');
    usr_chat_button_sub.setAttribute('type', 'button');
    usr_chat_button_sub.setAttribute('onclick', "privateChatwith('" + row.username + "')");
    usr_chat_button_sub.textContent = 'Talk';

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

function privateChatwith(to_name) {
    //console.log("=====>Start private Chat");
    var chatter = {
        audience: to_name
    };
    $.ajax({
        url: '/user/setAudience',
        type: 'post',
        data: chatter,
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows != null) {
            //console.log(chatter);
            //console.log("Private message get success");
            $(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        //console.log(chatter);
        //console.log("Private message get fail");
        $(window.location).attr('href', '/chat');
    });
}

$('#pchat').on('click', function() {
    //console.log("Start public Chat");
    $.ajax({
        url: '/user/setAudience',
        type: 'post',
        data: {
            audience: "All"
        },
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows != null) {
            //console.log("Public message get success");
            //	$(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        //console.log('fail to get wall messages');
    });
});
