$(function(){
    var p = $('p'); 
    var words = p.text().split(' '); 
    var text = ''; 
    $.each(words, function(i, w){
                     if($.trim(w)) text = text + '<span>' + w + '</span> ' }
          );
    p.html(text); 
    computeLines = function(){ 
      var line = 0; 
      var prevTop = -15; 
      $('span', p).each(function(){ 
        var word = $(this); 
        var top = word.offset().top; 
        if(top!=prevTop){ 
          prevTop=top; 
          line++; 
        } 
        word.attr('class', 'line' + line); 
      });
    }
    computeLines();
    $('#fontslider').on('change', function() {
        console.log('input');
        computeLines()
          var v= $(this).val();
          $('div').css('font-size', v + 'px');
        });
    $('#paddingslider').on('change', function() {
                computeLines()
              var v= $(this).val();
              $('div').css('line-height', v + 'px')
            });
    $(window).resize(computeLines);
    window.addEventListener('click',(event) =>{
        console.log("xcoords"+event.pageX);
        elem = document.elementFromPoint(event.pageX,event.pageY);
        elem.style.color = 'blue';
    });
  });
  
  