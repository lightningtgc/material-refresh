# Material Refresh

> Material Design swipe (pull) to refresh

> High Performance

> Mobile only

It's not impact the structure of sites.

## Types and preview

Type1: `Above surface` (default)

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/above.gif" />

Type2: `Below surface`

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/below.gif" />
 <img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/below-color.gif" />

Type3: `Button action`

<img src="https://raw.githubusercontent.com/lightningtgc/material-refresh/gh-pages/styles/images/button-action.gif" />

## Demo

[The Live Demo](http://lightningtgc.github.io/material-refresh/)

## Getting Started

#### Install it

Include `material-refresh.js` and `material-refresh.css` in your target html file.

```html
<link rel='stylesheet' href='material-refresh.css'/>

<script src='material-refresh.js'></script>
```

Cause it is a plugin for `Zepto` or `jQuery`, so we also need to include `Zepto` or `jQuery`:
```html
<script src='zepto.js'></script>
<!-- or include jQuery.js-->
<script src='jQuery.js'></script>
```

Actually, we will combine and compress all the css or js, depend on your needs.

You can also install it via [Bower](https://github.com/bower/bower) or [npm](https://www.npmjs.com/):

Coming...

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

* nav: 

-- Using for turn into Type2, refresh body will below the nav surface
 
eg: 
```js
var opts = {
  nav: '#navigation'
}
```

* scrollEl: 

-- custom scroll wrapper element, decide which elemnt will allow trigger refresh action.

(Default:{ ios:document.body, android: document})

eg: 
```js
var opts = {
  scrollEl: '#mainWrapper'
}
```

* onBegin: (Callback Function)

-- Tigger when the refresh body start to rotate because of the right gesture(swipe). 

-- You can use this callback to pull ajax data or other action.

eg:
```js
var opts = {
  onBegin: function(){
    alert('Begin to rotate');
    $.get('/whatevs.html', function(response){
        $('#someDom').append(response);
    });
  }
}


* onEnd:

* top:

* theme:

* index:

* maxTime:

* freeze:

#### Type1: Above surface




## Browser support

Android 3 +

iOS 5 +

## Resource

[Google Material Design](http://www.google.com/design/spec/patterns/swipe-to-refresh.html#swipe-to-refresh-swipe-to-refresh)

## License

[MIT](http://opensource.org/licenses/mit-license.php)  © [Gctang](https://github.com/lightningtgc)
