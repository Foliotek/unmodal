// unmodal jQuery Plugin
// Copyright (c) 2012 Foliotek Inc.
// MIT License
// https://github.com/Foliotek/ajaxq
// Contains inverse-intersection under MIT License
// https://github.com/bgrins/inverse-intersection

(function($) {
        
    var blockCSS = { position: "absolute" };
    var blockMarkup = "<div class='unmodal unmodal-hidden' />";
    var visible = false;
    
    var inverseIntersection = (function() {

        function intersection(r1, r2) {
            var x0 = Math.max(r1.left, r2.left);
            var x1 = Math.min(r1.left + r1.width, r2.left + r2.width);

            if (x0 <= x1) {
                var y0 = Math.max(r1.top, r2.top);
                var y1 = Math.min(r1.top + r1.height, r2.top + r2.height);

                if (y0 <= y1) {
                    return {
                        left: x0,
                        top: y0,
                        width: x1 - x0,
                        height: y1 - y0
                    };
                }
            }
            
            return false;
        }
        
        function filterWithArea(rectangles) {
            var output = [];
            
            for (var i = 0; i < rectangles.length; i++) {
                if (rectangles[i].width > 0 && rectangles[i].height > 0) {
                    output.push(rectangles[i]);
                }
            }
            
            return output;
        }
        
        function splitRectangleOnIntersection(r, mask) {
            
            var inter = intersection(mask, r);
            
            if (!inter) {
                return [r];
            }
            
            // If there is an intersection, return 4 rectangles surrounding this box
            var rectangles = filterWithArea([
                { 
                    left: r.left, 
                    top: r.top, 
                    width: r.width, 
                    height: inter.top - r.top
                },
                { 
                    left: r.left, 
                    top: inter.top + inter.height, 
                    width: r.width, 
                    height: (r.top + r.height) - (inter.top + inter.height)
                },
                {
                    left: r.left,
                    top: inter.top,
                    width: inter.left - r.left,
                    height: inter.height
                },
                {
                    left: inter.left + inter.width,
                    top: inter.top,
                    width: (r.left + r.width) - (inter.left + inter.width), height: inter.height
                }
            ]);
            
            return rectangles;
        }
        
        return function (parentBounds, allBounds) {
            
            if (!allBounds.length) {
                return [];
            }
            
            var outputBounds = [parentBounds];
            
            for (var i = 0; i < allBounds.length; i++) {
                var newOutputs = [];
                for (var j = 0; j < outputBounds.length; j++) {
                    var inters = splitRectangleOnIntersection(outputBounds[j], allBounds[i]);
                    newOutputs = newOutputs.concat(inters);
                }
                outputBounds = newOutputs;
            }
            
            return outputBounds;
        };
        
    })();
    
    function removeBoxes(doc) {
       $(".unmodal", doc || document).remove();
    }
    
    function appendBoxes(doc, nodes) {
    
        var bounds = nodes.map(function () {
            var node = $(this);
            if (node.is(":visible")) {
                var rect = node.offset();
                rect.width = node.outerWidth();
                rect.height = node.outerHeight();

                return rect;
            }
        }).toArray();
        
        var parentRect = { left:0, top:0, width: $(doc).width(), height: $(doc).height() };
        var boxes = inverseIntersection(parentRect, bounds);
        var blocks = [];
        
        for (var i = 0; i < boxes.length; i++) {
            
            var box = boxes[i];
            var block = $(blockMarkup).css(blockCSS);
            
            block.width(box.width).height(box.height).css({
                left: box.left,
                top: box.top
            });
            
            blocks.push(block[0]);
        }
        
        removeBoxes(doc);
        
        function removeHiddenClass() {
            $(blocks).removeClass("unmodal-hidden");
        }
        if (visible) {
            $(blocks).appendTo(doc.body);
            removeHiddenClass();
        }
        else {
            $(blocks).appendTo(doc.body);
            setTimeout(removeHiddenClass, 1);
        }
        
        visible = true;
    }
    
    $.fn.unmodal = function(opts) {
        
        if (this.length) {
        
            var o = $.extend({}, $.fn.unmodal.defaults, opts);
            var doc = this[0].ownerDocument || document;
            var body = doc.body;
            var nodes = this.not(".unmodal");
            
            $(doc).data("hide.unmodal", o.hide);
            
            $(doc).unbind("click.unmodal").delegate(".unmodal", "click.unmodal", function() {
                $.fn.unmodal.clear(doc);
                return false;
            });
            $(doc).unbind("selectstart.unmodal").bind("selectstart.unmodal", function() {
                return false;
            });
            $(doc).unbind("keydown.unmodal").bind("keydown.unmodal", function(e) {
                if (e.keyCode == 27) {
                    $.fn.unmodal.clear(doc);
                }
            });
            
            $.fn.unmodal.refresh = function(e) {
                appendBoxes(doc, nodes, true);
            };
            
            $(window).unbind("resize.unmodal input.unmodal").bind("resize.unmodal input.unmodal", $.fn.unmodal.refresh);
            
            appendBoxes(doc, nodes);
        
        }
            
        return this;
    };
    
    $.fn.unmodal.defaults = {
        hide: $.noop
    };
    $.fn.unmodal.clear = function(doc) {
        removeBoxes(doc);
        visible = false;
        $(window).unbind("resize.unmodal input.unmodal");
        $(doc || document).unbind("click.unmodal keydown.unmodal selectstart.unmodal");
        
        if ($(doc || document).data("hide.unmodal")) {
            $(doc || document).data("hide.unmodal").apply();
            $(doc || document).removeData("hide.unmodal");
        }
    };
    $.fn.unmodal.refresh = $.noop;
    
    
})(jQuery);

    