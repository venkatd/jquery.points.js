//= require jquery.js

function Rectangle(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this._computePoints();
}

Rectangle.prototype._computePoints = function() {
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;

    this.lt = this.tl = {left:this.left, top:this.top};
    this.ct = this.tc = {left:this.left + this.width / 2, top:this.top};
    this.rt = this.tr = {left:this.left + this.width, top:this.top};

    this.lc = this.cl = {left:this.left, top:this.top + this.height / 2};
    this.c = this.cc = {left:this.left + this.width / 2, top:this.top + this.height / 2};
    this.rc = this.cr = {left:this.left + this.width, top:this.top + this.height / 2};

    this.lb = this.bl = {left:this.left, top:this.top + this.height};
    this.cb = this.bc = {left:this.left + this.width / 2, top:this.top + this.height};
    this.rb = this.br = {left:this.left + this.width, top:this.top + this.height};
};

Rectangle.prototype.isAbove = function(rect) {
    return this.bottom < rect.top;
};

Rectangle.prototype.isBelow = function(rect) {
    return this.top > rect.bottom;
};

Rectangle.prototype.isRight = function(rect) {
    return this.left > rect.right;
};

Rectangle.prototype.isLeft = function(rect) {
    return this.right < rect.left;
};

Rectangle.prototype.overlaps = function(rect) {
    var noOverlap = this.isAbove(rect) || this.isBelow(rect)
                || this.isRight(rect) || this.isLeft(rect);
    return !noOverlap;
};

Rectangle.prototype.translate = function(deltaX, deltaY) {
    return new Rectangle(this.left + deltaX, this.top + deltaY, this.width, this.height);
};

Rectangle.prototype.translatePoint = function(pointName, thatRect, thatPoint) {
    var thisPoint = this[pointName];
    var thatPoint = thatRect[thatPoint];

    //without any further translation, the top-left of the source will get aligned to target
    var translate = {
        left: this.left - thisPoint.left,
        top: this.top - thisPoint.top
    };
    return new Rectangle(thatPoint.left + translate.left, thatPoint.top + translate.top, this.width, this.height);
};

(function($) {
	var scrollbarWidth = 0;
	$.getScrollbarWidth = function() {
		if ( !scrollbarWidth ) {
			if ( $.browser.msie ) {
				var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
						.css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
					$textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
						.css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
				scrollbarWidth = $textarea1.width() - $textarea2.width();
				$textarea1.add($textarea2).remove();
			} else {
				var $div = $('<div />')
					.css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
					.prependTo('body').append('<div />').find('div')
						.css({ width: '100%', height: 200 });
				scrollbarWidth = 100 - $div.width();
				$div.parent().remove();
			}
		}
		return scrollbarWidth;
	};

    $.isYScrollbarVisible = function() {
        return $('body').height() > $(window).height();
    };

    $.isXScrollbarVisible = function() {
        return $('body').width() > $(window).width();
    };

})(jQuery);

(function() {

    $.fn.getBox = function () {
        if (this.get(0).tl !== undefined)
            return this.get(0);

        var box;
        if (this.get(0) == window) {
            var deltaWidth = $.isYScrollbarVisible() ? $.getScrollbarWidth() : 0;
            var deltaHeight = $.isXScrollbarVisible() ? $.getScrollbarWidth() : 0;
            box = new Rectangle(
              $(window).scrollLeft(),
              $(window).scrollTop(),
              $(window).width() - deltaWidth,
              $(window).height() - deltaHeight
            );
        }
        else {
            box = new Rectangle(
                        $(this).offset().left,
                        $(this).offset().top,
                        $(this).outerWidth(true),
                        $(this).outerHeight(true)
                    );
        }

        return box;
    };

})();


(function ($) {
    var num = function (value) {
        return parseInt(value, 10) || 0;
    };

    $.each(['min', 'max'], function (i, name) {
        $.fn[name + 'Size'] = function (value) {
            var width, height;
            if (value) {
                if (value.width !== undefined) {
                    this.css(name + '-width', value.width);
                }
                if (value.height !== undefined) {
                    this.css(name + '-height', value.height);
                }
                return this;
            }
            else {
                width = this.css(name + '-width');
                height = this.css(name + '-height');
                // Apparently:
                //  * Opera returns -1px instead of none
                //  * IE6 returns undefined instead of none
                return {'width':(name === 'max' && (width === undefined || width === 'none' || num(width) === -1) && Number.MAX_VALUE) || num(width),
                    'height':(name === 'max' && (height === undefined || height === 'none' || num(height) === -1) && Number.MAX_VALUE) || num(height)};
            }
        };
    });

    /**
     * Sets or gets the values for border, margin and padding.
     */
    $.each(['border', 'margin', 'padding'], function (i, name) {
        $.fn[name] = function (value) {
            if (value) {
                if (value.top !== undefined) {
                    this.css(name + '-top' + (name === 'border' ? '-width' : ''), value.top);
                }
                if (value.bottom !== undefined) {
                    this.css(name + '-bottom' + (name === 'border' ? '-width' : ''), value.bottom);
                }
                if (value.left !== undefined) {
                    this.css(name + '-left' + (name === 'border' ? '-width' : ''), value.left);
                }
                if (value.right !== undefined) {
                    this.css(name + '-right' + (name === 'border' ? '-width' : ''), value.right);
                }
                return this;
            }
            else {
                return {
                    top:num(this.css(name + '-top' + (name === 'border' ? '-width' : ''))),
                    bottom:num(this.css(name + '-bottom' + (name === 'border' ? '-width' : ''))),
                    left:num(this.css(name + '-left' + (name === 'border' ? '-width' : ''))),
                    right:num(this.css(name + '-right' + (name === 'border' ? '-width' : '')))
                };
            }
        };
    });
})(jQuery);

$.fn.getPosition = function (target, options) {
    var defaults = {
        anchor:['tl', 'tl'],
        offset:[0, 0],
        animate:false
    };

    if (typeof options == 'string') {
        options = {anchor:[options, options]};
    }

    options = $.extend(defaults, options);

    if (typeof options.anchor == 'string') {
        options.anchor = [options.anchor, options.anchor];
    }
    if (options.anchor.length == 1) {
        options.anchor[1] = options.anchor[0]
    }

    if (target == 'viewport')
        target = $(window).getBox();

    var sourceBox = $(this).getBox();
    var targetBox = $(target).getBox();

    var finalBox = sourceBox.translatePoint(options.anchor[0], targetBox, options.anchor[1]);

    if (this.css('position') == 'fixed') {
        var viewportBoxCorner = $(window).getBox().tl;
        finalBox = finalBox.translate(-viewportBoxCorner.left, -viewportBoxCorner.top);
    }

    return finalBox.tl;
};

$.fn.isAbove = function(that) {
    var thisBox = $(this).getBox();
    var thatBox = $(that).getBox();
    return thisBox.isAbove(thatBox);
};

$.fn.isBelow = function(that) {
    var thisBox = $(this).getBox();
    var thatBox = $(that).getBox();
    return thisBox.isBelow(thatBox);
};

$.fn.applyPosition = function (target, options) {
    var position = $(this).getPosition(target, options);
    if (options.animate) {
        $(this).animate({left:position.left + 'px', top:position.top + 'px'}, 500);
    }
    else {
        $(this).css({left:position.left + 'px', top:position.top + 'px'});
    }
    return this;
};

$.fn.anchor = function (target, points) {
    console.log('anchor');console.log(this);
    if (target === undefined && points === undefined) {
        if (this.data('anchor') == null)
            this.data('anchor', {
                target:'body',
                anchor:'c'
            });
        return this.data('anchor');
    }
    else {
        this.data('anchor', {
            target:target,
            anchor:points
        });
        this.refreshPosition();
        return this;
    }
};

$.fn.pinDown = function () {
    this.css('position', 'fixed').refreshPosition();
    return this;
};

$.fn.refreshPosition = function () {
    var options = this.anchor();
    this.applyPosition(options.target, options);
    return this;
};

$.fn.anchorPosition = function () {
    var options = this.anchor();
    return this.getPosition(options.target, options);
};
