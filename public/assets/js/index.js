//scroll
var AUTO_SCROLL = false;
var SCROLL_SPEED = 50;
var SCROLL_FLAG = false;
var SCROLL_DELAY = 1000;


//tracker
var EYE_TRACKER_ON= false;
var VIDEO_ENABLED = false;
var HMM_ENABLED = true;
var LINE_PRED_ENABLED = true;
var WORD_PRED_ENABLED  = false;
var IS_PAUSED = false;
var LINE_COLOR = "blue";
var PREDICTION_DELAY = 200;
var MIN_PRED_COUNT = 6;
var MIN_LINE_TO_SHOW_ATPL = 5;
var MIN_WORD_PRED_ERROR = 3;

var para = new URLSearchParams(window.location.search);
var bookname = para.get("bookname");
var force_eyetrack = para.get("eyetrack");
var prediction_interval = null ;
var tot_line = 0;
var lno = 0;
var c_line = 0;
var t_spend = 0;
var time_spend = {};
var line_word_c = {};

const prev = document.getElementById('video');
const point = document.getElementById('showpred');
const auto_scroll = document.getElementById('toggle_autoscroll');
const autoscroll_menu = document.getElementById("autoscroll_menu");
const enable_eye = document.getElementById('enable_eye');
const eyetrack_menu = document.getElementById('eyetrack_menu');
const pred_line = document.getElementById("pred_line")
const pred_word = document.getElementById("pred_word")
const loader = document.getElementById("loader");
const hmm_toggle = document.getElementById("hmm");
const content  = document.getElementById("content");
const card  = document.getElementById("card");
const subcompo = document.getElementById("scompo");
const progress  = document.getElementById("progress");
const atpl = document.getElementById("atpl");
const headline = document.getElementById("headline");
var data = " ";


//status

const lineno = document.getElementById("lineno");
const read_speed = document.getElementById("speed");
//connecting to server
var server = new server_connection()



sessionStorage.setItem("bookname", bookname);
console.log(bookname);
tracker = new eyetracker();

if(force_eyetrack == "true"){
  $(".ee_check").prop('checked', true);
  tracker.start();
}
if (bookname == "custom/") {
  console.log("custom data");
  bookname =null;
  data = sessionStorage.getItem("customdata");
  computeLines();
}
else {
  loadDoc(bookname);
  bookname = bookname.slice(0, -5).replace(/_/g," ");
  headline.innerHTML = "<center><h1>"+bookname+"</h1><center>";

}
$(window).resize(computeLines);
window.applyKalmanFilter = true;
window.saveDataAcrossSessions = true;


//eyetracker main function
function eyetracker(){
  this.start = async function () {
      webgazer.params.showVideoPreview = true;
      console.log("eyetracker starting");
      loader.style.display = "block";

      prediction_interval = setInterval(function () {
        trackData = true;
      }, PREDICTION_DELAY);
      for(let i=1;i<tot_line;i++){
        time_spend[i] = 0;
      }
      let avg_time = 0;
      let c_taken = 0;
      await webgazer.setRegression('ridge')
        .setGazeListener(function (data, clock) {
          if (data && EYE_TRACKER_ON && trackData) {
            // $('.lines').each(function () {
            //   this.style.color = "black";
            // });
            // $('.words').each(function () {
            //   this.style.color = "inherit";
            // });
            // if(prev_elem){
            //   prev_elem.style.color = black;
            // }
            $('.lines').css({"color":"black"});
            $('.words').css({"color":"inherit"});
            elem = document.elementFromPoint(data.x, data.y);
            //elem = elem[0];
            if(document.getElementById("content").contains(elem)){
              if(elem.className=="words"){
                if(LINE_PRED_ENABLED) {
                  // console.log(elem.parentElement.id);
                  elem.parentElement.style.color = LINE_COLOR;
                }
                if(WORD_PRED_ENABLED) elem.style.color = "RED";
                elem = elem.parentElement;
              }
            else {
              if(LINE_PRED_ENABLED) elem.style.color = LINE_COLOR;
            }
              if (AUTO_SCROLL) {
                if (data.y > 0.80 * window.innerHeight) scrollWin(SCROLL_SPEED);
                if (data.y < 0.2 * window.innerHeight) scrollWin(-SCROLL_SPEED)
              }
                if(HMM_ENABLED){
                  lno = parseInt(elem.id.slice(4));
                  time_spend[lno] += 1;
                  t_spend +=PREDICTION_DELAY;
                  if (time_spend[lno] == MIN_PRED_COUNT ){
                    console.log(c_line);
                    c_line+=1;
                    c_taken = t_spend;
                    progress.innerHTML = String( ((c_line/tot_line)*100).toFixed(2));
                    if(c_line>=MIN_LINE_TO_SHOW_ATPL){
                      atpl.innerHTML = String(((c_taken/c_line)/1000).toFixed(2))+" sec";
                    }
                  }
                  read_speed.innerHTML = String((c_line/(1+(t_spend/60000)).toFixed()).toFixed(2))+" lpm";
                  lineno.innerHTML = lno;
                  
                  //server.send("x="+String(data.x)+"?y="+String(data.y)+"line="+String(lno))
                }
            }
            else{
              lineno.innerHTML = "- -";
            }
            trackData = false;
          }
          else {
            return;
          }
        }).begin();
        EYE_TRACKER_ON = true;
        eyetrack_menu.style.maxHeight = eyetrack_menu.scrollHeight + "px";
        webgazer.showPredictionPoints(false);     
        console.log("Eyetracker started");
        //eyetrack_menu.style.display = "block";
        loader.style.display = "none";
        $(".video_preview").prop('checked', true);
        $(".pred_line").prop('checked', true);
        this.showVideopreview();
        prev.classList.add("on");
        enable_eye.classList.add('on');
        pred_line.classList.add('on')
    }
    this.stop  = function(){
      webgazer.end();
      $('.lines').css({"color":"black"});
      $('.words').css({"color":"inherit"});
      // eyetrack_menu.style.maxHeight = null;
      clearInterval(prediction_interval);
      EYE_TRACKER_ON = false;
      enable_eye.classList.remove('on');
      // eyetrack_menu.style.display = "none";
    }
    this.showVideopreview = function(){
      if(!VIDEO_ENABLED){
      console.log("video preview enabled");
      subcompo.style.height = "50vh";
      VIDEO_ENABLED = true;
      webgazer.showVideo(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      prev.classList.add("on");
      }
    }
    this.stopVideopreview = function(){
      if(VIDEO_ENABLED){
      console.log("video preview disabled");
      VIDEO_ENABLED = false;
      webgazer.showVideo(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
      subcompo.style.height = "70vh";
      prev.classList.remove("on");
      }
    }
    this.resume = function() {
      //slider.classList.add('on');
      webgazer.resume();
    }
    this.pause = function() {
      webgazer.pause();
      //slider.classList.remove('on');
    }
  }

  //load content with words as span container
  function setData(data) {
    // var words = data.split('');
    var text = ' ';
    // $.each(words, function (i, w) {
    //   if ($.trim(w)) text = text + '<span>' + w + '</span>'
    // }
    // );
    for(i=0;i<data.length;i++){
      text = text + '<span>' + data[i]+ '</span>';
    }
    content.innerHTML = text;
  }


  //loadDoc will load the book content to page
  function loadDoc(bookname) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        data = this.responseText;
        computeLines();
      }
    };
    xhttp.open("GET", "/books/" + bookname.slice(0, -1), true);
    xhttp.send();
  }

//create span element for each element
function computeLines() {
    setData(data);
    var line = ''
    var line_no = 0;
    var word_no = 1;
    var word_tot = 0;
    var p = $('#content');
    var prevTop = -20;
    var text = '';
    var word = ''; 
    let f = true;
    $('span', content).each(function () {
      var c = $(this);
      char = c.text();
      var top = c.offset().top;
      word+=char;

      if (top != prevTop) {
        prevTop = top;
        if(f) f =false;
        else text = text + '<span class=lines id=line' + line_no + '>' + line + '</span>';
        line = '';
        word = char;
        line_no++;
      }
      if(char==" "){
        line_word_c[line_no] = word_no;
        line += "<span class=words>" + word+ '</span>';
        word ="";
        word_tot = word_tot +word_no;
        word_no = 0;
    }
      //line += "<span class=words id="+line_no+">" + word.text() + '</span>';
    });

    tot_line = line_no;
    p.html(text);
  }


  //slider management
  $('#fontslider').on('change', function () {
    console.log('input');
    var v = $(this).val();
    $('#content').css('font-size', v + 'px');
    computeLines();
  });
  $('#paddingslider').on('change', function () {
    var v = $(this).val();
    $('#content').css('line-height', v + 'px');
    computeLines();
  });
  $('#scrollslider').on('change', function () {
    var v = $(this).val();
    SCROLL_SPEED = v;
  });


//button management


$("#pause").click(function(){
  let icon = document.getElementById("pauseicon");
  let label = document.getElementById("pr");
  let on_pause_menu = document.getElementById("on_pause_div");
  if(IS_PAUSED){
    IS_PAUSED = false;
    webgazer.resume();
    icon.classList.remove("fa-play")
    icon.classList.add("fa-pause");
    label.innerHTML = "Pause";
    on_pause_menu.style.display = "none";
  }
  else{
    IS_PAUSED = true;
    webgazer.pause();
    $(".lines").css("color","black");
    $(".words").css("color","inherit");
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
    label.innerHTML = "Resume";
    on_pause_menu.style.display = "block";
  }

});

$("#lastline").click(function(){
  let line = document.getElementById("line"+String(lno));
  line.scrollIntoView();
  line.style.color = "red";
  setTimeout(function(){
    line.style.color = "black";
  },2000);
});
$("#clearstatus").click(function(){
  for(let i=1;i<tot_line;i++){
    time_spend[i] = 0;
  }
  c_line = 0;
  t_spend = 0;
  read_speed.innerHTML = "- -";
  atpl.innerHTML = "- -";
  progress.innerHTML = "0";
});
$(".pred_line").click(function () {
  if ($(this).is(':checked')) {
    console.log("line prediction enabled");
    pred_line.classList.add("on");
    LINE_PRED_ENABLED =true;
  }
  else{
    console.log("line predition  disabled");
    pred_line.classList.remove("on");
    LINE_PRED_ENABLED = false;
  }
});
$(".pred_word").click(function () {
  if ($(this).is(':checked')) {
    console.log("word prediction enabled");
    pred_word.classList.add("on");
    WORD_PRED_ENABLED = true;
  }
  else{
    console.log("word prediction disabled");
    pred_word.classList.remove("on");
    WORD_PRED_ENABLED = false;
  }
});
  $(".ee_check").click(function () {
    if ($(this).is(':checked')) {
      swal({
        title: "Are you sure?",
        text: "You need to calibrate before tracking for better result!",
        icon: "warning",
        dangerMode: true,
        buttons: {
          Calibrate: "Calibrate",
          Start: {
            text: "Start tracking",
            value: "track"
          },
          cancel: true,
        },
      }).then((value) => {
        switch (value) {
          case "Calibrate":

            break;
          case "track":
            tracker.start();
            console.log("track");
            break
          default:
            console.log("canceled");

        }
      })
    }
    else {
      tracker.stop();
    }
  });

  $(".video_preview").click(function () {

    if ($(this).is(':checked')) {
      tracker.showVideopreview();
    }
    else {
      tracker.stopVideopreview();
    }
  });
  $('#colorpicker').change(function(){
    LINE_COLOR= this.value;
  })
  $(".showpredpoint").click(function () {
    
    if ($(this).is(':checked')) {
      console.log("prediciton point enabled");
      webgazer.showPredictionPoints(true);
      point.classList.add("on");
    }
    else {
      webgazer.showPredictionPoints(false);
      point.classList.remove("on");
    }
  });
  
  $(".auto_scroll").click(function () {
    if ($(this).is(':checked')) {
      if(EYE_TRACKER_ON){
        console.log("auto scroll enabled");
        //autoscroll_menu.style.display = "block";
        AUTO_SCROLL = true;
         this.scroll_interval  = setInterval(function(){
          SCROLL_FLAG = true;
        },SCROLL_DELAY);
        auto_scroll.classList.add("on");
        }
        else{
          $(this).prop('checked', false);
          swal("enable eyetracker","you need to enable eyetracker to avail this feature","error");
        }
    }
    else {
      clearInterval(this.scroll_interval);
      console.log("auto scroll disabled");
      AUTO_SCROLL = false;
      auto_scroll.classList.remove("on");
      //autoscroll_menu.style.display = "none";
    }
  });
  $(".hmm").click(function () {
    if ($(this).is(':checked')) {
      console.log("hmm enabled");
      HMM_ENABLED = true;
      hmm_toggle.classList.add("on");
    }
    else {
      HMM_ENABLED = false;
      hmm_toogle.classList.remove("on");
    }
  });

function clearcache(){
  console.log("local cache cleared");
  webgazer.clearData();
}

  //scroll control

  function scrollWin(y) {
    if(SCROLL_FLAG){
      SCROLL_FLAG = false;
      card.scrollBy(0, y);
    }
  }


//server_connection

  function server_connection(){
    const host = window.location.host;
    let protocol = window.location.protocol;
    protocol = protocol === "https:" ? "wss:" : "ws:";
    const ws_url = `${protocol}//${host}`;
    console.log(ws_url);
    const ws = new WebSocket(ws_url);
    ws.onmessage = async (event) => {
      console.log(`Server has sent : ${await event.data}`);
    };
    ws.onerror = function (error) {
      console.log('WebSocket Error ' + error);
   };
    this.send = function(data){
      ws.send(data);
    }
  }

