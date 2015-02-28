/**
 * Google Material Design Swipe To Refresh.   
 * By Gctang(https://github.com/lightningtgc)
 *
 * Three types of refresh:
 * 1. Above or coplanar with another surface
 * 2. Below another surface in z-space. 
 * 3. Button action refresh
 *
 */

;(function($){
    var $scrollEl = $(document.body);
    var $refreshMain, $spinnerWrapper, $arrowWrapper, $arrowMain;
    var scrollEl = document.body;

    var noShowClass = 'mui-refresh-noshow';
    var mainAnimatClass = 'mui-refresh-main-animat';

    var isShowLoading = false;
    var isStoping = false;
    var isBtnAction = false;

    var NUM_POS_START_Y = -85;
    var NUM_POS_TARGET_Y = 0; // Where to stop
    var NUM_POS_MAX_Y = 65;   // Max position for the moving distance
    var NUM_POS_MIN_Y = -25;  // Min position for the moving distance
    var NUM_NAV_TARGET_ADDY = 20; // For custom nav bar

    var touchCurrentY;
    var touchStartY = 0;
    var customNavTop = 0;
    var verticalThreshold = 2;
    var maxRotateTime = 3000;
    var basePosY = 60;

    var onBegin = null;
    var onEnd = null;
    var stopAnimatTimeout = null;
    
    var refreshNav = '';

    var lastTime = new Date().getTime();

    var isIOS = $.os.ios;

    var tmpl = '<div id="muiRefresh" class="mui-refresh-main mui-refresh-main-animat mui-blue-theme" >\
        <div class="mui-refresh-wrapper ">\
            <div class="mui-arrow-wrapper">\
                <div class="mui-arrow-main"></div>\
            </div>\
            <div class="mui-spinner-wrapper" style="display:none;">\
                <div class="mui-spinner-main" >\
                    <div class="mui-spinner-left">\
                        <div class="mui-half-circle"></div>\
                    </div>\
                    <div class="mui-spinner-right">\
                        <div class="mui-half-circle"></div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>';

    // Defined the object to improve performance
    var touchPos = {
        top: 0,
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
    }

    // Default options 
    /* var opts = { */
    /*     scrollEl: null, //String  */
    /*     maxTime: 3000, //Number */
    /*     onBegin: null, //Function */
    /*     onEnd: null, //Function */
    /*     nav: null, //String */
    /*     index: 10001, //Number*/
    /*     top: '0px' //String */
    /* } */

    
    /* Known issue: 
     * 1.iOS feature when scrolling ,animation will stop  
     * 2. Animation display issue in anfroid like miui小米
     */

    /**
     * TODO list:
     * * theme extract
     *
     */

    // Main function to init the refresh style
    function mRefresh(options) {
        options = options || {};

        scrollEl = options.scrollEl ? options.scrollEl :
                        isIOS ? scrollEl : document;
        $scrollEl = $(scrollEl);

        // extend options
        onBegin = options.onBegin;
        onEnd = options.onEnd;
        maxRotateTime = options.maxTime || maxRotateTime;
        refreshNav = options.nav || refreshNav;

        if ($('#muirefresh').length === 0) {
            renderTmpl();

            $refreshMain = $('#muiRefresh');
            $spinnerWrapper = $('.mui-spinner-wrapper', $refreshMain);
            $arrowWrapper = $('.mui-arrow-wrapper', $refreshMain);
            $arrowMain = $('.mui-arrow-main', $refreshMain);
        }

        // Custom nav bar 
        if (!isDefaultType()) {
            $refreshMain.addClass('mui-refresh-nav');
            basePosY = $(refreshNav).height() + 20;
            if($(refreshNav).offset()){
                customNavTop = $(refreshNav).offset().top;
                basePosY += customNavTop;
                // Set init Y position
                $refreshMain.css('top', customNavTop + 'px');
            }

            //Set z-index to make sure ablow the nav bar
            var navIndex = $(refreshNav).css('z-index');
            $refreshMain.css('z-index', navIndex - 1);
        }

        //Set custom z-index
        if(options.index){
            $refreshMain.css('z-index', ~~options.index);
        }

        //Set custom top, to change the position
        if(options.top){
            $refreshMain.css('top', options.top);
        }

        bindEvents();
    }

    // Finish loading
    mRefresh.resolve = function() {
        if(!isStoping && stopAnimatTimeout){
            clearTimeout(stopAnimatTimeout);
            stopAnimatTimeout = null;

            recoverRefresh();
        }
    }

    // Destory refresh
    mRefresh.destroy = function(){
        unbindEvents();
        $refreshMain.remove();

    }

    // Button action refresh
    mRefresh.refresh = function() {
        // Do rotate
        if(!isShowLoading){
            var realTargetPos = basePosY + NUM_POS_TARGET_Y - 20;
            isShowLoading = true;
            isBtnAction = true;

            if (!isDefaultType()) {
                realTargetPos = realTargetPos + NUM_NAV_TARGET_ADDY;
            }
            
            //Romove animat time
            $refreshMain.removeClass(mainAnimatClass);
            // move to target position
            $refreshMain.css('top', realTargetPos + 'px');
            // make it small
            $refreshMain.css('-webkit-transform', 'scale(' + 0.01  + ')');
            
            setTimeout(doRotate, 60);
        }
    }

    // Render html template
    function renderTmpl(){
        document.body.insertAdjacentHTML('beforeend', tmpl);
    }


    function touchStart(e){
        if(isIOS && scrollEl == document.body){
            touchPos.top = window.scrollY;
        }else{
            touchPos.top = document.body.scrollTop;
        }

        if (touchPos.top > 0 || isShowLoading) {
            return;
        }

        touchCurrentY = basePosY + NUM_POS_START_Y;
        $refreshMain.show();
        
        if (e.touches[0]) {
            touchPos.x1 = e.touches[0].pageX;
            touchStartY = touchPos.y1 = e.touches[0].pageY;
        }
    }

    function touchMove(e){
        var thisTouch, distanceY;
        var now = new Date().getTime();

        if (touchPos.top > 0 || isShowLoading || !e.touches || e.touches.length !== 1) {
            // Just allow one finger
            return;
        }

        thisTouch = e.touches[0];

        touchPos.x2 = thisTouch.pageX;
        touchPos.y2 = thisTouch.pageY;

        // Distance for pageY change
        distanceY = touchPos.y2 - touchPos.y1;

        if (touchPos.y2 - touchStartY + verticalThreshold > 0) {
            e.preventDefault();  

            // Some android phone
            // Throttle, aviod jitter 
            if (now - lastTime < 90) {
                return;
            }

            if (touchCurrentY < basePosY - customNavTop + NUM_POS_MAX_Y) {
                touchCurrentY += distanceY ;
                moveCircle(touchCurrentY);
            } else {
                // Move over the max position will do the rotate
                doRotate();
                return;
            }

        }

        // y1 always is the current pageY
        touchPos.y1 = thisTouch.pageY;
        lastTime = now;
    }

    function touchEnd(e){
        if (touchPos.top > 0 || isShowLoading) {
            return;
        }
        e.preventDefault();
        
        if (touchCurrentY > basePosY - customNavTop + NUM_POS_MIN_Y) {
            // Should move over the min position
            doRotate();
        } else {
            backToStart();
        }
    }
    
    function backToStart() {
        var realStartPos = basePosY + NUM_POS_START_Y;
        if ( isDefaultType() ) {
            $refreshMain.css('top', realStartPos + 'px');
            $refreshMain.css('-webkit-transform', 'scale(' + 0  + ')');
        } else {
            // Distance must greater than NUM_POS_MIN_Y
            $refreshMain.css('top', customNavTop + 'px');
            /* $refreshMain.css('-webkit-transform', 'translateY(' + realStartPos + 'px)'); */
        }
        setTimeout(function(){
            // Handle button action
            if(!isShowLoading){
                $refreshMain.css('opacity', 0);
                $refreshMain.hide();
            }
        }, 300);
    }

    /**
     * moveCircle
     * touchmove change the circle style
     *
     * @param {number} y
     */

    function moveCircle(y){
        var scaleRate = 40;
        var scalePer = y / scaleRate > 1 ? 1 : y / scaleRate < 0 ? 0 : y / scaleRate;
        var currMoveY = basePosY + NUM_POS_START_Y + y;

        if (isDefaultType()) {
            // Small to Big
            $refreshMain.css('-webkit-transform', 'scale(' + scalePer  + ')');
        }
        /* $refreshMain.css('-webkit-transform', 'translateY('+ y + 'px)'); */

        $refreshMain.css('opacity', scalePer);
        // Change the position
        $refreshMain.css('top', currMoveY + 'px');
        $arrowMain.css('-webkit-transform', 'rotate(' + -(y * 3) + 'deg)');
        /* $arrowMain.css('transform', 'rotate(' + -(y * 3) + 'deg)'); */ 

    }


    /**
     * doRotate
     * Rotate the circle,and you can stop it by `mRefresh.resolve()`
     * or it wil stop within the time: `maxRotateTime`
     */
    function doRotate(){
        isShowLoading = true;
        // Do onBegin callback
        if (typeof onBegin === 'function') {
            onBegin();
        }

        // Make sure display entirely
        $refreshMain.css('opacity', 1);

        if (!isBtnAction) { 
            var realTargetPos = basePosY + NUM_POS_TARGET_Y - 20;
            if (!isDefaultType()) {
                realTargetPos = realTargetPos + NUM_NAV_TARGET_ADDY;
            }
            $refreshMain.css('top', realTargetPos + 'px');
            /* $refreshMain.css('-webkit-transform', 'translateY(' + realTargetPos + 'px)'); */
        } else {
            $refreshMain.addClass(mainAnimatClass);
            $refreshMain.css('-webkit-transform', 'scale(' + 1  + ')');
        }

        $arrowWrapper.hide();

        // Start animation
        $spinnerWrapper.show();

        // Timeout to stop animation
        stopAnimatTimeout = setTimeout(recoverRefresh, maxRotateTime);
    }

    /**
     * Recover Refresh
     * Hide the circle 
     */
    function recoverRefresh(){

        // For aviod resolve
        isStoping = true;

        // Stop animation 
        // translate and scale can't use together
        $refreshMain.addClass(noShowClass);

        $spinnerWrapper.hide();

        setTimeout(function(){
            $refreshMain.removeClass(noShowClass);
            $refreshMain.hide();
            
            backToStart();

            $arrowWrapper.show();

            isShowLoading = false;
            isStoping = false;
            isBtnAction = false;

            if (typeof onEnd === 'function') {
                onEnd();
            }

        }, 500); 
    }

    /**
     * isDefaultType
     * Check is type1: Above surface
     *
     * @return {Boolen}
     */
    function isDefaultType() {
       return $(refreshNav).length === 0;
    }

    function bindEvents() {
        $scrollEl.on('touchstart', touchStart);
        $scrollEl.on('touchmove', touchMove);
        $scrollEl.on('touchend', touchEnd);
    }

    function unbindEvents() {
        $scrollEl.off('touchstart', touchStart);
        $scrollEl.off('touchmove', touchMove);
        $scrollEl.off('touchend', touchEnd);
    }


    window.mRefresh = mRefresh;

})(Zepto || jQuery);

