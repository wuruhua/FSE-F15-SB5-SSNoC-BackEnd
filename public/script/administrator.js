var user_name = $.cookie('user');
var md5 = $.cookie('md5');
var socket = io.connect();
var adminlist = getNode("admin-list");
var usernode = getNode("user_node");
var dropdown_pri_self = getNode("dropdown_pri_self");
var dropdown_active_self = getNode("dropdown_active_self");
socket.emit('sendstatus', "All");

var banned_name = new Array("about", "access", "account", "accounts", "add", "address", "adm", "admin", "administration", "adult", "advertising", "affiliate", "affiliates", "ajax", "analytics", "android", "anon", "anonymous", "api", "app", "apps", "archive", "atom", "auth", "authentication", "avatar", "backup", "banner", "banners", "bin", "billing", "blog", "blogs", "board", "bot", "bots", "business", "chat", "cache", "cadastro", "calendar", "campaign", "careers", "cgi", "client", "cliente", "code", "comercial", "compare", "config", "connect", "contact", "contest", "create", "code", "compras", "css", "dashboard", "data", "db", "design", "delete", "demo", "design", "designer", "dev", "devel", "dir", "directory", "doc", "docs", "domain", "download", "downloads", "edit", "editor", "email", "ecommerce", "forum", "forums", "faq", "favorite", "feed", "feedback", "flog", "follow", "file", "files", "free", "ftp", "gadget", "gadgets", "games", "guest", "group", "groups", "help", "home", "homepage", "host", "hosting", "hostname", "html", "http", "httpd", "https", "hpg", "info", "information", "image", "img", "images", "imap", "index", "invite", "intranet", "indice", "ipad", "iphone", "irc", "java", "javascript", "job", "jobs", "js", "knowledgebase", "log", "login", "logs", "logout", "list", "lists", "mail", "mail1", "mail2", "mail3", "mail4", "mail5", "mailer", "mailing", "mx", "manager", "marketing", "master", "me", "media", "message", "microblog", "microblogs", "mine", "mp3", "msg", "msn", "mysql", "messenger", "mob", "mobile", "movie", "movies", "music", "musicas", "my", "name", "named", "net", "network", "new", "news", "newsletter", "nick", "nickname", "notes", "noticias", "ns", "ns1", "ns2", "ns3", "ns4", "old", "online", "operator", "order", "orders", "page", "pager", "pages", "panel", "password", "perl", "pic", "pics", "photo", "photos", "photoalbum", "php", "plugin", "plugins", "pop", "pop3", "post", "postmaster", "postfix", "posts", "profile", "project", "projects", "promo", "pub", "public", "python", "random", "register", "registration", "root", "ruby", "rss", "sale", "sales", "sample", "samples", "script", "scripts", "secure", "send", "service", "shop", "sql", "signup", "signin", "search", "security", "settings", "setting", "setup", "site", "sites", "sitemap", "smtp", "soporte", "ssh", "stage", "staging", "start", "subscribe", "subdomain", "suporte", "support", "stat", "static", "stats", "status", "store", "stores", "system", "tablet", "tablets", "tech", "telnet", "test", "test1", "test2", "test3", "teste", "tests", "theme", "themes", "tmp", "todo", "task", "tasks", "tools", "tv", "talk", "update", "upload", "url", "user", "username", "usuario", "usage", "vendas", "video", "videos", "visitor", "win", "ww", "www", "www1", "www2", "www3", "www4", "www5", "www6", "www7", "wwww", "wws", "wwws", "web", "webmail", "website", "websites", "webmaster", "workshop", "xxx", "xpg", "you", "yourname", "yourusername", "yoursite", "yourdomain");

function changePri(pri, username) {
    if (username === "my") {
        username = user_name;
    }

    var data = {
        username: username,
        pri: pri
    };
    $.ajax({
        url: '/admin/setpri/',
        type: 'post',
        data: data,
        success: function(data) {
            if (data.success === true) {
                alert(data.message);
                $(window.location).attr('href', '/administrator');
            } else {
                alert(data.message);
            }
        }
    });
}


$('#perfmon').on('click', function() {
    console.log("perfmon clicked");

    console.log("perfMeasureButton"); 
    {
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
function changeActive(active, username) {
    if (username === "my") {
        username = user_name;
    }

    var data = {
        username: username,
        active: active
    };
    $.ajax({
        url: '/admin/setactive/',
        type: 'post',
        data: data,
        success: function(data) {
            if (data.success === true) {
                alert(data.message);
                $(window.location).attr('href', '/administrator');
            } else {
                alert(data.message);
            }
        }
    });
}

function changeInfo(username) {
    var password = "";
    var old = "";
    var flag = false;
    if (username === "my") {
        old = user_name;
        username = $("#user_node").val();
        password = $("#password_node").val();
        flag = true;
    } else {
        old = $("#old_" + username).text();
        username = $("#username_" + old).val();
        password = $('#password_' + old).val();
    }
    var data = {
        old: old,
        username: username,
        password: password
    };
    if (data.password !== "" && data.password.length < 4) {
        alert("password should be at least 4 character long");
    } else if (data.username !== "" && data.username.length < 3) {
        alert("username should be at least 3 character long");
    } else if (data.username !== "" && isbanned(data.username)) {
        alert("username is banned, please change another name");
    } else {
        $.ajax({
            url: '/admin/setuserinfo/',
            type: 'post',
            data: data,
            success: function(data) {
                if (data.success === true) {
                    if (flag) {
                        alert(data.message);
                        alert("Your information is changed, please login again!");
                        logoutButton();
                    } else {
                        alert(data.message);
                        $(window.location).attr('href', '/administrator');
                    }
                } else {
                    alert(data.message);
                }
            }
        });
    }
}

socket.on('updateUserList', function(rows) {
    updatePriList(rows);
});

function updatePriList(rows) {
    adminlist.textContent = "";
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].username == user_name) {
            updatePriSelf(rows[i]);
        } else {
            updatePriUser(rows[i]);
        }
    }
}

function updatePriUser(row) {

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
    usr_info_old = document.createElement('div');
    usr_info_old.setAttribute('style', 'display: none;');
    usr_info_old.setAttribute('id', 'old_' + row.username);
    usr_info_old.textContent = row.username;

    usr_info_name = document.createElement('input');
    usr_info_name.setAttribute('id', 'username_' + row.username);
    usr_info_name.setAttribute('class', 'name');
    usr_info_name.setAttribute('placeholder', row.username);

    usr_info_password = document.createElement('input');
    usr_info_password.setAttribute('id', 'password_' + row.username);
    usr_info_password.setAttribute('class', 'password');
    usr_info_password.setAttribute('placeholder', '******');

    usr_info_name_title = document.createElement('td');
    usr_info_name_title.textContent = "Username:";

    usr_info_password_title = document.createElement('td');
    usr_info_password_title.textContent = "Password:";

    usr_info_change = document.createElement('button');
    usr_info_change.setAttribute('class', 'btn btn-xs btn-primary');
    usr_info_change.setAttribute('onclick', "changeInfo('" + row.username + "')");
    usr_info_change.textContent = "Change Info";


    usr_br = document.createElement('br');

    usr_pri = document.createElement('div');
    usr_pri.setAttribute("class", "dropdown" + row.username);
    usr_pri_btn = document.createElement("button");

    usr_pri_btn.setAttribute("id", "dropdown_pri_" + row.username);
    usr_pri_btn.setAttribute("type", "button");
    usr_pri_btn.setAttribute("data-toggle", "dropdown");

    usr_pri_span = document.createElement("span");
    usr_pri_span.setAttribute("class", "caret");
    usr_pri_ul = document.createElement("ul");
    usr_pri_ul.setAttribute("class", "dropdown-menu");

    usr_pri_li_admin = document.createElement("li");
    usr_pri_a_admin = document.createElement("a");
    usr_pri_a_admin.setAttribute('onclick', "changePri(1,'" + row.username + "')");
    usr_pri_a_admin.textContent = "Administrator";
    usr_pri_li_admin.appendChild(usr_pri_a_admin);

    usr_pri_li_Coordinator = document.createElement("li");
    usr_pri_a_Coordinator = document.createElement("a");
    usr_pri_a_Coordinator.setAttribute('onclick', "changePri(2,'" + row.username + "')");
    usr_pri_a_Coordinator.textContent = "Coordinator";
    usr_pri_li_Coordinator.appendChild(usr_pri_a_Coordinator);

    usr_pri_li_Monitor = document.createElement("li");
    usr_pri_a_Monitor = document.createElement("a");
    usr_pri_a_Monitor.setAttribute('onclick', "changePri(3,'" + row.username + "')");
    usr_pri_a_Monitor.textContent = "Monitor";
    usr_pri_li_Monitor.appendChild(usr_pri_a_Monitor);

    usr_pri_li_Citizen = document.createElement("li");
    usr_pri_a_Citizen = document.createElement("a");
    usr_pri_a_Citizen.setAttribute('onclick', "changePri(0,'" + row.username + "')");
    usr_pri_a_Citizen.textContent = "Citizen";
    usr_pri_li_Citizen.appendChild(usr_pri_a_Citizen);

    usr_pri_ul.appendChild(usr_pri_li_admin);
    usr_pri_ul.appendChild(usr_pri_li_Coordinator);
    usr_pri_ul.appendChild(usr_pri_li_Monitor);
    usr_pri_ul.appendChild(usr_pri_li_Citizen);

    //console.log(row.status);
    switch (row.pri) {

        case 1:
            {
                usr_pri_btn.textContent = 'Administrator';
                usr_pri_btn.setAttribute("class", "btn btn-xs btn-success dropdown-toggle");
                break;
            }
        case 2:
            {
                usr_pri_btn.textContent = 'Coordinator';
                usr_pri_btn.setAttribute("class", "btn btn-xs btn-warning dropdown-toggle");
                break;
            }
        case 3:
            {
                usr_pri_btn.textContent = 'Monitor';
                usr_pri_btn.setAttribute("class", "btn btn-xs btn-danger dropdown-toggle");
                break;
            }
        default:
            {
                usr_pri_btn.textContent = 'Citizen';
                usr_pri_btn.setAttribute("class", "btn btn-xs btn-default dropdown-toggle");
            }
    }

    usr_active = document.createElement('div');
    usr_active.setAttribute("class", "dropdown" + row.username);
    usr_active_btn = document.createElement("button");

    usr_active_btn.setAttribute("id", "dropdown_pri_" + row.username);
    usr_active_btn.setAttribute("type", "button");
    usr_active_btn.setAttribute("data-toggle", "dropdown");

    usr_active_span = document.createElement("span");
    usr_active_span.setAttribute("class", "caret");
    usr_active_ul = document.createElement("ul");
    usr_active_ul.setAttribute("class", "dropdown-menu");

    usr_active_li_Inactive = document.createElement("li");
    usr_active_a_Inactive = document.createElement("a");
    usr_active_a_Inactive.setAttribute('onclick', "changeActive(0,'" + row.username + "')");
    usr_active_a_Inactive.textContent = "Inactive";
    usr_active_li_Inactive.appendChild(usr_active_a_Inactive);

    usr_active_li_Active = document.createElement("li");
    usr_active_a_Active = document.createElement("a");
    usr_active_a_Active.setAttribute('onclick', "changeActive(1,'" + row.username + "')");
    usr_active_a_Active.textContent = "Active";
    usr_active_li_Active.appendChild(usr_active_a_Active);

    usr_active_ul.appendChild(usr_active_li_Active);
    usr_active_ul.appendChild(usr_active_li_Inactive);


    switch (row.is_active) {

        case 1:
            {
                usr_active_btn.textContent = 'Active';
                usr_active_btn.setAttribute("class", "btn btn-xs btn-info dropdown-toggle");
                break;
            }
        default:
            {
                usr_active_btn.textContent = 'Inactive';
                usr_active_btn.setAttribute("class", "btn btn-xs btn-default dropdown-toggle");
            }
    }

    //---------------------usr_pri----------------
    usr_pri_btn.appendChild(usr_pri_span);
    usr_pri.appendChild(usr_pri_btn);
    usr_pri.appendChild(usr_pri_ul);
    usr_active_btn.appendChild(usr_active_span);
    usr_active.appendChild(usr_active_btn);
    usr_active.appendChild(usr_active_ul);


    //---------------------clearfix------------------------
    usr_clearfix = document.createElement('div');
    usr_clearfix.setAttribute('class', 'clearfix');

    //-------------------put things together--------------
    usr_avatar_img.appendChild(usr_avatar_img_sub);
    usr_info.appendChild(usr_info_old);
    usr_info.appendChild(usr_info_name_title);
    usr_info.appendChild(usr_info_name);
    usr_info.appendChild(usr_info_password_title);
    usr_info.appendChild(usr_info_password);
    usr_info.appendChild(usr_br);
    usr_info.appendChild(usr_info_change);
    usr_info.appendChild(usr_pri);
    usr_info.appendChild(usr_active);

    usr_frame.appendChild(usr_avatar_img);
    usr_frame.appendChild(usr_info);
    usr_frame.appendChild(usr_clearfix);

    adminlist.appendChild(usr_frame);
    adminlist.insertBefore(usr_frame, null);

}

function updatePriSelf(row) {
    usernode.setAttribute('placeholder', row.username);
    var status_class = "";
    if (row.pri === 0) {
        status_class = "btn btn-xs btn-default dropdown-toggle";
        dropdown_pri_self.textContent = "Citizen";
    }
    if (row.pri === 1) {
        status_class = "btn btn-xs btn-success dropdown-toggle";
        dropdown_pri_self.textContent = "Administrator";
    }
    if (row.pri === 2) {
        status_class = "btn btn-xs btn-warning dropdown-toggle";
        dropdown_pri_self.textContent = "Coordinator";
    }
    if (row.pri == 3) {
        status_class = "btn btn-xs btn-danger dropdown-toggle";
        dropdown_pri_self.textContent = "Monitor";
    }

    var active_class = "";
    if (row.is_active === 0) {
        active_class = "btn btn-xs btn-default dropdown-toggle";
        dropdown_active_self.textContent = "Inactive";
    }
    if (row.is_active === 1) {
        active_class = "btn btn-xs btn-info dropdown-toggle";
        dropdown_active_self.textContent = "Active";
    }

    caret = document.createElement('span');
    caret.setAttribute('class', 'caret');

    dropdown_pri_self.setAttribute('class', status_class);
    dropdown_pri_self.appendChild(caret);
    dropdown_active_self.setAttribute('class', active_class);
    dropdown_active_self.appendChild(caret);
}

function isbanned(username) {
    for (var i = 0; i < banned_name.length; i++) {
        if (username == banned_name[i]) {
            return true;
        }
    }
    return false;
}
