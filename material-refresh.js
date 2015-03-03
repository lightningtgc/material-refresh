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
    var blueThemeClass = 'mui-blue-theme';

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
    var maxRotateTime = 6000; //Max time to stop rotate
    var basePosY = 60;

    var onBegin = null;
    var onBtnBegin= null;
    var onEnd = null;
    var onBtnEnd = null;
    var stopAnimatTimeout = null;
    
    var refreshNav = '';

    var lastTime = new Date().getTime();

    var isIOS = $.os.ios;

    var tmpl = '<div id="muiRefresh" class="mui-refresh-main">\
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
    /*     scrollEl: '', //String  */
    /*     nav: '', //String */
    /*     top: '0px', //String */
    /*     theme: '', //String */
    /*     index: 10001, //Number*/
    /*     maxTime: 3000, //Number */
    /*     freeze: false, //Boolen */
    /*     onBegin: null, //Function */
    /*     onEnd: null //Function */
    /* } */

    
    /* Known issue: 
     * 1. iOS feature when scrolling ,animation will stop  
     * 2. Animation display issue in anfroid like miui小米
     *
     *
     * TODO list:
     * 1. Using translate and scale together to replace top 
     * 2. Optimize circle rotate animation
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
        }

        $refreshMain = $('#muiRefresh');
        $spinnerWrapper = $('.mui-spinner-wrapper', $refreshMain);
        $arrowWrapper = $('.mui-arrow-wrapper', $refreshMain);
        $arrowMain = $('.mui-arrow-main', $refreshMain);

        // Custom nav bar 
        if (!isDefaultType()) {
            $refreshMain.addClass('mui-refresh-nav');
            basePosY = $(refreshNav).height() + 20;
            if($(refreshNav).offset()){
                customNavTop = $(refreshNav).offset().top;
                // Handle position fix
                if($(refreshNav).css('position') !== 'fixed'){
                    basePosY += customNavTop;
                }
                // Set the first Y position
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

        // Extract theme 
        if (options.theme) {
            $refreshMain.addClass(options.theme);
        } else {
            $refreshMain.addClass(blueThemeClass);
        }

        // Add Animation Class
        $refreshMain.addClass(mainAnimatClass);

        if(!options.freeze){
            bindEvents();
        }
    }

    // Public Methods

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

    // Type3: Button action refresh
    mRefresh.refresh = function(opt) {
        // Do rotate
        if(!isShowLoading){
            var realTargetPos = basePosY + NUM_POS_TARGET_Y - 20;
            isShowLoading = true;
            isBtnAction = true;

            opt = opt || {};
            onBtnBegin = opt.onBegin;
            onBtnEnd = opt.onEnd;

            if (!isDefaultType()) {
                realTargetPos = realTargetPos + NUM_NAV_TARGET_ADDY;
            }
            
            // Handle freeze
            $refreshMain.show();
            //Romove animat time
            $refreshMain.removeClass(mainAnimatClass);
            // move to target position
            $refreshMain.css('top', realTargetPos + 'px');
            // make it small
            $refreshMain.css('-webkit-transform', 'scale(' + 0.01  + ')');
            
            setTimeout(doRotate, 60);
        }
    }

    // Unbind touch events,for freeze type1 and type2
    mRefresh.unbindEvents = function(){
        unbindEvents();
    }

    mRefresh.bindEvents = function(){
        bindEvents();
    }

    // Render html template
    function renderTmpl(){
        document.body.insertAdjacentHTML('beforeend', tmpl);
    }


    function touchStart(e){
        if(isIOS && scrollEl == document.body){
            touchPos.top = window.scrollY;
        }else if(scrollEl != document){
            touchPos.top = document.querySelector(scrollEl).scrollTop;
        } else {
            touchPos.top = (document.documentElement || document.body.parentNode || document.body).scrollTop;
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
    
    /**
     * backToStart
     * Return to start position
     */
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
        // Do button action callback
        if (isBtnAction && typeof onBtnBegin === 'function') {
            onBtnBegin();
        } else if (typeof onBegin === 'function') {
            // Do onBegin callback
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
        $refreshMain.addClass(noShowClass);

        $spinnerWrapper.hide();

        setTimeout(function(){
            $refreshMain.removeClass(noShowClass);
            $refreshMain.hide();
            
            backToStart();

            $arrowWrapper.show();

            isShowLoading = false;
            isStoping = false;

            if (isBtnAction && typeof onBtnEnd === 'function') {
                onBtnEnd();
            } else if (typeof onEnd === 'function') {
                onEnd();
            }
            
            isBtnAction = false;
            
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

