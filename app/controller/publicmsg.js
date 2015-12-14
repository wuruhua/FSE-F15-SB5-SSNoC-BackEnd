var Message = require('../model/message.js');

function publicmsg(content, status, src, ismsg,istest) {
    // console.log("before constructor, content: "+content);
    Message.call(this, content, src, "All", 1, status, ismsg,istest);
    // console.log("after constructor,content: "+ this.content);
}

publicmsg.prototype = Object.create(Message.prototype);
//publicmsg.prototype = new message();
publicmsg.prototype.constructor = publicmsg;


module.exports = publicmsg;
