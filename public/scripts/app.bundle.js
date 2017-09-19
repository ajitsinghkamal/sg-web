(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('./utils/shims');

var _firebase_app = require('./app/firebase_app');

// Export a single instance of firebase app
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
// Import the needed shims
var firebase = (0, _firebase_app.createFirebaseNamespace)();
// Import the createFirebaseNamespace function
exports.default = firebase;
module.exports = exports['default'];


},{"./app/firebase_app":3,"./utils/shims":9}],2:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.patchCapture = patchCapture;
var ERROR_NAME = 'FirebaseError';
var captureStackTrace = Error.captureStackTrace;
// Export for faking in tests
function patchCapture(captureFake) {
    var result = captureStackTrace;
    captureStackTrace = captureFake;
    return result;
}
var FirebaseError = function () {
    function FirebaseError(code, message) {
        this.code = code;
        this.message = message;
        var stack;
        // We want the stack value, if implemented by Error
        if (captureStackTrace) {
            // Patches this.stack, omitted calls above ErrorFactory#create
            captureStackTrace(this, ErrorFactory.prototype.create);
        } else {
            var err_1 = Error.apply(this, arguments);
            this.name = ERROR_NAME;
            // Make non-enumerable getter for the property.
            Object.defineProperty(this, 'stack', {
                get: function get() {
                    return err_1.stack;
                }
            });
        }
    }
    return FirebaseError;
}();
exports.FirebaseError = FirebaseError;
// Back-door inheritance

FirebaseError.prototype = Object.create(Error.prototype);
FirebaseError.prototype.constructor = FirebaseError;
FirebaseError.prototype.name = ERROR_NAME;
var ErrorFactory = function () {
    function ErrorFactory(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
        // Matches {$name}, by default.
        this.pattern = /\{\$([^}]+)}/g;
        // empty
    }
    ErrorFactory.prototype.create = function (code, data) {
        if (data === undefined) {
            data = {};
        }
        var template = this.errors[code];
        var fullCode = this.service + '/' + code;
        var message;
        if (template === undefined) {
            message = 'Error';
        } else {
            message = template.replace(this.pattern, function (match, key) {
                var value = data[key];
                return value !== undefined ? value.toString() : '<' + key + '?>';
            });
        }
        // Service: Error message (service/code).
        message = this.serviceName + ': ' + message + ' (' + fullCode + ').';
        var err = new FirebaseError(fullCode, message);
        // Populate the Error object with message parts for programmatic
        // accesses (e.g., e.file).
        for (var prop in data) {
            if (!data.hasOwnProperty(prop) || prop.slice(-1) === '_') {
                continue;
            }
            err[prop] = data[prop];
        }
        return err;
    };
    return ErrorFactory;
}();
exports.ErrorFactory = ErrorFactory;


},{}],3:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createFirebaseNamespace = createFirebaseNamespace;

var _subscribe = require('./subscribe');

var _errors = require('./errors');

var _promise = require('../utils/promise');

var _deep_copy = require('../utils/deep_copy');

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var contains = function contains(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};
var DEFAULT_ENTRY_NAME = '[DEFAULT]';
// An array to capture listeners before the true auth functions
// exist
var tokenListeners = [];
/**
 * Global context object for a collection of services using
 * a shared authentication state.
 */
var FirebaseAppImpl = function () {
    function FirebaseAppImpl(options, name, firebase_) {
        this.firebase_ = firebase_;
        this.isDeleted_ = false;
        this.services_ = {};
        this.name_ = name;
        this.options_ = (0, _deep_copy.deepCopy)(options);
        this.INTERNAL = {
            getUid: function getUid() {
                return null;
            },
            getToken: function getToken() {
                return _promise.PromiseImpl.resolve(null);
            },
            addAuthTokenListener: function addAuthTokenListener(callback) {
                tokenListeners.push(callback);
                // Make sure callback is called, asynchronously, in the absence of the auth module
                setTimeout(function () {
                    return callback(null);
                }, 0);
            },
            removeAuthTokenListener: function removeAuthTokenListener(callback) {
                tokenListeners = tokenListeners.filter(function (listener) {
                    return listener !== callback;
                });
            }
        };
    }
    Object.defineProperty(FirebaseAppImpl.prototype, "name", {
        get: function get() {
            this.checkDestroyed_();
            return this.name_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseAppImpl.prototype, "options", {
        get: function get() {
            this.checkDestroyed_();
            return this.options_;
        },
        enumerable: true,
        configurable: true
    });
    FirebaseAppImpl.prototype.delete = function () {
        var _this = this;
        return new _promise.PromiseImpl(function (resolve) {
            _this.checkDestroyed_();
            resolve();
        }).then(function () {
            _this.firebase_.INTERNAL.removeApp(_this.name_);
            var services = [];
            Object.keys(_this.services_).forEach(function (serviceKey) {
                Object.keys(_this.services_[serviceKey]).forEach(function (instanceKey) {
                    services.push(_this.services_[serviceKey][instanceKey]);
                });
            });
            return _promise.PromiseImpl.all(services.map(function (service) {
                return service.INTERNAL.delete();
            }));
        }).then(function () {
            _this.isDeleted_ = true;
            _this.services_ = {};
        });
    };
    /**
     * Return a service instance associated with this app (creating it
     * on demand), identified by the passed instanceIdentifier.
     *
     * NOTE: Currently storage is the only one that is leveraging this
     * functionality. They invoke it by calling:
     *
     * ```javascript
     * firebase.app().storage('STORAGE BUCKET ID')
     * ```
     *
     * The service name is passed to this already
     * @internal
     */
    FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
        if (instanceIdentifier === void 0) {
            instanceIdentifier = DEFAULT_ENTRY_NAME;
        }
        this.checkDestroyed_();
        if (!this.services_[name]) {
            this.services_[name] = {};
        }
        if (!this.services_[name][instanceIdentifier]) {
            /**
             * If a custom instance has been defined (i.e. not '[DEFAULT]')
             * then we will pass that instance on, otherwise we pass `null`
             */
            var instanceSpecifier = instanceIdentifier !== DEFAULT_ENTRY_NAME ? instanceIdentifier : undefined;
            var service = this.firebase_.INTERNAL.factories[name](this, this.extendApp.bind(this), instanceSpecifier);
            this.services_[name][instanceIdentifier] = service;
        }
        return this.services_[name][instanceIdentifier];
    };
    /**
     * Callback function used to extend an App instance at the time
     * of service instance creation.
     */
    FirebaseAppImpl.prototype.extendApp = function (props) {
        var _this = this;
        // Copy the object onto the FirebaseAppImpl prototype
        (0, _deep_copy.deepExtend)(this, props);
        /**
         * If the app has overwritten the addAuthTokenListener stub, forward
         * the active token listeners on to the true fxn.
         *
         * TODO: This function is required due to our current module
         * structure. Once we are able to rely strictly upon a single module
         * implementation, this code should be refactored and Auth should
         * provide these stubs and the upgrade logic
         */
        if (props.INTERNAL && props.INTERNAL.addAuthTokenListener) {
            tokenListeners.forEach(function (listener) {
                _this.INTERNAL.addAuthTokenListener(listener);
            });
            tokenListeners = [];
        }
    };
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    FirebaseAppImpl.prototype.checkDestroyed_ = function () {
        if (this.isDeleted_) {
            error('app-deleted', { name: this.name_ });
        }
    };
    return FirebaseAppImpl;
}();
// Prevent dead-code elimination of these methods w/o invalid property
// copying.
FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options || FirebaseAppImpl.prototype.delete || console.log('dc');
/**
 * Return a firebase namespace object.
 *
 * In production, this will be called exactly once and the result
 * assigned to the 'firebase' global.  It may be called multiple times
 * in unit tests.
 */
function createFirebaseNamespace() {
    var apps_ = {};
    var factories = {};
    var appHooks = {};
    // A namespace is a plain JavaScript Object.
    var namespace = {
        // Hack to prevent Babel from modifying the object returned
        // as the firebase namespace.
        __esModule: true,
        initializeApp: initializeApp,
        app: app,
        apps: null,
        Promise: _promise.PromiseImpl,
        SDK_VERSION: '4.3.0',
        INTERNAL: {
            registerService: registerService,
            createFirebaseNamespace: createFirebaseNamespace,
            extendNamespace: extendNamespace,
            createSubscribe: _subscribe.createSubscribe,
            ErrorFactory: _errors.ErrorFactory,
            removeApp: removeApp,
            factories: factories,
            useAsService: useAsService,
            Promise: _promise.PromiseImpl,
            deepExtend: _deep_copy.deepExtend
        }
    };
    // Inject a circular default export to allow Babel users who were previously
    // using:
    //
    //   import firebase from 'firebase';
    //   which becomes: var firebase = require('firebase').default;
    //
    // instead of
    //
    //   import * as firebase from 'firebase';
    //   which becomes: var firebase = require('firebase');
    (0, _deep_copy.patchProperty)(namespace, 'default', namespace);
    // firebase.apps is a read-only getter.
    Object.defineProperty(namespace, 'apps', {
        get: getApps
    });
    /**
     * Called by App.delete() - but before any services associated with the App
     * are deleted.
     */
    function removeApp(name) {
        var app = apps_[name];
        callAppHooks(app, 'delete');
        delete apps_[name];
    }
    /**
     * Get the App object for a given name (or DEFAULT).
     */
    function app(name) {
        name = name || DEFAULT_ENTRY_NAME;
        if (!contains(apps_, name)) {
            error('no-app', { name: name });
        }
        return apps_[name];
    }
    (0, _deep_copy.patchProperty)(app, 'App', FirebaseAppImpl);
    /**
     * Create a new App instance (name must be unique).
     */
    function initializeApp(options, name) {
        if (name === undefined) {
            name = DEFAULT_ENTRY_NAME;
        } else {
            if (typeof name !== 'string' || name === '') {
                error('bad-app-name', { name: name + '' });
            }
        }
        if (contains(apps_, name)) {
            error('duplicate-app', { name: name });
        }
        var app = new FirebaseAppImpl(options, name, namespace);
        apps_[name] = app;
        callAppHooks(app, 'create');
        return app;
    }
    /*
     * Return an array of all the non-deleted FirebaseApps.
     */
    function getApps() {
        // Make a copy so caller cannot mutate the apps list.
        return Object.keys(apps_).map(function (name) {
            return apps_[name];
        });
    }
    /*
     * Register a Firebase Service.
     *
     * firebase.INTERNAL.registerService()
     *
     * TODO: Implement serviceProperties.
     */
    function registerService(name, createService, serviceProperties, appHook, allowMultipleInstances) {
        // Cannot re-register a service that already exists
        if (factories[name]) {
            error('duplicate-service', { name: name });
        }
        // Capture the service factory for later service instantiation
        factories[name] = createService;
        // Capture the appHook, if passed
        if (appHook) {
            appHooks[name] = appHook;
            // Run the **new** app hook on all existing apps
            getApps().forEach(function (app) {
                appHook('create', app);
            });
        }
        // The Service namespace is an accessor function ...
        var serviceNamespace = function serviceNamespace(appArg) {
            if (appArg === void 0) {
                appArg = app();
            }
            if (typeof appArg[name] !== 'function') {
                // Invalid argument.
                // This happens in the following case: firebase.storage('gs:/')
                error('invalid-app-argument', { name: name });
            }
            // Forward service instance lookup to the FirebaseApp.
            return appArg[name]();
        };
        // ... and a container for service-level properties.
        if (serviceProperties !== undefined) {
            (0, _deep_copy.deepExtend)(serviceNamespace, serviceProperties);
        }
        // Monkey-patch the serviceNamespace onto the firebase namespace
        namespace[name] = serviceNamespace;
        // Patch the FirebaseAppImpl prototype
        FirebaseAppImpl.prototype[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var serviceFxn = this._getService.bind(this, name);
            return serviceFxn.apply(this, allowMultipleInstances ? args : []);
        };
        return serviceNamespace;
    }
    /**
     * Patch the top-level firebase namespace with additional properties.
     *
     * firebase.INTERNAL.extendNamespace()
     */
    function extendNamespace(props) {
        (0, _deep_copy.deepExtend)(namespace, props);
    }
    function callAppHooks(app, eventName) {
        Object.keys(factories).forEach(function (serviceName) {
            // Ignore virtual services
            var factoryName = useAsService(app, serviceName);
            if (factoryName === null) {
                return;
            }
            if (appHooks[factoryName]) {
                appHooks[factoryName](eventName, app);
            }
        });
    }
    // Map the requested service to a registered service name
    // (used to map auth to serverAuth service when needed).
    function useAsService(app, name) {
        if (name === 'serverAuth') {
            return null;
        }
        var useService = name;
        var options = app.options;
        return useService;
    }
    return namespace;
}
function error(code, args) {
    throw appErrors.create(code, args);
}
// TypeScript does not support non-string indexes!
// let errors: {[code: AppError: string} = {
var errors = {
    'no-app': "No Firebase App '{$name}' has been created - " + 'call Firebase App.initializeApp()',
    'bad-app-name': "Illegal App name: '{$name}",
    'duplicate-app': "Firebase App named '{$name}' already exists",
    'app-deleted': "Firebase App named '{$name}' already deleted",
    'duplicate-service': "Firebase service named '{$name}' already registered",
    'sa-not-supported': 'Initializing the Firebase SDK with a service ' + 'account is only allowed in a Node.js environment. On client ' + 'devices, you should instead initialize the SDK with an api key and ' + 'auth domain',
    'invalid-app-argument': 'firebase.{$name}() takes either no argument or a ' + 'Firebase App instance.'
};
var appErrors = new _errors.ErrorFactory('app', 'Firebase', errors);


},{"../utils/deep_copy":6,"../utils/promise":8,"./errors":2,"./subscribe":4}],4:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createSubscribe = createSubscribe;
exports.async = async;

var _promise = require('../utils/promise');

/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */
function createSubscribe(executor, onNoObservers) {
    var proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */
var ObserverProxy = function () {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function ObserverProxy(executor, onNoObservers) {
        var _this = this;
        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = _promise.PromiseImpl.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task.then(function () {
            executor(_this);
        }).catch(function (e) {
            _this.error(e);
        });
    }
    ObserverProxy.prototype.next = function (value) {
        this.forEachObserver(function (observer) {
            observer.next(value);
        });
    };
    ObserverProxy.prototype.error = function (error) {
        this.forEachObserver(function (observer) {
            observer.error(error);
        });
        this.close(error);
    };
    ObserverProxy.prototype.complete = function () {
        this.forEachObserver(function (observer) {
            observer.complete();
        });
        this.close();
    };
    /**
     * Subscribe function that can be used to add an Observer to the fan-out list.
     *
     * - We require that no event is sent to a subscriber sychronously to their
     *   call to subscribe().
     */
    ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
        var _this = this;
        var observer;
        if (nextOrObserver === undefined && error === undefined && complete === undefined) {
            throw new Error('Missing Observer.');
        }
        // Assemble an Observer object when passed as callback functions.
        if (implementsAnyMethods(nextOrObserver, ['next', 'error', 'complete'])) {
            observer = nextOrObserver;
        } else {
            observer = {
                next: nextOrObserver,
                error: error,
                complete: complete
            };
        }
        if (observer.next === undefined) {
            observer.next = noop;
        }
        if (observer.error === undefined) {
            observer.error = noop;
        }
        if (observer.complete === undefined) {
            observer.complete = noop;
        }
        var unsub = this.unsubscribeOne.bind(this, this.observers.length);
        // Attempt to subscribe to a terminated Observable - we
        // just respond to the Observer with the final error or complete
        // event.
        if (this.finalized) {
            this.task.then(function () {
                try {
                    if (_this.finalError) {
                        observer.error(_this.finalError);
                    } else {
                        observer.complete();
                    }
                } catch (e) {
                    // nothing
                }
                return;
            });
        }
        this.observers.push(observer);
        return unsub;
    };
    // Unsubscribe is synchronous - we guarantee that no events are sent to
    // any unsubscribed Observer.
    ObserverProxy.prototype.unsubscribeOne = function (i) {
        if (this.observers === undefined || this.observers[i] === undefined) {
            return;
        }
        delete this.observers[i];
        this.observerCount -= 1;
        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
            this.onNoObservers(this);
        }
    };
    ObserverProxy.prototype.forEachObserver = function (fn) {
        if (this.finalized) {
            // Already closed by previous event....just eat the additional values.
            return;
        }
        // Since sendOne calls asynchronously - there is no chance that
        // this.observers will become undefined.
        for (var i = 0; i < this.observers.length; i++) {
            this.sendOne(i, fn);
        }
    };
    // Call the Observer via one of it's callback function. We are careful to
    // confirm that the observe has not been unsubscribed since this asynchronous
    // function had been queued.
    ObserverProxy.prototype.sendOne = function (i, fn) {
        var _this = this;
        // Execute the callback asynchronously
        this.task.then(function () {
            if (_this.observers !== undefined && _this.observers[i] !== undefined) {
                try {
                    fn(_this.observers[i]);
                } catch (e) {
                    // Ignore exceptions raised in Observers or missing methods of an
                    // Observer.
                    // Log error to console. b/31404806
                    if (typeof console !== 'undefined' && console.error) {
                        console.error(e);
                    }
                }
            }
        });
    };
    ObserverProxy.prototype.close = function (err) {
        var _this = this;
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        if (err !== undefined) {
            this.finalError = err;
        }
        // Proxy is no longer needed - garbage collect references
        this.task.then(function () {
            _this.observers = undefined;
            _this.onNoObservers = undefined;
        });
    };
    return ObserverProxy;
}();
/** Turn synchronous function into one called asynchronously. */
function async(fn, onError) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _promise.PromiseImpl.resolve(true).then(function () {
            fn.apply(void 0, args);
        }).catch(function (error) {
            if (onError) {
                onError(error);
            }
        });
    };
}
/**
 * Return true if the object passed in implements any of the named methods.
 */
function implementsAnyMethods(obj, methods) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {
        return false;
    }
    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
        var method = methods_1[_i];
        if (method in obj && typeof obj[method] === 'function') {
            return true;
        }
    }
    return false;
}
function noop() {
    // do nothing
}


},{"../utils/promise":8}],5:[function(require,module,exports){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}],6:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deepCopy = deepCopy;
exports.deepExtend = deepExtend;
exports.patchProperty = patchProperty;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * Do a deep-copy of basic JavaScript Objects or Arrays.
 */
function deepCopy(value) {
    return deepExtend(undefined, value);
}
/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 */
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date:
            // Treat Dates like scalars; if the target date object had any child
            // properties - they will be lost!
            var dateValue = source;
            return new Date(dateValue.getTime());
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            // Always copy the array source and overwrite the target.
            target = [];
            break;
        default:
            // Not a plain Object - treat it as a scalar.
            return source;
    }
    for (var prop in source) {
        if (!source.hasOwnProperty(prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}
// TODO: Really needed (for JSCompiler type checking)?
function patchProperty(obj, prop, value) {
    obj[prop] = value;
}


},{}],7:[function(require,module,exports){
(function (global){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var scope;
if (typeof global !== 'undefined') {
    scope = global;
} else if (typeof self !== 'undefined') {
    scope = self;
} else {
    try {
        scope = Function('return this')();
    } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
    }
}
var globalScope = exports.globalScope = scope;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.attachDummyErrorHandler = exports.Deferred = exports.PromiseImpl = undefined;

var _globalScope = require('../utils/globalScope');

var PromiseImpl = exports.PromiseImpl = _globalScope.globalScope.Promise || require('promise-polyfill');
/**
 * A deferred promise implementation.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Deferred = function () {
    /** @constructor */
    function Deferred() {
        var self = this;
        this.resolve = null;
        this.reject = null;
        this.promise = new PromiseImpl(function (resolve, reject) {
            self.resolve = resolve;
            self.reject = reject;
        });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     * @param {((?function(?(Error)): (?|undefined))| (?function(?(Error),?=): (?|undefined)))=} opt_nodeCallback
     * @return {!function(?(Error), ?=)}
     */
    Deferred.prototype.wrapCallback = function (opt_nodeCallback) {
        var self = this;
        /**
           * @param {?Error} error
           * @param {?=} opt_value
           */
        function meta(error, opt_value) {
            if (error) {
                self.reject(error);
            } else {
                self.resolve(opt_value);
            }
            if (typeof opt_nodeCallback === 'function') {
                attachDummyErrorHandler(self.promise);
                // Some of our callbacks don't expect a value and our own tests
                // assert that the parameter length is 1
                if (opt_nodeCallback.length === 1) {
                    opt_nodeCallback(error);
                } else {
                    opt_nodeCallback(error, opt_value);
                }
            }
        }
        return meta;
    };
    return Deferred;
}();
exports.Deferred = Deferred;
/**
 * Chrome (and maybe other browsers) report an Error in the console if you reject a promise
 * and nobody handles the error. This is normally a good thing, but this will confuse devs who
 * never intended to use promises in the first place. So in some cases (in particular, if the
 * developer attached a callback), we should attach a dummy resolver to the promise to suppress
 * this error.
 *
 * Note: We can't do this all the time, since it breaks the Promise spec (though in the obscure
 * 3.3.3 section related to upgrading non-compliant promises).
 * @param {!firebase.Promise} promise
 */

var attachDummyErrorHandler = exports.attachDummyErrorHandler = function attachDummyErrorHandler(promise) {
    promise.catch(function () {});
};


},{"../utils/globalScope":7,"promise-polyfill":5}],9:[function(require,module,exports){
/*! @license Firebase v4.3.0
Build: rev-bd8265e
Terms: https://firebase.google.com/terms/ */

'use strict';

/**
 * This is the Array.prototype.findIndex polyfill from MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
 * https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
 */
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function value(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];
            // 5. Let k be 0.
            var k = 0;
            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }
            // 7. Return -1.
            return -1;
        }
    });
}
/**
 * This is the Array.prototype.find polyfill from MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 * https://tc39.github.io/ecma262/#sec-array.prototype.find
 */
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function value(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];
            // 5. Let k be 0.
            var k = 0;
            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }
            // 7. Return undefined.
            return undefined;
        }
    });
}


},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.classShuffleUtil = classShuffleUtil;

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _app = require('firebase/app');

var firebase = _interopRequireWildcard(_app);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/prefer-default-export */
function classShuffleUtil(element, classToAdd, classToRemove) {
	if (typeof element === 'string' || element instanceof String) {
		(0, _jquery2.default)(element).removeClass(classToRemove).addClass(classToAdd);
	} else {
		element.forEach(function (el) {
			(0, _jquery2.default)(el).removeClass(classToRemove).addClass(classToAdd);
		});
	}
}

// export class firebaseDb {
// 	fire = firebase.initializeApp({
// 		apiKey: 'AIzaSyDiMtPwt58-NEnR56kTzJ9HddG5IrGuhrE',
// 		authDomain: 'sudeepgandhiweb.firebaseapp.com',
// 		databaseURL: 'https://sudeepgandhiweb.firebaseio.com',
// 		projectId: 'sudeepgandhiweb',
// 	});

// 	fireDatabase = fire.database();

// 	// write to database
// 	const writeToDb = function writeToDbUtil(path, valueObj) {
// 		fireDatabase.ref().set(valueObj);
// 	};

// 	// read from database
// 	const ReadFromDb = function ReadFromDbUtil(path) {
// 		firebase.database().ref(path).once('value').then((snapshot) => {
// 			// something
// 		});
// 	};
// }

},{"firebase/app":1,"jquery":"jquery"}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZmlyZWJhc2UvYXBwLmpzIiwibm9kZV9tb2R1bGVzL2ZpcmViYXNlL2FwcC9lcnJvcnMuanMiLCJub2RlX21vZHVsZXMvZmlyZWJhc2UvYXBwL2ZpcmViYXNlX2FwcC5qcyIsIm5vZGVfbW9kdWxlcy9maXJlYmFzZS9hcHAvc3Vic2NyaWJlLmpzIiwibm9kZV9tb2R1bGVzL2ZpcmViYXNlL25vZGVfbW9kdWxlcy9wcm9taXNlLXBvbHlmaWxsL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvZmlyZWJhc2UvdXRpbHMvZGVlcF9jb3B5LmpzIiwibm9kZV9tb2R1bGVzL2ZpcmViYXNlL3V0aWxzL2dsb2JhbFNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL2ZpcmViYXNlL3V0aWxzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvZmlyZWJhc2UvdXRpbHMvc2hpbXMuanMiLCJzcmMvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7UUNwRmdCLGdCLEdBQUEsZ0I7O0FBSmhCOzs7O0FBQ0E7O0lBQVksUTs7Ozs7O0FBRlo7QUFLTyxTQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLFVBQW5DLEVBQStDLGFBQS9DLEVBQThEO0FBQ3BFLEtBQUksT0FBTyxPQUFQLEtBQW1CLFFBQW5CLElBQStCLG1CQUFtQixNQUF0RCxFQUE4RDtBQUM3RCx3QkFBRSxPQUFGLEVBQVcsV0FBWCxDQUF1QixhQUF2QixFQUFzQyxRQUF0QyxDQUErQyxVQUEvQztBQUNBLEVBRkQsTUFFTztBQUNOLFVBQVEsT0FBUixDQUFnQixVQUFDLEVBQUQsRUFBUTtBQUN2Qix5QkFBRSxFQUFGLEVBQU0sV0FBTixDQUFrQixhQUFsQixFQUFpQyxRQUFqQyxDQUEwQyxVQUExQztBQUNBLEdBRkQ7QUFHQTtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2NC4zLjBcbkJ1aWxkOiByZXYtYmQ4MjY1ZVxuVGVybXM6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS90ZXJtcy8gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5yZXF1aXJlKCcuL3V0aWxzL3NoaW1zJyk7XG5cbnZhciBfZmlyZWJhc2VfYXBwID0gcmVxdWlyZSgnLi9hcHAvZmlyZWJhc2VfYXBwJyk7XG5cbi8vIEV4cG9ydCBhIHNpbmdsZSBpbnN0YW5jZSBvZiBmaXJlYmFzZSBhcHBcbi8qKlxuKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgSW5jLlxuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuLy8gSW1wb3J0IHRoZSBuZWVkZWQgc2hpbXNcbnZhciBmaXJlYmFzZSA9ICgwLCBfZmlyZWJhc2VfYXBwLmNyZWF0ZUZpcmViYXNlTmFtZXNwYWNlKSgpO1xuLy8gSW1wb3J0IHRoZSBjcmVhdGVGaXJlYmFzZU5hbWVzcGFjZSBmdW5jdGlvblxuZXhwb3J0cy5kZWZhdWx0ID0gZmlyZWJhc2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC5qcy5tYXBcbiIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2NC4zLjBcbkJ1aWxkOiByZXYtYmQ4MjY1ZVxuVGVybXM6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS90ZXJtcy8gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnBhdGNoQ2FwdHVyZSA9IHBhdGNoQ2FwdHVyZTtcbnZhciBFUlJPUl9OQU1FID0gJ0ZpcmViYXNlRXJyb3InO1xudmFyIGNhcHR1cmVTdGFja1RyYWNlID0gRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2U7XG4vLyBFeHBvcnQgZm9yIGZha2luZyBpbiB0ZXN0c1xuZnVuY3Rpb24gcGF0Y2hDYXB0dXJlKGNhcHR1cmVGYWtlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGNhcHR1cmVTdGFja1RyYWNlO1xuICAgIGNhcHR1cmVTdGFja1RyYWNlID0gY2FwdHVyZUZha2U7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBGaXJlYmFzZUVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEZpcmViYXNlRXJyb3IoY29kZSwgbWVzc2FnZSkge1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB2YXIgc3RhY2s7XG4gICAgICAgIC8vIFdlIHdhbnQgdGhlIHN0YWNrIHZhbHVlLCBpZiBpbXBsZW1lbnRlZCBieSBFcnJvclxuICAgICAgICBpZiAoY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgICAgICAgIC8vIFBhdGNoZXMgdGhpcy5zdGFjaywgb21pdHRlZCBjYWxscyBhYm92ZSBFcnJvckZhY3RvcnkjY3JlYXRlXG4gICAgICAgICAgICBjYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFcnJvckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZXJyXzEgPSBFcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gRVJST1JfTkFNRTtcbiAgICAgICAgICAgIC8vIE1ha2Ugbm9uLWVudW1lcmFibGUgZ2V0dGVyIGZvciB0aGUgcHJvcGVydHkuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3N0YWNrJywge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyXzEuc3RhY2s7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEZpcmViYXNlRXJyb3I7XG59KCk7XG5leHBvcnRzLkZpcmViYXNlRXJyb3IgPSBGaXJlYmFzZUVycm9yO1xuLy8gQmFjay1kb29yIGluaGVyaXRhbmNlXG5cbkZpcmViYXNlRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuRmlyZWJhc2VFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGaXJlYmFzZUVycm9yO1xuRmlyZWJhc2VFcnJvci5wcm90b3R5cGUubmFtZSA9IEVSUk9SX05BTUU7XG52YXIgRXJyb3JGYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVycm9yRmFjdG9yeShzZXJ2aWNlLCBzZXJ2aWNlTmFtZSwgZXJyb3JzKSB7XG4gICAgICAgIHRoaXMuc2VydmljZSA9IHNlcnZpY2U7XG4gICAgICAgIHRoaXMuc2VydmljZU5hbWUgPSBzZXJ2aWNlTmFtZTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBlcnJvcnM7XG4gICAgICAgIC8vIE1hdGNoZXMgeyRuYW1lfSwgYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy5wYXR0ZXJuID0gL1xce1xcJChbXn1dKyl9L2c7XG4gICAgICAgIC8vIGVtcHR5XG4gICAgfVxuICAgIEVycm9yRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKGNvZGUsIGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuZXJyb3JzW2NvZGVdO1xuICAgICAgICB2YXIgZnVsbENvZGUgPSB0aGlzLnNlcnZpY2UgKyAnLycgKyBjb2RlO1xuICAgICAgICB2YXIgbWVzc2FnZTtcbiAgICAgICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnRXJyb3InO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IHRlbXBsYXRlLnJlcGxhY2UodGhpcy5wYXR0ZXJuLCBmdW5jdGlvbiAobWF0Y2gsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlLnRvU3RyaW5nKCkgOiAnPCcgKyBrZXkgKyAnPz4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VydmljZTogRXJyb3IgbWVzc2FnZSAoc2VydmljZS9jb2RlKS5cbiAgICAgICAgbWVzc2FnZSA9IHRoaXMuc2VydmljZU5hbWUgKyAnOiAnICsgbWVzc2FnZSArICcgKCcgKyBmdWxsQ29kZSArICcpLic7XG4gICAgICAgIHZhciBlcnIgPSBuZXcgRmlyZWJhc2VFcnJvcihmdWxsQ29kZSwgbWVzc2FnZSk7XG4gICAgICAgIC8vIFBvcHVsYXRlIHRoZSBFcnJvciBvYmplY3Qgd2l0aCBtZXNzYWdlIHBhcnRzIGZvciBwcm9ncmFtbWF0aWNcbiAgICAgICAgLy8gYWNjZXNzZXMgKGUuZy4sIGUuZmlsZSkuXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhLmhhc093blByb3BlcnR5KHByb3ApIHx8IHByb3Auc2xpY2UoLTEpID09PSAnXycpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycltwcm9wXSA9IGRhdGFbcHJvcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVycjtcbiAgICB9O1xuICAgIHJldHVybiBFcnJvckZhY3Rvcnk7XG59KCk7XG5leHBvcnRzLkVycm9yRmFjdG9yeSA9IEVycm9yRmFjdG9yeTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVycm9ycy5qcy5tYXBcbiIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2NC4zLjBcbkJ1aWxkOiByZXYtYmQ4MjY1ZVxuVGVybXM6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS90ZXJtcy8gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUZpcmViYXNlTmFtZXNwYWNlID0gY3JlYXRlRmlyZWJhc2VOYW1lc3BhY2U7XG5cbnZhciBfc3Vic2NyaWJlID0gcmVxdWlyZSgnLi9zdWJzY3JpYmUnKTtcblxudmFyIF9lcnJvcnMgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKCcuLi91dGlscy9wcm9taXNlJyk7XG5cbnZhciBfZGVlcF9jb3B5ID0gcmVxdWlyZSgnLi4vdXRpbHMvZGVlcF9jb3B5Jyk7XG5cbi8qKlxuKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgSW5jLlxuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4qIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuKlxuKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuKlxuKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4qIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4qIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xudmFyIGNvbnRhaW5zID0gZnVuY3Rpb24gY29udGFpbnMob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbn07XG52YXIgREVGQVVMVF9FTlRSWV9OQU1FID0gJ1tERUZBVUxUXSc7XG4vLyBBbiBhcnJheSB0byBjYXB0dXJlIGxpc3RlbmVycyBiZWZvcmUgdGhlIHRydWUgYXV0aCBmdW5jdGlvbnNcbi8vIGV4aXN0XG52YXIgdG9rZW5MaXN0ZW5lcnMgPSBbXTtcbi8qKlxuICogR2xvYmFsIGNvbnRleHQgb2JqZWN0IGZvciBhIGNvbGxlY3Rpb24gb2Ygc2VydmljZXMgdXNpbmdcbiAqIGEgc2hhcmVkIGF1dGhlbnRpY2F0aW9uIHN0YXRlLlxuICovXG52YXIgRmlyZWJhc2VBcHBJbXBsID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEZpcmViYXNlQXBwSW1wbChvcHRpb25zLCBuYW1lLCBmaXJlYmFzZV8pIHtcbiAgICAgICAgdGhpcy5maXJlYmFzZV8gPSBmaXJlYmFzZV87XG4gICAgICAgIHRoaXMuaXNEZWxldGVkXyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlcnZpY2VzXyA9IHt9O1xuICAgICAgICB0aGlzLm5hbWVfID0gbmFtZTtcbiAgICAgICAgdGhpcy5vcHRpb25zXyA9ICgwLCBfZGVlcF9jb3B5LmRlZXBDb3B5KShvcHRpb25zKTtcbiAgICAgICAgdGhpcy5JTlRFUk5BTCA9IHtcbiAgICAgICAgICAgIGdldFVpZDogZnVuY3Rpb24gZ2V0VWlkKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFRva2VuOiBmdW5jdGlvbiBnZXRUb2tlbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3Byb21pc2UuUHJvbWlzZUltcGwucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRBdXRoVG9rZW5MaXN0ZW5lcjogZnVuY3Rpb24gYWRkQXV0aFRva2VuTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0b2tlbkxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgY2FsbGJhY2sgaXMgY2FsbGVkLCBhc3luY2hyb25vdXNseSwgaW4gdGhlIGFic2VuY2Ugb2YgdGhlIGF1dGggbW9kdWxlXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVBdXRoVG9rZW5MaXN0ZW5lcjogZnVuY3Rpb24gcmVtb3ZlQXV0aFRva2VuTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0b2tlbkxpc3RlbmVycyA9IHRva2VuTGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmVyICE9PSBjYWxsYmFjaztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZpcmViYXNlQXBwSW1wbC5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgdGhpcy5jaGVja0Rlc3Ryb3llZF8oKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5hbWVfO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZSwgXCJvcHRpb25zXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRGVzdHJveWVkXygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc187XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIEZpcmViYXNlQXBwSW1wbC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IF9wcm9taXNlLlByb21pc2VJbXBsKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICBfdGhpcy5jaGVja0Rlc3Ryb3llZF8oKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5maXJlYmFzZV8uSU5URVJOQUwucmVtb3ZlQXBwKF90aGlzLm5hbWVfKTtcbiAgICAgICAgICAgIHZhciBzZXJ2aWNlcyA9IFtdO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoX3RoaXMuc2VydmljZXNfKS5mb3JFYWNoKGZ1bmN0aW9uIChzZXJ2aWNlS2V5KSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoX3RoaXMuc2VydmljZXNfW3NlcnZpY2VLZXldKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZUtleSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wdXNoKF90aGlzLnNlcnZpY2VzX1tzZXJ2aWNlS2V5XVtpbnN0YW5jZUtleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gX3Byb21pc2UuUHJvbWlzZUltcGwuYWxsKHNlcnZpY2VzLm1hcChmdW5jdGlvbiAoc2VydmljZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlLklOVEVSTkFMLmRlbGV0ZSgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLmlzRGVsZXRlZF8gPSB0cnVlO1xuICAgICAgICAgICAgX3RoaXMuc2VydmljZXNfID0ge307XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgc2VydmljZSBpbnN0YW5jZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBhcHAgKGNyZWF0aW5nIGl0XG4gICAgICogb24gZGVtYW5kKSwgaWRlbnRpZmllZCBieSB0aGUgcGFzc2VkIGluc3RhbmNlSWRlbnRpZmllci5cbiAgICAgKlxuICAgICAqIE5PVEU6IEN1cnJlbnRseSBzdG9yYWdlIGlzIHRoZSBvbmx5IG9uZSB0aGF0IGlzIGxldmVyYWdpbmcgdGhpc1xuICAgICAqIGZ1bmN0aW9uYWxpdHkuIFRoZXkgaW52b2tlIGl0IGJ5IGNhbGxpbmc6XG4gICAgICpcbiAgICAgKiBgYGBqYXZhc2NyaXB0XG4gICAgICogZmlyZWJhc2UuYXBwKCkuc3RvcmFnZSgnU1RPUkFHRSBCVUNLRVQgSUQnKVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogVGhlIHNlcnZpY2UgbmFtZSBpcyBwYXNzZWQgdG8gdGhpcyBhbHJlYWR5XG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZS5fZ2V0U2VydmljZSA9IGZ1bmN0aW9uIChuYW1lLCBpbnN0YW5jZUlkZW50aWZpZXIpIHtcbiAgICAgICAgaWYgKGluc3RhbmNlSWRlbnRpZmllciA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBpbnN0YW5jZUlkZW50aWZpZXIgPSBERUZBVUxUX0VOVFJZX05BTUU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja0Rlc3Ryb3llZF8oKTtcbiAgICAgICAgaWYgKCF0aGlzLnNlcnZpY2VzX1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlc19bbmFtZV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuc2VydmljZXNfW25hbWVdW2luc3RhbmNlSWRlbnRpZmllcl0pIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSWYgYSBjdXN0b20gaW5zdGFuY2UgaGFzIGJlZW4gZGVmaW5lZCAoaS5lLiBub3QgJ1tERUZBVUxUXScpXG4gICAgICAgICAgICAgKiB0aGVuIHdlIHdpbGwgcGFzcyB0aGF0IGluc3RhbmNlIG9uLCBvdGhlcndpc2Ugd2UgcGFzcyBgbnVsbGBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGluc3RhbmNlU3BlY2lmaWVyID0gaW5zdGFuY2VJZGVudGlmaWVyICE9PSBERUZBVUxUX0VOVFJZX05BTUUgPyBpbnN0YW5jZUlkZW50aWZpZXIgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgc2VydmljZSA9IHRoaXMuZmlyZWJhc2VfLklOVEVSTkFMLmZhY3Rvcmllc1tuYW1lXSh0aGlzLCB0aGlzLmV4dGVuZEFwcC5iaW5kKHRoaXMpLCBpbnN0YW5jZVNwZWNpZmllcik7XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2VzX1tuYW1lXVtpbnN0YW5jZUlkZW50aWZpZXJdID0gc2VydmljZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlc19bbmFtZV1baW5zdGFuY2VJZGVudGlmaWVyXTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGZ1bmN0aW9uIHVzZWQgdG8gZXh0ZW5kIGFuIEFwcCBpbnN0YW5jZSBhdCB0aGUgdGltZVxuICAgICAqIG9mIHNlcnZpY2UgaW5zdGFuY2UgY3JlYXRpb24uXG4gICAgICovXG4gICAgRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZS5leHRlbmRBcHAgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gQ29weSB0aGUgb2JqZWN0IG9udG8gdGhlIEZpcmViYXNlQXBwSW1wbCBwcm90b3R5cGVcbiAgICAgICAgKDAsIF9kZWVwX2NvcHkuZGVlcEV4dGVuZCkodGhpcywgcHJvcHMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdGhlIGFwcCBoYXMgb3ZlcndyaXR0ZW4gdGhlIGFkZEF1dGhUb2tlbkxpc3RlbmVyIHN0dWIsIGZvcndhcmRcbiAgICAgICAgICogdGhlIGFjdGl2ZSB0b2tlbiBsaXN0ZW5lcnMgb24gdG8gdGhlIHRydWUgZnhuLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUT0RPOiBUaGlzIGZ1bmN0aW9uIGlzIHJlcXVpcmVkIGR1ZSB0byBvdXIgY3VycmVudCBtb2R1bGVcbiAgICAgICAgICogc3RydWN0dXJlLiBPbmNlIHdlIGFyZSBhYmxlIHRvIHJlbHkgc3RyaWN0bHkgdXBvbiBhIHNpbmdsZSBtb2R1bGVcbiAgICAgICAgICogaW1wbGVtZW50YXRpb24sIHRoaXMgY29kZSBzaG91bGQgYmUgcmVmYWN0b3JlZCBhbmQgQXV0aCBzaG91bGRcbiAgICAgICAgICogcHJvdmlkZSB0aGVzZSBzdHVicyBhbmQgdGhlIHVwZ3JhZGUgbG9naWNcbiAgICAgICAgICovXG4gICAgICAgIGlmIChwcm9wcy5JTlRFUk5BTCAmJiBwcm9wcy5JTlRFUk5BTC5hZGRBdXRoVG9rZW5MaXN0ZW5lcikge1xuICAgICAgICAgICAgdG9rZW5MaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5JTlRFUk5BTC5hZGRBdXRoVG9rZW5MaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRva2VuTGlzdGVuZXJzID0gW107XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCB0aHJvdyBhbiBFcnJvciBpZiB0aGUgQXBwIGhhcyBhbHJlYWR5IGJlZW4gZGVsZXRlZCAtXG4gICAgICogdXNlIGJlZm9yZSBwZXJmb3JtaW5nIEFQSSBhY3Rpb25zIG9uIHRoZSBBcHAuXG4gICAgICovXG4gICAgRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZS5jaGVja0Rlc3Ryb3llZF8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGVsZXRlZF8pIHtcbiAgICAgICAgICAgIGVycm9yKCdhcHAtZGVsZXRlZCcsIHsgbmFtZTogdGhpcy5uYW1lXyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEZpcmViYXNlQXBwSW1wbDtcbn0oKTtcbi8vIFByZXZlbnQgZGVhZC1jb2RlIGVsaW1pbmF0aW9uIG9mIHRoZXNlIG1ldGhvZHMgdy9vIGludmFsaWQgcHJvcGVydHlcbi8vIGNvcHlpbmcuXG5GaXJlYmFzZUFwcEltcGwucHJvdG90eXBlLm5hbWUgJiYgRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZS5vcHRpb25zIHx8IEZpcmViYXNlQXBwSW1wbC5wcm90b3R5cGUuZGVsZXRlIHx8IGNvbnNvbGUubG9nKCdkYycpO1xuLyoqXG4gKiBSZXR1cm4gYSBmaXJlYmFzZSBuYW1lc3BhY2Ugb2JqZWN0LlxuICpcbiAqIEluIHByb2R1Y3Rpb24sIHRoaXMgd2lsbCBiZSBjYWxsZWQgZXhhY3RseSBvbmNlIGFuZCB0aGUgcmVzdWx0XG4gKiBhc3NpZ25lZCB0byB0aGUgJ2ZpcmViYXNlJyBnbG9iYWwuICBJdCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzXG4gKiBpbiB1bml0IHRlc3RzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVGaXJlYmFzZU5hbWVzcGFjZSgpIHtcbiAgICB2YXIgYXBwc18gPSB7fTtcbiAgICB2YXIgZmFjdG9yaWVzID0ge307XG4gICAgdmFyIGFwcEhvb2tzID0ge307XG4gICAgLy8gQSBuYW1lc3BhY2UgaXMgYSBwbGFpbiBKYXZhU2NyaXB0IE9iamVjdC5cbiAgICB2YXIgbmFtZXNwYWNlID0ge1xuICAgICAgICAvLyBIYWNrIHRvIHByZXZlbnQgQmFiZWwgZnJvbSBtb2RpZnlpbmcgdGhlIG9iamVjdCByZXR1cm5lZFxuICAgICAgICAvLyBhcyB0aGUgZmlyZWJhc2UgbmFtZXNwYWNlLlxuICAgICAgICBfX2VzTW9kdWxlOiB0cnVlLFxuICAgICAgICBpbml0aWFsaXplQXBwOiBpbml0aWFsaXplQXBwLFxuICAgICAgICBhcHA6IGFwcCxcbiAgICAgICAgYXBwczogbnVsbCxcbiAgICAgICAgUHJvbWlzZTogX3Byb21pc2UuUHJvbWlzZUltcGwsXG4gICAgICAgIFNES19WRVJTSU9OOiAnNC4zLjAnLFxuICAgICAgICBJTlRFUk5BTDoge1xuICAgICAgICAgICAgcmVnaXN0ZXJTZXJ2aWNlOiByZWdpc3RlclNlcnZpY2UsXG4gICAgICAgICAgICBjcmVhdGVGaXJlYmFzZU5hbWVzcGFjZTogY3JlYXRlRmlyZWJhc2VOYW1lc3BhY2UsXG4gICAgICAgICAgICBleHRlbmROYW1lc3BhY2U6IGV4dGVuZE5hbWVzcGFjZSxcbiAgICAgICAgICAgIGNyZWF0ZVN1YnNjcmliZTogX3N1YnNjcmliZS5jcmVhdGVTdWJzY3JpYmUsXG4gICAgICAgICAgICBFcnJvckZhY3Rvcnk6IF9lcnJvcnMuRXJyb3JGYWN0b3J5LFxuICAgICAgICAgICAgcmVtb3ZlQXBwOiByZW1vdmVBcHAsXG4gICAgICAgICAgICBmYWN0b3JpZXM6IGZhY3RvcmllcyxcbiAgICAgICAgICAgIHVzZUFzU2VydmljZTogdXNlQXNTZXJ2aWNlLFxuICAgICAgICAgICAgUHJvbWlzZTogX3Byb21pc2UuUHJvbWlzZUltcGwsXG4gICAgICAgICAgICBkZWVwRXh0ZW5kOiBfZGVlcF9jb3B5LmRlZXBFeHRlbmRcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSW5qZWN0IGEgY2lyY3VsYXIgZGVmYXVsdCBleHBvcnQgdG8gYWxsb3cgQmFiZWwgdXNlcnMgd2hvIHdlcmUgcHJldmlvdXNseVxuICAgIC8vIHVzaW5nOlxuICAgIC8vXG4gICAgLy8gICBpbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UnO1xuICAgIC8vICAgd2hpY2ggYmVjb21lczogdmFyIGZpcmViYXNlID0gcmVxdWlyZSgnZmlyZWJhc2UnKS5kZWZhdWx0O1xuICAgIC8vXG4gICAgLy8gaW5zdGVhZCBvZlxuICAgIC8vXG4gICAgLy8gICBpbXBvcnQgKiBhcyBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZSc7XG4gICAgLy8gICB3aGljaCBiZWNvbWVzOiB2YXIgZmlyZWJhc2UgPSByZXF1aXJlKCdmaXJlYmFzZScpO1xuICAgICgwLCBfZGVlcF9jb3B5LnBhdGNoUHJvcGVydHkpKG5hbWVzcGFjZSwgJ2RlZmF1bHQnLCBuYW1lc3BhY2UpO1xuICAgIC8vIGZpcmViYXNlLmFwcHMgaXMgYSByZWFkLW9ubHkgZ2V0dGVyLlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuYW1lc3BhY2UsICdhcHBzJywge1xuICAgICAgICBnZXQ6IGdldEFwcHNcbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYnkgQXBwLmRlbGV0ZSgpIC0gYnV0IGJlZm9yZSBhbnkgc2VydmljZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBBcHBcbiAgICAgKiBhcmUgZGVsZXRlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmVBcHAobmFtZSkge1xuICAgICAgICB2YXIgYXBwID0gYXBwc19bbmFtZV07XG4gICAgICAgIGNhbGxBcHBIb29rcyhhcHAsICdkZWxldGUnKTtcbiAgICAgICAgZGVsZXRlIGFwcHNfW25hbWVdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEFwcCBvYmplY3QgZm9yIGEgZ2l2ZW4gbmFtZSAob3IgREVGQVVMVCkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXBwKG5hbWUpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgREVGQVVMVF9FTlRSWV9OQU1FO1xuICAgICAgICBpZiAoIWNvbnRhaW5zKGFwcHNfLCBuYW1lKSkge1xuICAgICAgICAgICAgZXJyb3IoJ25vLWFwcCcsIHsgbmFtZTogbmFtZSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXBwc19bbmFtZV07XG4gICAgfVxuICAgICgwLCBfZGVlcF9jb3B5LnBhdGNoUHJvcGVydHkpKGFwcCwgJ0FwcCcsIEZpcmViYXNlQXBwSW1wbCk7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEFwcCBpbnN0YW5jZSAobmFtZSBtdXN0IGJlIHVuaXF1ZSkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZUFwcChvcHRpb25zLCBuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5hbWUgPSBERUZBVUxUX0VOVFJZX05BTUU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IG5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoJ2JhZC1hcHAtbmFtZScsIHsgbmFtZTogbmFtZSArICcnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb250YWlucyhhcHBzXywgbmFtZSkpIHtcbiAgICAgICAgICAgIGVycm9yKCdkdXBsaWNhdGUtYXBwJywgeyBuYW1lOiBuYW1lIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcHAgPSBuZXcgRmlyZWJhc2VBcHBJbXBsKG9wdGlvbnMsIG5hbWUsIG5hbWVzcGFjZSk7XG4gICAgICAgIGFwcHNfW25hbWVdID0gYXBwO1xuICAgICAgICBjYWxsQXBwSG9va3MoYXBwLCAnY3JlYXRlJyk7XG4gICAgICAgIHJldHVybiBhcHA7XG4gICAgfVxuICAgIC8qXG4gICAgICogUmV0dXJuIGFuIGFycmF5IG9mIGFsbCB0aGUgbm9uLWRlbGV0ZWQgRmlyZWJhc2VBcHBzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEFwcHMoKSB7XG4gICAgICAgIC8vIE1ha2UgYSBjb3B5IHNvIGNhbGxlciBjYW5ub3QgbXV0YXRlIHRoZSBhcHBzIGxpc3QuXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcHBzXykubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwc19bbmFtZV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAqIFJlZ2lzdGVyIGEgRmlyZWJhc2UgU2VydmljZS5cbiAgICAgKlxuICAgICAqIGZpcmViYXNlLklOVEVSTkFMLnJlZ2lzdGVyU2VydmljZSgpXG4gICAgICpcbiAgICAgKiBUT0RPOiBJbXBsZW1lbnQgc2VydmljZVByb3BlcnRpZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJTZXJ2aWNlKG5hbWUsIGNyZWF0ZVNlcnZpY2UsIHNlcnZpY2VQcm9wZXJ0aWVzLCBhcHBIb29rLCBhbGxvd011bHRpcGxlSW5zdGFuY2VzKSB7XG4gICAgICAgIC8vIENhbm5vdCByZS1yZWdpc3RlciBhIHNlcnZpY2UgdGhhdCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBpZiAoZmFjdG9yaWVzW25hbWVdKSB7XG4gICAgICAgICAgICBlcnJvcignZHVwbGljYXRlLXNlcnZpY2UnLCB7IG5hbWU6IG5hbWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FwdHVyZSB0aGUgc2VydmljZSBmYWN0b3J5IGZvciBsYXRlciBzZXJ2aWNlIGluc3RhbnRpYXRpb25cbiAgICAgICAgZmFjdG9yaWVzW25hbWVdID0gY3JlYXRlU2VydmljZTtcbiAgICAgICAgLy8gQ2FwdHVyZSB0aGUgYXBwSG9vaywgaWYgcGFzc2VkXG4gICAgICAgIGlmIChhcHBIb29rKSB7XG4gICAgICAgICAgICBhcHBIb29rc1tuYW1lXSA9IGFwcEhvb2s7XG4gICAgICAgICAgICAvLyBSdW4gdGhlICoqbmV3KiogYXBwIGhvb2sgb24gYWxsIGV4aXN0aW5nIGFwcHNcbiAgICAgICAgICAgIGdldEFwcHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChhcHApIHtcbiAgICAgICAgICAgICAgICBhcHBIb29rKCdjcmVhdGUnLCBhcHApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhlIFNlcnZpY2UgbmFtZXNwYWNlIGlzIGFuIGFjY2Vzc29yIGZ1bmN0aW9uIC4uLlxuICAgICAgICB2YXIgc2VydmljZU5hbWVzcGFjZSA9IGZ1bmN0aW9uIHNlcnZpY2VOYW1lc3BhY2UoYXBwQXJnKSB7XG4gICAgICAgICAgICBpZiAoYXBwQXJnID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBhcHBBcmcgPSBhcHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXBwQXJnW25hbWVdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gSW52YWxpZCBhcmd1bWVudC5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaW4gdGhlIGZvbGxvd2luZyBjYXNlOiBmaXJlYmFzZS5zdG9yYWdlKCdnczovJylcbiAgICAgICAgICAgICAgICBlcnJvcignaW52YWxpZC1hcHAtYXJndW1lbnQnLCB7IG5hbWU6IG5hbWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3J3YXJkIHNlcnZpY2UgaW5zdGFuY2UgbG9va3VwIHRvIHRoZSBGaXJlYmFzZUFwcC5cbiAgICAgICAgICAgIHJldHVybiBhcHBBcmdbbmFtZV0oKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gLi4uIGFuZCBhIGNvbnRhaW5lciBmb3Igc2VydmljZS1sZXZlbCBwcm9wZXJ0aWVzLlxuICAgICAgICBpZiAoc2VydmljZVByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgKDAsIF9kZWVwX2NvcHkuZGVlcEV4dGVuZCkoc2VydmljZU5hbWVzcGFjZSwgc2VydmljZVByb3BlcnRpZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1vbmtleS1wYXRjaCB0aGUgc2VydmljZU5hbWVzcGFjZSBvbnRvIHRoZSBmaXJlYmFzZSBuYW1lc3BhY2VcbiAgICAgICAgbmFtZXNwYWNlW25hbWVdID0gc2VydmljZU5hbWVzcGFjZTtcbiAgICAgICAgLy8gUGF0Y2ggdGhlIEZpcmViYXNlQXBwSW1wbCBwcm90b3R5cGVcbiAgICAgICAgRmlyZWJhc2VBcHBJbXBsLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZXJ2aWNlRnhuID0gdGhpcy5fZ2V0U2VydmljZS5iaW5kKHRoaXMsIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VGeG4uYXBwbHkodGhpcywgYWxsb3dNdWx0aXBsZUluc3RhbmNlcyA/IGFyZ3MgOiBbXSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzZXJ2aWNlTmFtZXNwYWNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXRjaCB0aGUgdG9wLWxldmVsIGZpcmViYXNlIG5hbWVzcGFjZSB3aXRoIGFkZGl0aW9uYWwgcHJvcGVydGllcy5cbiAgICAgKlxuICAgICAqIGZpcmViYXNlLklOVEVSTkFMLmV4dGVuZE5hbWVzcGFjZSgpXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXh0ZW5kTmFtZXNwYWNlKHByb3BzKSB7XG4gICAgICAgICgwLCBfZGVlcF9jb3B5LmRlZXBFeHRlbmQpKG5hbWVzcGFjZSwgcHJvcHMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjYWxsQXBwSG9va3MoYXBwLCBldmVudE5hbWUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoZmFjdG9yaWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChzZXJ2aWNlTmFtZSkge1xuICAgICAgICAgICAgLy8gSWdub3JlIHZpcnR1YWwgc2VydmljZXNcbiAgICAgICAgICAgIHZhciBmYWN0b3J5TmFtZSA9IHVzZUFzU2VydmljZShhcHAsIHNlcnZpY2VOYW1lKTtcbiAgICAgICAgICAgIGlmIChmYWN0b3J5TmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcHBIb29rc1tmYWN0b3J5TmFtZV0pIHtcbiAgICAgICAgICAgICAgICBhcHBIb29rc1tmYWN0b3J5TmFtZV0oZXZlbnROYW1lLCBhcHApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gTWFwIHRoZSByZXF1ZXN0ZWQgc2VydmljZSB0byBhIHJlZ2lzdGVyZWQgc2VydmljZSBuYW1lXG4gICAgLy8gKHVzZWQgdG8gbWFwIGF1dGggdG8gc2VydmVyQXV0aCBzZXJ2aWNlIHdoZW4gbmVlZGVkKS5cbiAgICBmdW5jdGlvbiB1c2VBc1NlcnZpY2UoYXBwLCBuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnc2VydmVyQXV0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciB1c2VTZXJ2aWNlID0gbmFtZTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhcHAub3B0aW9ucztcbiAgICAgICAgcmV0dXJuIHVzZVNlcnZpY2U7XG4gICAgfVxuICAgIHJldHVybiBuYW1lc3BhY2U7XG59XG5mdW5jdGlvbiBlcnJvcihjb2RlLCBhcmdzKSB7XG4gICAgdGhyb3cgYXBwRXJyb3JzLmNyZWF0ZShjb2RlLCBhcmdzKTtcbn1cbi8vIFR5cGVTY3JpcHQgZG9lcyBub3Qgc3VwcG9ydCBub24tc3RyaW5nIGluZGV4ZXMhXG4vLyBsZXQgZXJyb3JzOiB7W2NvZGU6IEFwcEVycm9yOiBzdHJpbmd9ID0ge1xudmFyIGVycm9ycyA9IHtcbiAgICAnbm8tYXBwJzogXCJObyBGaXJlYmFzZSBBcHAgJ3skbmFtZX0nIGhhcyBiZWVuIGNyZWF0ZWQgLSBcIiArICdjYWxsIEZpcmViYXNlIEFwcC5pbml0aWFsaXplQXBwKCknLFxuICAgICdiYWQtYXBwLW5hbWUnOiBcIklsbGVnYWwgQXBwIG5hbWU6ICd7JG5hbWV9XCIsXG4gICAgJ2R1cGxpY2F0ZS1hcHAnOiBcIkZpcmViYXNlIEFwcCBuYW1lZCAneyRuYW1lfScgYWxyZWFkeSBleGlzdHNcIixcbiAgICAnYXBwLWRlbGV0ZWQnOiBcIkZpcmViYXNlIEFwcCBuYW1lZCAneyRuYW1lfScgYWxyZWFkeSBkZWxldGVkXCIsXG4gICAgJ2R1cGxpY2F0ZS1zZXJ2aWNlJzogXCJGaXJlYmFzZSBzZXJ2aWNlIG5hbWVkICd7JG5hbWV9JyBhbHJlYWR5IHJlZ2lzdGVyZWRcIixcbiAgICAnc2Etbm90LXN1cHBvcnRlZCc6ICdJbml0aWFsaXppbmcgdGhlIEZpcmViYXNlIFNESyB3aXRoIGEgc2VydmljZSAnICsgJ2FjY291bnQgaXMgb25seSBhbGxvd2VkIGluIGEgTm9kZS5qcyBlbnZpcm9ubWVudC4gT24gY2xpZW50ICcgKyAnZGV2aWNlcywgeW91IHNob3VsZCBpbnN0ZWFkIGluaXRpYWxpemUgdGhlIFNESyB3aXRoIGFuIGFwaSBrZXkgYW5kICcgKyAnYXV0aCBkb21haW4nLFxuICAgICdpbnZhbGlkLWFwcC1hcmd1bWVudCc6ICdmaXJlYmFzZS57JG5hbWV9KCkgdGFrZXMgZWl0aGVyIG5vIGFyZ3VtZW50IG9yIGEgJyArICdGaXJlYmFzZSBBcHAgaW5zdGFuY2UuJ1xufTtcbnZhciBhcHBFcnJvcnMgPSBuZXcgX2Vycm9ycy5FcnJvckZhY3RvcnkoJ2FwcCcsICdGaXJlYmFzZScsIGVycm9ycyk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1maXJlYmFzZV9hcHAuanMubWFwXG4iLCIvKiEgQGxpY2Vuc2UgRmlyZWJhc2UgdjQuMy4wXG5CdWlsZDogcmV2LWJkODI2NWVcblRlcm1zOiBodHRwczovL2ZpcmViYXNlLmdvb2dsZS5jb20vdGVybXMvICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmV4cG9ydHMuY3JlYXRlU3Vic2NyaWJlID0gY3JlYXRlU3Vic2NyaWJlO1xuZXhwb3J0cy5hc3luYyA9IGFzeW5jO1xuXG52YXIgX3Byb21pc2UgPSByZXF1aXJlKCcuLi91dGlscy9wcm9taXNlJyk7XG5cbi8qKlxuICogSGVscGVyIHRvIG1ha2UgYSBTdWJzY3JpYmUgZnVuY3Rpb24gKGp1c3QgbGlrZSBQcm9taXNlIGhlbHBzIG1ha2UgYVxuICogVGhlbmFibGUpLlxuICpcbiAqIEBwYXJhbSBleGVjdXRvciBGdW5jdGlvbiB3aGljaCBjYW4gbWFrZSBjYWxscyB0byBhIHNpbmdsZSBPYnNlcnZlclxuICogICAgIGFzIGEgcHJveHkuXG4gKiBAcGFyYW0gb25Ob09ic2VydmVycyBDYWxsYmFjayB3aGVuIGNvdW50IG9mIE9ic2VydmVycyBnb2VzIHRvIHplcm8uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN1YnNjcmliZShleGVjdXRvciwgb25Ob09ic2VydmVycykge1xuICAgIHZhciBwcm94eSA9IG5ldyBPYnNlcnZlclByb3h5KGV4ZWN1dG9yLCBvbk5vT2JzZXJ2ZXJzKTtcbiAgICByZXR1cm4gcHJveHkuc3Vic2NyaWJlLmJpbmQocHJveHkpO1xufVxuLyoqXG4gKiBJbXBsZW1lbnQgZmFuLW91dCBmb3IgYW55IG51bWJlciBvZiBPYnNlcnZlcnMgYXR0YWNoZWQgdmlhIGEgc3Vic2NyaWJlXG4gKiBmdW5jdGlvbi5cbiAqL1xudmFyIE9ic2VydmVyUHJveHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yIEZ1bmN0aW9uIHdoaWNoIGNhbiBtYWtlIGNhbGxzIHRvIGEgc2luZ2xlIE9ic2VydmVyXG4gICAgICogICAgIGFzIGEgcHJveHkuXG4gICAgICogQHBhcmFtIG9uTm9PYnNlcnZlcnMgQ2FsbGJhY2sgd2hlbiBjb3VudCBvZiBPYnNlcnZlcnMgZ29lcyB0byB6ZXJvLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIE9ic2VydmVyUHJveHkoZXhlY3V0b3IsIG9uTm9PYnNlcnZlcnMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBbXTtcbiAgICAgICAgdGhpcy51bnN1YnNjcmliZXMgPSBbXTtcbiAgICAgICAgdGhpcy5vYnNlcnZlckNvdW50ID0gMDtcbiAgICAgICAgLy8gTWljcm8tdGFzayBzY2hlZHVsaW5nIGJ5IGNhbGxpbmcgdGFzay50aGVuKCkuXG4gICAgICAgIHRoaXMudGFzayA9IF9wcm9taXNlLlByb21pc2VJbXBsLnJlc29sdmUoKTtcbiAgICAgICAgdGhpcy5maW5hbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vbk5vT2JzZXJ2ZXJzID0gb25Ob09ic2VydmVycztcbiAgICAgICAgLy8gQ2FsbCB0aGUgZXhlY3V0b3IgYXN5bmNocm9ub3VzbHkgc28gc3Vic2NyaWJlcnMgdGhhdCBhcmUgY2FsbGVkXG4gICAgICAgIC8vIHN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIGNyZWF0aW9uIG9mIHRoZSBzdWJzY3JpYmUgZnVuY3Rpb25cbiAgICAgICAgLy8gY2FuIHN0aWxsIHJlY2VpdmUgdGhlIHZlcnkgZmlyc3QgdmFsdWUgZ2VuZXJhdGVkIGluIHRoZSBleGVjdXRvci5cbiAgICAgICAgdGhpcy50YXNrLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhlY3V0b3IoX3RoaXMpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgX3RoaXMuZXJyb3IoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBPYnNlcnZlclByb3h5LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZm9yRWFjaE9ic2VydmVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgT2JzZXJ2ZXJQcm94eS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5mb3JFYWNoT2JzZXJ2ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlKGVycm9yKTtcbiAgICB9O1xuICAgIE9ic2VydmVyUHJveHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmZvckVhY2hPYnNlcnZlcihmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgYW4gT2JzZXJ2ZXIgdG8gdGhlIGZhbi1vdXQgbGlzdC5cbiAgICAgKlxuICAgICAqIC0gV2UgcmVxdWlyZSB0aGF0IG5vIGV2ZW50IGlzIHNlbnQgdG8gYSBzdWJzY3JpYmVyIHN5Y2hyb25vdXNseSB0byB0aGVpclxuICAgICAqICAgY2FsbCB0byBzdWJzY3JpYmUoKS5cbiAgICAgKi9cbiAgICBPYnNlcnZlclByb3h5LnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAobmV4dE9yT2JzZXJ2ZXIsIGVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgb2JzZXJ2ZXI7XG4gICAgICAgIGlmIChuZXh0T3JPYnNlcnZlciA9PT0gdW5kZWZpbmVkICYmIGVycm9yID09PSB1bmRlZmluZWQgJiYgY29tcGxldGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIE9ic2VydmVyLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc2VtYmxlIGFuIE9ic2VydmVyIG9iamVjdCB3aGVuIHBhc3NlZCBhcyBjYWxsYmFjayBmdW5jdGlvbnMuXG4gICAgICAgIGlmIChpbXBsZW1lbnRzQW55TWV0aG9kcyhuZXh0T3JPYnNlcnZlciwgWyduZXh0JywgJ2Vycm9yJywgJ2NvbXBsZXRlJ10pKSB7XG4gICAgICAgICAgICBvYnNlcnZlciA9IG5leHRPck9ic2VydmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JzZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgbmV4dDogbmV4dE9yT2JzZXJ2ZXIsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JzZXJ2ZXIubmV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0ID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JzZXJ2ZXIuZXJyb3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IgPSBub29wO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYnNlcnZlci5jb21wbGV0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHVuc3ViID0gdGhpcy51bnN1YnNjcmliZU9uZS5iaW5kKHRoaXMsIHRoaXMub2JzZXJ2ZXJzLmxlbmd0aCk7XG4gICAgICAgIC8vIEF0dGVtcHQgdG8gc3Vic2NyaWJlIHRvIGEgdGVybWluYXRlZCBPYnNlcnZhYmxlIC0gd2VcbiAgICAgICAgLy8ganVzdCByZXNwb25kIHRvIHRoZSBPYnNlcnZlciB3aXRoIHRoZSBmaW5hbCBlcnJvciBvciBjb21wbGV0ZVxuICAgICAgICAvLyBldmVudC5cbiAgICAgICAgaWYgKHRoaXMuZmluYWxpemVkKSB7XG4gICAgICAgICAgICB0aGlzLnRhc2sudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmZpbmFsRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKF90aGlzLmZpbmFsRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9ic2VydmVycy5wdXNoKG9ic2VydmVyKTtcbiAgICAgICAgcmV0dXJuIHVuc3ViO1xuICAgIH07XG4gICAgLy8gVW5zdWJzY3JpYmUgaXMgc3luY2hyb25vdXMgLSB3ZSBndWFyYW50ZWUgdGhhdCBubyBldmVudHMgYXJlIHNlbnQgdG9cbiAgICAvLyBhbnkgdW5zdWJzY3JpYmVkIE9ic2VydmVyLlxuICAgIE9ic2VydmVyUHJveHkucHJvdG90eXBlLnVuc3Vic2NyaWJlT25lID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzID09PSB1bmRlZmluZWQgfHwgdGhpcy5vYnNlcnZlcnNbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSB0aGlzLm9ic2VydmVyc1tpXTtcbiAgICAgICAgdGhpcy5vYnNlcnZlckNvdW50IC09IDE7XG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVyQ291bnQgPT09IDAgJiYgdGhpcy5vbk5vT2JzZXJ2ZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub25Ob09ic2VydmVycyh0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgT2JzZXJ2ZXJQcm94eS5wcm90b3R5cGUuZm9yRWFjaE9ic2VydmVyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbmFsaXplZCkge1xuICAgICAgICAgICAgLy8gQWxyZWFkeSBjbG9zZWQgYnkgcHJldmlvdXMgZXZlbnQuLi4uanVzdCBlYXQgdGhlIGFkZGl0aW9uYWwgdmFsdWVzLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNpbmNlIHNlbmRPbmUgY2FsbHMgYXN5bmNocm9ub3VzbHkgLSB0aGVyZSBpcyBubyBjaGFuY2UgdGhhdFxuICAgICAgICAvLyB0aGlzLm9ic2VydmVycyB3aWxsIGJlY29tZSB1bmRlZmluZWQuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZE9uZShpLCBmbik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENhbGwgdGhlIE9ic2VydmVyIHZpYSBvbmUgb2YgaXQncyBjYWxsYmFjayBmdW5jdGlvbi4gV2UgYXJlIGNhcmVmdWwgdG9cbiAgICAvLyBjb25maXJtIHRoYXQgdGhlIG9ic2VydmUgaGFzIG5vdCBiZWVuIHVuc3Vic2NyaWJlZCBzaW5jZSB0aGlzIGFzeW5jaHJvbm91c1xuICAgIC8vIGZ1bmN0aW9uIGhhZCBiZWVuIHF1ZXVlZC5cbiAgICBPYnNlcnZlclByb3h5LnByb3RvdHlwZS5zZW5kT25lID0gZnVuY3Rpb24gKGksIGZuKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIEV4ZWN1dGUgdGhlIGNhbGxiYWNrIGFzeW5jaHJvbm91c2x5XG4gICAgICAgIHRoaXMudGFzay50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vYnNlcnZlcnMgIT09IHVuZGVmaW5lZCAmJiBfdGhpcy5vYnNlcnZlcnNbaV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZuKF90aGlzLm9ic2VydmVyc1tpXSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXhjZXB0aW9ucyByYWlzZWQgaW4gT2JzZXJ2ZXJzIG9yIG1pc3NpbmcgbWV0aG9kcyBvZiBhblxuICAgICAgICAgICAgICAgICAgICAvLyBPYnNlcnZlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gTG9nIGVycm9yIHRvIGNvbnNvbGUuIGIvMzE0MDQ4MDZcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIE9ic2VydmVyUHJveHkucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbmFsaXplZCA9IHRydWU7XG4gICAgICAgIGlmIChlcnIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5maW5hbEVycm9yID0gZXJyO1xuICAgICAgICB9XG4gICAgICAgIC8vIFByb3h5IGlzIG5vIGxvbmdlciBuZWVkZWQgLSBnYXJiYWdlIGNvbGxlY3QgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLnRhc2sudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5vYnNlcnZlcnMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfdGhpcy5vbk5vT2JzZXJ2ZXJzID0gdW5kZWZpbmVkO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBPYnNlcnZlclByb3h5O1xufSgpO1xuLyoqIFR1cm4gc3luY2hyb25vdXMgZnVuY3Rpb24gaW50byBvbmUgY2FsbGVkIGFzeW5jaHJvbm91c2x5LiAqL1xuZnVuY3Rpb24gYXN5bmMoZm4sIG9uRXJyb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIF9wcm9taXNlLlByb21pc2VJbXBsLnJlc29sdmUodHJ1ZSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmbi5hcHBseSh2b2lkIDAsIGFyZ3MpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59XG4vKipcbiAqIFJldHVybiB0cnVlIGlmIHRoZSBvYmplY3QgcGFzc2VkIGluIGltcGxlbWVudHMgYW55IG9mIHRoZSBuYW1lZCBtZXRob2RzLlxuICovXG5mdW5jdGlvbiBpbXBsZW1lbnRzQW55TWV0aG9kcyhvYmosIG1ldGhvZHMpIHtcbiAgICBpZiAoKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG9iaikpICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKHZhciBfaSA9IDAsIG1ldGhvZHNfMSA9IG1ldGhvZHM7IF9pIDwgbWV0aG9kc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgbWV0aG9kID0gbWV0aG9kc18xW19pXTtcbiAgICAgICAgaWYgKG1ldGhvZCBpbiBvYmogJiYgdHlwZW9mIG9ialttZXRob2RdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBub29wKCkge1xuICAgIC8vIGRvIG5vdGhpbmdcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN1YnNjcmliZS5qcy5tYXBcbiIsIihmdW5jdGlvbiAocm9vdCkge1xuXG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4gIC8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxuICB2YXIgc2V0VGltZW91dEZ1bmMgPSBzZXRUaW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICBcbiAgLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gIGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gICAgdGhpcy5fc3RhdGUgPSAwO1xuICAgIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICAgIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICAgIHNlbGYgPSBzZWxmLl92YWx1ZTtcbiAgICB9XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgICBzZWxmLl9kZWZlcnJlZHMucHVzaChkZWZlcnJlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuX2hhbmRsZWQgPSB0cnVlO1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHJldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFByb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICBpZiAobmV3VmFsdWUgJiYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG5ld1ZhbHVlID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICBzZWxmLl9zdGF0ZSA9IDM7XG4gICAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuX3N0YXRlID0gMTtcbiAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICBmaW5hbGUoc2VsZik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KHNlbGYsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHNlbGYuX3N0YXRlID0gMjtcbiAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGZpbmFsZShzZWxmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXNlbGYuX2hhbmRsZWQpIHtcbiAgICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGhhbmRsZShzZWxmLCBzZWxmLl9kZWZlcnJlZHNbaV0pO1xuICAgIH1cbiAgICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gICAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gICAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICAgKlxuICAgKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gICAqL1xuICBmdW5jdGlvbiBkb1Jlc29sdmUoZm4sIHNlbGYpIHtcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBmbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgICB9XG4gIH1cblxuICBQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgdmFyIHByb20gPSBuZXcgKHRoaXMuY29uc3RydWN0b3IpKG5vb3ApO1xuXG4gICAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gICAgcmV0dXJuIHByb207XG4gIH07XG5cbiAgUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW47XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICByZWplY3QoZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IFByb21pc2UpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlamVjdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmFsdWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhbHVlc1tpXS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH0pIHx8XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG4gICAgfTtcblxuICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0IHRoZSBpbW1lZGlhdGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBjYWxsYmFja3NcbiAgICogQHBhcmFtIGZuIHtmdW5jdGlvbn0gRnVuY3Rpb24gdG8gZXhlY3V0ZVxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0SW1tZWRpYXRlRm4gPSBmdW5jdGlvbiBfc2V0SW1tZWRpYXRlRm4oZm4pIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuKGZuKSB7XG4gICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmbjtcbiAgfTtcbiAgXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiAgfSBlbHNlIGlmICghcm9vdC5Qcm9taXNlKSB7XG4gICAgcm9vdC5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfVxuXG59KSh0aGlzKTtcbiIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2NC4zLjBcbkJ1aWxkOiByZXYtYmQ4MjY1ZVxuVGVybXM6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS90ZXJtcy8gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVlcENvcHkgPSBkZWVwQ29weTtcbmV4cG9ydHMuZGVlcEV4dGVuZCA9IGRlZXBFeHRlbmQ7XG5leHBvcnRzLnBhdGNoUHJvcGVydHkgPSBwYXRjaFByb3BlcnR5O1xuLyoqXG4qIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG4vKipcbiAqIERvIGEgZGVlcC1jb3B5IG9mIGJhc2ljIEphdmFTY3JpcHQgT2JqZWN0cyBvciBBcnJheXMuXG4gKi9cbmZ1bmN0aW9uIGRlZXBDb3B5KHZhbHVlKSB7XG4gICAgcmV0dXJuIGRlZXBFeHRlbmQodW5kZWZpbmVkLCB2YWx1ZSk7XG59XG4vKipcbiAqIENvcHkgcHJvcGVydGllcyBmcm9tIHNvdXJjZSB0byB0YXJnZXQgKHJlY3Vyc2l2ZWx5IGFsbG93cyBleHRlbnNpb25cbiAqIG9mIE9iamVjdHMgYW5kIEFycmF5cykuICBTY2FsYXIgdmFsdWVzIGluIHRoZSB0YXJnZXQgYXJlIG92ZXItd3JpdHRlbi5cbiAqIElmIHRhcmdldCBpcyB1bmRlZmluZWQsIGFuIG9iamVjdCBvZiB0aGUgYXBwcm9wcmlhdGUgdHlwZSB3aWxsIGJlIGNyZWF0ZWRcbiAqIChhbmQgcmV0dXJuZWQpLlxuICpcbiAqIFdlIHJlY3Vyc2l2ZWx5IGNvcHkgYWxsIGNoaWxkIHByb3BlcnRpZXMgb2YgcGxhaW4gT2JqZWN0cyBpbiB0aGUgc291cmNlLSBzb1xuICogdGhhdCBuYW1lc3BhY2UtIGxpa2UgZGljdGlvbmFyaWVzIGFyZSBtZXJnZWQuXG4gKlxuICogTm90ZSB0aGF0IHRoZSB0YXJnZXQgY2FuIGJlIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2UgdGhlIHByb3BlcnRpZXMgaW5cbiAqIHRoZSBzb3VyY2UgT2JqZWN0IGFyZSBjb3BpZWQgb250byBpdCBhcyBzdGF0aWMgcHJvcGVydGllcyBvZiB0aGUgRnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGRlZXBFeHRlbmQodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAoIShzb3VyY2UgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuICAgIHN3aXRjaCAoc291cmNlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgIGNhc2UgRGF0ZTpcbiAgICAgICAgICAgIC8vIFRyZWF0IERhdGVzIGxpa2Ugc2NhbGFyczsgaWYgdGhlIHRhcmdldCBkYXRlIG9iamVjdCBoYWQgYW55IGNoaWxkXG4gICAgICAgICAgICAvLyBwcm9wZXJ0aWVzIC0gdGhleSB3aWxsIGJlIGxvc3QhXG4gICAgICAgICAgICB2YXIgZGF0ZVZhbHVlID0gc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVWYWx1ZS5nZXRUaW1lKCkpO1xuICAgICAgICBjYXNlIE9iamVjdDpcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyYXk6XG4gICAgICAgICAgICAvLyBBbHdheXMgY29weSB0aGUgYXJyYXkgc291cmNlIGFuZCBvdmVyd3JpdGUgdGhlIHRhcmdldC5cbiAgICAgICAgICAgIHRhcmdldCA9IFtdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBOb3QgYSBwbGFpbiBPYmplY3QgLSB0cmVhdCBpdCBhcyBhIHNjYWxhci5cbiAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmICghc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRbcHJvcF0gPSBkZWVwRXh0ZW5kKHRhcmdldFtwcm9wXSwgc291cmNlW3Byb3BdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbi8vIFRPRE86IFJlYWxseSBuZWVkZWQgKGZvciBKU0NvbXBpbGVyIHR5cGUgY2hlY2tpbmcpP1xuZnVuY3Rpb24gcGF0Y2hQcm9wZXJ0eShvYmosIHByb3AsIHZhbHVlKSB7XG4gICAgb2JqW3Byb3BdID0gdmFsdWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWVwX2NvcHkuanMubWFwXG4iLCIvKiEgQGxpY2Vuc2UgRmlyZWJhc2UgdjQuMy4wXG5CdWlsZDogcmV2LWJkODI2NWVcblRlcm1zOiBodHRwczovL2ZpcmViYXNlLmdvb2dsZS5jb20vdGVybXMvICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4qIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG52YXIgc2NvcGU7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzY29wZSA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2NvcGUgPSBzZWxmO1xufSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgICBzY29wZSA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHlmaWxsIGZhaWxlZCBiZWNhdXNlIGdsb2JhbCBvYmplY3QgaXMgdW5hdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudCcpO1xuICAgIH1cbn1cbnZhciBnbG9iYWxTY29wZSA9IGV4cG9ydHMuZ2xvYmFsU2NvcGUgPSBzY29wZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdsb2JhbFNjb3BlLmpzLm1hcFxuIiwiLyohIEBsaWNlbnNlIEZpcmViYXNlIHY0LjMuMFxuQnVpbGQ6IHJldi1iZDgyNjVlXG5UZXJtczogaHR0cHM6Ly9maXJlYmFzZS5nb29nbGUuY29tL3Rlcm1zLyAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYXR0YWNoRHVtbXlFcnJvckhhbmRsZXIgPSBleHBvcnRzLkRlZmVycmVkID0gZXhwb3J0cy5Qcm9taXNlSW1wbCA9IHVuZGVmaW5lZDtcblxudmFyIF9nbG9iYWxTY29wZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2dsb2JhbFNjb3BlJyk7XG5cbnZhciBQcm9taXNlSW1wbCA9IGV4cG9ydHMuUHJvbWlzZUltcGwgPSBfZ2xvYmFsU2NvcGUuZ2xvYmFsU2NvcGUuUHJvbWlzZSB8fCByZXF1aXJlKCdwcm9taXNlLXBvbHlmaWxsJyk7XG4vKipcbiAqIEEgZGVmZXJyZWQgcHJvbWlzZSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuLyoqXG4qIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4qIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4qXG4qICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4qXG4qIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG52YXIgRGVmZXJyZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqIEBjb25zdHJ1Y3RvciAqL1xuICAgIGZ1bmN0aW9uIERlZmVycmVkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMucmVzb2x2ZSA9IG51bGw7XG4gICAgICAgIHRoaXMucmVqZWN0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICBzZWxmLnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE91ciBBUEkgaW50ZXJuYWxzIGFyZSBub3QgcHJvbWlzZWlmaWVkIGFuZCBjYW5ub3QgYmVjYXVzZSBvdXIgY2FsbGJhY2sgQVBJcyBoYXZlIHN1YnRsZSBleHBlY3RhdGlvbnMgYXJvdW5kXG4gICAgICogaW52b2tpbmcgcHJvbWlzZXMgaW5saW5lLCB3aGljaCBQcm9taXNlcyBhcmUgZm9yYmlkZGVuIHRvIGRvLiBUaGlzIG1ldGhvZCBhY2NlcHRzIGFuIG9wdGlvbmFsIG5vZGUtc3R5bGUgY2FsbGJhY2tcbiAgICAgKiBhbmQgcmV0dXJucyBhIG5vZGUtc3R5bGUgY2FsbGJhY2sgd2hpY2ggd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgRGVmZXJyZWQncyBwcm9taXNlLlxuICAgICAqIEBwYXJhbSB7KCg/ZnVuY3Rpb24oPyhFcnJvcikpOiAoP3x1bmRlZmluZWQpKXwgKD9mdW5jdGlvbig/KEVycm9yKSw/PSk6ICg/fHVuZGVmaW5lZCkpKT19IG9wdF9ub2RlQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHshZnVuY3Rpb24oPyhFcnJvciksID89KX1cbiAgICAgKi9cbiAgICBEZWZlcnJlZC5wcm90b3R5cGUud3JhcENhbGxiYWNrID0gZnVuY3Rpb24gKG9wdF9ub2RlQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvKipcbiAgICAgICAgICAgKiBAcGFyYW0gez9FcnJvcn0gZXJyb3JcbiAgICAgICAgICAgKiBAcGFyYW0gez89fSBvcHRfdmFsdWVcbiAgICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gbWV0YShlcnJvciwgb3B0X3ZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYucmVzb2x2ZShvcHRfdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRfbm9kZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXR0YWNoRHVtbXlFcnJvckhhbmRsZXIoc2VsZi5wcm9taXNlKTtcbiAgICAgICAgICAgICAgICAvLyBTb21lIG9mIG91ciBjYWxsYmFja3MgZG9uJ3QgZXhwZWN0IGEgdmFsdWUgYW5kIG91ciBvd24gdGVzdHNcbiAgICAgICAgICAgICAgICAvLyBhc3NlcnQgdGhhdCB0aGUgcGFyYW1ldGVyIGxlbmd0aCBpcyAxXG4gICAgICAgICAgICAgICAgaWYgKG9wdF9ub2RlQ2FsbGJhY2subGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdF9ub2RlQ2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdF9ub2RlQ2FsbGJhY2soZXJyb3IsIG9wdF92YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgIH07XG4gICAgcmV0dXJuIERlZmVycmVkO1xufSgpO1xuZXhwb3J0cy5EZWZlcnJlZCA9IERlZmVycmVkO1xuLyoqXG4gKiBDaHJvbWUgKGFuZCBtYXliZSBvdGhlciBicm93c2VycykgcmVwb3J0IGFuIEVycm9yIGluIHRoZSBjb25zb2xlIGlmIHlvdSByZWplY3QgYSBwcm9taXNlXG4gKiBhbmQgbm9ib2R5IGhhbmRsZXMgdGhlIGVycm9yLiBUaGlzIGlzIG5vcm1hbGx5IGEgZ29vZCB0aGluZywgYnV0IHRoaXMgd2lsbCBjb25mdXNlIGRldnMgd2hvXG4gKiBuZXZlciBpbnRlbmRlZCB0byB1c2UgcHJvbWlzZXMgaW4gdGhlIGZpcnN0IHBsYWNlLiBTbyBpbiBzb21lIGNhc2VzIChpbiBwYXJ0aWN1bGFyLCBpZiB0aGVcbiAqIGRldmVsb3BlciBhdHRhY2hlZCBhIGNhbGxiYWNrKSwgd2Ugc2hvdWxkIGF0dGFjaCBhIGR1bW15IHJlc29sdmVyIHRvIHRoZSBwcm9taXNlIHRvIHN1cHByZXNzXG4gKiB0aGlzIGVycm9yLlxuICpcbiAqIE5vdGU6IFdlIGNhbid0IGRvIHRoaXMgYWxsIHRoZSB0aW1lLCBzaW5jZSBpdCBicmVha3MgdGhlIFByb21pc2Ugc3BlYyAodGhvdWdoIGluIHRoZSBvYnNjdXJlXG4gKiAzLjMuMyBzZWN0aW9uIHJlbGF0ZWQgdG8gdXBncmFkaW5nIG5vbi1jb21wbGlhbnQgcHJvbWlzZXMpLlxuICogQHBhcmFtIHshZmlyZWJhc2UuUHJvbWlzZX0gcHJvbWlzZVxuICovXG5cbnZhciBhdHRhY2hEdW1teUVycm9ySGFuZGxlciA9IGV4cG9ydHMuYXR0YWNoRHVtbXlFcnJvckhhbmRsZXIgPSBmdW5jdGlvbiBhdHRhY2hEdW1teUVycm9ySGFuZGxlcihwcm9taXNlKSB7XG4gICAgcHJvbWlzZS5jYXRjaChmdW5jdGlvbiAoKSB7fSk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvbWlzZS5qcy5tYXBcbiIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2NC4zLjBcbkJ1aWxkOiByZXYtYmQ4MjY1ZVxuVGVybXM6IGh0dHBzOi8vZmlyZWJhc2UuZ29vZ2xlLmNvbS90ZXJtcy8gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXggcG9seWZpbGwgZnJvbSBNRE5cbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmRJbmRleFxuICogaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICovXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZEluZGV4Jywge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUocHJlZGljYXRlKSB7XG4gICAgICAgICAgICAvLyAxLiBMZXQgTyBiZSA/IFRvT2JqZWN0KHRoaXMgdmFsdWUpLlxuICAgICAgICAgICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widGhpc1wiIGlzIG51bGwgb3Igbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvID0gT2JqZWN0KHRoaXMpO1xuICAgICAgICAgICAgLy8gMi4gTGV0IGxlbiBiZSA/IFRvTGVuZ3RoKD8gR2V0KE8sIFwibGVuZ3RoXCIpKS5cbiAgICAgICAgICAgIHZhciBsZW4gPSBvLmxlbmd0aCA+Pj4gMDtcbiAgICAgICAgICAgIC8vIDMuIElmIElzQ2FsbGFibGUocHJlZGljYXRlKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyA0LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgICAgICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIC8vIDUuIExldCBrIGJlIDAuXG4gICAgICAgICAgICB2YXIgayA9IDA7XG4gICAgICAgICAgICAvLyA2LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cbiAgICAgICAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgLy8gYS4gTGV0IFBrIGJlICEgVG9TdHJpbmcoaykuXG4gICAgICAgICAgICAgICAgLy8gYi4gTGV0IGtWYWx1ZSBiZSA/IEdldChPLCBQaykuXG4gICAgICAgICAgICAgICAgLy8gYy4gTGV0IHRlc3RSZXN1bHQgYmUgVG9Cb29sZWFuKD8gQ2FsbChwcmVkaWNhdGUsIFQsIMKrIGtWYWx1ZSwgaywgTyDCuykpLlxuICAgICAgICAgICAgICAgIC8vIGQuIElmIHRlc3RSZXN1bHQgaXMgdHJ1ZSwgcmV0dXJuIGsuXG4gICAgICAgICAgICAgICAgdmFyIGtWYWx1ZSA9IG9ba107XG4gICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIGtWYWx1ZSwgaywgbykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGUuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyA3LiBSZXR1cm4gLTEuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qKlxuICogVGhpcyBpcyB0aGUgQXJyYXkucHJvdG90eXBlLmZpbmQgcG9seWZpbGwgZnJvbSBNRE5cbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmRcbiAqIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kXG4gKi9cbmlmICghQXJyYXkucHJvdG90eXBlLmZpbmQpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZCcsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKHByZWRpY2F0ZSkge1xuICAgICAgICAgICAgLy8gMS4gTGV0IE8gYmUgPyBUb09iamVjdCh0aGlzIHZhbHVlKS5cbiAgICAgICAgICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInRoaXNcIiBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbyA9IE9iamVjdCh0aGlzKTtcbiAgICAgICAgICAgIC8vIDIuIExldCBsZW4gYmUgPyBUb0xlbmd0aCg/IEdldChPLCBcImxlbmd0aFwiKSkuXG4gICAgICAgICAgICB2YXIgbGVuID0gby5sZW5ndGggPj4+IDA7XG4gICAgICAgICAgICAvLyAzLiBJZiBJc0NhbGxhYmxlKHByZWRpY2F0ZSkgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gNC4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuICAgICAgICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICAvLyA1LiBMZXQgayBiZSAwLlxuICAgICAgICAgICAgdmFyIGsgPSAwO1xuICAgICAgICAgICAgLy8gNi4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG4gICAgICAgICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICAgICAgICAgIC8vIGEuIExldCBQayBiZSAhIFRvU3RyaW5nKGspLlxuICAgICAgICAgICAgICAgIC8vIGIuIExldCBrVmFsdWUgYmUgPyBHZXQoTywgUGspLlxuICAgICAgICAgICAgICAgIC8vIGMuIExldCB0ZXN0UmVzdWx0IGJlIFRvQm9vbGVhbig/IENhbGwocHJlZGljYXRlLCBULCDCqyBrVmFsdWUsIGssIE8gwrspKS5cbiAgICAgICAgICAgICAgICAvLyBkLiBJZiB0ZXN0UmVzdWx0IGlzIHRydWUsIHJldHVybiBrVmFsdWUuXG4gICAgICAgICAgICAgICAgdmFyIGtWYWx1ZSA9IG9ba107XG4gICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIGtWYWx1ZSwgaywgbykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZS4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDcuIFJldHVybiB1bmRlZmluZWQuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGltcy5qcy5tYXBcbiIsIi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnQgKi9cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgKiBhcyBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1NodWZmbGVVdGlsKGVsZW1lbnQsIGNsYXNzVG9BZGQsIGNsYXNzVG9SZW1vdmUpIHtcblx0aWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyB8fCBlbGVtZW50IGluc3RhbmNlb2YgU3RyaW5nKSB7XG5cdFx0JChlbGVtZW50KS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKS5hZGRDbGFzcyhjbGFzc1RvQWRkKTtcblx0fSBlbHNlIHtcblx0XHRlbGVtZW50LmZvckVhY2goKGVsKSA9PiB7XG5cdFx0XHQkKGVsKS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKS5hZGRDbGFzcyhjbGFzc1RvQWRkKTtcblx0XHR9KTtcblx0fVxufVxuXG4vLyBleHBvcnQgY2xhc3MgZmlyZWJhc2VEYiB7XG4vLyBcdGZpcmUgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKHtcbi8vIFx0XHRhcGlLZXk6ICdBSXphU3lEaU10UHd0NTgtTkVuUjU2a1R6SjlIZGRHNUlyR3VockUnLFxuLy8gXHRcdGF1dGhEb21haW46ICdzdWRlZXBnYW5kaGl3ZWIuZmlyZWJhc2VhcHAuY29tJyxcbi8vIFx0XHRkYXRhYmFzZVVSTDogJ2h0dHBzOi8vc3VkZWVwZ2FuZGhpd2ViLmZpcmViYXNlaW8uY29tJyxcbi8vIFx0XHRwcm9qZWN0SWQ6ICdzdWRlZXBnYW5kaGl3ZWInLFxuLy8gXHR9KTtcblxuLy8gXHRmaXJlRGF0YWJhc2UgPSBmaXJlLmRhdGFiYXNlKCk7XG5cbi8vIFx0Ly8gd3JpdGUgdG8gZGF0YWJhc2Vcbi8vIFx0Y29uc3Qgd3JpdGVUb0RiID0gZnVuY3Rpb24gd3JpdGVUb0RiVXRpbChwYXRoLCB2YWx1ZU9iaikge1xuLy8gXHRcdGZpcmVEYXRhYmFzZS5yZWYoKS5zZXQodmFsdWVPYmopO1xuLy8gXHR9O1xuXG4vLyBcdC8vIHJlYWQgZnJvbSBkYXRhYmFzZVxuLy8gXHRjb25zdCBSZWFkRnJvbURiID0gZnVuY3Rpb24gUmVhZEZyb21EYlV0aWwocGF0aCkge1xuLy8gXHRcdGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uY2UoJ3ZhbHVlJykudGhlbigoc25hcHNob3QpID0+IHtcbi8vIFx0XHRcdC8vIHNvbWV0aGluZ1xuLy8gXHRcdH0pO1xuLy8gXHR9O1xuLy8gfVxuXG4iXX0=
