function init() {
    var socket = io.connect();
    socket.on('chatroom', function() {
        $(window.location).attr('href', '/chatroom');
    });
}

$(document).on('ready', init);
