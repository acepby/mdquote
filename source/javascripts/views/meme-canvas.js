/*
* MemeCanvasView
* Manages the creation, rendering, and download of the Meme image.
*/
MEME.MemeCanvasView = Backbone.View.extend({

  initialize: function() {
    var canvas = document.createElement('canvas');
    var $container = MEME.$('#meme-canvas');

    // Display canvas, if enabled:
    if (canvas && canvas.getContext) {
      $container.html(canvas);
      this.canvas = canvas;
      this.setDownload();
      this.render();
    } else {
      $container.html(this.$('noscript').html());
    }

    // Listen to model for changes, and re-render in response:
    this.listenTo(this.model, 'change', this.render);
  },

  setDownload: function() {
    var a = document.createElement('a');
    if (typeof a.download == 'undefined') {
      this.$el.append('<p class="m-canvas__download-note">Right-click button and select "Download Linked File..." to save image.</p>');
    }
  },

  render: function() {
    // Return early if there is no valid canvas to render:
    if (!this.canvas) return;

    // Collect model data:
    var m = this.model;
    var d = this.model.toJSON();
    var ctx = this.canvas.getContext('2d');
    var padding = Math.round(d.width * d.paddingRatio);

    // Reset canvas display:
    this.canvas.width = d.width;
    this.canvas.height = d.height;
    ctx.clearRect(0, 0, d.width, d.height);

    function renderBackground(ctx) {
      // Base height and width:
      var bh = m.background.height;
      var bw = m.background.width;

      if (bh && bw) {
        // Transformed height and width:
        // Set the base position if null
        var th = bh * d.imageScale;
        var tw = bw * d.imageScale;
        var cx = d.backgroundPosition.x || d.width / 2;
        var cy = d.backgroundPosition.y || d.height / 2;

        ctx.drawImage(m.background, 0, 0, bw, bh, cx-(tw/2), cy-(th/2), tw, th);
      }
    }

    function renderOverlay(ctx) {
      if (d.overlayColor) {
        ctx.save();
        ctx.globalAlpha = d.overlayAlpha;
        ctx.fillStyle = d.overlayColor;
        ctx.fillRect(0, 0, d.width, d.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function renderHeadline(ctx) {
      var maxWidth = Math.round(d.width * 0.625);
      var x = padding*2;
      var y = padding;
      //var qoutY=y;
      var authY;
      var quotX = x;
      //var testWidth;
      ctx.font = d.fontSize +'pt '+ d.fontFamily;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';

      // Text shadow:
      if (d.textShadow) {
        ctx.shadowColor = "#333";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 5;
      }

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;
        //quotX= x - padding*3;
        //y = d.height - d.height / 1.5;
        maxWidth = Math.round(d.width*0.625);//d.width - d.width / 3;

      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;
        //quotX=d.width - testWidth;

      } else {
        ctx.textAlign = 'left';
      }

      var words = d.headlineText.split(' ');
      var line  = '';
      var numLines = 1;
      for (var n = 0; n < words.length; n++) {
        var testLine  = line + words[n] + ' ';
        var metrics   = ctx.measureText( testLine );
        var testWidth = metrics.width;
        //console.log(y);
        if (testWidth > maxWidth && n > 0) {
          //renderQuoteMark(ctx,x,y);
          // ctx.font = d.fontSize +'pt '+ d.fontFamily;
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += Math.round(d.fontSize * 2);
          authY=y;
          numLines++;
        } else {
          line = testLine;
          authY =y+d.fontSize*2;
          //console.log("y sebaris: "+y +authY);
        }

if (numLines==1) {
  if(x==padding*2){
    quotX=x-padding*0.25;
  }else if (x==d.width/2) {
    quotX=x - testWidth/2;
  }else {
    quotX=d.width - (testWidth+padding*0.25);
  }
}
        if (n==words.length-1) {
            authY =y+d.fontSize*3;


            //console.log("akhir kata :"+authY);
          }
      }


      ctx.font = d.fontSize +'pt '+ d.fontFamily;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';
      ctx.fillText(line, x, y);
      //renderQuoteMark(ctx,quotX,padding);
      console.log("baris :" +n);
      console.log("x :" +x);
      console.log("testWidth :" +testWidth);
      ctx.shadowColor = 'transparent';
      renderQuoteMark(ctx,quotX,padding);
      renderAuthor(ctx,x,authY);
    }

    function renderCredit(ctx) {
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'left';
      ctx.fillStyle = d.fontColor;
      ctx.font = 'normal '+ d.creditSize +'pt '+ d.fontFamily;
      ctx.fillText(d.creditText, padding*0.5, d.height - padding*0.18);
    }

    function renderWatermark(ctx) {
      // Base & transformed height and width:
      var bw, bh, tw, th;
      bh = th = m.watermark.height;
      bw = tw = m.watermark.width;

      if (bh && bw) {
        // Calculate watermark maximum width:
        var mw = d.width * d.watermarkMaxWidthRatio;

        // Constrain transformed height based on maximum allowed width:
        if (mw < bw) {
          th = bh * (mw / bw);
          tw = mw;
        }

        ctx.globalAlpha = d.watermarkAlpha;
        ctx.drawImage(m.watermark, 0, 0, bw, bh, d.width-padding-tw, d.height-padding-th, tw, th);
        ctx.globalAlpha = 1;
      }
    }


    function renderFbAkun(ctx) {
		var fbLogo,twitLogo,InstaLogo;
    	if(d.fbAkun!=''){
				fbLogo='\uf082 ';
			}else{
            fbLogo='';
       	}
   	if(d.twitAkun!=''){
        		twitLogo=' \uf081 ';
        }else{
            twitLogo='';
        }
   	if(d.instaAkun!=''){
        		instaLogo=' \uf16d ';
        }else{
             var instaLogo='';
        }
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'left';
      ctx.fillStyle = d.fontColor;
      ctx.font = 'normal '+ d.fbAkunSize +'pt '+ d.fontFamily;
      ctx.fillText(fbLogo+d.fbAkun+twitLogo+d.twitAkun+instaLogo+d.instaAkun, padding*d.medsosHorizontal, d.height - padding*d.medsosVertical);
    }
//author
function renderAuthor(ctx,x,authY) {
	   var koma,dash;
	   if(d.authorKet!=''){
			koma=' , ';
      dash='-- ';
	   }else {
	   	koma='';
       dash='';
	   	}

      ctx.textBaseline = 'bottom';
      //ctx.textAlign = 'left';
      ctx.fillStyle = d.fontColor;
      ctx.font = 'normal '+ d.authorSize +'pt '+ d.fontFamily;
      ctx.fillText(dash+d.author+koma+d.authorKet, x, authY);
    }


//quote marks
function renderQuoteMark(ctx,x,y) {
      //ctx.textBaseline = 'bottom';
      //ctx.textAlign = 'right';
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#919191';
      ctx.font = 'normal '+ 36 +'pt '+ d.fontFamily;
      ctx.fillText('\uf10e' ,x-padding*0.625,y-30);
    }


    //roundrect
    //soure : http://js-bits.blogspot.co.id/2010/07/canvas-rounded-corner-rectangles.html
    /**
      	* Draws a rounded rectangle using the current state of the canvas.
      	* If you omit the last three params, it will draw a rectangle
	* outline with a 5 pixel border radius
 	* @param {CanvasRenderingContext2D} ctx
 	* @param {Number} x The top left x coordinate
 	* @param {Number} y The top left y coordinate
 	* @param {Number} width The width of the rectangle
 	* @param {Number} height The height of the rectangle
 	* @param {Number} radius The corner radius. Defaults to 5;
 	* @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 	* @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 	*/
	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  		if (typeof stroke == "undefined" ) {
    			stroke = true;
  			}
 		 if (typeof radius === "undefined") {
    			radius = 5;
  			}
  		ctx.beginPath();
  		ctx.moveTo(x + radius, y);
  		ctx.lineTo(x + width - radius, y);
  		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  		ctx.lineTo(x + width, y + height - radius);
  		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  		ctx.lineTo(x + radius, y + height);
  		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  		ctx.lineTo(x, y + radius);
  		ctx.quadraticCurveTo(x, y, x + radius, y);
  		ctx.closePath();
  		if (stroke) {
    			ctx.stroke();
  			}
  		if (fill) {
    			ctx.fill();
  			}
		}
   //setting rectRound
    //ctx.lineWidth=3;
    ctx.strokeStyle="rgb(249,225,4)";

//render to canvas
    renderBackground(ctx);
    renderOverlay(ctx);
    //renderQuoteMark(ctx);
    renderHeadline(ctx);
    //renderAuthor(ctx);
    renderCredit(ctx);
    renderWatermark(ctx);
    renderFbAkun(ctx);
    roundRect(ctx,padding*0.25,padding*0.25,d.width-padding*0.5,d.height-padding*0.9,20,false,true);

    var data = this.canvas.toDataURL(); //.replace('image/png', 'image/octet-stream');
    this.$('#meme-download').attr({
      'href': data,
      'download': (d.downloadName || 'share') + '.png'
    });

    // Enable drag cursor while canvas has artwork:
    this.canvas.style.cursor = this.model.background.width ? 'move' : 'default';
  },

  events: {
    'mousedown canvas': 'onDrag'
  },

  // Performs drag-and-drop on the background image placement:
  onDrag: function(evt) {
    evt.preventDefault();

    // Return early if there is no background image:
    if (!this.model.hasBackground()) return;

    // Configure drag settings:
    var model = this.model;
    var d = model.toJSON();
    var iw = model.background.width * d.imageScale / 2;
    var ih = model.background.height * d.imageScale / 2;
    var origin = {x: evt.clientX, y: evt.clientY};
    var start = d.backgroundPosition;
    start.x = start.x || d.width / 2;
    start.y = start.y || d.height / 2;

    // Create update function with draggable constraints:
    function update(evt) {
      evt.preventDefault();
      model.set('backgroundPosition', {
        x: Math.max(d.width-iw, Math.min(start.x - (origin.x - evt.clientX), iw)),
        y: Math.max(d.height-ih, Math.min(start.y - (origin.y - evt.clientY), ih))
      });
    }

    // Perform drag sequence:
    var $doc = MEME.$(document)
      .on('mousemove.drag', update)
      .on('mouseup.drag', function(evt) {
        $doc.off('mouseup.drag mousemove.drag');
        update(evt);
      });
  }
});
