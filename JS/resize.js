/*
 * Resize Handles
 * Original author: dooble.
 */

// public methods : 
// minimize,restore,moveTo,toggle
// ex: $('#handle').trigger('moveTo', 300);

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "handle",
        defaults = {
            master : null,
            slave  : null,
            cookie : true,
            margin : 2,
            defaultPos : 200,
            minimum : 200
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this._defaults = defaults;
        this._name     = pluginName;
        this.options   = $.extend( {}, defaults, options) ;
        
        this.handle  = element;
		this.$handle = $(element);
		
		this.isDraging = false;
		this.isCookieExist = false;
		this.isMinimized = false;

        this.handlePosition = this.$handle.position();
        this.handleParent   = this.$handle.parent();
        
        this.isOrientationY = (this.options.orientation === 'bottom' || this.options.orientation === 'top');

        this.handleSize = (this.isOrientationY) ? this.$handle.height() : this.handleSize = this.$handle.width();
		
        this.master = $(this.options.master)[0];
        this.slave = $(this.options.slave)[0];

        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        var i = this;

		i.setEventDrag();
		i.getCurrentSizes();

		(i.options.cookie) ? i.getCookie() : i.setDefaultPos();

		i.setOutsideEvents();
    };

    Plugin.prototype.setEventDrag = function () {
		var i = this;
		
		i.$handle.one('mousedown',function(event){
			event.preventDefault();
			i.toggleDrag();
			
			$(window).one('mouseup', function(){
				i.toggleDrag();
				i.setEventDrag();
			})
			
		});
	}
	
	Plugin.prototype.setHandlePosition = function (newPos) {
		var i = this,
			handleStyle = i.handle.style,
			masterStyle = i.master.style,
			slaveStyle = i.slave.style,
			currentPos = 0,
			newPos = parseInt(newPos);

		if((i.isDraging && newPos < i.minimum) || !i.isDraging) {
			if(i.isOrientationY) {
				currentPos = i.totalParentSize - newPos;
				handleStyle.bottom = currentPos + 'px';
				masterStyle.height = currentPos - i.options.margin + 'px';
				slaveStyle.marginBottom = currentPos + i.handleSize + i.options.margin + 'px';
			} else {
				currentPos = i.totalParentSize - newPos;
				handleStyle.right = currentPos + 'px';
				masterStyle.width = currentPos - i.options.margin + 'px';
				slaveStyle.marginRight = currentPos + i.handleSize + i.options.margin + 'px';
			}
		}
	}
	
	Plugin.prototype.toggleDrag = function () {
		var i = this,
			body = $('body'),
			newPos = 0;
		
		// toggle
		i.isDraging = !i.isDraging;


		if(i.isDraging) {
			i.getCurrentSizes();	

			// the heavy lifting happens on the timer istead on  'mousemove' event,
			// this will make shore that setHandlePosition() will not called too often.
			$(window).one('mousemove', function(){
				$(window).on('mousemove', function(event) {
					if (i.isOrientationY) {
						i.pagePos = event.pageY;
					} else {
						i.pagePos = event.pageX;
					}
				});
				i.timer = setInterval(function(){
					i.setHandlePosition(i.pagePos)
				}, 1000/24);

				// when the cursor leaves the handle it loses its arrowish look,
				// therefore, as long as dragging been done, set arrowish cursor for the whole page.
				(i.isOrientationY) ? body.addClass('dragingY') : body.addClass('dragingX')
			})
			
		} 
		else { 
			clearTimeout(i.timer);

			if (i.pagePos < i.minimum) { 
				i.isMinimized = false;
				if(i.options.cookie) i.setCookie();

			} else {
				i.isMinimized = true;
			}

			body.removeClass('dragingY dragingX')
			$(window).off('mousemove') 
		}
	}


	Plugin.prototype.getCurrentSizes = function () {
		var i = this;
		if(this.isOrientationY) {
			i.handleParentSize = i.handleParent.height();
			i.totalParentSize = (i.handleParentSize - (i.handleSize/2)) + i.handleParent.offset().top;
		} else {
			i.handleParentSize = i.handleParent.width();
			i.totalParentSize = (i.handleParentSize - (i.handleSize/2)) + i.handleParent.offset().left;
		}

		i.minimum = i.totalParentSize - this.options.minimum;
	}	

	Plugin.prototype.setDefaultPos = function () {
		var i = this;
		i.setHandlePosition(i.totalParentSize - i.options.defaultPos);
	}

	Plugin.prototype.setCookie = function () {
		var i = this;
		// remember those changes..
		$.cookie(i.handle.id, i.pagePos, { expires: 365 });
	}
	
	Plugin.prototype.getCookie = function () {
		var i = this,
			cookie = $.cookie(i.handle.id);

		if(cookie) {
			i.isCookieExist = true;

			if(cookie < i.minimum) {
				i.setHandlePosition(cookie);
			} else {
				i.setHandlePosition(i.minimum);
			}
		}
	}

	Plugin.prototype.setOutsideEvents = function () {
		var i = this;

		Plugin.prototype.minimize = function () {
			i.isMinimized = true;
			i.setHandlePosition(i.minimum);
		}

		Plugin.prototype.restore = function () {
			i.isMinimized = false;

			if(i.options.cookie && i.isCookieExist) {
				i.getCookie();
			} else {
				i.setDefaultPos();
			}
		}

		Plugin.prototype.toggle = function () {
			if(i.isMinimized) {
				$(this).trigger('restore');
			} else {
				$(this).trigger('minimize');
			}
		}

		Plugin.prototype.moveTo = function (event, newPos) {
			i.setHandlePosition(i.totalParentSize - newPos);
		}

		i.$handle.on('minimize', i.minimize)
				 .on('restore',  i.restore)
				 .on('moveTo',  i.moveTo)
				 .on('toggle',  i.toggle)
	}


    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );
