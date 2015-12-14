var user_name = $.cookie('user');
var navbar_name = getNode("navbar_name");
var socket = io.connect();

$(document).ready(function() {
    console.log("ready!");

    console.log("chat Name:" + user_name);
    socket.emit('PerfCheck', "welcome");

    //Receive and update user list. Note: the user list can only be added or updated. No deleted is of user case
    socket.on('PerfGet', function() {
        //local_user_list[nameCard.name] = nameCard.status;
        //console.log("update list");
        $(window.location).attr('href', '/perfmon_msg');

    });

    //change name on Nav bar
    console.log(navbar_name.textContent);
    navbar_name.textContent = 'Hi ' + user_name;
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
            page: "welcome"
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
        //	input_content_an.textContent = '';
    }

});
//receive announce_entry from server, and display
socket.on('announcement', function(data) {

    console.log("welcome page: data.msg" + data.msg);
    console.log("welcome page: data.name" + data.name);
    console.log("user_name" + user_name);

    if (data.msg == "performance on") {
        if (data.name == user_name) {
            $.cookie("perf_master", "welcome");
            $(window.location).attr('href', '/perfmon');
        } else {
            $.cookie("perf_slave", "welcome");
            $(window.location).attr('href', '/perfmon_msg');

        }
    }

});
