var user_name = $.cookie('user');
var navbar_name = getNode("navbar_name");

$(document).ready(function() {
    //console.log("ready!");

    //console.log("chat Name:" + user_name);

    //change name on Nav bar
    //console.log(navbar_name.textContent);
    navbar_name.textContent = 'Hi ' + user_name;
});
