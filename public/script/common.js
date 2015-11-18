var user_name = $.cookie('user');
var getNode = function(s) {
        return document.getElementById(s);
    }

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
    element.scrollTop = element.scrollHeight;
}

function changeStatusTo(newstatus) {
    var to = getNode('user');
    to = user_name;
    //console.log("username" + user_name);
    //console.log("newstatus" + newstatus);

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
    //console.log("==========>Start public Chat");
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
        if (rows != null) {
            //console.log(chatter);
            //console.log("Public message get success");
            $(window.location).attr('href', '/chat');
        }
    }).fail(function() {
        //console.log(chatter);
        //console.log("Public message get fail");
        $(window.location).attr('href', '/chat');
    });
}

function logoutButton(){
    socket.emit('logoutUser', {
            name : user_name,
            status : 0
        }); 
    // Check in console to see if the correct chatName has been sent to server
    //alert(chatName);
    $(window.location).attr('href', '/login'); 
}
