var _ = require('ep_etherpad-lite/static/js/underscore');
var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;

var timer = 0;

exports.postAceInit = function(hook_name, context){
  showAuthor.enable(context);

  /* init */
  if (padcookie.getPref("author-hover") === false) {
    $('#options-author-hover').val() 
    $('#options-author-hover').attr('checked','unchecked');
    $('#options-author-hover').attr('checked',false);
  }else{
    $('#options-author-hover').attr('checked','checked');
  }

  if($('#options-author-hover').is(':checked')) {
    clientVars.plugins.plugins.ep_author_hover.enabled = true;
  } else {
    clientVars.plugins.plugins.ep_author_hover.enabled = false;
  }

  /* on click */
  $('#options-author-hover').on('click', function() {
   if($('#options-author-hover').is(':checked')) {
      padcookie.setPref("author-hover", true)
      clientVars.plugins.plugins.ep_author_hover = true;
    } else {
      padcookie.setPref("author-hover", false)
      clientVars.plugins.plugins.ep_author_hover = true;
    }
  });

}

var showAuthor = {
  enable: function(context){
    context.ace.callWithAce(function(ace){
      var doc = ace.ace_getDocument();
      $(doc).find('#innerdocbody').mousemove(_(exports.showAuthor.hover).bind(ace));
    }, 'showAuthor', true);
  },
  disable: function(context){
    context.ace.callWithAce(function(ace){
      var doc = ace.ace_getDocument();
      $(doc).find('#innerdocbody').mousemove(_().bind(ace));
    }, 'showAuthor', true);
  },
  hover: function(span){

    if(timer) { // wait a second before showing!
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(function(){
      showAuthor.show(span);
    }, 1000);

  },
  show: function(span){
    if(clientVars.plugins.plugins.ep_author_hover.enabled){
      var spanObj = $(span.target).closest('span');

      if(spanObj.length == 0) // In the case we are not close to a piece of text
          return;

      var authorId = showAuthor.authorIdFromClass(spanObj.get(0).className); // Get the authorId

      if(!authorId){ return; } // Default text isn't shown
      showAuthor.destroy(); // Destroy existing
      var authorNameAndColor = showAuthor.authorNameAndColorFromAuthorId(authorId); // Get the authorName And Color
      
      showAuthor.draw(span, authorNameAndColor.name, authorNameAndColor.color);
    }
  },
  authorIdFromClass: function(className){
    if (className.substring(0, 7) == "author-") {
      return className.substring(7).replace(/[a-y0-9]+|-|z.+?z/g, function(cc) {
        if (cc == '-') { return '.'; }
        else if (cc.charAt(0) == 'z') {
          return String.fromCharCode(Number(cc.slice(1, -1)));
        }
        else {
          return cc;
        }
      });
    }
  },
  authorNameAndColorFromAuthorId: function(authorId){
    var fullAuthorId = authorId; // historical data uses full author id without substing
    // todo figure out why we need a substring to fix this

    authorId = authorId.substring(0,14); // don't ask....  something appears to be fucked in regex
    // It could always be me..

    var myAuthorId = pad.myUserInfo.userId.substring(0,14);
    if(myAuthorId == authorId){
      return {
        name: "Me",
        color: "#ffffff"
      }
    }

    // Not me, let's look up in the DOM
    var authorObj = {};
    $('#otheruserstable > tbody > tr').each(function(){
      if (authorId == $(this).data("authorid").substring(0,14)){
        $(this).find('.usertdname').each( function() {
          authorObj.name = $(this).text();
          if(authorObj.name == "") authorObj.name = "Unknown Author";
        });
        $(this).find('.usertdswatch > div').each( function() {
          authorObj.color = $(this).css("background-color");
        });
        return authorObj;
      }
    });

    // Else go historical
    if(!authorObj || !authorObj.name){
      var historicalInfo = clientVars.collab_client_vars.historicalAuthorData[fullAuthorId]; // Try to use historical data
			if(historicalInfo.name != null)
      	return {
        	  name : historicalInfo.name,
        	  color : historicalInfo.colorId
	      };
    }

    return {name: "Unknown Author", color: "#ffffff"};
  },
  draw: function(target, authorName, authorColor){

		var span = target.target;

		/* QTIP version work in progress
		console.log("before");

		$(span).qtip({
				content: {
					text : authorName
				},
				position : {
					my: "top left",
					at: 'bottom right',
					target : 'mouse'
				},
				show : {
					target : $(span)
				}
			});
    console.log(span);*/

    var fontSize = $(span).parent().css('font-size');
    var top = $(span).context.offsetTop -14;
    if(top < 0) top = $(span).height() +14;
    var left = target.clientX +15;
    $(span).removeAttr("title");

    // TODO use qtip, it will handle edge cases better
    var outBody = $('iframe[name="ace_outer"]').contents().find("body");
    var $indicator = $("<div class='authortooltip' style='opacity:.9;font-size:14px;padding:5px 5px 0px 5px;position:absolute;left:"+left+"px;top:"+top +"px;background-color:"+authorColor+"' title="+authorName+">"+authorName+"</div>");
    $(outBody).append($indicator);
  
    // After a while, fade out
    setTimeout(function(){
      $indicator.fadeOut(500, function(){
        $indicator.remove();
      });
    }, 500);
  },
  destroy: function(){
    $('iframe[name="ace_outer"]').contents().find(".authortooltip").remove();
  }
}

exports.showAuthor = showAuthor;
