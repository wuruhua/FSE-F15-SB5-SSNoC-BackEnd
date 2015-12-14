/*jslint loopfunc: true */
var navbar_name = document.getElementById("navbar_name");
var user_name = $.cookie('user');
var md5 = $.cookie('md5');
navbar_name.textContent = 'Hi ' + user_name;

function init() {
    var responseTxt;
    var realTestTime = 1;
    var isTestOnGoing = false;
    var isNotRunOutOfTime = true;
    var testStartTime;
    var sync_on = 0;
    var async_on = 0;
    var req_int = 0;

    var peakRspTime0 = [];
    var peakRspTime1 = [];
    var peakRspTime2 = [];
    var peakRspTime3 = [];

    /*var post_throughput_rate = [];
    var get_throughput_rate = [];*/
    var post_response_time = [];
    var get_response_time = [];

    var post_prt = 0;
    var get_prt = 0;
    var postcnt = 0;
    var getcnt = 0;
    var errcnt = 0;
    var post_get = 1;
    var postObjArr = [];
    var getObjArr = [];
    var postObj;
    var getObj;
    var rps;
    var tmpTime;
    var isOutOfMemory;

    var testMsg = "1a1a1a1a1a1a1a1a1a1a";

    var socket = io.connect();
    var task;
    var in_start = 0;
    var processedPostCount = 0;
    var OutstandingPost = 0;
    var OutstandingGet = 0;
    var PostCount = 0;
    var processedGetCount = 0;
    var GetCount = 0;
    var testTime = 0;
    var uptime = 0;
    var uptime_string = '';

    function resInit() {
        $("#totalpost").html(0);
        $("#postpersec").html(0);
        $("#totalget").html(0);
        $("#getpersec").html(0);
        $("#avgtimeperpost").html(0);
        $("#avgtimeperget").html(0);
        $("#rps").html(0);
        $("#errcnt").html(0);
        $("#postprt").html(0);
        $("#getprt").html(0);

        $("#thead").show();
        $("#performance_chart").show();
        $("#request_chart").hide();
        $("#response_chart").hide();
        $("#throughput_chart").hide();

        peakRspTime0 = [];
        peakRspTime1 = [];
        peakRspTime2 = [];
        peakRspTime3 = [];
        postObjArr = [];
        getObjArr = [];
        /*post_throughput_rate = [];
        get_throughput_rate = [];*/
        post_response_time = [];
        get_response_time = [];

        PostCount = 0;
        GetCount = 0;
        post_prt = 0;
        get_prt = 0;
        in_start = 1;
        uptime_string = '';
        $("#uptime").html('');
    }

    //change timestamp to normal time
    function getDate(timestamp) {
        var tt = new Date(parseInt(timestamp) * 1000).toLocaleString();
        return tt;
    }


    function displayuptime(uptime) {
        var minutes = 1000 * 60;
        var hours = minutes * 60;
        var days = hours * 24;
        var years = days * 365;
        if (uptime > years) {
            uptime_string = Math.round(uptime / years) + " years ";
            uptime = uptime - years;
        }

        if (uptime > days) {
            uptime_string += Math.round(uptime / days) + " days ";
            if (uptime > (days * Math.round(uptime / days)))
                uptime = uptime - (days * Math.round(uptime / days));
            else
                uptime = (days * Math.round(uptime / days)) - uptime;
        }

        if (uptime > hours) {
            uptime_string += Math.round(uptime / hours) + " hours ";
            if (uptime > (hours * Math.round(uptime / hours)))
                uptime = uptime - (hours * Math.round(uptime / hours));
            else
                uptime = (hours * Math.round(uptime / hours)) - uptime;
        }

        if (uptime > minutes) {
            uptime_string += Math.round(uptime / minutes) + " minutes ";
            if (uptime > (minutes * Math.round(uptime / minutes)))
                uptime = uptime - (minutes * Math.round(uptime / minutes));
            else
                uptime = (minutes * Math.round(uptime / minutes)) - uptime;
        }
        if (uptime < minutes) {
            uptime_string += Math.round(uptime / 1000) + " seconds ";
        }
        return uptime_string;
    }


    var perf_master = $.cookie('perf_master');
    console.log("perf_master" + perf_master);

    socket.on('chatroom', function() {

        $(window.location).attr('href', "/" + $.cookie("perf_master"));
    });


    $("input[name='sync']").on("click", function() {
        if ($("input[name='sync']").is(":checked")) {
            sync_on = 1;
            $("input[name='async']").prop("disabled", true);
        }
        if ($("input[name='sync']").is(":not(:checked)")) {
            sync_on = 0;
            $('#testTime').val('');
            $('#reqInterval').val('');
            $("input[name='async']").prop("disabled", false);
        }
    });

    $("input[name='async']").on("click", function() {
        if ($("input[name='async']").is(":checked")) {
            $("input[name='sync']").prop("disabled", true);
            async_on = 1;
        }
        if ($("input[name='async']").is(":not(:checked)")) {
            async_on = 0;
            $('#testTime').val('');
            $('#reqInterval').val('');
            $("input[name='sync']").prop("disabled", false);
        }
    });




    $('#start').on('click', function(e) {

        resInit();

        socket.emit('getuptime', "All");

        socket.on('uptime', function(data) {
            uptime = data;
        });

        testTime = $('#testTime').val();
        req_int = $('#reqInterval').val();

        if (testTime === '' || (req_int === '')) {
            alert("Test time is empty");
        } else if (isNaN(testTime) || (isNaN(req_int))) {
            alert("Test time should be a number");
        } else {
            testTime = testTime * 1000;
            processedPostCount = 0;
            processedGetCount = 0;
            OutstandingGet = 0;
            OutstandingPost = 0;
            PostCount = 0;
            GetCount = 0;

            isTestOnGoing = true;
            isNotRunOutOfTime = true;
            isOutOfMemory = false;

            realTestTime = 1;
            tmpTime = 0;
            if (uptime) {
                uptime = uptime + testTime;
            }

            testStartTime = new Date().getTime();

            $.ajax({
                url: '/user/perfSetup',
                type: 'post',
                crossDomain: true,
                dataType: 'text'
            }).done(function(data) {
                responseTxt = data;
                console.log("responseTx11111t"+ responseTxt);
               if (responseTxt == "\"TestMessageTableCreated\"") {
                    console.log("Inside");
                    var timestamp = Date.parse(new Date()) / 1000;
                    var sendMsg = {
                        cont: testMsg,
                        timestamp: getDate(timestamp)
                    };

                    testStartTime = new Date().getTime();
                    if (sync_on == 1) {
                        task = setInterval(function() {
                            if (isTestOnGoing) {
                                tmpTime = new Date().getTime();
                                if (tmpTime - testStartTime >= testTime) {
                                    isNotRunOutOfTime = false;
                                    isTestOnGoing = false;
                                    alert("Test Time is Over");
                                }

                                if (!isNotRunOutOfTime || isOutOfMemory) {
                                    tmpTime = new Date().getTime();
                                    realTestTime = tmpTime - testStartTime;
                                    isTestOnGoing = false;
                                }
                                PostCount++;
                                peakRspTime0.push(new Date().getTime());

                                postObj = $.ajax({
                                    url: '/user/insertTestMsg',
                                    type: 'post',
                                    data: sendMsg,
                                    crossDomain: true,
                                    dataType: 'json'
                                }).done(function(data) {
                                    responseTxt = data;
                                    peakRspTime1.push(new Date().getTime());

                                    if (responseTxt === "Out Of Memory") {
                                        isTestOnGoing = false;
                                        isOutOfMemory = true;
                                        alert("Out of Memory in backend");
                                    } else {
                                        if (isTestOnGoing)
                                            processedPostCount = processedPostCount + 1;

                                        post_response_time.push((peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]) / 1000);
                                        if ((peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]) > post_prt) {
                                            post_prt = (peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]);
                                        }

                                        realTestTime = tmpTime - testStartTime;
                                        rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);
                                        $("#totalpost").html(processedPostCount);
                                        //console.log("One message inserted" + "@@@@@@@@@ current post" + processedPostCount + "@@@@@@ calculated:" + ((processedPostCount / realTestTime) * 1000).toFixed(1));
                                        //post_throughput_rate.push(((processedPostCount / realTestTime) * 1000).toFixed(2));
                                        $("#postpersec").html(((processedPostCount / realTestTime) * 1000).toFixed(2));
                                        $("#avgtimeperpost").html((realTestTime / (processedPostCount * 1000)).toFixed(3));
                                        $("#rps").html(rps);
                                        $("#errcnt").html(errcnt);

                                    }
                                }).fail(function(data) {
                                    if (isTestOnGoing) {
                                        errcnt++;
                                        //   console.log("==============>errcnt"+errcnt);
                                    }
                                });
                                postObjArr.push(postObj);

                                peakRspTime2.push(new Date().getTime());
                                GetCount++;
                                getObj = $.ajax({
                                        url: '/user/getTestMsg',
                                        type: 'get',
                                        crossDomain: true,
                                        dataType: 'json'
                                    }).done(function(rows) {
                                        peakRspTime3.push(new Date().getTime());

                                        if (rows.length) {
                                            realTestTime = tmpTime - testStartTime;
                                            if (isTestOnGoing)
                                                processedGetCount = processedGetCount + 1;

                                            get_response_time.push((peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]) / 100);

                                            if ((peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]) > get_prt) {
                                                get_prt = (peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]);
                                            }
                                            rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);
                                            //console.log("processedGetCount"+processedGetCount);
                                            $("#totalget").html(processedGetCount);
                                            $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                                            $("#avgtimeperget").html((realTestTime / (processedGetCount * 1000)).toFixed(3));
                                            $("#rps").html(rps);
                                            $("#errcnt").html(errcnt);

                                        }
                                    })
                                    .fail(function(data) {
                                        if (isTestOnGoing) {
                                            errcnt++;
                                            // console.log("==============>errcnt"+errcnt);
                                        }
                                    });
                                getObjArr.push(getObj);
                            } else {
                                OutstandingGet = GetCount - processedGetCount;
                                OutstandingPost = PostCount - processedPostCount;
                                $("#uptime").html(displayuptime(uptime));
                                postObjArr.forEach(function(postObj) {
                                    postObj.abort();
                                });
                                getObjArr.forEach(function(getObj) {
                                    getObj.abort();
                                });
                                rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);
                                $("#totalget").html(processedGetCount);
                                $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                                //get_throughput_rate.push(((processedGetCount / realTestTime) * 1000).toFixed(2));
                                $("#avgtimeperget").html((realTestTime / (processedGetCount * 1000)).toFixed(3));
                                $("#errcnt").html(errcnt);
                                //$("#uptime").html(displayuptime(uptime));
                                $("#rps").html(rps);
                                $("#postprt").html(post_prt / 1000);
                                $("#getprt").html(get_prt / 1000);

                                $("#performance_chart").hide();
                                clearInterval(task);
                            }
                        }, req_int);
                    } else if (async_on == 1) {
                        task = setInterval(function() {
                            if (isTestOnGoing) {
                                tmpTime = new Date().getTime();
                                if (tmpTime - testStartTime >= testTime) {
                                    isNotRunOutOfTime = false;
                                    isTestOnGoing = false;
                                    alert("Test Time is Over");
                                }
                                if (!isNotRunOutOfTime || isOutOfMemory) {
                                    tmpTime = new Date().getTime();
                                    realTestTime = tmpTime - testStartTime;
                                    isTestOnGoing = false;
                                }
                                if (post_get == 1) {
                                    post_get = 0;
                                    postcnt = 0;
                                    while (postcnt < 5) {
                                        PostCount++;
                                        peakRspTime0.push(new Date().getTime());
                                        postObj = $.ajax({
                                                url: '/user/insertTestMsg',
                                                type: 'post',
                                                data: sendMsg,
                                                crossDomain: true,
                                                dataType: 'json'
                                            }).done(function(data) {
                                                responseTxt = data;
                                                peakRspTime1.push(new Date().getTime());
                                                if (responseTxt === "Out Of Memory") {
                                                    isTestOnGoing = false;
                                                    isOutOfMemory = true;
                                                    alert("Out of Memory in backend");
                                                } else {
                                                    if (isTestOnGoing)
                                                        processedPostCount = processedPostCount + 1;

                                                    post_response_time.push((peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]) / 1000);
                                                    if ((peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]) > get_prt) {
                                                        post_prt = (peakRspTime1[processedPostCount - 1] - peakRspTime0[processedPostCount - 1]);
                                                    }

                                                    rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);

                                                    realTestTime = tmpTime - testStartTime;
                                                    $("#totalpost").html(processedPostCount);
                                                    //console.log("One message inserted" + "@@@@@@@@@ current post" + processedPostCount + "@@@@@@ calculated:" + ((processedPostCount / realTestTime) * 1000).toFixed(1));
                                                    //post_throughput_rate.push(((processedPostCount / realTestTime) * 1000).toFixed(2));
                                                    $("#postpersec").html(((processedPostCount / realTestTime) * 1000).toFixed(2));
                                                    $("#avgtimeperpost").html((realTestTime / (processedPostCount * 1000)).toFixed(3));
                                                    $("#rps").html(rps);
                                                    $("#errcnt").html(errcnt);

                                                }
                                            })
                                            .fail(function(data) {
                                                if (isTestOnGoing) {
                                                    errcnt++;
                                                    //console.log("==============>errcnt"+errcnt);
                                                }
                                            });
                                        postcnt++;
                                        postObjArr.push(postObj);
                                    }
                                } else if (post_get === 0) {
                                    post_get = 1;
                                    getcnt = 0;
                                    while (getcnt < 10) {
                                        GetCount++;
                                        peakRspTime2.push(new Date().getTime());
                                        getObj = $.ajax({
                                                url: '/user/getTestMsg',
                                                type: 'get',
                                                crossDomain: true,
                                                dataType: 'json'
                                            }).done(function(rows) {
                                                peakRspTime3.push(new Date().getTime());
                                                if (rows.length) {
                                                    realTestTime = tmpTime - testStartTime;
                                                    if (isTestOnGoing)
                                                        processedGetCount = processedGetCount + 1;

                                                    get_response_time.push((peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]) / 1000);

                                                    if ((peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]) > get_prt) {
                                                        get_prt = (peakRspTime3[processedGetCount - 1] - peakRspTime2[processedGetCount - 1]);
                                                    }

                                                    rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);
                                                    $("#totalget").html(processedGetCount);
                                                    //get_throughput_rate.push(((processedGetCount / realTestTime) * 1000).toFixed(2));


                                                    $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                                                    $("#avgtimeperget").html((realTestTime / (processedGetCount * 1000)).toFixed(3));
                                                    $("#rps").html(rps);
                                                    $("#errcnt").html(errcnt);
                                                    $("#postprt").html(post_prt / 1000);
                                                    $("#getprt").html(get_prt / 1000);

                                                }
                                            })
                                            .fail(function(data) {
                                                if (isTestOnGoing) {
                                                    errcnt++;
                                                    //console.log("==============>errcnt"+errcnt);
                                                }
                                            });
                                        getcnt++;
                                        getObjArr.push(getObj);
                                    }
                                }
                            } else {
                                OutstandingGet = GetCount - processedGetCount;
                                OutstandingPost = PostCount - processedPostCount;


                                $("#uptime").html(displayuptime(uptime));
                                postObjArr.forEach(function(postObj) {
                                    postObj.abort();
                                });
                                getObjArr.forEach(function(getObj) {
                                    getObj.abort();
                                });
                                //console.log("PRT POST", post_prt);
                                //console.log("PRT GET", get_prt);

                                rps = (((processedGetCount + processedPostCount) / realTestTime) * 1000).toFixed(2);
                                $("#totalget").html(processedGetCount);
                                $("#getpersec").html(((processedGetCount / realTestTime) * 1000).toFixed(2));
                                $("#avgtimeperget").html((realTestTime / (processedGetCount * 1000)).toFixed(3));
                                $("#rps").html(rps);
                                $("#errcnt").html(errcnt);
                                $("#postprt").html(post_prt / 1000);
                                $("#getprt").html(get_prt / 1000);

                                $("#performance_chart").hide();
                                clearInterval(task);
                            }
                        }, req_int);
                    }
                }
            });
        }
    });




    $('#stop').click(function() {
        // console.log("stop button clicked");
        if (in_start == 1) {
            in_start = 0;
            $.ajax({
                url: '/user/perfDelete',
                type: 'POST',
                crossDomain: true,
                dataType: 'json'
            }).done(function(data) {
                responseTxt = data;
            });
        }
        socket.emit('stopmeasure', "All");

    });

}

$(document).on('ready', init);
