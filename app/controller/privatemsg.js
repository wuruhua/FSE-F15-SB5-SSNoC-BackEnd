var Message = require('../model/message.js');

function privatemsg(content, status, src, dest, ismsg,istest) {
    // console.log("before constructor, content: "+content);
    Message.call(this, content, src, dest, 1, status, ismsg,istest);
    // console.log("after constructor,content: "+ this.content);
}

privatemsg.prototype = Object.create(Message.prototype);
//publicmsg.prototype = new message();
privatemsg.prototype.constructor = privatemsg;


module.exports = privatemsg;
