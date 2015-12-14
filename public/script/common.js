var socket = io.connect();
var username = $.cookie('user');

var getNode = function(s) {
    return document.getElementById(s);
};
//change timestamp to hour format
function formatAMPM(timestamp) {
    var date = new Date(timestamp*1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
}

//change timestamp to normal time
function getDate(timestamp) {
    var tt = new Date(parseInt(timestamp) * 1000).toLocaleString();
    return tt;
}

function getTimestamp() {
    var timestamp = Date.parse(new Date()) / 1000;
    return timestamp;
}

function updateScroll(element) {
    'updateScroll done';
    element.scrollTop = element.scrollHeight;
}

function changeStatusTo(newstatus) {
    var user_name = $.cookie('user');
    var to = getNode('user');
    to = user_name;
    console.log("username" + user_name);
    console.log("newstatus" + newstatus);

    var data = {
        "user": user_name,
        "status": newstatus
    };
    $.ajax({
        url: '/user/updateStatus/',
        type: 'PUT',
        data: data,
        success: function(data) {
            $(window.location).attr('href', '/contactlist');
        }
    });
}

function publicChatwith() {
    console.log("==========>Start public Chat");
    // $.cookie("chat-type", "public");
    var chatter = {
        audience: ""
    };
    $.ajax({
        url: '/user/setAudience',
        type: 'post',
        data: chatter,
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows !== null) {
            console.log(chatter);
            console.log("Public message get success");
            $(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        console.log(chatter);
        console.log("Public message get fail");
        $(window.location).attr('href', '/chat');
    });
}

function privateChatwith(to_name) {
    console.log("=====>Start private Chat");
    var chatter = {
        audience: to_name
    };
    //var author = $.cookie("user");
    //$.cookie("chat-type","private");
    $.ajax({
        url: '/user/setAudience',
        type: 'post',
        data: chatter,
        crossDomain: true,
        dataType: 'json'
    }).done(function(rows) {
        if (rows !== null) {
            console.log(chatter);
            console.log("Private message get success");
            $(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        console.log(chatter);
        console.log("Private message get fail");
        $(window.location).attr('href', '/chat');
    });

    //clear cookie of new message for to_name
    createCookie('new_msg_' + to_name, 0, 100);
}

function logoutButton() {
    socket.emit('logoutUser', {
        name: user_name,
        status: 0
    });
    // Check in console to see if the correct chatName has been sent to server
    //alert(chatName);
    cleancookie();
    $(window.location).attr('href', '/login');
}

function sleep(time) {
    //do some things
    setTimeout(continueExecution, time); //wait ten seconds before continuing
}

function continueExecution() {
    //finish doing things after the pause
}

socket.on('updatePri_' + username, function(data) {
    createCookie("pri", data.cookie, 1);
});

socket.on('Logout_' + username, function(data) {
    alert(data.message);
    logoutButton();
});

function cleancookie() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        createCookie(cookies[i].split("=")[0], "", -1);
    }
}

function createCookie(name, value, days) {
    console.log("set cookie" + name + " " + value);
    var expires ;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
       expires = "; expires=" + date.toGMTString();
    } else {
         expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function checkadmin() {
    $.ajax({
        url: '/admin/isadmin',
        type: 'get',
        crossDomain: true,
        dataType: "json",
        success: function(data) {
            //data.success is true: login success
            if (data.success !== true) {
                alert(data.message);
                $(window.location).attr('href', '/chat');
            }
        },
        error: function() {
            //alert("Server Error!")
        }
    });
}

function checkmonitor() {
    $.ajax({
        url: '/admin/ismonitor',
        type: 'get',
        crossDomain: true,
        dataType: "json",
        success: function(data) {
            //data.success is true: login success
            if (data.success !== true) {
                alert(data.message);
                $(window.location).attr('href', '/chat');
            }
        },
        error: function() {
            //alert("Server Error!")
        }
    });
}

function iscitizen() {
    $.ajax({
        url: '/admin/iscitizen',
        type: 'get',
        crossDomain: true,
        dataType: "json",
        success: function(data) {
            //data.success is true: login success
            if (data.success !== true) {
                alert(data.message);
                $(window.location).attr('href', '/login');
            }
        },
        error: function() {
            //alert("Server Error!")
        }
    });
}
