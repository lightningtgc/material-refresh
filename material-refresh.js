(function() {
    "use strict";
    (function() {
        var refreshMain, spinnerWrapper, arrowWrapper, arrowMain;
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

        var isIOS = /ip(hone|ad|od)/i.test(navigator.userAgent);

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

        function parseIntPx(v) {
          var m = v.match('(\d+)px');
          if (m == null) return 0;
          return parseInt(m[1], 10);
        }

        // Main function to init the refresh style
        function mRefresh(options) {
            options = options || {};

            scrollEl = options.scrollEl ? options.scrollEl :
                            isIOS ? scrollEl : document;

            // extend options
            onBegin = options.onBegin;
            onEnd = options.onEnd;
            maxRotateTime = options.maxTime || maxRotateTime;
            refreshNav = options.nav || refreshNav;

            if (document.querySelectorAll('#muirefresh').length === 0) {
                renderTmpl();
            }

            refreshMain = document.querySelector('#muiRefresh');
            spinnerWrapper = refreshMain.querySelector('.mui-spinner-wrapper');
            arrowWrapper = refreshMain.querySelector('.mui-arrow-wrapper');
            arrowMain = refreshMain.querySelector('.mui-arrow-main');

            // Custom nav bar
            if (!isDefaultType()) {
                refreshMain.classList.add('mui-refresh-nav');
                basePosY = parseIntPx(refreshNav.style.height) + 20;
                var rect;
                if(rect = refreshNav.getBoundingClientRect()){
                    var top  = rect.top + document.body.scrollTop,
                        left = rect.left + document.body.scrollLeft;

                    customNavTop = top;
                    // Handle position fix
                    if(refreshNav.style.position !== 'fixed'){
                        basePosY += customNavTop;
                    }
                    // Set the first Y position
                    refreshMain.style.top = customNavTop + 'px';
                }

                //Set z-index to make sure ablow the nav bar
                var navIndex = refreshNav.style.zIndex;
                refreshMain.style.zIndex = navIndex - 1;
            }

            //Set custom z-index
            if(options.index){
                refreshMain.style.zIndex = ~~options.index;
            }

            //Set custom top, to change the position
            if(options.top){
                refreshMain.style.top = options.top;
            }

            // Extract theme
            if (options.theme) {
                refreshMain.classList.add(options.theme);
            } else {
                refreshMain.classList.add(blueThemeClass);
            }

            // Add Animation Class
            refreshMain.classList.add(mainAnimatClass);

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
            refreshMain.parentNode.removeChild(refreshMain);

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
                refreshMain.style.display = '';
                //Romove animat time
                refreshMain.classList.remove(mainAnimatClass);
                // move to target position
                refreshMain.style.top = realTargetPos + 'px';
                // make it small
                refreshMain.style.webkitTransform = 'scale(' + 0.01 + ')';

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
            refreshMain.style.display = '';

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
                refreshMain.style.top = realStartPos + 'px';
                refreshMain.style.webkitTransform = 'scale(' + 0  + ')';
            } else {
                // Distance must greater than NUM_POS_MIN_Y
                refreshMain.style.top = customNavTop + 'px';
                /* refreshMain.style.webkitTransform = 'translateY(' + realStartPos + 'px)'; */
            }
            setTimeout(function(){
                // Handle button action
                if(!isShowLoading){
                    refreshMain.style.opacity = 0;
                    refreshMain.style.display = 'none';
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
                refreshMain.style.webkitTransform = 'scale(' + scalePer  + ')';
            }
            /* refreshMain.style.webkitTransform = 'translateY('+ y + 'px)'; */

            refreshMain.style.opacity = scalePer;
            // Change the position
            refreshMain.style.top = currMoveY + 'px';
            arrowMain.style.webkitTransform = 'rotate(' + -(y * 3) + 'deg)';
            /* arrowMain.style.transform = 'rotate(' + -(y * 3) + 'deg)'; */

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
            refreshMain.style.opacity = 1;

            if (!isBtnAction) {
                var realTargetPos = basePosY + NUM_POS_TARGET_Y - 20;
                if (!isDefaultType()) {
                    realTargetPos = realTargetPos + NUM_NAV_TARGET_ADDY;
                }
                refreshMain.style.top = realTargetPos + 'px';
                /* refreshMain.style.webkitTransform = 'translateY(' + realTargetPos + 'px)'; */
            } else {
                refreshMain.classList.add(mainAnimatClass);
                refreshMain.style.webkitTransform = 'scale(' + 1  + ')';
            }

            arrowWrapper.style.display = 'none';

            // Start animation
            spinnerWrapper.style.display = '';

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
            refreshMain.classList.add(noShowClass);

            spinnerWrapper.style.display = 'none';

            setTimeout(function(){
                refreshMain.classList.remove(noShowClass);
                refreshMain.style.display = 'none';

                backToStart();

                arrowWrapper.style.display = '';

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
           return !refreshNav.length || document.querySelectorAll(refreshNav).length === 0;
        }

        function bindEvents() {
            scrollEl.addEventListener('touchstart', touchStart);
            scrollEl.addEventListener('touchmove', touchMove);
            scrollEl.addEventListener('touchend', touchEnd);
        }

        function unbindEvents() {
            scrollEl.removeEventListener('touchstart', touchStart);
            scrollEl.removeEventListener('touchmove', touchMove);
            scrollEl.removeEventListener('touchend', touchEnd);
        }


        window.mRefresh = mRefresh;

    })();
}).call(this);