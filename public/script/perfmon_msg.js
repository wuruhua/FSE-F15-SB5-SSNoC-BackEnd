function init() {
    var socket = io.connect();
    socket.on('chatroom', function(data) {
        $(window.location).attr('href', "/chat");
    });
}

$(document).on('ready', init);
