var Message = require('../model/message.js');

function announcement(content, status, src, ismsg,istest) {
    // console.log("before constructor, content: "+content);
    Message.call(this, content, src, "All", 2, status, ismsg,istest);
    // console.log("after constructor,content: "+ this.content);
}

announcement.prototype = Object.create(Message.prototype);
//publicmsg.prototype = new message();
announcement.prototype.constructor = announcement;


module.exports = announcement;
