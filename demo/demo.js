
$(function() {
    
    $("body").removeClass("noscript");
    
    $(document).on("click", "div[contenteditable]", function() {
        $(this).unmodal();
        
        // Fix for IE9 and FF to get updates on contenteditable working properly
        $(this).unbind("DOMNodeInserted DOMNodeRemoved DOMCharacterDataModified").bind("DOMNodeInserted DOMNodeRemoved DOMCharacterDataModified", $.fn.unmodal.refresh);
    });
    
    /*
    $("*").mouseenter(function() {
        $(this).unmodal({leaveOnMouseLeave: true})
    });
    */
    var headers = $("#header").children();
    
    headers.click(function() {
        headers.unmodal();
    });
    
    $(".show-grid").children().click(function() {
        $("body").addClass("showing-grid");
        $(".show-grid").children().unmodal({
            hide: function() {
                $("body").removeClass("showing-grid");
            }
        });
    });
    
    headers.unmodal();
});