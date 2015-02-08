(function($){
    // DOM
    var $scrollEl = $(document.body);
    var $doc = $(document);
    var $refreshMain = $('#refreshMain');
    var $spinnerWrapper = $('.md-spinner-wrapper');
    var $arrowWrapper = $('.ui-reload-face');
    var $arrowMain = $('.ui-half-circle', $arrowWrapper);

    var noShowClass = 'ui-noshow-refresh';

    var isShowLoading = false;

    var NUM_POS_START_Y = -70;
    var NUM_POS_TARGET_Y = 0;
    var NUM_POS_MAX_Y = 65;
    var NUM_POS_MIN_Y = -25;

    var touchCurrentY;
    var touchStartY = 0;
    var verticalThreshold = 2;

    var touchPos = {
        x1: 0,
        x2: 0
    };

    //TODO: iOS feature when scrolling ,animation will stop

    function init(options) {
        scrollEl = utils.isIos() ? 
                        options.scrollEl ? $(options.scrollEl) : $scrollEl
                   : $doc;

    }

    function touchStart(e){
        if(window.scrollY !== 0 || isShowLoading){
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        touchCurrentY = NUM_POS_START_Y;
        $refreshMain.show();
        
        if(e.touches[0]){
            touchPos.x1 = e.touches[0].pageX;
            touchStartY = touchPos.y1 = e.touches[0].pageY;
        }
    }

    function touchMove(e){
        var thisTouch, distanceY;  
        if(window.scrollY !== 0 || isShowLoading || !e.touches || e.touches.length !== 1){
            // Just allow one finger
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        thisTouch = e.touches[0];

        touchPos.x2 = thisTouch.pageX;
        touchPos.y2 = thisTouch.pageY;

        // Distance for pageY change
        distanceY = touchPos.y2 - touchPos.y1;

        if (touchPos.y2 > touchStartY + verticalThreshold) {

            if(touchCurrentY < NUM_POS_MAX_Y){
                touchCurrentY += distanceY ;
                $refreshMain.css('-webkit-transform', 'translateY(' + touchCurrentY + 'px)');
                $refreshMain.css('transform', 'translateY(' + touchCurrentY + 'px)');
                $arrowMain.css('-webkit-transform', 'rotate(' + -(touchCurrentY * 3) + 'deg)');
                $arrowMain.css('transform', 'rotate(' + -(touchCurrentY * 3) + 'deg)');
            } else {
                doLoader();
                return;
            }

        }

        // y1 always is the current pageY
        touchPos.y1 = thisTouch.pageY;
    }

    function touchEnd(e){
        if(window.scrollY !== 0 || isShowLoading){
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        
        if(touchCurrentY > NUM_POS_MIN_Y){
            doLoader();
        } else {
            // Distance must greater than NUM_POS_MIN_Y
            $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_START_Y + 'px)');
            $refreshMain.css('transform', 'translateY(' + NUM_POS_START_Y + 'px)');
        }
    }

    function doLoader(){
        isShowLoading = true;

        $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_TARGET_Y + 'px)');
        $refreshMain.css('transform', 'translateY(' + NUM_POS_TARGET_Y + 'px)');

        $arrowWrapper.hide();
        // Start animation
        $spinnerWrapper.show();

        setTimeout(function(){

            // Stop animation 
            $refreshMain.addClass(noShowClass);
            $spinnerWrapper.hide();

            setTimeout(recoverRefresh, 500);

        }, 3000);
    }

    function recoverRefresh(){
        //TODO: display gently.
        $refreshMain.removeClass(noShowClass);
        $refreshMain.hide();
        $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_START_Y + 'px)');
        $refreshMain.css('transform', 'translateY(' + NUM_POS_START_Y + 'px)');
        
        $arrowWrapper.show();
        isShowLoading = false;  
    }

    function bindEvents(){
        $scrollEl.on('touchstart', touchStart);
        $scrollEl.on('touchmove', touchMove);
        $scrollEl.on('touchend', touchEnd);
    }

    function unbindEvents(){
        $scrollEl.off('touchstart', touchStart);
        $scrollEl.off('touchmove', touchMove);
        $scrollEl.off('touchend', touchEnd);
    }

    bindEvents();

})(Zepto);
