/*!
 * imagesLoaded PACKAGED v3.0.2
 * JavaScript is all like "You images are done yet or what?"
 */

/*!
 * EventEmitter v4.1.0 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function (exports) {
	// Place the script in strict mode
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size

	// Easy access to the prototype
	var proto = EventEmitter.prototype,
		nativeIndexOf = Array.prototype.indexOf ? true : false;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function} listener Method to look for.
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listener, listeners) {
		// Return the index via the native method if possible
		if (nativeIndexOf) {
			return listeners.indexOf(listener);
		}

		// There is no native method
		// Use a manual loop to find the index
		var i = listeners.length;
		while (i--) {
			// If the listener matches, return it's index
			if (listeners[i] === listener) {
				return i;
			}
		}

		// Default to returning -1
		return -1;
	}

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function () {
		return this._events || (this._events = {});
	};

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function (evt) {
		// Create a shortcut to the storage object
		// Initialise it if it does not exists yet
		var events = this._getEvents(),
			response,
			key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (typeof evt === 'object') {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function (evt) {
		var listeners = this.getListeners(evt),
			response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function (evt, listener) {
		var listeners = this.getListenersAsObject(evt),
			key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) &&
				indexOfListener(listener, listeners[key]) === -1) {
				listeners[key].push(listener);
			}
		}

		// Return the instance of EventEmitter to allow chaining
		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = proto.addListener;

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function (evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function (evts)
	{
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function (evt, listener) {
		var listeners = this.getListenersAsObject(evt),
			index,
			key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listener, listeners[key]);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		// Return the instance of EventEmitter to allow chaining
		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = proto.removeListener;

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function (evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function (evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function (remove, evt, listeners) {
		// Initialise any required variables
		var i,
			value,
			single = remove ? this.removeListener : this.addListener,
			multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		// Return the instance of EventEmitter to allow chaining
		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function (evt) {
		var type = typeof evt,
			events = this._getEvents(),
			key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (type === 'object') {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		// Return the instance of EventEmitter to allow chaining
		return this;
	};

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function (evt, args) {
		var listeners = this.getListenersAsObject(evt),
			i,
			key,
			response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					response = args ? listeners[key][i].apply(null, args) : listeners[key][i]();
					if (response === true) {
						this.removeListener(evt, listeners[key][i]);
					}
				}
			}
		}

		// Return the instance of EventEmitter to allow chaining
		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = proto.emitEvent;

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function (evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	// Expose the class either via AMD or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return EventEmitter;
		});
	}
	else {
		exports.EventEmitter = EventEmitter;
	}
}(this));
/*!
 * eventie v1.0.3
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = window.event;
        // add event.target
        event.target = event.target || event.srcElement;
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = window.event;
        // add event.target
        event.target = event.target || event.srcElement;
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

/*!
 * imagesLoaded v3.0.2
 * JavaScript is all like "You images are done yet or what?"
 */

( function( window ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

// --------------------------  -------------------------- //

function defineImagesLoaded( EventEmitter, eventie ) {

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    this.emit( 'progress', this, image );
    if ( this.jqDeferred ) {
      this.jqDeferred.notify( this, image );
    }
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emit( eventName, this );
    this.emit( 'always', this );
    if ( this.jqDeferred ) {
      var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[ jqMethod ]( this );
    }
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  var cache = {};

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var cached = cache[ this.img.src ];
    if ( cached ) {
      this.useCached( cached );
      return;
    }
    // add this to cache
    cache[ this.img.src ] = this;

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var proxyImage = this.proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.useCached = function( cached ) {
    if ( cached.isConfirmed ) {
      this.confirm( cached.isLoaded, 'cached was confirmed' );
    } else {
      var _this = this;
      cached.on( 'confirm', function( image ) {
        _this.confirm( image.isLoaded, 'cache emitted confirmed' );
        return true; // bind once
      });
    }
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // trigger specified handler for event type
  LoadingImage.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  LoadingImage.prototype.onload = function() {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents();
  };

  LoadingImage.prototype.onerror = function() {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents();
  };

  LoadingImage.prototype.unbindProxyEvents = function() {
    eventie.unbind( this.proxyImage, 'load', this );
    eventie.unbind( this.proxyImage, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;
}

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'eventEmitter',
      'eventie'
    ],
    defineImagesLoaded );
} else {
  // browser global
  window.imagesLoaded = defineImagesLoaded(
    window.EventEmitter,
    window.eventie
  );
}

})( window );
/*!
 * Isotope PACKAGED v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */

!function(t,e){"function"==typeof define&&define.amd?define("jquery-bridget/jquery-bridget",["jquery"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("jquery")):t.jQueryBridget=e(t,t.jQuery)}(window,function(t,e){"use strict";function i(i,s,a){function u(t,e,o){var n,s="$()."+i+'("'+e+'")';return t.each(function(t,u){var h=a.data(u,i);if(!h)return void r(i+" not initialized. Cannot call methods, i.e. "+s);var d=h[e];if(!d||"_"==e.charAt(0))return void r(s+" is not a valid method");var l=d.apply(h,o);n=void 0===n?l:n}),void 0!==n?n:t}function h(t,e){t.each(function(t,o){var n=a.data(o,i);n?(n.option(e),n._init()):(n=new s(o,e),a.data(o,i,n))})}a=a||e||t.jQuery,a&&(s.prototype.option||(s.prototype.option=function(t){a.isPlainObject(t)&&(this.options=a.extend(!0,this.options,t))}),a.fn[i]=function(t){if("string"==typeof t){var e=n.call(arguments,1);return u(this,t,e)}return h(this,t),this},o(a))}function o(t){!t||t&&t.bridget||(t.bridget=i)}var n=Array.prototype.slice,s=t.console,r="undefined"==typeof s?function(){}:function(t){s.error(t)};return o(e||t.jQuery),i}),function(t,e){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",e):"object"==typeof module&&module.exports?module.exports=e():t.EvEmitter=e()}("undefined"!=typeof window?window:this,function(){function t(){}var e=t.prototype;return e.on=function(t,e){if(t&&e){var i=this._events=this._events||{},o=i[t]=i[t]||[];return o.indexOf(e)==-1&&o.push(e),this}},e.once=function(t,e){if(t&&e){this.on(t,e);var i=this._onceEvents=this._onceEvents||{},o=i[t]=i[t]||{};return o[e]=!0,this}},e.off=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var o=i.indexOf(e);return o!=-1&&i.splice(o,1),this}},e.emitEvent=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){i=i.slice(0),e=e||[];for(var o=this._onceEvents&&this._onceEvents[t],n=0;n<i.length;n++){var s=i[n],r=o&&o[s];r&&(this.off(t,s),delete o[s]),s.apply(this,e)}return this}},e.allOff=function(){delete this._events,delete this._onceEvents},t}),function(t,e){"function"==typeof define&&define.amd?define("get-size/get-size",e):"object"==typeof module&&module.exports?module.exports=e():t.getSize=e()}(window,function(){"use strict";function t(t){var e=parseFloat(t),i=t.indexOf("%")==-1&&!isNaN(e);return i&&e}function e(){}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0;e<h;e++){var i=u[e];t[i]=0}return t}function o(t){var e=getComputedStyle(t);return e||a("Style returned "+e+". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1"),e}function n(){if(!d){d=!0;var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style.boxSizing="border-box";var i=document.body||document.documentElement;i.appendChild(e);var n=o(e);r=200==Math.round(t(n.width)),s.isBoxSizeOuter=r,i.removeChild(e)}}function s(e){if(n(),"string"==typeof e&&(e=document.querySelector(e)),e&&"object"==typeof e&&e.nodeType){var s=o(e);if("none"==s.display)return i();var a={};a.width=e.offsetWidth,a.height=e.offsetHeight;for(var d=a.isBorderBox="border-box"==s.boxSizing,l=0;l<h;l++){var f=u[l],c=s[f],m=parseFloat(c);a[f]=isNaN(m)?0:m}var p=a.paddingLeft+a.paddingRight,y=a.paddingTop+a.paddingBottom,g=a.marginLeft+a.marginRight,v=a.marginTop+a.marginBottom,_=a.borderLeftWidth+a.borderRightWidth,z=a.borderTopWidth+a.borderBottomWidth,I=d&&r,x=t(s.width);x!==!1&&(a.width=x+(I?0:p+_));var S=t(s.height);return S!==!1&&(a.height=S+(I?0:y+z)),a.innerWidth=a.width-(p+_),a.innerHeight=a.height-(y+z),a.outerWidth=a.width+g,a.outerHeight=a.height+v,a}}var r,a="undefined"==typeof console?e:function(t){console.error(t)},u=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"],h=u.length,d=!1;return s}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("desandro-matches-selector/matches-selector",e):"object"==typeof module&&module.exports?module.exports=e():t.matchesSelector=e()}(window,function(){"use strict";var t=function(){var t=window.Element.prototype;if(t.matches)return"matches";if(t.matchesSelector)return"matchesSelector";for(var e=["webkit","moz","ms","o"],i=0;i<e.length;i++){var o=e[i],n=o+"MatchesSelector";if(t[n])return n}}();return function(e,i){return e[t](i)}}),function(t,e){"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["desandro-matches-selector/matches-selector"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("desandro-matches-selector")):t.fizzyUIUtils=e(t,t.matchesSelector)}(window,function(t,e){var i={};i.extend=function(t,e){for(var i in e)t[i]=e[i];return t},i.modulo=function(t,e){return(t%e+e)%e};var o=Array.prototype.slice;i.makeArray=function(t){if(Array.isArray(t))return t;if(null===t||void 0===t)return[];var e="object"==typeof t&&"number"==typeof t.length;return e?o.call(t):[t]},i.removeFrom=function(t,e){var i=t.indexOf(e);i!=-1&&t.splice(i,1)},i.getParent=function(t,i){for(;t.parentNode&&t!=document.body;)if(t=t.parentNode,e(t,i))return t},i.getQueryElement=function(t){return"string"==typeof t?document.querySelector(t):t},i.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},i.filterFindElements=function(t,o){t=i.makeArray(t);var n=[];return t.forEach(function(t){if(t instanceof HTMLElement){if(!o)return void n.push(t);e(t,o)&&n.push(t);for(var i=t.querySelectorAll(o),s=0;s<i.length;s++)n.push(i[s])}}),n},i.debounceMethod=function(t,e,i){i=i||100;var o=t.prototype[e],n=e+"Timeout";t.prototype[e]=function(){var t=this[n];clearTimeout(t);var e=arguments,s=this;this[n]=setTimeout(function(){o.apply(s,e),delete s[n]},i)}},i.docReady=function(t){var e=document.readyState;"complete"==e||"interactive"==e?setTimeout(t):document.addEventListener("DOMContentLoaded",t)},i.toDashed=function(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()};var n=t.console;return i.htmlInit=function(e,o){i.docReady(function(){var s=i.toDashed(o),r="data-"+s,a=document.querySelectorAll("["+r+"]"),u=document.querySelectorAll(".js-"+s),h=i.makeArray(a).concat(i.makeArray(u)),d=r+"-options",l=t.jQuery;h.forEach(function(t){var i,s=t.getAttribute(r)||t.getAttribute(d);try{i=s&&JSON.parse(s)}catch(a){return void(n&&n.error("Error parsing "+r+" on "+t.className+": "+a))}var u=new e(t,i);l&&l.data(t,o,u)})})},i}),function(t,e){"function"==typeof define&&define.amd?define("outlayer/item",["ev-emitter/ev-emitter","get-size/get-size"],e):"object"==typeof module&&module.exports?module.exports=e(require("ev-emitter"),require("get-size")):(t.Outlayer={},t.Outlayer.Item=e(t.EvEmitter,t.getSize))}(window,function(t,e){"use strict";function i(t){for(var e in t)return!1;return e=null,!0}function o(t,e){t&&(this.element=t,this.layout=e,this.position={x:0,y:0},this._create())}function n(t){return t.replace(/([A-Z])/g,function(t){return"-"+t.toLowerCase()})}var s=document.documentElement.style,r="string"==typeof s.transition?"transition":"WebkitTransition",a="string"==typeof s.transform?"transform":"WebkitTransform",u={WebkitTransition:"webkitTransitionEnd",transition:"transitionend"}[r],h={transform:a,transition:r,transitionDuration:r+"Duration",transitionProperty:r+"Property",transitionDelay:r+"Delay"},d=o.prototype=Object.create(t.prototype);d.constructor=o,d._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},d.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},d.getSize=function(){this.size=e(this.element)},d.css=function(t){var e=this.element.style;for(var i in t){var o=h[i]||i;e[o]=t[i]}},d.getPosition=function(){var t=getComputedStyle(this.element),e=this.layout._getOption("originLeft"),i=this.layout._getOption("originTop"),o=t[e?"left":"right"],n=t[i?"top":"bottom"],s=parseFloat(o),r=parseFloat(n),a=this.layout.size;o.indexOf("%")!=-1&&(s=s/100*a.width),n.indexOf("%")!=-1&&(r=r/100*a.height),s=isNaN(s)?0:s,r=isNaN(r)?0:r,s-=e?a.paddingLeft:a.paddingRight,r-=i?a.paddingTop:a.paddingBottom,this.position.x=s,this.position.y=r},d.layoutPosition=function(){var t=this.layout.size,e={},i=this.layout._getOption("originLeft"),o=this.layout._getOption("originTop"),n=i?"paddingLeft":"paddingRight",s=i?"left":"right",r=i?"right":"left",a=this.position.x+t[n];e[s]=this.getXValue(a),e[r]="";var u=o?"paddingTop":"paddingBottom",h=o?"top":"bottom",d=o?"bottom":"top",l=this.position.y+t[u];e[h]=this.getYValue(l),e[d]="",this.css(e),this.emitEvent("layout",[this])},d.getXValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&!e?t/this.layout.size.width*100+"%":t+"px"},d.getYValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&e?t/this.layout.size.height*100+"%":t+"px"},d._transitionTo=function(t,e){this.getPosition();var i=this.position.x,o=this.position.y,n=t==this.position.x&&e==this.position.y;if(this.setPosition(t,e),n&&!this.isTransitioning)return void this.layoutPosition();var s=t-i,r=e-o,a={};a.transform=this.getTranslate(s,r),this.transition({to:a,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},d.getTranslate=function(t,e){var i=this.layout._getOption("originLeft"),o=this.layout._getOption("originTop");return t=i?t:-t,e=o?e:-e,"translate3d("+t+"px, "+e+"px, 0)"},d.goTo=function(t,e){this.setPosition(t,e),this.layoutPosition()},d.moveTo=d._transitionTo,d.setPosition=function(t,e){this.position.x=parseFloat(t),this.position.y=parseFloat(e)},d._nonTransition=function(t){this.css(t.to),t.isCleaning&&this._removeStyles(t.to);for(var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)},d.transition=function(t){if(!parseFloat(this.layout.options.transitionDuration))return void this._nonTransition(t);var e=this._transn;for(var i in t.onTransitionEnd)e.onEnd[i]=t.onTransitionEnd[i];for(i in t.to)e.ingProperties[i]=!0,t.isCleaning&&(e.clean[i]=!0);if(t.from){this.css(t.from);var o=this.element.offsetHeight;o=null}this.enableTransition(t.to),this.css(t.to),this.isTransitioning=!0};var l="opacity,"+n(a);d.enableTransition=function(){if(!this.isTransitioning){var t=this.layout.options.transitionDuration;t="number"==typeof t?t+"ms":t,this.css({transitionProperty:l,transitionDuration:t,transitionDelay:this.staggerDelay||0}),this.element.addEventListener(u,this,!1)}},d.onwebkitTransitionEnd=function(t){this.ontransitionend(t)},d.onotransitionend=function(t){this.ontransitionend(t)};var f={"-webkit-transform":"transform"};d.ontransitionend=function(t){if(t.target===this.element){var e=this._transn,o=f[t.propertyName]||t.propertyName;if(delete e.ingProperties[o],i(e.ingProperties)&&this.disableTransition(),o in e.clean&&(this.element.style[t.propertyName]="",delete e.clean[o]),o in e.onEnd){var n=e.onEnd[o];n.call(this),delete e.onEnd[o]}this.emitEvent("transitionEnd",[this])}},d.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(u,this,!1),this.isTransitioning=!1},d._removeStyles=function(t){var e={};for(var i in t)e[i]="";this.css(e)};var c={transitionProperty:"",transitionDuration:"",transitionDelay:""};return d.removeTransitionStyles=function(){this.css(c)},d.stagger=function(t){t=isNaN(t)?0:t,this.staggerDelay=t+"ms"},d.removeElem=function(){this.element.parentNode.removeChild(this.element),this.css({display:""}),this.emitEvent("remove",[this])},d.remove=function(){return r&&parseFloat(this.layout.options.transitionDuration)?(this.once("transitionEnd",function(){this.removeElem()}),void this.hide()):void this.removeElem()},d.reveal=function(){delete this.isHidden,this.css({display:""});var t=this.layout.options,e={},i=this.getHideRevealTransitionEndProperty("visibleStyle");e[i]=this.onRevealTransitionEnd,this.transition({from:t.hiddenStyle,to:t.visibleStyle,isCleaning:!0,onTransitionEnd:e})},d.onRevealTransitionEnd=function(){this.isHidden||this.emitEvent("reveal")},d.getHideRevealTransitionEndProperty=function(t){var e=this.layout.options[t];if(e.opacity)return"opacity";for(var i in e)return i},d.hide=function(){this.isHidden=!0,this.css({display:""});var t=this.layout.options,e={},i=this.getHideRevealTransitionEndProperty("hiddenStyle");e[i]=this.onHideTransitionEnd,this.transition({from:t.visibleStyle,to:t.hiddenStyle,isCleaning:!0,onTransitionEnd:e})},d.onHideTransitionEnd=function(){this.isHidden&&(this.css({display:"none"}),this.emitEvent("hide"))},d.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},o}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("outlayer/outlayer",["ev-emitter/ev-emitter","get-size/get-size","fizzy-ui-utils/utils","./item"],function(i,o,n,s){return e(t,i,o,n,s)}):"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter"),require("get-size"),require("fizzy-ui-utils"),require("./item")):t.Outlayer=e(t,t.EvEmitter,t.getSize,t.fizzyUIUtils,t.Outlayer.Item)}(window,function(t,e,i,o,n){"use strict";function s(t,e){var i=o.getQueryElement(t);if(!i)return void(u&&u.error("Bad element for "+this.constructor.namespace+": "+(i||t)));this.element=i,h&&(this.$element=h(this.element)),this.options=o.extend({},this.constructor.defaults),this.option(e);var n=++l;this.element.outlayerGUID=n,f[n]=this,this._create();var s=this._getOption("initLayout");s&&this.layout()}function r(t){function e(){t.apply(this,arguments)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e}function a(t){if("number"==typeof t)return t;var e=t.match(/(^\d*\.?\d*)(\w*)/),i=e&&e[1],o=e&&e[2];if(!i.length)return 0;i=parseFloat(i);var n=m[o]||1;return i*n}var u=t.console,h=t.jQuery,d=function(){},l=0,f={};s.namespace="outlayer",s.Item=n,s.defaults={containerStyle:{position:"relative"},initLayout:!0,originLeft:!0,originTop:!0,resize:!0,resizeContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}};var c=s.prototype;o.extend(c,e.prototype),c.option=function(t){o.extend(this.options,t)},c._getOption=function(t){var e=this.constructor.compatOptions[t];return e&&void 0!==this.options[e]?this.options[e]:this.options[t]},s.compatOptions={initLayout:"isInitLayout",horizontal:"isHorizontal",layoutInstant:"isLayoutInstant",originLeft:"isOriginLeft",originTop:"isOriginTop",resize:"isResizeBound",resizeContainer:"isResizingContainer"},c._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),o.extend(this.element.style,this.options.containerStyle);var t=this._getOption("resize");t&&this.bindResize()},c.reloadItems=function(){this.items=this._itemize(this.element.children)},c._itemize=function(t){for(var e=this._filterFindItemElements(t),i=this.constructor.Item,o=[],n=0;n<e.length;n++){var s=e[n],r=new i(s,this);o.push(r)}return o},c._filterFindItemElements=function(t){return o.filterFindElements(t,this.options.itemSelector)},c.getItemElements=function(){return this.items.map(function(t){return t.element})},c.layout=function(){this._resetLayout(),this._manageStamps();var t=this._getOption("layoutInstant"),e=void 0!==t?t:!this._isLayoutInited;this.layoutItems(this.items,e),this._isLayoutInited=!0},c._init=c.layout,c._resetLayout=function(){this.getSize()},c.getSize=function(){this.size=i(this.element)},c._getMeasurement=function(t,e){var o,n=this.options[t];n?("string"==typeof n?o=this.element.querySelector(n):n instanceof HTMLElement&&(o=n),this[t]=o?i(o)[e]:n):this[t]=0},c.layoutItems=function(t,e){t=this._getItemsForLayout(t),this._layoutItems(t,e),this._postLayout()},c._getItemsForLayout=function(t){return t.filter(function(t){return!t.isIgnored})},c._layoutItems=function(t,e){if(this._emitCompleteOnItems("layout",t),t&&t.length){var i=[];t.forEach(function(t){var o=this._getItemLayoutPosition(t);o.item=t,o.isInstant=e||t.isLayoutInstant,i.push(o)},this),this._processLayoutQueue(i)}},c._getItemLayoutPosition=function(){return{x:0,y:0}},c._processLayoutQueue=function(t){this.updateStagger(),t.forEach(function(t,e){this._positionItem(t.item,t.x,t.y,t.isInstant,e)},this)},c.updateStagger=function(){var t=this.options.stagger;return null===t||void 0===t?void(this.stagger=0):(this.stagger=a(t),this.stagger)},c._positionItem=function(t,e,i,o,n){o?t.goTo(e,i):(t.stagger(n*this.stagger),t.moveTo(e,i))},c._postLayout=function(){this.resizeContainer()},c.resizeContainer=function(){var t=this._getOption("resizeContainer");if(t){var e=this._getContainerSize();e&&(this._setContainerMeasure(e.width,!0),this._setContainerMeasure(e.height,!1))}},c._getContainerSize=d,c._setContainerMeasure=function(t,e){if(void 0!==t){var i=this.size;i.isBorderBox&&(t+=e?i.paddingLeft+i.paddingRight+i.borderLeftWidth+i.borderRightWidth:i.paddingBottom+i.paddingTop+i.borderTopWidth+i.borderBottomWidth),t=Math.max(t,0),this.element.style[e?"width":"height"]=t+"px"}},c._emitCompleteOnItems=function(t,e){function i(){n.dispatchEvent(t+"Complete",null,[e])}function o(){r++,r==s&&i()}var n=this,s=e.length;if(!e||!s)return void i();var r=0;e.forEach(function(e){e.once(t,o)})},c.dispatchEvent=function(t,e,i){var o=e?[e].concat(i):i;if(this.emitEvent(t,o),h)if(this.$element=this.$element||h(this.element),e){var n=h.Event(e);n.type=t,this.$element.trigger(n,i)}else this.$element.trigger(t,i)},c.ignore=function(t){var e=this.getItem(t);e&&(e.isIgnored=!0)},c.unignore=function(t){var e=this.getItem(t);e&&delete e.isIgnored},c.stamp=function(t){t=this._find(t),t&&(this.stamps=this.stamps.concat(t),t.forEach(this.ignore,this))},c.unstamp=function(t){t=this._find(t),t&&t.forEach(function(t){o.removeFrom(this.stamps,t),this.unignore(t)},this)},c._find=function(t){if(t)return"string"==typeof t&&(t=this.element.querySelectorAll(t)),t=o.makeArray(t)},c._manageStamps=function(){this.stamps&&this.stamps.length&&(this._getBoundingRect(),this.stamps.forEach(this._manageStamp,this))},c._getBoundingRect=function(){var t=this.element.getBoundingClientRect(),e=this.size;this._boundingRect={left:t.left+e.paddingLeft+e.borderLeftWidth,top:t.top+e.paddingTop+e.borderTopWidth,right:t.right-(e.paddingRight+e.borderRightWidth),bottom:t.bottom-(e.paddingBottom+e.borderBottomWidth)}},c._manageStamp=d,c._getElementOffset=function(t){var e=t.getBoundingClientRect(),o=this._boundingRect,n=i(t),s={left:e.left-o.left-n.marginLeft,top:e.top-o.top-n.marginTop,right:o.right-e.right-n.marginRight,bottom:o.bottom-e.bottom-n.marginBottom};return s},c.handleEvent=o.handleEvent,c.bindResize=function(){t.addEventListener("resize",this),this.isResizeBound=!0},c.unbindResize=function(){t.removeEventListener("resize",this),this.isResizeBound=!1},c.onresize=function(){this.resize()},o.debounceMethod(s,"onresize",100),c.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},c.needsResizeLayout=function(){var t=i(this.element),e=this.size&&t;return e&&t.innerWidth!==this.size.innerWidth},c.addItems=function(t){var e=this._itemize(t);return e.length&&(this.items=this.items.concat(e)),e},c.appended=function(t){var e=this.addItems(t);e.length&&(this.layoutItems(e,!0),this.reveal(e))},c.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps(),this.layoutItems(e,!0),this.reveal(e),this.layoutItems(i)}},c.reveal=function(t){if(this._emitCompleteOnItems("reveal",t),t&&t.length){var e=this.updateStagger();t.forEach(function(t,i){t.stagger(i*e),t.reveal()})}},c.hide=function(t){if(this._emitCompleteOnItems("hide",t),t&&t.length){var e=this.updateStagger();t.forEach(function(t,i){t.stagger(i*e),t.hide()})}},c.revealItemElements=function(t){var e=this.getItems(t);this.reveal(e)},c.hideItemElements=function(t){var e=this.getItems(t);this.hide(e)},c.getItem=function(t){for(var e=0;e<this.items.length;e++){var i=this.items[e];if(i.element==t)return i}},c.getItems=function(t){t=o.makeArray(t);var e=[];return t.forEach(function(t){var i=this.getItem(t);i&&e.push(i)},this),e},c.remove=function(t){var e=this.getItems(t);this._emitCompleteOnItems("remove",e),e&&e.length&&e.forEach(function(t){t.remove(),o.removeFrom(this.items,t)},this)},c.destroy=function(){var t=this.element.style;t.height="",t.position="",t.width="",this.items.forEach(function(t){t.destroy()}),this.unbindResize();var e=this.element.outlayerGUID;delete f[e],delete this.element.outlayerGUID,h&&h.removeData(this.element,this.constructor.namespace)},s.data=function(t){t=o.getQueryElement(t);var e=t&&t.outlayerGUID;return e&&f[e]},s.create=function(t,e){var i=r(s);return i.defaults=o.extend({},s.defaults),o.extend(i.defaults,e),i.compatOptions=o.extend({},s.compatOptions),i.namespace=t,i.data=s.data,i.Item=r(n),o.htmlInit(i,t),h&&h.bridget&&h.bridget(t,i),i};var m={ms:1,s:1e3};return s.Item=n,s}),function(t,e){"function"==typeof define&&define.amd?define("isotope-layout/js/item",["outlayer/outlayer"],e):"object"==typeof module&&module.exports?module.exports=e(require("outlayer")):(t.Isotope=t.Isotope||{},t.Isotope.Item=e(t.Outlayer))}(window,function(t){"use strict";function e(){t.Item.apply(this,arguments)}var i=e.prototype=Object.create(t.Item.prototype),o=i._create;i._create=function(){this.id=this.layout.itemGUID++,o.call(this),this.sortData={}},i.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var t=this.layout.options.getSortData,e=this.layout._sorters;for(var i in t){var o=e[i];this.sortData[i]=o(this.element,this)}}};var n=i.destroy;return i.destroy=function(){n.apply(this,arguments),this.css({display:""})},e}),function(t,e){"function"==typeof define&&define.amd?define("isotope-layout/js/layout-mode",["get-size/get-size","outlayer/outlayer"],e):"object"==typeof module&&module.exports?module.exports=e(require("get-size"),require("outlayer")):(t.Isotope=t.Isotope||{},t.Isotope.LayoutMode=e(t.getSize,t.Outlayer))}(window,function(t,e){"use strict";function i(t){this.isotope=t,t&&(this.options=t.options[this.namespace],this.element=t.element,this.items=t.filteredItems,this.size=t.size)}var o=i.prototype,n=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout","_getOption"];return n.forEach(function(t){o[t]=function(){return e.prototype[t].apply(this.isotope,arguments)}}),o.needsVerticalResizeLayout=function(){var e=t(this.isotope.element),i=this.isotope.size&&e;return i&&e.innerHeight!=this.isotope.size.innerHeight},o._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},o.getColumnWidth=function(){this.getSegmentSize("column","Width")},o.getRowHeight=function(){this.getSegmentSize("row","Height")},o.getSegmentSize=function(t,e){var i=t+e,o="outer"+e;if(this._getMeasurement(i,o),!this[i]){var n=this.getFirstItemSize();this[i]=n&&n[o]||this.isotope.size["inner"+e]}},o.getFirstItemSize=function(){var e=this.isotope.filteredItems[0];return e&&e.element&&t(e.element)},o.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},o.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},i.modes={},i.create=function(t,e){function n(){i.apply(this,arguments)}return n.prototype=Object.create(o),n.prototype.constructor=n,e&&(n.options=e),n.prototype.namespace=t,i.modes[t]=n,n},i}),function(t,e){"function"==typeof define&&define.amd?define("masonry-layout/masonry",["outlayer/outlayer","get-size/get-size"],e):"object"==typeof module&&module.exports?module.exports=e(require("outlayer"),require("get-size")):t.Masonry=e(t.Outlayer,t.getSize)}(window,function(t,e){var i=t.create("masonry");i.compatOptions.fitWidth="isFitWidth";var o=i.prototype;return o._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns(),this.colYs=[];for(var t=0;t<this.cols;t++)this.colYs.push(0);this.maxY=0,this.horizontalColIndex=0},o.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var t=this.items[0],i=t&&t.element;this.columnWidth=i&&e(i).outerWidth||this.containerWidth}var o=this.columnWidth+=this.gutter,n=this.containerWidth+this.gutter,s=n/o,r=o-n%o,a=r&&r<1?"round":"floor";s=Math[a](s),this.cols=Math.max(s,1)},o.getContainerWidth=function(){var t=this._getOption("fitWidth"),i=t?this.element.parentNode:this.element,o=e(i);this.containerWidth=o&&o.innerWidth},o._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth%this.columnWidth,i=e&&e<1?"round":"ceil",o=Math[i](t.size.outerWidth/this.columnWidth);o=Math.min(o,this.cols);for(var n=this.options.horizontalOrder?"_getHorizontalColPosition":"_getTopColPosition",s=this[n](o,t),r={x:this.columnWidth*s.col,y:s.y},a=s.y+t.size.outerHeight,u=o+s.col,h=s.col;h<u;h++)this.colYs[h]=a;return r},o._getTopColPosition=function(t){var e=this._getTopColGroup(t),i=Math.min.apply(Math,e);return{col:e.indexOf(i),y:i}},o._getTopColGroup=function(t){if(t<2)return this.colYs;for(var e=[],i=this.cols+1-t,o=0;o<i;o++)e[o]=this._getColGroupY(o,t);return e},o._getColGroupY=function(t,e){if(e<2)return this.colYs[t];var i=this.colYs.slice(t,t+e);return Math.max.apply(Math,i)},o._getHorizontalColPosition=function(t,e){var i=this.horizontalColIndex%this.cols,o=t>1&&i+t>this.cols;i=o?0:i;var n=e.size.outerWidth&&e.size.outerHeight;return this.horizontalColIndex=n?i+t:this.horizontalColIndex,{col:i,y:this._getColGroupY(i,t)}},o._manageStamp=function(t){var i=e(t),o=this._getElementOffset(t),n=this._getOption("originLeft"),s=n?o.left:o.right,r=s+i.outerWidth,a=Math.floor(s/this.columnWidth);a=Math.max(0,a);var u=Math.floor(r/this.columnWidth);u-=r%this.columnWidth?0:1,u=Math.min(this.cols-1,u);for(var h=this._getOption("originTop"),d=(h?o.top:o.bottom)+i.outerHeight,l=a;l<=u;l++)this.colYs[l]=Math.max(d,this.colYs[l])},o._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var t={height:this.maxY};return this._getOption("fitWidth")&&(t.width=this._getContainerFitWidth()),t},o._getContainerFitWidth=function(){for(var t=0,e=this.cols;--e&&0===this.colYs[e];)t++;return(this.cols-t)*this.columnWidth-this.gutter},o.needsResizeLayout=function(){var t=this.containerWidth;return this.getContainerWidth(),t!=this.containerWidth},i}),function(t,e){"function"==typeof define&&define.amd?define("isotope-layout/js/layout-modes/masonry",["../layout-mode","masonry-layout/masonry"],e):"object"==typeof module&&module.exports?module.exports=e(require("../layout-mode"),require("masonry-layout")):e(t.Isotope.LayoutMode,t.Masonry)}(window,function(t,e){"use strict";var i=t.create("masonry"),o=i.prototype,n={_getElementOffset:!0,layout:!0,_getMeasurement:!0};for(var s in e.prototype)n[s]||(o[s]=e.prototype[s]);var r=o.measureColumns;o.measureColumns=function(){this.items=this.isotope.filteredItems,r.call(this)};var a=o._getOption;return o._getOption=function(t){return"fitWidth"==t?void 0!==this.options.isFitWidth?this.options.isFitWidth:this.options.fitWidth:a.apply(this.isotope,arguments)},i}),function(t,e){"function"==typeof define&&define.amd?define("isotope-layout/js/layout-modes/fit-rows",["../layout-mode"],e):"object"==typeof exports?module.exports=e(require("../layout-mode")):e(t.Isotope.LayoutMode)}(window,function(t){"use strict";var e=t.create("fitRows"),i=e.prototype;return i._resetLayout=function(){this.x=0,this.y=0,this.maxY=0,this._getMeasurement("gutter","outerWidth")},i._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth+this.gutter,i=this.isotope.size.innerWidth+this.gutter;0!==this.x&&e+this.x>i&&(this.x=0,this.y=this.maxY);var o={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+t.size.outerHeight),this.x+=e,o},i._getContainerSize=function(){return{height:this.maxY}},e}),function(t,e){"function"==typeof define&&define.amd?define("isotope-layout/js/layout-modes/vertical",["../layout-mode"],e):"object"==typeof module&&module.exports?module.exports=e(require("../layout-mode")):e(t.Isotope.LayoutMode)}(window,function(t){"use strict";var e=t.create("vertical",{horizontalAlignment:0}),i=e.prototype;return i._resetLayout=function(){this.y=0},i._getItemLayoutPosition=function(t){t.getSize();var e=(this.isotope.size.innerWidth-t.size.outerWidth)*this.options.horizontalAlignment,i=this.y;return this.y+=t.size.outerHeight,{x:e,y:i}},i._getContainerSize=function(){return{height:this.y}},e}),function(t,e){"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","desandro-matches-selector/matches-selector","fizzy-ui-utils/utils","isotope-layout/js/item","isotope-layout/js/layout-mode","isotope-layout/js/layout-modes/masonry","isotope-layout/js/layout-modes/fit-rows","isotope-layout/js/layout-modes/vertical"],function(i,o,n,s,r,a){return e(t,i,o,n,s,r,a)}):"object"==typeof module&&module.exports?module.exports=e(t,require("outlayer"),require("get-size"),require("desandro-matches-selector"),require("fizzy-ui-utils"),require("isotope-layout/js/item"),require("isotope-layout/js/layout-mode"),require("isotope-layout/js/layout-modes/masonry"),require("isotope-layout/js/layout-modes/fit-rows"),require("isotope-layout/js/layout-modes/vertical")):t.Isotope=e(t,t.Outlayer,t.getSize,t.matchesSelector,t.fizzyUIUtils,t.Isotope.Item,t.Isotope.LayoutMode)}(window,function(t,e,i,o,n,s,r){function a(t,e){return function(i,o){for(var n=0;n<t.length;n++){var s=t[n],r=i.sortData[s],a=o.sortData[s];if(r>a||r<a){var u=void 0!==e[s]?e[s]:e,h=u?1:-1;return(r>a?1:-1)*h}}return 0}}var u=t.jQuery,h=String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(/^\s+|\s+$/g,"")},d=e.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});d.Item=s,d.LayoutMode=r;var l=d.prototype;l._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),e.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var t in r.modes)this._initLayoutMode(t)},l.reloadItems=function(){this.itemGUID=0,e.prototype.reloadItems.call(this)},l._itemize=function(){for(var t=e.prototype._itemize.apply(this,arguments),i=0;i<t.length;i++){var o=t[i];o.id=this.itemGUID++}return this._updateItemsSortData(t),t},l._initLayoutMode=function(t){var e=r.modes[t],i=this.options[t]||{};this.options[t]=e.options?n.extend(e.options,i):i,this.modes[t]=new e(this)},l.layout=function(){return!this._isLayoutInited&&this._getOption("initLayout")?void this.arrange():void this._layout()},l._layout=function(){var t=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,t),this._isLayoutInited=!0},l.arrange=function(t){this.option(t),this._getIsInstant();var e=this._filter(this.items);this.filteredItems=e.matches,this._bindArrangeComplete(),this._isInstant?this._noTransition(this._hideReveal,[e]):this._hideReveal(e),this._sort(),this._layout()},l._init=l.arrange,l._hideReveal=function(t){this.reveal(t.needReveal),this.hide(t.needHide)},l._getIsInstant=function(){var t=this._getOption("layoutInstant"),e=void 0!==t?t:!this._isLayoutInited;return this._isInstant=e,e},l._bindArrangeComplete=function(){function t(){e&&i&&o&&n.dispatchEvent("arrangeComplete",null,[n.filteredItems])}var e,i,o,n=this;this.once("layoutComplete",function(){e=!0,t()}),this.once("hideComplete",function(){i=!0,t()}),this.once("revealComplete",function(){o=!0,t()})},l._filter=function(t){var e=this.options.filter;e=e||"*";for(var i=[],o=[],n=[],s=this._getFilterTest(e),r=0;r<t.length;r++){var a=t[r];if(!a.isIgnored){var u=s(a);u&&i.push(a),u&&a.isHidden?o.push(a):u||a.isHidden||n.push(a)}}return{matches:i,needReveal:o,needHide:n}},l._getFilterTest=function(t){return u&&this.options.isJQueryFiltering?function(e){return u(e.element).is(t);
}:"function"==typeof t?function(e){return t(e.element)}:function(e){return o(e.element,t)}},l.updateSortData=function(t){var e;t?(t=n.makeArray(t),e=this.getItems(t)):e=this.items,this._getSorters(),this._updateItemsSortData(e)},l._getSorters=function(){var t=this.options.getSortData;for(var e in t){var i=t[e];this._sorters[e]=f(i)}},l._updateItemsSortData=function(t){for(var e=t&&t.length,i=0;e&&i<e;i++){var o=t[i];o.updateSortData()}};var f=function(){function t(t){if("string"!=typeof t)return t;var i=h(t).split(" "),o=i[0],n=o.match(/^\[(.+)\]$/),s=n&&n[1],r=e(s,o),a=d.sortDataParsers[i[1]];return t=a?function(t){return t&&a(r(t))}:function(t){return t&&r(t)}}function e(t,e){return t?function(e){return e.getAttribute(t)}:function(t){var i=t.querySelector(e);return i&&i.textContent}}return t}();d.sortDataParsers={parseInt:function(t){return parseInt(t,10)},parseFloat:function(t){return parseFloat(t)}},l._sort=function(){if(this.options.sortBy){var t=n.makeArray(this.options.sortBy);this._getIsSameSortBy(t)||(this.sortHistory=t.concat(this.sortHistory));var e=a(this.sortHistory,this.options.sortAscending);this.filteredItems.sort(e)}},l._getIsSameSortBy=function(t){for(var e=0;e<t.length;e++)if(t[e]!=this.sortHistory[e])return!1;return!0},l._mode=function(){var t=this.options.layoutMode,e=this.modes[t];if(!e)throw new Error("No layout mode: "+t);return e.options=this.options[t],e},l._resetLayout=function(){e.prototype._resetLayout.call(this),this._mode()._resetLayout()},l._getItemLayoutPosition=function(t){return this._mode()._getItemLayoutPosition(t)},l._manageStamp=function(t){this._mode()._manageStamp(t)},l._getContainerSize=function(){return this._mode()._getContainerSize()},l.needsResizeLayout=function(){return this._mode().needsResizeLayout()},l.appended=function(t){var e=this.addItems(t);if(e.length){var i=this._filterRevealAdded(e);this.filteredItems=this.filteredItems.concat(i)}},l.prepended=function(t){var e=this._itemize(t);if(e.length){this._resetLayout(),this._manageStamps();var i=this._filterRevealAdded(e);this.layoutItems(this.filteredItems),this.filteredItems=i.concat(this.filteredItems),this.items=e.concat(this.items)}},l._filterRevealAdded=function(t){var e=this._filter(t);return this.hide(e.needHide),this.reveal(e.matches),this.layoutItems(e.matches,!0),e.matches},l.insert=function(t){var e=this.addItems(t);if(e.length){var i,o,n=e.length;for(i=0;i<n;i++)o=e[i],this.element.appendChild(o.element);var s=this._filter(e).matches;for(i=0;i<n;i++)e[i].isLayoutInstant=!0;for(this.arrange(),i=0;i<n;i++)delete e[i].isLayoutInstant;this.reveal(s)}};var c=l.remove;return l.remove=function(t){t=n.makeArray(t);var e=this.getItems(t);c.call(this,t);for(var i=e&&e.length,o=0;i&&o<i;o++){var s=e[o];n.removeFrom(this.filteredItems,s)}},l.shuffle=function(){for(var t=0;t<this.items.length;t++){var e=this.items[t];e.sortData.random=Math.random()}this.options.sortBy="random",this._sort(),this._layout()},l._noTransition=function(t,e){var i=this.options.transitionDuration;this.options.transitionDuration=0;var o=t.apply(this,e);return this.options.transitionDuration=i,o},l.getFilteredItemElements=function(){return this.filteredItems.map(function(t){return t.element})},d});
/*!
 * Name    : Just Another Parallax [Jarallax]
 * Version : 1.10.6
 * Author  : nK <https://nkdev.info>
 * GitHub  : https://github.com/nk-o/jarallax
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

    "use strict";


    module.exports = function (callback) {

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // Already ready or interactive, execute callback
            callback.call();
        } else if (document.attachEvent) {
            // Old browsers
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState === 'interactive') callback.call();
            });
        } else if (document.addEventListener) {
            // Modern browsers
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    /***/ }),
    /* 3 */,
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";
    /* WEBPACK VAR INJECTION */(function(global) {

    var win;

    if (typeof window !== "undefined") {
        win = window;
    } else if (typeof global !== "undefined") {
        win = global;
    } else if (typeof self !== "undefined") {
        win = self;
    } else {
        win = {};
    }

    module.exports = win;
    /* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

    /***/ }),
    /* 5 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var g;

    // This works in non-strict mode
    g = function () {
        return this;
    }();

    try {
        // This works if eval is allowed (see CSP)
        g = g || Function("return this")() || (1, eval)("this");
    } catch (e) {
        // This works if the window reference is available
        if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
    }

    // g can still be undefined, but nothing to do about it...
    // We return undefined, instead of nothing here, so it's
    // easier to handle this case. if(!global) { ...}

    module.exports = g;

    /***/ }),
    /* 6 */,
    /* 7 */,
    /* 8 */,
    /* 9 */,
    /* 10 */,
    /* 11 */
    /***/ (function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(12);


    /***/ }),
    /* 12 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _liteReady = __webpack_require__(2);

    var _liteReady2 = _interopRequireDefault(_liteReady);

    var _global = __webpack_require__(4);

    var _jarallax = __webpack_require__(13);

    var _jarallax2 = _interopRequireDefault(_jarallax);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // no conflict
    var oldPlugin = _global.window.jarallax;
    _global.window.jarallax = _jarallax2.default;
    _global.window.jarallax.noConflict = function () {
        _global.window.jarallax = oldPlugin;
        return this;
    };

    // jQuery support
    if (typeof _global.jQuery !== 'undefined') {
        var jQueryPlugin = function jQueryPlugin() {
            var args = arguments || [];
            Array.prototype.unshift.call(args, this);
            var res = _jarallax2.default.apply(_global.window, args);
            return (typeof res === 'undefined' ? 'undefined' : _typeof(res)) !== 'object' ? res : this;
        };
        jQueryPlugin.constructor = _jarallax2.default.constructor;

        // no conflict
        var oldJqPlugin = _global.jQuery.fn.jarallax;
        _global.jQuery.fn.jarallax = jQueryPlugin;
        _global.jQuery.fn.jarallax.noConflict = function () {
            _global.jQuery.fn.jarallax = oldJqPlugin;
            return this;
        };
    }

    // data-jarallax initialization
    (0, _liteReady2.default)(function () {
        (0, _jarallax2.default)(document.querySelectorAll('[data-jarallax]'));
    });

    /***/ }),
    /* 13 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";
    /* WEBPACK VAR INJECTION */(function(global) {

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _liteReady = __webpack_require__(2);

    var _liteReady2 = _interopRequireDefault(_liteReady);

    var _rafl = __webpack_require__(14);

    var _rafl2 = _interopRequireDefault(_rafl);

    var _global = __webpack_require__(4);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var isIE = navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1 || navigator.userAgent.indexOf('Edge/') > -1;

    var supportTransform = function () {
        var prefixes = 'transform WebkitTransform MozTransform'.split(' ');
        var div = document.createElement('div');
        for (var i = 0; i < prefixes.length; i++) {
            if (div && div.style[prefixes[i]] !== undefined) {
                return prefixes[i];
            }
        }
        return false;
    }();

    // Window data
    var wndW = void 0;
    var wndH = void 0;
    var wndY = void 0;
    var forceResizeParallax = false;
    var forceScrollParallax = false;
    function updateWndVars(e) {
        wndW = _global.window.innerWidth || document.documentElement.clientWidth;
        wndH = _global.window.innerHeight || document.documentElement.clientHeight;
        if ((typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' && (e.type === 'load' || e.type === 'dom-loaded')) {
            forceResizeParallax = true;
        }
    }
    updateWndVars();
    _global.window.addEventListener('resize', updateWndVars);
    _global.window.addEventListener('orientationchange', updateWndVars);
    _global.window.addEventListener('load', updateWndVars);
    (0, _liteReady2.default)(function () {
        updateWndVars({
            type: 'dom-loaded'
        });
    });

    // list with all jarallax instances
    // need to render all in one scroll/resize event
    var jarallaxList = [];

    // Animate if changed window size or scrolled page
    var oldPageData = false;
    function updateParallax() {
        if (!jarallaxList.length) {
            return;
        }

        if (_global.window.pageYOffset !== undefined) {
            wndY = _global.window.pageYOffset;
        } else {
            wndY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
        }

        var isResized = forceResizeParallax || !oldPageData || oldPageData.width !== wndW || oldPageData.height !== wndH;
        var isScrolled = forceScrollParallax || isResized || !oldPageData || oldPageData.y !== wndY;

        forceResizeParallax = false;
        forceScrollParallax = false;

        if (isResized || isScrolled) {
            jarallaxList.forEach(function (item) {
                if (isResized) {
                    item.onResize();
                }
                if (isScrolled) {
                    item.onScroll();
                }
            });

            oldPageData = {
                width: wndW,
                height: wndH,
                y: wndY
            };
        }

        (0, _rafl2.default)(updateParallax);
    }

    // ResizeObserver
    var resizeObserver = global.ResizeObserver ? new global.ResizeObserver(function (entry) {
        if (entry && entry.length) {
            (0, _rafl2.default)(function () {
                entry.forEach(function (item) {
                    if (item.target && item.target.jarallax) {
                        if (!forceResizeParallax) {
                            item.target.jarallax.onResize();
                        }
                        forceScrollParallax = true;
                    }
                });
            });
        }
    }) : false;

    var instanceID = 0;

    // Jarallax class

    var Jarallax = function () {
        function Jarallax(item, userOptions) {
            _classCallCheck(this, Jarallax);

            var self = this;

            self.instanceID = instanceID++;

            self.$item = item;

            self.defaults = {
                type: 'scroll', // type of parallax: scroll, scale, opacity, scale-opacity, scroll-opacity
                speed: 0.5, // supported value from -1 to 2
                imgSrc: null,
                imgElement: '.jarallax-img',
                imgSize: 'cover',
                imgPosition: '50% 50%',
                imgRepeat: 'no-repeat', // supported only for background, not for <img> tag
                keepImg: false, // keep <img> tag in it's default place
                elementInViewport: null,
                zIndex: -100,
                disableParallax: false,
                disableVideo: false,
                automaticResize: true, // use ResizeObserver to recalculate position and size of parallax image

                // video
                videoSrc: null,
                videoStartTime: 0,
                videoEndTime: 0,
                videoVolume: 0,
                videoPlayOnlyVisible: true,

                // events
                onScroll: null, // function(calculations) {}
                onInit: null, // function() {}
                onDestroy: null, // function() {}
                onCoverImage: null // function() {}
            };

            // DEPRECATED: old data-options
            var deprecatedDataAttribute = self.$item.getAttribute('data-jarallax');
            var oldDataOptions = JSON.parse(deprecatedDataAttribute || '{}');
            if (deprecatedDataAttribute) {
                // eslint-disable-next-line no-console
                console.warn('Detected usage of deprecated data-jarallax JSON options, you should use pure data-attribute options. See info here - https://github.com/nk-o/jarallax/issues/53');
            }

            // prepare data-options
            var dataOptions = self.$item.dataset || {};
            var pureDataOptions = {};
            Object.keys(dataOptions).forEach(function (key) {
                var loweCaseOption = key.substr(0, 1).toLowerCase() + key.substr(1);
                if (loweCaseOption && typeof self.defaults[loweCaseOption] !== 'undefined') {
                    pureDataOptions[loweCaseOption] = dataOptions[key];
                }
            });

            self.options = self.extend({}, self.defaults, oldDataOptions, pureDataOptions, userOptions);
            self.pureOptions = self.extend({}, self.options);

            // prepare 'true' and 'false' strings to boolean
            Object.keys(self.options).forEach(function (key) {
                if (self.options[key] === 'true') {
                    self.options[key] = true;
                } else if (self.options[key] === 'false') {
                    self.options[key] = false;
                }
            });

            // fix speed option [-1.0, 2.0]
            self.options.speed = Math.min(2, Math.max(-1, parseFloat(self.options.speed)));

            // deprecated noAndroid and noIos options
            if (self.options.noAndroid || self.options.noIos) {
                // eslint-disable-next-line no-console
                console.warn('Detected usage of deprecated noAndroid or noIos options, you should use disableParallax option. See info here - https://github.com/nk-o/jarallax/#disable-on-mobile-devices');

                // prepare fallback if disableParallax option is not used
                if (!self.options.disableParallax) {
                    if (self.options.noIos && self.options.noAndroid) {
                        self.options.disableParallax = /iPad|iPhone|iPod|Android/;
                    } else if (self.options.noIos) {
                        self.options.disableParallax = /iPad|iPhone|iPod/;
                    } else if (self.options.noAndroid) {
                        self.options.disableParallax = /Android/;
                    }
                }
            }

            // prepare disableParallax callback
            if (typeof self.options.disableParallax === 'string') {
                self.options.disableParallax = new RegExp(self.options.disableParallax);
            }
            if (self.options.disableParallax instanceof RegExp) {
                var disableParallaxRegexp = self.options.disableParallax;
                self.options.disableParallax = function () {
                    return disableParallaxRegexp.test(navigator.userAgent);
                };
            }
            if (typeof self.options.disableParallax !== 'function') {
                self.options.disableParallax = function () {
                    return false;
                };
            }

            // prepare disableVideo callback
            if (typeof self.options.disableVideo === 'string') {
                self.options.disableVideo = new RegExp(self.options.disableVideo);
            }
            if (self.options.disableVideo instanceof RegExp) {
                var disableVideoRegexp = self.options.disableVideo;
                self.options.disableVideo = function () {
                    return disableVideoRegexp.test(navigator.userAgent);
                };
            }
            if (typeof self.options.disableVideo !== 'function') {
                self.options.disableVideo = function () {
                    return false;
                };
            }

            // custom element to check if parallax in viewport
            var elementInVP = self.options.elementInViewport;
            // get first item from array
            if (elementInVP && (typeof elementInVP === 'undefined' ? 'undefined' : _typeof(elementInVP)) === 'object' && typeof elementInVP.length !== 'undefined') {
                var _elementInVP = elementInVP;

                var _elementInVP2 = _slicedToArray(_elementInVP, 1);

                elementInVP = _elementInVP2[0];
            }
            // check if dom element
            if (!(elementInVP instanceof Element)) {
                elementInVP = null;
            }
            self.options.elementInViewport = elementInVP;

            self.image = {
                src: self.options.imgSrc || null,
                $container: null,
                useImgTag: false,

                // position fixed is needed for the most of browsers because absolute position have glitches
                // on MacOS with smooth scroll there is a huge lags with absolute position - https://github.com/nk-o/jarallax/issues/75
                // on mobile devices better scrolled with absolute position
                position: /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ? 'absolute' : 'fixed'
            };

            if (self.initImg() && self.canInitParallax()) {
                self.init();
            }
        }

        // add styles to element


        _createClass(Jarallax, [{
            key: 'css',
            value: function css(el, styles) {
                if (typeof styles === 'string') {
                    return _global.window.getComputedStyle(el).getPropertyValue(styles);
                }

                // add transform property with vendor prefix
                if (styles.transform && supportTransform) {
                    styles[supportTransform] = styles.transform;
                }

                Object.keys(styles).forEach(function (key) {
                    el.style[key] = styles[key];
                });
                return el;
            }

            // Extend like jQuery.extend

        }, {
            key: 'extend',
            value: function extend(out) {
                var _arguments = arguments;

                out = out || {};
                Object.keys(arguments).forEach(function (i) {
                    if (!_arguments[i]) {
                        return;
                    }
                    Object.keys(_arguments[i]).forEach(function (key) {
                        out[key] = _arguments[i][key];
                    });
                });
                return out;
            }

            // get window size and scroll position. Useful for extensions

        }, {
            key: 'getWindowData',
            value: function getWindowData() {
                return {
                    width: wndW,
                    height: wndH,
                    y: wndY
                };
            }

            // Jarallax functions

        }, {
            key: 'initImg',
            value: function initImg() {
                var self = this;

                // find image element
                var $imgElement = self.options.imgElement;
                if ($imgElement && typeof $imgElement === 'string') {
                    $imgElement = self.$item.querySelector($imgElement);
                }
                // check if dom element
                if (!($imgElement instanceof Element)) {
                    $imgElement = null;
                }

                if ($imgElement) {
                    if (self.options.keepImg) {
                        self.image.$item = $imgElement.cloneNode(true);
                    } else {
                        self.image.$item = $imgElement;
                        self.image.$itemParent = $imgElement.parentNode;
                    }
                    self.image.useImgTag = true;
                }

                // true if there is img tag
                if (self.image.$item) {
                    return true;
                }

                // get image src
                if (self.image.src === null) {
                    self.image.src = self.css(self.$item, 'background-image').replace(/^url\(['"]?/g, '').replace(/['"]?\)$/g, '');
                }
                return !(!self.image.src || self.image.src === 'none');
            }
        }, {
            key: 'canInitParallax',
            value: function canInitParallax() {
                return supportTransform && !this.options.disableParallax();
            }
        }, {
            key: 'init',
            value: function init() {
                var self = this;
                var containerStyles = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    pointerEvents: 'none'
                };
                var imageStyles = {};

                if (!self.options.keepImg) {
                    // save default user styles
                    var curStyle = self.$item.getAttribute('style');
                    if (curStyle) {
                        self.$item.setAttribute('data-jarallax-original-styles', curStyle);
                    }
                    if (self.image.useImgTag) {
                        var curImgStyle = self.image.$item.getAttribute('style');
                        if (curImgStyle) {
                            self.image.$item.setAttribute('data-jarallax-original-styles', curImgStyle);
                        }
                    }
                }

                // set relative position and z-index to the parent
                if (self.css(self.$item, 'position') === 'static') {
                    self.css(self.$item, {
                        position: 'relative'
                    });
                }
                if (self.css(self.$item, 'z-index') === 'auto') {
                    self.css(self.$item, {
                        zIndex: 0
                    });
                }

                // container for parallax image
                self.image.$container = document.createElement('div');
                self.css(self.image.$container, containerStyles);
                self.css(self.image.$container, {
                    'z-index': self.options.zIndex
                });

                // fix for IE https://github.com/nk-o/jarallax/issues/110
                if (isIE) {
                    self.css(self.image.$container, {
                        opacity: 0.9999
                    });
                }

                self.image.$container.setAttribute('id', 'jarallax-container-' + self.instanceID);
                self.$item.appendChild(self.image.$container);

                // use img tag
                if (self.image.useImgTag) {
                    imageStyles = self.extend({
                        'object-fit': self.options.imgSize,
                        'object-position': self.options.imgPosition,
                        // support for plugin https://github.com/bfred-it/object-fit-images
                        'font-family': 'object-fit: ' + self.options.imgSize + '; object-position: ' + self.options.imgPosition + ';',
                        'max-width': 'none'
                    }, containerStyles, imageStyles);

                    // use div with background image
                } else {
                    self.image.$item = document.createElement('div');
                    if (self.image.src) {
                        imageStyles = self.extend({
                            'background-position': self.options.imgPosition,
                            'background-size': self.options.imgSize,
                            'background-repeat': self.options.imgRepeat,
                            'background-image': 'url("' + self.image.src + '")'
                        }, containerStyles, imageStyles);
                    }
                }

                if (self.options.type === 'opacity' || self.options.type === 'scale' || self.options.type === 'scale-opacity' || self.options.speed === 1) {
                    self.image.position = 'absolute';
                }

                // check if one of parents have transform style (without this check, scroll transform will be inverted if used parallax with position fixed)
                // discussion - https://github.com/nk-o/jarallax/issues/9
                if (self.image.position === 'fixed') {
                    var parentWithTransform = 0;
                    var $itemParents = self.$item;
                    while ($itemParents !== null && $itemParents !== document && parentWithTransform === 0) {
                        var parentTransform = self.css($itemParents, '-webkit-transform') || self.css($itemParents, '-moz-transform') || self.css($itemParents, 'transform');
                        if (parentTransform && parentTransform !== 'none') {
                            parentWithTransform = 1;
                            self.image.position = 'absolute';
                        }
                        $itemParents = $itemParents.parentNode;
                    }
                }

                // add position to parallax block
                imageStyles.position = self.image.position;

                // insert parallax image
                self.css(self.image.$item, imageStyles);
                self.image.$container.appendChild(self.image.$item);

                // set initial position and size
                self.onResize();
                self.onScroll(true);

                // ResizeObserver
                if (self.options.automaticResize && resizeObserver) {
                    resizeObserver.observe(self.$item);
                }

                // call onInit event
                if (self.options.onInit) {
                    self.options.onInit.call(self);
                }

                // remove default user background
                if (self.css(self.$item, 'background-image') !== 'none') {
                    self.css(self.$item, {
                        'background-image': 'none'
                    });
                }

                self.addToParallaxList();
            }

            // add to parallax instances list

        }, {
            key: 'addToParallaxList',
            value: function addToParallaxList() {
                jarallaxList.push(this);

                if (jarallaxList.length === 1) {
                    updateParallax();
                }
            }

            // remove from parallax instances list

        }, {
            key: 'removeFromParallaxList',
            value: function removeFromParallaxList() {
                var self = this;

                jarallaxList.forEach(function (item, key) {
                    if (item.instanceID === self.instanceID) {
                        jarallaxList.splice(key, 1);
                    }
                });
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                var self = this;

                self.removeFromParallaxList();

                // return styles on container as before jarallax init
                var originalStylesTag = self.$item.getAttribute('data-jarallax-original-styles');
                self.$item.removeAttribute('data-jarallax-original-styles');
                // null occurs if there is no style tag before jarallax init
                if (!originalStylesTag) {
                    self.$item.removeAttribute('style');
                } else {
                    self.$item.setAttribute('style', originalStylesTag);
                }

                if (self.image.useImgTag) {
                    // return styles on img tag as before jarallax init
                    var originalStylesImgTag = self.image.$item.getAttribute('data-jarallax-original-styles');
                    self.image.$item.removeAttribute('data-jarallax-original-styles');
                    // null occurs if there is no style tag before jarallax init
                    if (!originalStylesImgTag) {
                        self.image.$item.removeAttribute('style');
                    } else {
                        self.image.$item.setAttribute('style', originalStylesTag);
                    }

                    // move img tag to its default position
                    if (self.image.$itemParent) {
                        self.image.$itemParent.appendChild(self.image.$item);
                    }
                }

                // remove additional dom elements
                if (self.$clipStyles) {
                    self.$clipStyles.parentNode.removeChild(self.$clipStyles);
                }
                if (self.image.$container) {
                    self.image.$container.parentNode.removeChild(self.image.$container);
                }

                // call onDestroy event
                if (self.options.onDestroy) {
                    self.options.onDestroy.call(self);
                }

                // delete jarallax from item
                delete self.$item.jarallax;
            }

            // it will remove some image overlapping
            // overlapping occur due to an image position fixed inside absolute position element

        }, {
            key: 'clipContainer',
            value: function clipContainer() {
                // needed only when background in fixed position
                if (this.image.position !== 'fixed') {
                    return;
                }

                var self = this;
                var rect = self.image.$container.getBoundingClientRect();
                var width = rect.width,
                    height = rect.height;


                if (!self.$clipStyles) {
                    self.$clipStyles = document.createElement('style');
                    self.$clipStyles.setAttribute('type', 'text/css');
                    self.$clipStyles.setAttribute('id', 'jarallax-clip-' + self.instanceID);
                    var head = document.head || document.getElementsByTagName('head')[0];
                    head.appendChild(self.$clipStyles);
                }

                var styles = '#jarallax-container-' + self.instanceID + ' {\n           clip: rect(0 ' + width + 'px ' + height + 'px 0);\n           clip: rect(0, ' + width + 'px, ' + height + 'px, 0);\n        }';

                // add clip styles inline (this method need for support IE8 and less browsers)
                if (self.$clipStyles.styleSheet) {
                    self.$clipStyles.styleSheet.cssText = styles;
                } else {
                    self.$clipStyles.innerHTML = styles;
                }
            }
        }, {
            key: 'coverImage',
            value: function coverImage() {
                var self = this;

                var rect = self.image.$container.getBoundingClientRect();
                var contH = rect.height;
                var speed = self.options.speed;

                var isScroll = self.options.type === 'scroll' || self.options.type === 'scroll-opacity';
                var scrollDist = 0;
                var resultH = contH;
                var resultMT = 0;

                // scroll parallax
                if (isScroll) {
                    // scroll distance and height for image
                    if (speed < 0) {
                        scrollDist = speed * Math.max(contH, wndH);

                        if (wndH < contH) {
                            scrollDist -= speed * (contH - wndH);
                        }
                    } else {
                        scrollDist = speed * (contH + wndH);
                    }

                    // size for scroll parallax
                    if (speed > 1) {
                        resultH = Math.abs(scrollDist - wndH);
                    } else if (speed < 0) {
                        resultH = scrollDist / speed + Math.abs(scrollDist);
                    } else {
                        resultH += (wndH - contH) * (1 - speed);
                    }

                    scrollDist /= 2;
                }

                // store scroll distance
                self.parallaxScrollDistance = scrollDist;

                // vertical center
                if (isScroll) {
                    resultMT = (wndH - resultH) / 2;
                } else {
                    resultMT = (contH - resultH) / 2;
                }

                // apply result to item
                self.css(self.image.$item, {
                    height: resultH + 'px',
                    marginTop: resultMT + 'px',
                    left: self.image.position === 'fixed' ? rect.left + 'px' : '0',
                    width: rect.width + 'px'
                });

                // call onCoverImage event
                if (self.options.onCoverImage) {
                    self.options.onCoverImage.call(self);
                }

                // return some useful data. Used in the video cover function
                return {
                    image: {
                        height: resultH,
                        marginTop: resultMT
                    },
                    container: rect
                };
            }
        }, {
            key: 'isVisible',
            value: function isVisible() {
                return this.isElementInViewport || false;
            }
        }, {
            key: 'onScroll',
            value: function onScroll(force) {
                var self = this;

                var rect = self.$item.getBoundingClientRect();
                var contT = rect.top;
                var contH = rect.height;
                var styles = {};

                // check if in viewport
                var viewportRect = rect;
                if (self.options.elementInViewport) {
                    viewportRect = self.options.elementInViewport.getBoundingClientRect();
                }
                self.isElementInViewport = viewportRect.bottom >= 0 && viewportRect.right >= 0 && viewportRect.top <= wndH && viewportRect.left <= wndW;

                // stop calculations if item is not in viewport
                if (force ? false : !self.isElementInViewport) {
                    return;
                }

                // calculate parallax helping variables
                var beforeTop = Math.max(0, contT);
                var beforeTopEnd = Math.max(0, contH + contT);
                var afterTop = Math.max(0, -contT);
                var beforeBottom = Math.max(0, contT + contH - wndH);
                var beforeBottomEnd = Math.max(0, contH - (contT + contH - wndH));
                var afterBottom = Math.max(0, -contT + wndH - contH);
                var fromViewportCenter = 1 - 2 * (wndH - contT) / (wndH + contH);

                // calculate on how percent of section is visible
                var visiblePercent = 1;
                if (contH < wndH) {
                    visiblePercent = 1 - (afterTop || beforeBottom) / contH;
                } else if (beforeTopEnd <= wndH) {
                    visiblePercent = beforeTopEnd / wndH;
                } else if (beforeBottomEnd <= wndH) {
                    visiblePercent = beforeBottomEnd / wndH;
                }

                // opacity
                if (self.options.type === 'opacity' || self.options.type === 'scale-opacity' || self.options.type === 'scroll-opacity') {
                    styles.transform = 'translate3d(0,0,0)';
                    styles.opacity = visiblePercent;
                }

                // scale
                if (self.options.type === 'scale' || self.options.type === 'scale-opacity') {
                    var scale = 1;
                    if (self.options.speed < 0) {
                        scale -= self.options.speed * visiblePercent;
                    } else {
                        scale += self.options.speed * (1 - visiblePercent);
                    }
                    styles.transform = 'scale(' + scale + ') translate3d(0,0,0)';
                }

                // scroll
                if (self.options.type === 'scroll' || self.options.type === 'scroll-opacity') {
                    var positionY = self.parallaxScrollDistance * fromViewportCenter;

                    // fix if parallax block in absolute position
                    if (self.image.position === 'absolute') {
                        positionY -= contT;
                    }

                    styles.transform = 'translate3d(0,' + positionY + 'px,0)';
                }

                self.css(self.image.$item, styles);

                // call onScroll event
                if (self.options.onScroll) {
                    self.options.onScroll.call(self, {
                        section: rect,

                        beforeTop: beforeTop,
                        beforeTopEnd: beforeTopEnd,
                        afterTop: afterTop,
                        beforeBottom: beforeBottom,
                        beforeBottomEnd: beforeBottomEnd,
                        afterBottom: afterBottom,

                        visiblePercent: visiblePercent,
                        fromViewportCenter: fromViewportCenter
                    });
                }
            }
        }, {
            key: 'onResize',
            value: function onResize() {
                this.coverImage();
                this.clipContainer();
            }
        }]);

        return Jarallax;
    }();

    // global definition


    var plugin = function plugin(items) {
        // check for dom element
        // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        if ((typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? items instanceof HTMLElement : items && (typeof items === 'undefined' ? 'undefined' : _typeof(items)) === 'object' && items !== null && items.nodeType === 1 && typeof items.nodeName === 'string') {
            items = [items];
        }

        var options = arguments[1];
        var args = Array.prototype.slice.call(arguments, 2);
        var len = items.length;
        var k = 0;
        var ret = void 0;

        for (k; k < len; k++) {
            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' || typeof options === 'undefined') {
                if (!items[k].jarallax) {
                    items[k].jarallax = new Jarallax(items[k], options);
                }
            } else if (items[k].jarallax) {
                // eslint-disable-next-line prefer-spread
                ret = items[k].jarallax[options].apply(items[k].jarallax, args);
            }
            if (typeof ret !== 'undefined') {
                return ret;
            }
        }

        return items;
    };
    plugin.constructor = Jarallax;

    exports.default = plugin;
    /* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

    /***/ }),
    /* 14 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    var global = __webpack_require__(4);

    /**
     * `requestAnimationFrame()`
     */

    var request = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || fallback;

    var prev = +new Date();
    function fallback(fn) {
      var curr = +new Date();
      var ms = Math.max(0, 16 - (curr - prev));
      var req = setTimeout(fn, ms);
      return prev = curr, req;
    }

    /**
     * `cancelAnimationFrame()`
     */

    var cancel = global.cancelAnimationFrame || global.webkitCancelAnimationFrame || global.mozCancelAnimationFrame || clearTimeout;

    if (Function.prototype.bind) {
      request = request.bind(global);
      cancel = cancel.bind(global);
    }

    exports = module.exports = request;
    exports.cancel = cancel;

    /***/ })
    /******/ ]);

/*!
 * Name    : Video Background Extension for Jarallax
 * Version : 1.0.1
 * Author  : nK <https://nkdev.info>
 * GitHub  : https://github.com/nk-o/jarallax
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

    "use strict";


    module.exports = function (callback) {

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // Already ready or interactive, execute callback
            callback.call();
        } else if (document.attachEvent) {
            // Old browsers
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState === 'interactive') callback.call();
            });
        } else if (document.addEventListener) {
            // Modern browsers
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    /***/ }),
    /* 3 */,
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";
    /* WEBPACK VAR INJECTION */(function(global) {

    var win;

    if (typeof window !== "undefined") {
        win = window;
    } else if (typeof global !== "undefined") {
        win = global;
    } else if (typeof self !== "undefined") {
        win = self;
    } else {
        win = {};
    }

    module.exports = win;
    /* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(5)))

    /***/ }),
    /* 5 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var g;

    // This works in non-strict mode
    g = function () {
        return this;
    }();

    try {
        // This works if eval is allowed (see CSP)
        g = g || Function("return this")() || (1, eval)("this");
    } catch (e) {
        // This works if the window reference is available
        if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
    }

    // g can still be undefined, but nothing to do about it...
    // We return undefined, instead of nothing here, so it's
    // easier to handle this case. if(!global) { ...}

    module.exports = g;

    /***/ }),
    /* 6 */
    /***/ (function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(7);


    /***/ }),
    /* 7 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    var _videoWorker = __webpack_require__(8);

    var _videoWorker2 = _interopRequireDefault(_videoWorker);

    var _global = __webpack_require__(4);

    var _global2 = _interopRequireDefault(_global);

    var _liteReady = __webpack_require__(2);

    var _liteReady2 = _interopRequireDefault(_liteReady);

    var _jarallaxVideo = __webpack_require__(10);

    var _jarallaxVideo2 = _interopRequireDefault(_jarallaxVideo);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // add video worker globally to fallback jarallax < 1.10 versions
    _global2.default.VideoWorker = _global2.default.VideoWorker || _videoWorker2.default;

    (0, _jarallaxVideo2.default)();

    // data-jarallax-video initialization
    (0, _liteReady2.default)(function () {
        if (typeof jarallax !== 'undefined') {
            jarallax(document.querySelectorAll('[data-jarallax-video]'));
        }
    });

    /***/ }),
    /* 8 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    module.exports = __webpack_require__(9);

    /***/ }),
    /* 9 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    // Deferred
    // thanks http://stackoverflow.com/questions/18096715/implement-deferred-object-without-using-jquery
    function Deferred() {
        this._done = [];
        this._fail = [];
    }
    Deferred.prototype = {
        execute: function execute(list, args) {
            var i = list.length;
            args = Array.prototype.slice.call(args);
            while (i--) {
                list[i].apply(null, args);
            }
        },
        resolve: function resolve() {
            this.execute(this._done, arguments);
        },
        reject: function reject() {
            this.execute(this._fail, arguments);
        },
        done: function done(callback) {
            this._done.push(callback);
        },
        fail: function fail(callback) {
            this._fail.push(callback);
        }
    };

    var ID = 0;
    var YoutubeAPIadded = 0;
    var VimeoAPIadded = 0;
    var loadingYoutubePlayer = 0;
    var loadingVimeoPlayer = 0;
    var loadingYoutubeDefer = new Deferred();
    var loadingVimeoDefer = new Deferred();

    var VideoWorker = function () {
        function VideoWorker(url, options) {
            _classCallCheck(this, VideoWorker);

            var self = this;

            self.url = url;

            self.options_default = {
                autoplay: false,
                loop: false,
                mute: false,
                volume: 100,
                showContols: true,

                // start / end video time in seconds
                startTime: 0,
                endTime: 0
            };

            self.options = self.extend({}, self.options_default, options);

            // check URL
            self.videoID = self.parseURL(url);

            // init
            if (self.videoID) {
                self.ID = ID++;
                self.loadAPI();
                self.init();
            }
        }

        // Extend like jQuery.extend


        _createClass(VideoWorker, [{
            key: 'extend',
            value: function extend(out) {
                var _arguments = arguments;

                out = out || {};
                Object.keys(arguments).forEach(function (i) {
                    if (!_arguments[i]) {
                        return;
                    }
                    Object.keys(_arguments[i]).forEach(function (key) {
                        out[key] = _arguments[i][key];
                    });
                });
                return out;
            }
        }, {
            key: 'parseURL',
            value: function parseURL(url) {
                // parse youtube ID
                function getYoutubeID(ytUrl) {
                    // eslint-disable-next-line no-useless-escape
                    var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
                    var match = ytUrl.match(regExp);
                    return match && match[1].length === 11 ? match[1] : false;
                }

                // parse vimeo ID
                function getVimeoID(vmUrl) {
                    // eslint-disable-next-line no-useless-escape
                    var regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
                    var match = vmUrl.match(regExp);
                    return match && match[3] ? match[3] : false;
                }

                // parse local string
                function getLocalVideos(locUrl) {
                    // eslint-disable-next-line no-useless-escape
                    var videoFormats = locUrl.split(/,(?=mp4\:|webm\:|ogv\:|ogg\:)/);
                    var result = {};
                    var ready = 0;
                    videoFormats.forEach(function (val) {
                        // eslint-disable-next-line no-useless-escape
                        var match = val.match(/^(mp4|webm|ogv|ogg)\:(.*)/);
                        if (match && match[1] && match[2]) {
                            // eslint-disable-next-line prefer-destructuring
                            result[match[1] === 'ogv' ? 'ogg' : match[1]] = match[2];
                            ready = 1;
                        }
                    });
                    return ready ? result : false;
                }

                var Youtube = getYoutubeID(url);
                var Vimeo = getVimeoID(url);
                var Local = getLocalVideos(url);

                if (Youtube) {
                    this.type = 'youtube';
                    return Youtube;
                } else if (Vimeo) {
                    this.type = 'vimeo';
                    return Vimeo;
                } else if (Local) {
                    this.type = 'local';
                    return Local;
                }

                return false;
            }
        }, {
            key: 'isValid',
            value: function isValid() {
                return !!this.videoID;
            }

            // events

        }, {
            key: 'on',
            value: function on(name, callback) {
                this.userEventsList = this.userEventsList || [];

                // add new callback in events list
                (this.userEventsList[name] || (this.userEventsList[name] = [])).push(callback);
            }
        }, {
            key: 'off',
            value: function off(name, callback) {
                var _this = this;

                if (!this.userEventsList || !this.userEventsList[name]) {
                    return;
                }

                if (!callback) {
                    delete this.userEventsList[name];
                } else {
                    this.userEventsList[name].forEach(function (val, key) {
                        if (val === callback) {
                            _this.userEventsList[name][key] = false;
                        }
                    });
                }
            }
        }, {
            key: 'fire',
            value: function fire(name) {
                var _this2 = this;

                var args = [].slice.call(arguments, 1);
                if (this.userEventsList && typeof this.userEventsList[name] !== 'undefined') {
                    this.userEventsList[name].forEach(function (val) {
                        // call with all arguments
                        if (val) {
                            val.apply(_this2, args);
                        }
                    });
                }
            }
        }, {
            key: 'play',
            value: function play(start) {
                var self = this;
                if (!self.player) {
                    return;
                }

                if (self.type === 'youtube' && self.player.playVideo) {
                    if (typeof start !== 'undefined') {
                        self.player.seekTo(start || 0);
                    }
                    if (YT.PlayerState.PLAYING !== self.player.getPlayerState()) {
                        self.player.playVideo();
                    }
                }

                if (self.type === 'vimeo') {
                    if (typeof start !== 'undefined') {
                        self.player.setCurrentTime(start);
                    }
                    self.player.getPaused().then(function (paused) {
                        if (paused) {
                            self.player.play();
                        }
                    });
                }

                if (self.type === 'local') {
                    if (typeof start !== 'undefined') {
                        self.player.currentTime = start;
                    }
                    if (self.player.paused) {
                        self.player.play();
                    }
                }
            }
        }, {
            key: 'pause',
            value: function pause() {
                var self = this;
                if (!self.player) {
                    return;
                }

                if (self.type === 'youtube' && self.player.pauseVideo) {
                    if (YT.PlayerState.PLAYING === self.player.getPlayerState()) {
                        self.player.pauseVideo();
                    }
                }

                if (self.type === 'vimeo') {
                    self.player.getPaused().then(function (paused) {
                        if (!paused) {
                            self.player.pause();
                        }
                    });
                }

                if (self.type === 'local') {
                    if (!self.player.paused) {
                        self.player.pause();
                    }
                }
            }
        }, {
            key: 'mute',
            value: function mute() {
                var self = this;
                if (!self.player) {
                    return;
                }

                if (self.type === 'youtube' && self.player.mute) {
                    self.player.mute();
                }

                if (self.type === 'vimeo' && self.player.setVolume) {
                    self.player.setVolume(0);
                }

                if (self.type === 'local') {
                    self.$video.muted = true;
                }
            }
        }, {
            key: 'unmute',
            value: function unmute() {
                var self = this;
                if (!self.player) {
                    return;
                }

                if (self.type === 'youtube' && self.player.mute) {
                    self.player.unMute();
                }

                if (self.type === 'vimeo' && self.player.setVolume) {
                    self.player.setVolume(self.options.volume);
                }

                if (self.type === 'local') {
                    self.$video.muted = false;
                }
            }
        }, {
            key: 'setVolume',
            value: function setVolume() {
                var volume = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var self = this;
                if (!self.player || !volume) {
                    return;
                }

                if (self.type === 'youtube' && self.player.setVolume) {
                    self.player.setVolume(volume);
                }

                if (self.type === 'vimeo' && self.player.setVolume) {
                    self.player.setVolume(volume);
                }

                if (self.type === 'local') {
                    self.$video.volume = volume / 100;
                }
            }
        }, {
            key: 'getVolume',
            value: function getVolume(callback) {
                var self = this;
                if (!self.player) {
                    callback(false);
                    return;
                }

                if (self.type === 'youtube' && self.player.getVolume) {
                    callback(self.player.getVolume());
                }

                if (self.type === 'vimeo' && self.player.getVolume) {
                    self.player.getVolume().then(function (volume) {
                        callback(volume);
                    });
                }

                if (self.type === 'local') {
                    callback(self.$video.volume * 100);
                }
            }
        }, {
            key: 'getMuted',
            value: function getMuted(callback) {
                var self = this;
                if (!self.player) {
                    callback(null);
                    return;
                }

                if (self.type === 'youtube' && self.player.isMuted) {
                    callback(self.player.isMuted());
                }

                if (self.type === 'vimeo' && self.player.getVolume) {
                    self.player.getVolume().then(function (volume) {
                        callback(!!volume);
                    });
                }

                if (self.type === 'local') {
                    callback(self.$video.muted);
                }
            }
        }, {
            key: 'getImageURL',
            value: function getImageURL(callback) {
                var self = this;

                if (self.videoImage) {
                    callback(self.videoImage);
                    return;
                }

                if (self.type === 'youtube') {
                    var availableSizes = ['maxresdefault', 'sddefault', 'hqdefault', '0'];
                    var step = 0;

                    var tempImg = new Image();
                    tempImg.onload = function () {
                        // if no thumbnail, youtube add their own image with width = 120px
                        if ((this.naturalWidth || this.width) !== 120 || step === availableSizes.length - 1) {
                            // ok
                            self.videoImage = 'https://img.youtube.com/vi/' + self.videoID + '/' + availableSizes[step] + '.jpg';
                            callback(self.videoImage);
                        } else {
                            // try another size
                            step++;
                            this.src = 'https://img.youtube.com/vi/' + self.videoID + '/' + availableSizes[step] + '.jpg';
                        }
                    };
                    tempImg.src = 'https://img.youtube.com/vi/' + self.videoID + '/' + availableSizes[step] + '.jpg';
                }

                if (self.type === 'vimeo') {
                    var request = new XMLHttpRequest();
                    request.open('GET', 'https://vimeo.com/api/v2/video/' + self.videoID + '.json', true);
                    request.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            if (this.status >= 200 && this.status < 400) {
                                // Success!
                                var response = JSON.parse(this.responseText);
                                self.videoImage = response[0].thumbnail_large;
                                callback(self.videoImage);
                            } else {
                                // Error :(
                            }
                        }
                    };
                    request.send();
                    request = null;
                }
            }

            // fallback to the old version.

        }, {
            key: 'getIframe',
            value: function getIframe(callback) {
                this.getVideo(callback);
            }
        }, {
            key: 'getVideo',
            value: function getVideo(callback) {
                var self = this;

                // return generated video block
                if (self.$video) {
                    callback(self.$video);
                    return;
                }

                // generate new video block
                self.onAPIready(function () {
                    var hiddenDiv = void 0;
                    if (!self.$video) {
                        hiddenDiv = document.createElement('div');
                        hiddenDiv.style.display = 'none';
                    }

                    // Youtube
                    if (self.type === 'youtube') {
                        self.playerOptions = {};
                        self.playerOptions.videoId = self.videoID;
                        self.playerOptions.playerVars = {
                            autohide: 1,
                            rel: 0,
                            autoplay: 0,
                            // autoplay enable on mobile devices
                            playsinline: 1
                        };

                        // hide controls
                        if (!self.options.showContols) {
                            self.playerOptions.playerVars.iv_load_policy = 3;
                            self.playerOptions.playerVars.modestbranding = 1;
                            self.playerOptions.playerVars.controls = 0;
                            self.playerOptions.playerVars.showinfo = 0;
                            self.playerOptions.playerVars.disablekb = 1;
                        }

                        // events
                        var ytStarted = void 0;
                        var ytProgressInterval = void 0;
                        self.playerOptions.events = {
                            onReady: function onReady(e) {
                                // mute
                                if (self.options.mute) {
                                    e.target.mute();
                                } else if (self.options.volume) {
                                    e.target.setVolume(self.options.volume);
                                }

                                // autoplay
                                if (self.options.autoplay) {
                                    self.play(self.options.startTime);
                                }
                                self.fire('ready', e);

                                // volumechange
                                setInterval(function () {
                                    self.getVolume(function (volume) {
                                        if (self.options.volume !== volume) {
                                            self.options.volume = volume;
                                            self.fire('volumechange', e);
                                        }
                                    });
                                }, 150);
                            },
                            onStateChange: function onStateChange(e) {
                                // loop
                                if (self.options.loop && e.data === YT.PlayerState.ENDED) {
                                    self.play(self.options.startTime);
                                }
                                if (!ytStarted && e.data === YT.PlayerState.PLAYING) {
                                    ytStarted = 1;
                                    self.fire('started', e);
                                }
                                if (e.data === YT.PlayerState.PLAYING) {
                                    self.fire('play', e);
                                }
                                if (e.data === YT.PlayerState.PAUSED) {
                                    self.fire('pause', e);
                                }
                                if (e.data === YT.PlayerState.ENDED) {
                                    self.fire('ended', e);
                                }

                                // progress check
                                if (e.data === YT.PlayerState.PLAYING) {
                                    ytProgressInterval = setInterval(function () {
                                        self.fire('timeupdate', e);

                                        // check for end of video and play again or stop
                                        if (self.options.endTime && self.player.getCurrentTime() >= self.options.endTime) {
                                            if (self.options.loop) {
                                                self.play(self.options.startTime);
                                            } else {
                                                self.pause();
                                            }
                                        }
                                    }, 150);
                                } else {
                                    clearInterval(ytProgressInterval);
                                }
                            }
                        };

                        var firstInit = !self.$video;
                        if (firstInit) {
                            var div = document.createElement('div');
                            div.setAttribute('id', self.playerID);
                            hiddenDiv.appendChild(div);
                            document.body.appendChild(hiddenDiv);
                        }
                        self.player = self.player || new window.YT.Player(self.playerID, self.playerOptions);
                        if (firstInit) {
                            self.$video = document.getElementById(self.playerID);

                            // get video width and height
                            self.videoWidth = parseInt(self.$video.getAttribute('width'), 10) || 1280;
                            self.videoHeight = parseInt(self.$video.getAttribute('height'), 10) || 720;
                        }
                    }

                    // Vimeo
                    if (self.type === 'vimeo') {
                        self.playerOptions = '';

                        self.playerOptions += 'player_id=' + self.playerID;
                        self.playerOptions += '&autopause=0';
                        self.playerOptions += '&transparent=0';

                        // hide controls
                        if (!self.options.showContols) {
                            self.playerOptions += '&badge=0&byline=0&portrait=0&title=0';
                        }

                        // autoplay
                        self.playerOptions += '&autoplay=' + (self.options.autoplay ? '1' : '0');

                        // loop
                        self.playerOptions += '&loop=' + (self.options.loop ? 1 : 0);

                        if (!self.$video) {
                            self.$video = document.createElement('iframe');
                            self.$video.setAttribute('id', self.playerID);
                            self.$video.setAttribute('src', 'https://player.vimeo.com/video/' + self.videoID + '?' + self.playerOptions);
                            self.$video.setAttribute('frameborder', '0');
                            hiddenDiv.appendChild(self.$video);
                            document.body.appendChild(hiddenDiv);
                        }

                        self.player = self.player || new Vimeo.Player(self.$video);

                        // get video width and height
                        self.player.getVideoWidth().then(function (width) {
                            self.videoWidth = width || 1280;
                        });
                        self.player.getVideoHeight().then(function (height) {
                            self.videoHeight = height || 720;
                        });

                        // set current time for autoplay
                        if (self.options.startTime && self.options.autoplay) {
                            self.player.setCurrentTime(self.options.startTime);
                        }

                        // mute
                        if (self.options.mute) {
                            self.player.setVolume(0);
                        } else if (self.options.volume) {
                            self.player.setVolume(self.options.volume);
                        }

                        var vmStarted = void 0;
                        self.player.on('timeupdate', function (e) {
                            if (!vmStarted) {
                                self.fire('started', e);
                                vmStarted = 1;
                            }

                            self.fire('timeupdate', e);

                            // check for end of video and play again or stop
                            if (self.options.endTime) {
                                if (self.options.endTime && e.seconds >= self.options.endTime) {
                                    if (self.options.loop) {
                                        self.play(self.options.startTime);
                                    } else {
                                        self.pause();
                                    }
                                }
                            }
                        });
                        self.player.on('play', function (e) {
                            self.fire('play', e);

                            // check for the start time and start with it
                            if (self.options.startTime && e.seconds === 0) {
                                self.play(self.options.startTime);
                            }
                        });
                        self.player.on('pause', function (e) {
                            self.fire('pause', e);
                        });
                        self.player.on('ended', function (e) {
                            self.fire('ended', e);
                        });
                        self.player.on('loaded', function (e) {
                            self.fire('ready', e);
                        });
                        self.player.on('volumechange', function (e) {
                            self.fire('volumechange', e);
                        });
                    }

                    // Local
                    function addSourceToLocal(element, src, type) {
                        var source = document.createElement('source');
                        source.src = src;
                        source.type = type;
                        element.appendChild(source);
                    }
                    if (self.type === 'local') {
                        if (!self.$video) {
                            self.$video = document.createElement('video');

                            // show controls
                            if (self.options.showContols) {
                                self.$video.controls = true;
                            }

                            // mute
                            if (self.options.mute) {
                                self.$video.muted = true;
                            } else if (self.$video.volume) {
                                self.$video.volume = self.options.volume / 100;
                            }

                            // loop
                            if (self.options.loop) {
                                self.$video.loop = true;
                            }

                            // autoplay enable on mobile devices
                            self.$video.setAttribute('playsinline', '');
                            self.$video.setAttribute('webkit-playsinline', '');

                            self.$video.setAttribute('id', self.playerID);
                            hiddenDiv.appendChild(self.$video);
                            document.body.appendChild(hiddenDiv);

                            Object.keys(self.videoID).forEach(function (key) {
                                addSourceToLocal(self.$video, self.videoID[key], 'video/' + key);
                            });
                        }

                        self.player = self.player || self.$video;

                        var locStarted = void 0;
                        self.player.addEventListener('playing', function (e) {
                            if (!locStarted) {
                                self.fire('started', e);
                            }
                            locStarted = 1;
                        });
                        self.player.addEventListener('timeupdate', function (e) {
                            self.fire('timeupdate', e);

                            // check for end of video and play again or stop
                            if (self.options.endTime) {
                                if (self.options.endTime && this.currentTime >= self.options.endTime) {
                                    if (self.options.loop) {
                                        self.play(self.options.startTime);
                                    } else {
                                        self.pause();
                                    }
                                }
                            }
                        });
                        self.player.addEventListener('play', function (e) {
                            self.fire('play', e);
                        });
                        self.player.addEventListener('pause', function (e) {
                            self.fire('pause', e);
                        });
                        self.player.addEventListener('ended', function (e) {
                            self.fire('ended', e);
                        });
                        self.player.addEventListener('loadedmetadata', function () {
                            // get video width and height
                            self.videoWidth = this.videoWidth || 1280;
                            self.videoHeight = this.videoHeight || 720;

                            self.fire('ready');

                            // autoplay
                            if (self.options.autoplay) {
                                self.play(self.options.startTime);
                            }
                        });
                        self.player.addEventListener('volumechange', function (e) {
                            self.getVolume(function (volume) {
                                self.options.volume = volume;
                            });
                            self.fire('volumechange', e);
                        });
                    }

                    callback(self.$video);
                });
            }
        }, {
            key: 'init',
            value: function init() {
                var self = this;

                self.playerID = 'VideoWorker-' + self.ID;
            }
        }, {
            key: 'loadAPI',
            value: function loadAPI() {
                var self = this;

                if (YoutubeAPIadded && VimeoAPIadded) {
                    return;
                }

                var src = '';

                // load Youtube API
                if (self.type === 'youtube' && !YoutubeAPIadded) {
                    YoutubeAPIadded = 1;
                    src = 'https://www.youtube.com/iframe_api';
                }

                // load Vimeo API
                if (self.type === 'vimeo' && !VimeoAPIadded) {
                    VimeoAPIadded = 1;
                    src = 'https://player.vimeo.com/api/player.js';
                }

                if (!src) {
                    return;
                }

                // add script in head section
                var tag = document.createElement('script');
                var head = document.getElementsByTagName('head')[0];
                tag.src = src;

                head.appendChild(tag);

                head = null;
                tag = null;
            }
        }, {
            key: 'onAPIready',
            value: function onAPIready(callback) {
                var self = this;

                // Youtube
                if (self.type === 'youtube') {
                    // Listen for global YT player callback
                    if ((typeof YT === 'undefined' || YT.loaded === 0) && !loadingYoutubePlayer) {
                        // Prevents Ready event from being called twice
                        loadingYoutubePlayer = 1;

                        // Creates deferred so, other players know when to wait.
                        window.onYouTubeIframeAPIReady = function () {
                            window.onYouTubeIframeAPIReady = null;
                            loadingYoutubeDefer.resolve('done');
                            callback();
                        };
                    } else if ((typeof YT === 'undefined' ? 'undefined' : _typeof(YT)) === 'object' && YT.loaded === 1) {
                        callback();
                    } else {
                        loadingYoutubeDefer.done(function () {
                            callback();
                        });
                    }
                }

                // Vimeo
                if (self.type === 'vimeo') {
                    if (typeof Vimeo === 'undefined' && !loadingVimeoPlayer) {
                        loadingVimeoPlayer = 1;
                        var vimeoInterval = setInterval(function () {
                            if (typeof Vimeo !== 'undefined') {
                                clearInterval(vimeoInterval);
                                loadingVimeoDefer.resolve('done');
                                callback();
                            }
                        }, 20);
                    } else if (typeof Vimeo !== 'undefined') {
                        callback();
                    } else {
                        loadingVimeoDefer.done(function () {
                            callback();
                        });
                    }
                }

                // Local
                if (self.type === 'local') {
                    callback();
                }
            }
        }]);

        return VideoWorker;
    }();

    exports.default = VideoWorker;

    /***/ }),
    /* 10 */
    /***/ (function(module, exports, __webpack_require__) {

    "use strict";


    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = jarallaxVideo;

    var _videoWorker = __webpack_require__(8);

    var _videoWorker2 = _interopRequireDefault(_videoWorker);

    var _global = __webpack_require__(4);

    var _global2 = _interopRequireDefault(_global);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function jarallaxVideo() {
        var jarallax = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _global2.default.jarallax;

        if (typeof jarallax === 'undefined') {
            return;
        }

        var Jarallax = jarallax.constructor;

        // append video after init Jarallax
        var defInit = Jarallax.prototype.init;
        Jarallax.prototype.init = function () {
            var self = this;

            defInit.apply(self);

            if (self.video && !self.options.disableVideo()) {
                self.video.getVideo(function (video) {
                    var $parent = video.parentNode;
                    self.css(video, {
                        position: self.image.position,
                        top: '0px',
                        left: '0px',
                        right: '0px',
                        bottom: '0px',
                        width: '100%',
                        height: '100%',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        margin: 0,
                        zIndex: -1
                    });
                    self.$video = video;
                    self.image.$container.appendChild(video);

                    // remove parent video element (created by VideoWorker)
                    $parent.parentNode.removeChild($parent);
                });
            }
        };

        // cover video
        var defCoverImage = Jarallax.prototype.coverImage;
        Jarallax.prototype.coverImage = function () {
            var self = this;
            var imageData = defCoverImage.apply(self);
            var node = self.image.$item ? self.image.$item.nodeName : false;

            if (imageData && self.video && node && (node === 'IFRAME' || node === 'VIDEO')) {
                var h = imageData.image.height;
                var w = h * self.image.width / self.image.height;
                var ml = (imageData.container.width - w) / 2;
                var mt = imageData.image.marginTop;

                if (imageData.container.width > w) {
                    w = imageData.container.width;
                    h = w * self.image.height / self.image.width;
                    ml = 0;
                    mt += (imageData.image.height - h) / 2;
                }

                // add video height over than need to hide controls
                if (node === 'IFRAME') {
                    h += 400;
                    mt -= 200;
                }

                self.css(self.$video, {
                    width: w + 'px',
                    marginLeft: ml + 'px',
                    height: h + 'px',
                    marginTop: mt + 'px'
                });
            }

            return imageData;
        };

        // init video
        var defInitImg = Jarallax.prototype.initImg;
        Jarallax.prototype.initImg = function () {
            var self = this;
            var defaultResult = defInitImg.apply(self);

            if (!self.options.videoSrc) {
                self.options.videoSrc = self.$item.getAttribute('data-jarallax-video') || null;
            }

            if (self.options.videoSrc) {
                self.defaultInitImgResult = defaultResult;
                return true;
            }

            return defaultResult;
        };

        var defCanInitParallax = Jarallax.prototype.canInitParallax;
        Jarallax.prototype.canInitParallax = function () {
            var self = this;
            var defaultResult = defCanInitParallax.apply(self);

            if (!self.options.videoSrc) {
                return defaultResult;
            }

            var video = new _videoWorker2.default(self.options.videoSrc, {
                autoplay: true,
                loop: true,
                showContols: false,
                startTime: self.options.videoStartTime || 0,
                endTime: self.options.videoEndTime || 0,
                mute: self.options.videoVolume ? 0 : 1,
                volume: self.options.videoVolume || 0
            });

            if (video.isValid()) {
                // if parallax will not be inited, we can add thumbnail on background.
                if (!defaultResult) {
                    if (!self.defaultInitImgResult) {
                        video.getImageURL(function (url) {
                            // save default user styles
                            var curStyle = self.$item.getAttribute('style');
                            if (curStyle) {
                                self.$item.setAttribute('data-jarallax-original-styles', curStyle);
                            }

                            // set new background
                            self.css(self.$item, {
                                'background-image': 'url("' + url + '")',
                                'background-position': 'center',
                                'background-size': 'cover'
                            });
                        });
                    }

                    // init video
                } else {
                    video.on('ready', function () {
                        if (self.options.videoPlayOnlyVisible) {
                            var oldOnScroll = self.onScroll;
                            self.onScroll = function () {
                                oldOnScroll.apply(self);
                                if (self.isVisible()) {
                                    video.play();
                                } else {
                                    video.pause();
                                }
                            };
                        } else {
                            video.play();
                        }
                    });

                    video.on('started', function () {
                        self.image.$default_item = self.image.$item;
                        self.image.$item = self.$video;

                        // set video width and height
                        self.image.width = self.video.videoWidth || 1280;
                        self.image.height = self.video.videoHeight || 720;
                        self.options.imgWidth = self.image.width;
                        self.options.imgHeight = self.image.height;
                        self.coverImage();
                        self.clipContainer();
                        self.onScroll();

                        // hide image
                        if (self.image.$default_item) {
                            self.image.$default_item.style.display = 'none';
                        }
                    });

                    self.video = video;

                    // set image if not exists
                    if (!self.defaultInitImgResult) {
                        if (video.type !== 'local') {
                            video.getImageURL(function (url) {
                                self.image.src = url;
                                self.init();
                            });

                            return false;
                        }

                        // set empty image on local video if not defined
                        self.image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        return true;
                    }
                }
            }

            return defaultResult;
        };

        // Destroy video parallax
        var defDestroy = Jarallax.prototype.destroy;
        Jarallax.prototype.destroy = function () {
            var self = this;

            if (self.image.$default_item) {
                self.image.$item = self.image.$default_item;
                delete self.image.$default_item;
            }

            defDestroy.apply(self);
        };
    }

    /***/ })
    /******/ ]);
/**
 * SVGInjector v1.1.3 - Fast, caching, dynamic inline SVG DOM injection library
 * https://github.com/iconic/SVGInjector
 *
 * Copyright (c) 2014-2015 Waybury <hello@waybury.com>
 * @license MIT
 */
!function(t,e){"use strict";function r(t){t=t.split(" ");for(var e={},r=t.length,n=[];r--;)e.hasOwnProperty(t[r])||(e[t[r]]=1,n.unshift(t[r]));return n.join(" ")}var n="file:"===t.location.protocol,i=e.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1"),o=Array.prototype.forEach||function(t,e){if(void 0===this||null===this||"function"!=typeof t)throw new TypeError;var r,n=this.length>>>0;for(r=0;n>r;++r)r in this&&t.call(e,this[r],r,this)},a={},l=0,s=[],u=[],c={},f=function(t){return t.cloneNode(!0)},p=function(t,e){u[t]=u[t]||[],u[t].push(e)},d=function(t){for(var e=0,r=u[t].length;r>e;e++)!function(e){setTimeout(function(){u[t][e](f(a[t]))},0)}(e)},v=function(e,r){if(void 0!==a[e])a[e]instanceof SVGSVGElement?r(f(a[e])):p(e,r);else{if(!t.XMLHttpRequest)return r("Browser does not support XMLHttpRequest"),!1;a[e]={},p(e,r);var i=new XMLHttpRequest;i.onreadystatechange=function(){if(4===i.readyState){if(404===i.status||null===i.responseXML)return r("Unable to load SVG file: "+e),n&&r("Note: SVG injection ajax calls do not work locally without adjusting security setting in your browser. Or consider using a local webserver."),r(),!1;if(!(200===i.status||n&&0===i.status))return r("There was a problem injecting the SVG: "+i.status+" "+i.statusText),!1;if(i.responseXML instanceof Document)a[e]=i.responseXML.documentElement;else if(DOMParser&&DOMParser instanceof Function){var t;try{var o=new DOMParser;t=o.parseFromString(i.responseText,"text/xml")}catch(l){t=void 0}if(!t||t.getElementsByTagName("parsererror").length)return r("Unable to parse SVG file: "+e),!1;a[e]=t.documentElement}d(e)}},i.open("GET",e),i.overrideMimeType&&i.overrideMimeType("text/xml"),i.send()}},h=function(e,n,a,u){var f=e.getAttribute("data-src")||e.getAttribute("src");if(!/\.svg/i.test(f))return void u("Attempted to inject a file with a non-svg extension: "+f);if(!i){var p=e.getAttribute("data-fallback")||e.getAttribute("data-png");return void(p?(e.setAttribute("src",p),u(null)):a?(e.setAttribute("src",a+"/"+f.split("/").pop().replace(".svg",".png")),u(null)):u("This browser does not support SVG and no PNG fallback was defined."))}-1===s.indexOf(e)&&(s.push(e),e.setAttribute("src",""),v(f,function(i){if("undefined"==typeof i||"string"==typeof i)return u(i),!1;var a=e.getAttribute("id");a&&i.setAttribute("id",a);var p=e.getAttribute("title");p&&i.setAttribute("title",p);var d=[].concat(i.getAttribute("class")||[],"injected-svg",e.getAttribute("class")||[]).join(" ");i.setAttribute("class",r(d));var v=e.getAttribute("style");v&&i.setAttribute("style",v);var h=[].filter.call(e.attributes,function(t){return/^data-\w[\w\-]*$/.test(t.name)});o.call(h,function(t){t.name&&t.value&&i.setAttribute(t.name,t.value)});var g,m,b,y,A,w={clipPath:["clip-path"],"color-profile":["color-profile"],cursor:["cursor"],filter:["filter"],linearGradient:["fill","stroke"],marker:["marker","marker-start","marker-mid","marker-end"],mask:["mask"],pattern:["fill","stroke"],radialGradient:["fill","stroke"]};Object.keys(w).forEach(function(t){g=t,b=w[t],m=i.querySelectorAll("defs "+g+"[id]");for(var e=0,r=m.length;r>e;e++){y=m[e].id,A=y+"-"+l;var n;o.call(b,function(t){n=i.querySelectorAll("["+t+'*="'+y+'"]');for(var e=0,r=n.length;r>e;e++)n[e].setAttribute(t,"url(#"+A+")")}),m[e].id=A}}),i.removeAttribute("xmlns:a");for(var x,S,k=i.querySelectorAll("script"),j=[],G=0,T=k.length;T>G;G++)S=k[G].getAttribute("type"),S&&"application/ecmascript"!==S&&"application/javascript"!==S||(x=k[G].innerText||k[G].textContent,j.push(x),i.removeChild(k[G]));if(j.length>0&&("always"===n||"once"===n&&!c[f])){for(var M=0,V=j.length;V>M;M++)new Function(j[M])(t);c[f]=!0}var E=i.querySelectorAll("style");o.call(E,function(t){t.textContent+=""}),e.parentNode.replaceChild(i,e),delete s[s.indexOf(e)],e=null,l++,u(i)}))},g=function(t,e,r){e=e||{};var n=e.evalScripts||"always",i=e.pngFallback||!1,a=e.each;if(void 0!==t.length){var l=0;o.call(t,function(e){h(e,n,i,function(e){a&&"function"==typeof a&&a(e),r&&t.length===++l&&r(l)})})}else t?h(t,n,i,function(e){a&&"function"==typeof a&&a(e),r&&r(1),t=null}):r&&r(0)};"object"==typeof module&&"object"==typeof module.exports?module.exports=exports=g:"function"==typeof define&&define.amd?define(function(){return g}):"object"==typeof t&&(t.SVGInjector=g)}(window,document);
//# sourceMappingURL=svg-injector.map.js