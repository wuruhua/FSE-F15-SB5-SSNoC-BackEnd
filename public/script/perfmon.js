function init() {
    var responseTxt;
    var getMsgTableContent;
    var realTestTime = 1;
    var isTestOnGoing = false;
    var isGetTestOnGoing = false;
    var isNotRunOutOfTime = true;
    var testStartTime;
    var globalstop;
    var in_get;
    var in_post;
    var pausetime;
    var pausediff;
    var temptime;
    var tmpTime;
    var isOutOfMemory;
    var alertText;
    var testMsg = "1a1a1a1a1a1a1a1a1a1a";
    var socket = io.connect();
    var task;
    var tcnt = 0;
    var get_task;
    var gcnt = 0;
    var processedPostCount = 0;
    var PostCount = 0;
    var processedGetCount = 0;
    var GetCount = 0;
    var testTime = 0;
    $("#totalpost").html(0);
    $("#postpersec").html(0);
    $("#totalget").html(0);
    $("#getpersec").html(0);
    $("#avgtimeperpost").html(0);
    $("#avgtimeperget").html(0);

    socket.on('chatroom', function() {
        $(window.location).attr('href', '/chatroom');
    });

    function getMsg() {
        $.ajax({
            url: '/user/getTestMsg',
            type: 'get',
            crossDomain: true,
            dataType: 'json'
        }).done(function(rows) {
            getMsgTableContent = rows;

            //console.log("getMsgTableContent" + rows.length);
            if (rows.length) {
                tmpTime = new Date().getTime();


                if (in_get) {
                    testStartTime = testStartTime + in_get;
                    testTime = testTime - in_get;

                    in_get = 0;
                }

                if (pausediff) {
                    tmpTime = tmpTime - pausediff;
                }
                //console.log("gStartTime" + testStartTime);
                //console.log("gCurrentTime" + tmpTime);
                //console.log("gTimediff" + (tmpTime - testStartTime));
                //console.log("in_get" + in_get);
                //console.log("testTime" + testTime);
                if (tmpTime - (testStartTime) >= testTime) {
                    alertText = "Test Time Is Over";
                    alert(alertText);
                    $.ajax({
                        url: '/user/perfDelete',
                        type: 'POST',
                        crossDomain: true,
                        dataType: 'json'
                    }).done(function(data) {
                        responseTxt = data;
                    });
                } else if (globalstop == 1) {
                    console.log("Test is paused");
                    alert("Test is paused/stoppped");
                    in_get = (tmpTime - testStartTime);

                } else {
                    processedGetCount = processedGetCount + 1;
                    //console.log("processedGetCount" + processedGetCount);
                    //console.log("GetCount" + GetCount);
                    $("#totalget").html(processedGetCount);
                    $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                    $("#avgtimeperget").html((realTestTime / (processedGetCount * 1000)).toFixed(3));
                    getMsg();
                }
            }
        });
    }

    function insertMsg() {
        var timestamp = Date.parse(new Date()) / 1000;
        var sendMsg = {
            cont: testMsg,
            timestamp: getDate(timestamp)
        }
        $.ajax({
            url: '/user/insertTestMsg',
            type: 'post',
            data: sendMsg,
            crossDomain: true,
            dataType: 'json'
        }).done(function(data) {
            responseTxt = data;
            //console.log("responseTxt" + responseTxt);
            tmpTime = new Date().getTime();
            if (in_post) {
                testStartTime = testStartTime + in_post;
                testTime = testTime - in_post;
                in_post = 0;
            }
            if (pausediff) {
                tmpTime = tmpTime - pausediff;
            }
            //console.log("iStartTime" + testStartTime);
            //console.log("iCurrentTime" + tmpTime);
            //console.log("iTimediff" + (tmpTime - testStartTime));
            //console.log("in_post" + in_post);
            //console.log("testTime" + testTime);
            if (responseTxt === "Out Of Memory") {
                alertText = "Out Of Memory In Backend";
                alert(alertText);
            } else if (tmpTime - (testStartTime) >= testTime) {
                alertText = "Test Time Is Over";
                //alert(alertText);
                //console.log("Sending getTestMsg");
                testStartTime = new Date().getTime();
                testTime = temptime;
                pausediff = 0;
                in_post = 0;
                in_get = 0;
                getMsg();
            } else if (globalstop == 1) {
                //console.log("Test is paused");
                alert("Test is paused/stoppped");
                in_post = (tmpTime - testStartTime);
            } else {
                processedPostCount = processedPostCount + 1;
                realTestTime = tmpTime - testStartTime;
                $("#totalpost").html(processedPostCount);
                //console.log("One message inserted" + "@@@@@@@@@ current post" + processedPostCount + "@@@@@@ calculated:" + ((processedPostCount / realTestTime) * 1000).toFixed(1));
                $("#postpersec").html(((processedPostCount / realTestTime) * 1000).toFixed(2));
                $("#avgtimeperpost").html((realTestTime / (processedPostCount * 1000)).toFixed(3));
                insertMsg();
            }
        });
    }

    $('#start').on('click', function(e) {
        $("#totalpost").html(0);
        $("#postpersec").html(0);
        $("#totalget").html(0);
        $("#getpersec").html(0);
        $("#avgtimeperpost").html(0);
        $("#avgtimeperget").html(0);
        PostCount = 0;
        GetCount = 0;
        globalstop = 0;
        in_get = 0;
        in_post = 0;
        pausetime = 0;
        pausediff = 0;
        testTime = $('#testTime').val();
        if (testTime == '') {
            //console.log("Test time or test message is empty");
            alert("Test time or test message is empty");
        } else if (isNaN(testTime)) {
            //console.log("Test time should be a number");
            alert("Test time should be a number");
        } else {
            testTime = testTime * 500;
            temptime = testTime;
            //console.log("Time" + testTime);
            //console.log("msg" + testMsg);
            processedPostCount = 0;
            processedGetCount = 0;

            isTestOnGoing = true;
            isNotRunOutOfTime = true;
            isOutOfMemory = false;
            alertText = "";

            realTestTime = 1;
            tmpTime = 0;
            testStartTime = new Date().getTime();

            $("#totalpost").html(0);
            $("#postpersec").html(0);
            $("#totalget").html(0);
            $("#getpersec").html(0);

            $.ajax({
                url: '/user/perfSetup',
                type: 'post',
                crossDomain: true,
                dataType: 'text'
            }).done(function(data) {
                responseTxt = data;
                if (responseTxt = "TestMessageTableCreated") {
                    testStartTime = new Date().getTime();
                    //console.log("Ongoing " + testStartTime);
                    var timestamp = Date.parse(new Date()) / 1000;
                    var sendMsg = {
                        cont: testMsg,
                        timestamp: getDate(timestamp)
                    }

                    $.ajax({
                        url: '/user/insertTestMsg',
                        type: 'post',
                        data: sendMsg,
                        crossDomain: true,
                        dataType: 'json'
                    }).done(function(data) {
                        responseTxt = data;
                        //console.log("responseTxt" + responseTxt);
                        tmpTime = new Date().getTime();
                        //console.log("StartTime" + testStartTime);
                        //console.log("CurrentTime" + tmpTime);
                        //console.log("Timediff" + (tmpTime - testStartTime));
                        if (in_post) {
                            testStartTime = testStartTime + in_post;
                            testTime = testTime - in_post;
                            in_post = 0;
                        }

                        if (responseTxt === "Out Of Memory") {
                            alertText = "Out Of Memory In Backend";
                            alert(alertText);
                        } else if (tmpTime - (testStartTime + pausediff) >= testTime) {
                            alertText = "Test Time Is Over";
                            //console.log("Sending getTestMsg");
                            testStartTime = new Date().getTime();
                            getMsg();

                        } else if (globalstop == 1) {
                            //console.log("Test is paused");
                            alert("Test is paused/stoppped");
                            in_post = (tmpTime - testStartTime);
                        } else {
                            processedPostCount = processedPostCount + 1;
                            realTestTime = tmpTime - testStartTime;
                            $("#totalpost").html(processedPostCount);
                            //console.log("One message inserted" + "@@@@@@@@@ current post" + processedPostCount + "@@@@@@ calculated:" + ((processedPostCount / realTestTime) * 1000).toFixed(1));
                            $("#postpersec").html(((processedPostCount / realTestTime) * 1000).toFixed(2));
                            $("#avgtimeperpost").html((realTestTime / (processedPostCount * 1000)).toFixed(3));
                            insertMsg();
                        }
                    });

                    /*  console.log("Sending getTestMsg");
                      $.ajax({
                          url: '/user/getTestMsg',
                          type: 'get',
                          crossDomain: true,
                          dataType: 'json'
                      }).done(function (rows) {
                         getMsgTableContent = rows;
                      
                         console.log("getMsgTableContent" + rows.length);
                         if(rows.length) 
                         {
                            tmpTime = new Date().getTime();
                            console.log("StartTime" +testStartTime);
                            console.log("CurrentTime" +tmpTime);
                            console.log("Timediff"+(tmpTime - testStartTime));
                            if(tmpTime - testStartTime >= testTime) 
                            {    
                               alertText ="Test Time Is Over";
                               alert(alertText);
                               $.ajax({
                                  url: '/user/perfDelete',
                                  type: 'POST',
                                  crossDomain: true, 
                                  dataType: 'json'
                               }).done(function (data) {
                               responseTxt = data;
                               });
                            }
                            else
                            {
                               processedGetCount = processedGetCount + 1;
                               console.log("processedGetCount"+processedGetCount);
                               console.log("GetCount"+GetCount);
                               $("#totalget").html(processedGetCount);
                               $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                               $("#avgtimeperget").html((realTestTime/(processedGetCount * 1000)).toFixed(3));
                               getMsg();
                            }
                          }
                      });*/
                }
            });
        }
    });

    $('#stop').click(function() {
        console.log("stop button clicked");
        globalstop = 1;
        $.ajax({
            url: '/user/perfDelete',
            type: 'POST',
            crossDomain: true,
            dataType: 'json'
        }).done(function(data) {
            responseTxt = data;
        });
        socket.emit('stopmeasure', "All");
    });

    $('#pause').click(function() {
        //console.log("Pause button clicked");
        if (globalstop == 0) {
            globalstop = 1;
            pausetime = (new Date().getTime());
        } else if (globalstop == 1) {
            globalstop = 0;
            pausediff = ((new Date().getTime()) - pausetime);
            //console.log("in_post" + in_post);
            //console.log("in_get" + in_get);
            //console.log("pausediff" + pausediff);
            if (in_post) {
                insertMsg();
            } else if (in_get) {
                getMsg();
            }
        }
    });

    //change timestamp to normal time
    function getDate(timestamp) {
        var tt = new Date(parseInt(timestamp) * 1000).toLocaleString();
        return tt;
    }
}

$(document).on('ready', init);
