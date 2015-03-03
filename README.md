# Material Refresh

> High Performance

> Mobile only

Google Material Design swipe (pull) to refresh.

It uses CSS3 and JavaScript depend on [Zepto](https://github.com/madrobby/zepto) or [jQuery](https://github.com/jquery/jquery).

Actually, it's easy to convert the dependent js library or just use the vanilla JavaScript.

It's high performancenot which not impact the structure of sites.

## Types and preview

##### Type1: `Above surface` (default)

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/above.gif" />

##### Type2: `Below surface`

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/below.gif" />
 <img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/below-color.gif" />

##### Type3: `Button action`

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/button-action.gif" />

## Demo

#### [The Live Demo](http://lightningtgc.github.io/material-refresh/)

## Getting Started

#### Install it

Include `material-refresh.min.js` and `material-refresh.min.css` in your target html file.

```html
<link rel='stylesheet' href='material-refresh.min.css'/>

<script src='material-refresh.min.js'></script>
```

Cause it is a plugin for `Zepto` or `jQuery`, so we also need to include `Zepto` or `jQuery`:
```html
<script src='zepto.js'></script>

<!-- or include jQuery.js-->
<script src='jQuery.js'></script>
```

Usually, we will combine and compress all the css or js, depend on your needs.

You can also install it via [Bower](https://github.com/bower/bower) or [npm](https://www.npmjs.com/):

```
bower install --save material-refresh
```
```
npm install --save material-refresh
```

## Basic usage

Example for `Type1: Above surface (default)`:

1.Instantiation:

```js
mRefresh();
```

2.Finish the refresh and hide it:

```js
mRefresh.resolve();
```

## Relations of three types

* `Type1` and `Type2` can not use in the same time.
* `Type3` is depend on `Type1` or `Type2`, cause it will determine the refresher position 
* `Type3` and (`Type1` or `Type2`) can use in the same time.

## Advanced usage

#### Options

```js
    // Default options 
    /* var opts = { */
    /*     nav: '', //String, using for Type2 */
    /*     scrollEl: '', //String  */
    /*     top: '0px', //String */
    /*     theme: '', //String */
    /*     index: 10001, //Number*/
    /*     maxTime: 3000, //Number */
    /*     freeze: false, //Boolen */
    /*     onBegin: null, //Function */
    /*     onEnd: null //Function */
    /* } */
    mRefresh(opts);
```

##### nav: 

-- Using for turn into `Type2`, refresh body will below the nav surface
 
```js
// Example
var opts = {
  nav: '#navMain'
}
```

##### scrollEl: 

-- Custom scroll wrapper element, decide which elemnt will allow trigger refresh action.

-- Default:{ ios:document.body,  android: document }

```js
var opts = {
  scrollEl: '#mainWrapper'
}
```

##### onBegin: (Callback Function)

-- Trigger when the refresh body `start` to rotate because of the right gesture(swipe). 

-- You can use this callback to pull ajax data or other action.

```js
var opts = {
  onBegin: function(){
    alert('Begin to rotate');
    $.get('/whatevs.html', function(response){
        $('#someDom').append(response);
    });
  }
}


##### onEnd: (Callback Function)

-- Trigger when `finished` the refresh 

-- Using like `onBegin`

##### top: 

-- Set `top` of the refresher. 

-- You can change its position finally by setting this option.

-- Default{ `Type1` :'0px', `Type2`: depend on the height and top of the nav element }

```js
var opts = {
  top: '50px'
}
```

##### index:

-- Set `z-index` of the refresher to change it in z-space.

-- Default { `Type1`: 10001,  `Type2`: (the z-index of nav element) - 1}

```js
var opts = {
  index: 99
}
```

##### theme: (Default: 'mui-blue-theme')

-- Set color or custom style of the refresher. 

-- You can write your own style in css file by using the className like 'mui-somecolor-theme'

```js
var opts = {
  theme: 'mui-red-theme'
}
```

##### maxTime: (Default: 6000ms)

-- Refresher will stop in the maxTime if you don't use `mRefresh.resolve()` to stop it.

-- You can change this maxTime  to make it longer or shorter.

```js
var opts = {
  maxTime: 2000
}
```

##### freeze: (Default: false)

-- The touch event of the refresher will not trigger if freeze is true.

-- You can use this option to prevent `Type1` or `Type2` and just allow `Type3: button action`

```js
var opts = {
  freeze: true
}
```

#### Type1: Above surface

You can custom your own refresher like:

```js
var opts = {
    maxTime: 3000,
    onBegin: function(){
      $.get('/whatevs.html', function(response){
        $('#someDom').append(response);
      });
    },
    onEnd: function(){
      alert('Finish the refresh');
    }
}

mRefresh(opts);
```

#### Type2: Below surface

Use `Type2` by setting the option `nav` to the top of the elements:

```js
// example
var opts = {
    nav: '#navMain',
    onBegin: function(){
      $.get('/whatevs.html', function(response){
        $('#someDom').append(response);
      });
    }
}

mRefresh(opts);
```

Then the refresher will below the surface of the `navMain` element.

#### Type3: Button action

If you had inited the refresher,you can bind the DOM event by using:
```js
$('#buttonAction').on('tap', function(){
  mRefresh.refresh();
});
```
When you click the `buttonAction` element, the refresher will show.

If you want to get some callback when start or stop to refresh,by using `onBegin` or `onEnd`:

```js
$('#buttonAction').on('tap', function(){
  var refreshOpts = {
    onBegin: function(){
      // Do something
      $.get('/whatevs.html', function(response){
        $('#someDom').append(response);
      });
    },
    onEnd: function(){
      alert('Finish!')
    }
  }
  mRefresh.refresh(refreshOpts);
});

```

If you want not to trigger `Type1` or `Type2`, and just need `Type3`.

```js
var opts = {
  freeze: true
}
mRefresh(opts);

$('#buttonAction').on('tap', function(){
  mRefresh.refresh();
});

```

Or 
```js
mRefresh();
mRefresh.unbindEvents();

$('#buttonAction').on('tap', function(){
  mRefresh.refresh();
});
```

## Browser support

Android 3 +

iOS 5 +

## Resource

[Google Material Design](http://www.google.com/design/spec/patterns/swipe-to-refresh.html#swipe-to-refresh-swipe-to-refresh)

## License

[MIT](http://opensource.org/licenses/mit-license.php)  © [Gctang](https://github.com/lightningtgc)
