var dialog_table = getNode('dialog_table');
var announcement_table = getNode("announcement_table");
$("#status_type").selectpicker('hide');
$("#load_more").hide();
$("#search_chat").click(function() {
    var search_content = $('#search_chat_msg').val();
    var url = "";
    cleanchild(dialog_table);
    var type = $("#search_chat_type").val();
    if (type == "Public") {
        url = "/search/publicmsg";
    }
    if (type == "Private") {
        url = "/search/privatemsg";
    }
    $.ajax({
        url: url,
        type: 'post',
        crossDomain: true,
        data: {
            message: search_content
        },
        dataType: "json",
        success: function(data) {
            $("#load_more").hide();
            var count = 0;
            addMessageFromOthers("admin", data.message, getDate(getTimestamp()), "Status: OK @00:00:00 AM");
            if (type == "Public") {
                if (data.publicmsg.length > 10) {
                    for (var i = 0; i < 10; i++) {
                        if (data.publicmsg[i].src == user_name) {
                            addMessageFromSelf(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                        } else {
                            addMessageFromOthers(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                        }
                    }
                    count = count + 10;
                    $("#load_more").show();
                } else {
                    for (var i = 0; i < data.publicmsg.length; i++) {
                        if (data.publicmsg[i].src == user_name) {
                            addMessageFromSelf(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                        } else {
                            addMessageFromOthers(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                        }
                    }
                }
                $("#load_more").click(function() {
                    $("#load_more").hide();
                    if (count < data.publicmsg.length) {
                        for (var i = count; i < count + 10; i++) {
                            if (i < data.publicmsg.length) {
                                if (data.publicmsg[i].src == user_name) {
                                    addMessageFromSelf(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                                } else {
                                    addMessageFromOthers(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                                }
                            }
                        }
                        count = count + 10;
                        if (count < data.publicmsg.length) {
                            $("#load_more").show();
                        }
                    }
                });
            }
            if (type == "Private") {
                if (data.privatemsg.length > 10) {
                    for (var i = 0; i < 10; i++) {
                        if (data.privatemsg[i].src == user_name) {
                            addMessageFromSelf(data.privatemsg[i].src, data.privatemsg[i].content, data.privatemsg[i].gmt_create, data.privatemsg[i].usr_sts);
                        } else {
                            addMessageFromOthers(data.privatemsg[i].src, data.privatemsg[i].content, data.privatemsg[i].gmt_create, data.privatemsg[i].usr_sts);
                        }
                    }
                    count = count + 10;
                    $("#load_more").show();
                } else {
                    for (var i = 0; i < data.privatemsg.length; i++) {
                        if (data.privatemsg[i].src == user_name) {
                            addMessageFromSelf(data.privatemsg[i].src, data.privatemsg[i].content, data.privatemsg[i].gmt_create, data.privatemsg[i].usr_sts);
                        } else {
                            addMessageFromOthers(data.privatemsg[i].src, data.privatemsg[i].content, data.privatemsg[i].gmt_create, data.privatemsg[i].usr_sts);
                        }
                    }
                }
                $("#load_more").click(function() {
                    $("#load_more").hide();
                    if (count < data.publicmsg.length) {
                        for (var i = count; i < count + 10; i++) {
                            if (i < data.publicmsg.length) {
                                if (data.publicmsg[i].src == user_name) {
                                    addMessageFromSelf(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                                } else {
                                    addMessageFromOthers(data.publicmsg[i].src, data.publicmsg[i].content, data.publicmsg[i].gmt_create, data.publicmsg[i].usr_sts);
                                }
                            }
                        }
                        count = count + 10;
                        if (count < data.publicmsg.length) {
                            $("#load_more").show();
                        }
                    }
                });
            }

        },
        error: function() {
            //alert("Server Error!")
        }
    });
});

$("#search_user").click(function() {
    var search_content = $('#contact-list-search').val();
    var search_status = $("#status_type").val();
    var url = "";
    //cleanchild(dialog_table);
    var type = $("#search_user_type").val();
    if (type == "Name") {
        url = "/search/userlistbyname";
    }
    if (type == "Status") {
        url = "/search/userlistbystatus";
    }
    $.ajax({
        url: url,
        type: 'post',
        crossDomain: true,
        data: {
            username: search_content,
            status: search_status
        },
        dataType: "json",
        success: function(data) {
            contactlist.textContent = "";
            for (var i = 0; i < data.userlist.length; i++) {
                if (data.userlist[i].username == user_name) {
                    //do nothing
                } else {
                    updateSingleUser(data.userlist[i]);
                }
            }
        },
        error: function() {
            //alert("Server Error!")
        }
    });
});

$("#search_announcement").click(function() {
    var search_content = $('#contact-list-search').val();
    var url = "/search/announcement";
    //cleanchild(dialog_table);
    $.ajax({
        url: url,
        type: 'post',
        crossDomain: true,
        data: {
            announcement: search_content
        },
        dataType: "json",
        success: function(data) {
            var count = 0;
            announcement_table.textContent = "";
            var rows = data.announcement;
            addAnnouncementMsg(data.message, "admin", getDate(getTimestamp()));
            if (rows.length > 10) {
                for (var i = 0; i < 10; i++) {
                    addAnnouncementMsg(rows[i].content, rows[i].src, rows[i].gmt_create);
                }
                count = count + 10;
                $("#load_more").show();
            } else {
                for (var i = 0; i < rows.length; i++) {
                    addAnnouncementMsg(rows[i].content, rows[i].src, rows[i].gmt_create);
                }
            }
            $("#load_more").click(function() {
                $("#load_more").hide();
                if (count < rows.length) {
                    for (var i = count; i < count + 10; i++) {
                        if (i < rows.length) {
                            addAnnouncementMsg(rows[i].content, rows[i].src, rows[i].gmt_create);
                        }
                    }
                    count = count + 10;
                    if (count < rows.length) {
                        $("#load_more").show();
                    }
                }
            });

        },
        error: function() {
            //alert("Server Error!")
        }
    });
});

$("#search_user_type").on('change', function() {
    if ($("#search_user_type").val() == "Status") {
        $("#contact-list-search").hide();
        $("#status_type").selectpicker('show');
    } else {
        $("#contact-list-search").show();
        $("#status_type").selectpicker('hide');
    }
})

function cleanchild(myNode) {
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}
