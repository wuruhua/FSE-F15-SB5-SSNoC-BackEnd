var input_content_an = getNode('input_content_an');
var announcement_table = getNode('announcement_table');
var navbar_name = getNode("navbar_name");
var user_name = $.cookie('user');
var socket = io.connect();
var whitespacePattern = /^\s*$/; //used to test if a string is only consist of spaces

$(document).ready(function() {
    //console.log( "ready!" );
    //console.log("chat Name:"+user_name);
    //change name on Nav bar
    //console.log(navbar_name.textContent);
    navbar_name.textContent = 'Hi ' + user_name;
});

socket.emit('sendAn', "All");

// monitor input announcement and send to server
input_content_an.addEventListener('keydown', function(event) {
    //console.log('test input postAnnouncement' + input_content_an.value);
    var self = this;
    var timestamp = Date.parse(new Date()) / 1000;
    if (event.which === 13 && event.shiftKey === false && self.value != "" && !whitespacePattern.test(self.value)) {
        //console.log('name is: ' + user_name);
        //console.log('msg is: ' + self.value);
        //console.log('time is: ' + getDate(timestamp));
        socket.emit('postAnnouncement', {
            name: user_name,
            msg: input_content_an.value,
            time: getDate(timestamp)
        });
        input_content_an.value = '';
        event.preventDefault();
    }
});

socket.on('load announce', function(rows) {
    //console.log("Receiving old announcemessages");
    for (var i = 0; i < rows.length; i++) {
        //console.log("row:" + rows[i]);
        addAnnouncementMsg(rows[i].content, rows[i].src, rows[i].gmt_create);
    }
});

//receive announce_entry from server, and display
socket.on('announcement', function(data) {
    addAnnouncementMsg(data.msg, data.name, data.time);
    if (data.msg == "performance on") {
        if (data.name == user_name) {
            $(window.location).attr('href', '/perfmon');
        } else {
            $(window.location).attr('href', '/perfmon_msg');
        }
    }
});

function addAnnouncementMsg(content, src, gmt_create) {

    avatar_message_container = document.createElement('div');
    avatar_message_container.setAttribute('class', 'row msg_container base_sent');

    message_frame = document.createElement('div');
    message_frame.setAttribute('class', 'col-md-10 col-xs-10');
    message_frame.setAttribute('style', 'padding-right:0px;');
    message = document.createElement('div');
    message.setAttribute('class', 'messages msg_sent');

    msg_content = document.createElement('p');
    msg_content.textContent = content;
    msg_usertime = document.createElement('time');
    msg_usertime.textContent = src + ' • ' + formatAMPM(gmt_create);
    msg_status = document.createElement('span');

    avatar_frame = document.createElement('div');
    avatar_frame.setAttribute('class', 'col-md-2 col-xs-2 avatar');
    avatar_frame.setAttribute('style', 'padding-left:5px;');
    avatar_img = document.createElement('img');
    avatar_img.setAttribute('src', 'img/head.png');
    avatar_img.setAttribute('class', 'img-responsive');

    message.appendChild(msg_content);
    message.appendChild(msg_usertime);
    message_frame.appendChild(message);
    avatar_frame.appendChild(avatar_img);
    avatar_message_container.appendChild(message_frame);
    avatar_message_container.appendChild(avatar_frame);
    announcement_table.appendChild(avatar_message_container);
    announcement_table.insertBefore(avatar_message_container, null);

    updateScroll(announcement_table);
}

// When click "Announce" Button, an announcement will be pushed to server
function postAnnoucementButton() {
    //console.log('test postAnnoucementButton' + input_content_an.value);
    //console.log('user_name is ' + user_name);
    if (input_content_an.value != "" && !whitespacePattern.test(input_content_an.value)) {
        var date = new Date;
        var timestamp = Date.parse(new Date()) / 1000;
        //console.log('user_name is ' + user_name);
        //console.log('input_content_an is' + input_content_an.value);
        //console.log('time is: ' + date.toLocaleTimeString());
        socket.emit('postAnnouncement', {
            name: user_name,
            msg: input_content_an.value,
            time: getDate(timestamp)
        });
        input_content_an.value = '';
    }
}
