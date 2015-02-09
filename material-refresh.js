;(function($){

    //Known issue: iOS feature when scrolling ,animation will stop

    // DOM
    var $scrollEl = $(document.body);
    var $doc = $(document);

    var $refreshMain, $spinnerWrapper, $arrowWrapper, $arrowMain;

    var noShowClass = 'ui-noshow-refresh';

    var isShowLoading = false;
    var isDoingStop = false;

    var NUM_POS_START_Y = -70;
    var NUM_POS_TARGET_Y = 0;
    var NUM_POS_MAX_Y = 65;
    var NUM_POS_MIN_Y = -25;

    var touchCurrentY;
    var touchStartY = 0;
    var verticalThreshold = 2;
    var maxRotateTime = 3000;

    var onBegin = null;
    var onEnd = null;
    var stopAnimatTimeout = null;

    //TODO: theme extract
    var renderTmpl = '<div id="muiRefreshMain" class="ui-refresh-main md-blue-theme">\
        <div class="ui-refresh-wrapper ">\
            <div class="ui-reload-face">\
                <div class="ui-half-circle"></div>\
            </div>\
            <div class="md-spinner-wrapper" style="display:none;">\
                <div class="md-inner" >\
                    <div class="md-gap"></div>\
                    <div class="md-left">\
                        <div class="md-half-circle"></div>\
                    </div>\
                    <div class="md-right">\
                        <div class="md-half-circle"></div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>';

    var touchPos = {
        x1: 0,
        x2: 0
    };

    var utils = {
        isIos: function(){
            return $.os.ios;
        }
    };


    /* var opts = { */
    /*     scrollEl: null, */
    /*     maxRotateTime: 3000, */
    /*     onRotateBegin: null, */
    /*     onRotateEnd: null */

        
    /* }; */


    function mRefresh(options) {
        options = options || {};

        $scrollEl = options.scrollEl ? $(options.scrollEl) :
                        utils.isIos() ? $scrollEl : $doc;
        onBegin = options.onRotateBegin;
        onEnd = options.onRotateEnd;
        maxRotateTime = options.maxRotateTime || maxRotateTime;

        if(!document.getElementById('muiRefreshMain')){
            renderRefresh();

            $refreshMain = $('#muiRefreshMain');
            $spinnerWrapper = $('.md-spinner-wrapper');
            $arrowWrapper = $('.ui-reload-face');
            $arrowMain = $('.ui-half-circle', $arrowWrapper);
        }

    }

    // Finish loading
    mRefresh.resolve = function() {
        if(!isDoingStop && stopAnimatTimeout){
            clearTimeout(stopAnimatTimeout);
            stopAnimatTimeout = null;

            recoverRefresh();
        }
    }
    
    function renderRefresh(){
        $(document.body)[0].insertAdjacentHTML('beforeend', renderTmpl);
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
                $refreshMain.css('-webkit-transform', 'translateY(' + touchCurrentY  + 'px)');
                /* $refreshMain.css('transform', 'translateY(' + touchCurrentY + 'px)'); */
                $arrowMain.css('-webkit-transform', 'rotate(' + -(touchCurrentY * 3) + 'deg)');
                /* $arrowMain.css('transform', 'rotate(' + -(touchCurrentY * 3) + 'deg)'); */
            } else {
                doRotate();
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
            doRotate();
        } else {
            // Distance must greater than NUM_POS_MIN_Y
            $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_START_Y + 'px)');
            $refreshMain.css('transform', 'translateY(' + NUM_POS_START_Y + 'px)');
        }
    }

    function doRotate(){
        isShowLoading = true;

        // Do onBegin callback
        if (typeof onBegin === 'function') {
            onBegin();
        }

        $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_TARGET_Y + 'px)');
        $refreshMain.css('transform', 'translateY(' + NUM_POS_TARGET_Y + 'px)');
        $arrowWrapper.hide();

        // Start animation
        $spinnerWrapper.show();

        // Timeout to stop animation
        stopAnimatTimeout = setTimeout(recoverRefresh, maxRotateTime);
    }

    function recoverRefresh(){

        // For aviod resolve
        isDoingStop = true;

        // Stop animation 
        $refreshMain.addClass(noShowClass);
        $spinnerWrapper.hide();

        setTimeout(function(){
            //TODO: display gently.
            $refreshMain.removeClass(noShowClass);
            $refreshMain.hide();
            $refreshMain.css('-webkit-transform', 'translateY(' + NUM_POS_START_Y + 'px)');
            $refreshMain.css('transform', 'translateY(' + NUM_POS_START_Y + 'px)');

            $arrowWrapper.show();

            isShowLoading = false;
            isDoingStop = false;

            if (typeof onEnd === 'function') {
                onEnd();
            }

        }, 500); 
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

    window.mRefresh = mRefresh;

})(Zepto || jQuery);

