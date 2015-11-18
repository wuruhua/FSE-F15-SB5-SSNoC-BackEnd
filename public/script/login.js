/**
 * Handle login and register
 * @author zhengang.wei@sv.cmu.edu<br/>
 * 2015-10-1
 * @amendment liyuan.ding@sv.cmu.edu<br/>
 * 2015-11-2
 */

//An array store all the banned name
var banned_name = new Array("about", "access", "account", "accounts", "add", "address", "adm", "admin", "administration", "adult", "advertising", "affiliate", "affiliates", "ajax", "analytics", "android", "anon", "anonymous", "api", "app", "apps", "archive", "atom", "auth", "authentication", "avatar", "backup", "banner", "banners", "bin", "billing", "blog", "blogs", "board", "bot", "bots", "business", "chat", "cache", "cadastro", "calendar", "campaign", "careers", "cgi", "client", "cliente", "code", "comercial", "compare", "config", "connect", "contact", "contest", "create", "code", "compras", "css", "dashboard", "data", "db", "design", "delete", "demo", "design", "designer", "dev", "devel", "dir", "directory", "doc", "docs", "domain", "download", "downloads", "edit", "editor", "email", "ecommerce", "forum", "forums", "faq", "favorite", "feed", "feedback", "flog", "follow", "file", "files", "free", "ftp", "gadget", "gadgets", "games", "guest", "group", "groups", "help", "home", "homepage", "host", "hosting", "hostname", "html", "http", "httpd", "https", "hpg", "info", "information", "image", "img", "images", "imap", "index", "invite", "intranet", "indice", "ipad", "iphone", "irc", "java", "javascript", "job", "jobs", "js", "knowledgebase", "log", "login", "logs", "logout", "list", "lists", "mail", "mail1", "mail2", "mail3", "mail4", "mail5", "mailer", "mailing", "mx", "manager", "marketing", "master", "me", "media", "message", "microblog", "microblogs", "mine", "mp3", "msg", "msn", "mysql", "messenger", "mob", "mobile", "movie", "movies", "music", "musicas", "my", "name", "named", "net", "network", "new", "news", "newsletter", "nick", "nickname", "notes", "noticias", "ns", "ns1", "ns2", "ns3", "ns4", "old", "online", "operator", "order", "orders", "page", "pager", "pages", "panel", "password", "perl", "pic", "pics", "photo", "photos", "photoalbum", "php", "plugin", "plugins", "pop", "pop3", "post", "postmaster", "postfix", "posts", "profile", "project", "projects", "promo", "pub", "public", "python", "random", "register", "registration", "root", "ruby", "rss", "sale", "sales", "sample", "samples", "script", "scripts", "secure", "send", "service", "shop", "sql", "signup", "signin", "search", "security", "settings", "setting", "setup", "site", "sites", "sitemap", "smtp", "soporte", "ssh", "stage", "staging", "start", "subscribe", "subdomain", "suporte", "support", "stat", "static", "stats", "status", "store", "stores", "system", "tablet", "tablets", "tech", "telnet", "test", "test1", "test2", "test3", "teste", "tests", "theme", "themes", "tmp", "todo", "task", "tasks", "tools", "tv", "talk", "update", "upload", "url", "user", "username", "usuario", "usage", "vendas", "video", "videos", "visitor", "win", "ww", "www", "www1", "www2", "www3", "www4", "www5", "www6", "www7", "wwww", "wws", "wwws", "web", "webmail", "website", "websites", "webmaster", "workshop", "xxx", "xpg", "you", "yourname", "yourusername", "yoursite", "yourdomain");

$("#login-btn").click(function() {
    //set the inform to default
    $("#statusmsg").html("");
    //if the username and password is empty, inform the user
    if ($("#username").val() == "" || $("#password").val() == "") {
        $("#statusmsg").html("username and password can't be empty");
    } else {
        //post request of login
        $.ajax({
            url: '/user/login',
            type: 'post',
            crossDomain: true,
            data: {
                username: $("#username").val(),
                password: $("#password").val()
            },
            dataType: "json",
            success: function(data) {
                //data.success is true: login success
                if (data.success == true) {
                    $(window.location).attr('href', '/contactlist');
                } else {
                    //data.success is false: login fail
                    //data.code is 2: name is not existed
                    if (data.code == 12) {
                        //register();
                        $("#statusmsg").html(data.message);
                    }
                    //data.code is 3: name is existed but password is wrong
                    else if (data.code == 13) {
                        $("#statusmsg").html(data.message);
                    } else {
                        //alert("Unhandled error!")
                    }
                }
            },
            error: function() {
                //alert("Server Error!")
            }
        });
    }
});

$("#register-btn").click(function() {
    //set the inform to be default
    $("#statusmsg").html("");
    //console.log("1-1");
    //if the username, password and repassword is empty, inform the user
    if ($("#username").val() == "" || $("#password").val() == "" || $("#repassword").val() == "") {
        //console.log("1");
        $("#statusmsg").html("username and password can't be empty");
    } else if ($("#password").val() != $("#repassword").val()) {
        //console.log("2");
        $("#statusmsg").html("password not same");
    } else if ($("#password").val().length < 4) {
        //console.log("3");
        $("#statusmsg").html("password should be at least 4 character long");
    } else if ($("#username").val().length < 3) {
        //console.log("4");
        $("#statusmsg").html("username should be at least 3 character long");
    } else if (isbanned($("#username").val())) {
        //console.log("5");
        $("#statusmsg").html("username is banned, please change another name");
    } else {
        //console.log("6");
        $("#statusmsg").html("");
        $.ajax({
            url: '/user/register',
            type: 'post',
            crossDomain: true,
            data: {
                username: $("#username").val(),
                password: $("#password").val(),
                repassword: $('#repassword').val()
            },
            dataType: "json",
            success: function(data) {
                if (data.success == true) {
                    $(window.location).attr('href', '/welcome');
                } else {
                    if (data.code == 22) {
                        $("#statusmsg").html(data.message);
                    }
                }
            }
        });
    }
});

$("#register-link").click(function() {
    //set the inform to default
    $("#statusmsg").html("");
    $("#repassword").show();
    $("#register-btn").show();
    $("#login-btn").hide();
    $("#login-link").show();
    $("#register-link").hide();
});

$("#login-link").click(function() {
    //set the inform to default
    $("#statusmsg").html("");
    $("#repassword").hide();
    $("#register-btn").hide();
    $("#login-btn").show();
    $("#login-link").hide();
    $("#register-link").show();
});

/**
 * Check the username, if it is banned
 * @param username
 * @return true if name is banned, false if name is not banned
 */
function isbanned(username) {
    for (var i = 0; i < banned_name.length; i++) {
        if (username == banned_name[i]) {
            return true;
        }
    }
    return false;
}
