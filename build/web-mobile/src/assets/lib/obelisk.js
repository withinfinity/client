(function (root) {
  var exports = undefined,
      module = undefined,
      require = undefined;
  var define = undefined;
  var self = root,
      window = root,
      global = root,
      globalThis = root;
  (function () {
    (function () {
      function r(e, n, t) {
        function o(i, f) {
          if (!n[i]) {
            if (!e[i]) {
              var c = "function" == typeof require && require;
              if (!f && c) return c(i, !0);
              if (u) return u(i, !0);
              var a = new Error("Cannot find module '" + i + "'");
              throw a.code = "MODULE_NOT_FOUND", a;
            }

            var p = n[i] = {
              exports: {}
            };
            e[i][0].call(p.exports, function (r) {
              var n = e[i][1][r];
              return o(n || r);
            }, p, p.exports, r, e, n, t);
          }

          return n[i].exports;
        }

        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);

        return o;
      }

      return r;
    })()({
      1: [function (require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.
        'use strict';

        var R = typeof Reflect === 'object' ? Reflect : null;
        var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
          return Function.prototype.apply.call(target, receiver, args);
        };
        var ReflectOwnKeys;

        if (R && typeof R.ownKeys === 'function') {
          ReflectOwnKeys = R.ownKeys;
        } else if (Object.getOwnPropertySymbols) {
          ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
          };
        } else {
          ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target);
          };
        }

        function ProcessEmitWarning(warning) {
          if (console && console.warn) console.warn(warning);
        }

        var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
          return value !== value;
        };

        function EventEmitter() {
          EventEmitter.init.call(this);
        }

        module.exports = EventEmitter;
        module.exports.once = once; // Backwards-compat with node 0.10.x

        EventEmitter.EventEmitter = EventEmitter;
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._eventsCount = 0;
        EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.

        var defaultMaxListeners = 10;

        function checkListener(listener) {
          if (typeof listener !== 'function') {
            throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
          }
        }

        Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
          enumerable: true,
          get: function () {
            return defaultMaxListeners;
          },
          set: function (arg) {
            if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
              throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
            }

            defaultMaxListeners = arg;
          }
        });

        EventEmitter.init = function () {
          if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
            this._events = Object.create(null);
            this._eventsCount = 0;
          }

          this._maxListeners = this._maxListeners || undefined;
        }; // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.


        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
          if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
            throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
          }

          this._maxListeners = n;
          return this;
        };

        function _getMaxListeners(that) {
          if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
          return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
          return _getMaxListeners(this);
        };

        EventEmitter.prototype.emit = function emit(type) {
          var args = [];

          for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);

          var doError = type === 'error';
          var events = this._events;
          if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false; // If there is no 'error' event listener then throw.

          if (doError) {
            var er;
            if (args.length > 0) er = args[0];

            if (er instanceof Error) {
              // Note: The comments on the `throw` lines are intentional, they show
              // up in Node's output if this results in an unhandled exception.
              throw er; // Unhandled 'error' event
            } // At least give some kind of context to the user


            var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
            err.context = er;
            throw err; // Unhandled 'error' event
          }

          var handler = events[type];
          if (handler === undefined) return false;

          if (typeof handler === 'function') {
            ReflectApply(handler, this, args);
          } else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);

            for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
          }

          return true;
        };

        function _addListener(target, type, listener, prepend) {
          var m;
          var events;
          var existing;
          checkListener(listener);
          events = target._events;

          if (events === undefined) {
            events = target._events = Object.create(null);
            target._eventsCount = 0;
          } else {
            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (events.newListener !== undefined) {
              target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
              // this._events to be assigned to a new object

              events = target._events;
            }

            existing = events[type];
          }

          if (existing === undefined) {
            // Optimize the case of one listener. Don't need the extra array object.
            existing = events[type] = listener;
            ++target._eventsCount;
          } else {
            if (typeof existing === 'function') {
              // Adding the second element, need to change to array.
              existing = events[type] = prepend ? [listener, existing] : [existing, listener]; // If we've already got an array, just append.
            } else if (prepend) {
              existing.unshift(listener);
            } else {
              existing.push(listener);
            } // Check for listener leak


            m = _getMaxListeners(target);

            if (m > 0 && existing.length > m && !existing.warned) {
              existing.warned = true; // No error code for this since it is a Warning
              // eslint-disable-next-line no-restricted-syntax

              var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
              w.name = 'MaxListenersExceededWarning';
              w.emitter = target;
              w.type = type;
              w.count = existing.length;
              ProcessEmitWarning(w);
            }
          }

          return target;
        }

        EventEmitter.prototype.addListener = function addListener(type, listener) {
          return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener = function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

        function onceWrapper() {
          if (!this.fired) {
            this.target.removeListener(this.type, this.wrapFn);
            this.fired = true;
            if (arguments.length === 0) return this.listener.call(this.target);
            return this.listener.apply(this.target, arguments);
          }
        }

        function _onceWrap(target, type, listener) {
          var state = {
            fired: false,
            wrapFn: undefined,
            target: target,
            type: type,
            listener: listener
          };
          var wrapped = onceWrapper.bind(state);
          wrapped.listener = listener;
          state.wrapFn = wrapped;
          return wrapped;
        }

        EventEmitter.prototype.once = function once(type, listener) {
          checkListener(listener);
          this.on(type, _onceWrap(this, type, listener));
          return this;
        };

        EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        }; // Emits a 'removeListener' event if and only if the listener was removed.


        EventEmitter.prototype.removeListener = function removeListener(type, listener) {
          var list, events, position, i, originalListener;
          checkListener(listener);
          events = this._events;
          if (events === undefined) return this;
          list = events[type];
          if (list === undefined) return this;

          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0) this._events = Object.create(null);else {
              delete events[type];
              if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length - 1; i >= 0; i--) {
              if (list[i] === listener || list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0) return this;
            if (position === 0) list.shift();else {
              spliceOne(list, position);
            }
            if (list.length === 1) events[type] = list[0];
            if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

        EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
          var listeners, events, i;
          events = this._events;
          if (events === undefined) return this; // not listening for removeListener, no need to emit

          if (events.removeListener === undefined) {
            if (arguments.length === 0) {
              this._events = Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== undefined) {
              if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
            }

            return this;
          } // emit removeListener for all listeners on all events


          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;

            for (i = 0; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }

            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners !== undefined) {
            // LIFO order
            for (i = listeners.length - 1; i >= 0; i--) {
              this.removeListener(type, listeners[i]);
            }
          }

          return this;
        };

        function _listeners(target, type, unwrap) {
          var events = target._events;
          if (events === undefined) return [];
          var evlistener = events[type];
          if (evlistener === undefined) return [];
          if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
          return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
        }

        EventEmitter.prototype.listeners = function listeners(type) {
          return _listeners(this, type, true);
        };

        EventEmitter.prototype.rawListeners = function rawListeners(type) {
          return _listeners(this, type, false);
        };

        EventEmitter.listenerCount = function (emitter, type) {
          if (typeof emitter.listenerCount === 'function') {
            return emitter.listenerCount(type);
          } else {
            return listenerCount.call(emitter, type);
          }
        };

        EventEmitter.prototype.listenerCount = listenerCount;

        function listenerCount(type) {
          var events = this._events;

          if (events !== undefined) {
            var evlistener = events[type];

            if (typeof evlistener === 'function') {
              return 1;
            } else if (evlistener !== undefined) {
              return evlistener.length;
            }
          }

          return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
          return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
        };

        function arrayClone(arr, n) {
          var copy = new Array(n);

          for (var i = 0; i < n; ++i) copy[i] = arr[i];

          return copy;
        }

        function spliceOne(list, index) {
          for (; index + 1 < list.length; index++) list[index] = list[index + 1];

          list.pop();
        }

        function unwrapListeners(arr) {
          var ret = new Array(arr.length);

          for (var i = 0; i < ret.length; ++i) {
            ret[i] = arr[i].listener || arr[i];
          }

          return ret;
        }

        function once(emitter, name) {
          return new Promise(function (resolve, reject) {
            function errorListener(err) {
              emitter.removeListener(name, resolver);
              reject(err);
            }

            function resolver() {
              if (typeof emitter.removeListener === 'function') {
                emitter.removeListener('error', errorListener);
              }

              resolve([].slice.call(arguments));
            }

            ;
            eventTargetAgnosticAddListener(emitter, name, resolver, {
              once: true
            });

            if (name !== 'error') {
              addErrorHandlerIfEventEmitter(emitter, errorListener, {
                once: true
              });
            }
          });
        }

        function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
          if (typeof emitter.on === 'function') {
            eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
          }
        }

        function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
          if (typeof emitter.on === 'function') {
            if (flags.once) {
              emitter.once(name, listener);
            } else {
              emitter.on(name, listener);
            }
          } else if (typeof emitter.addEventListener === 'function') {
            // EventTarget does not have `error` event semantics like Node
            // EventEmitters, we do not listen for `error` events here.
            emitter.addEventListener(name, function wrapListener(arg) {
              // IE does not have builtin `{ once: true }` support so we
              // have to do it manually.
              if (flags.once) {
                emitter.removeEventListener(name, wrapListener);
              }

              listener(arg);
            });
          } else {
            throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
          }
        }
      }, {}],
      2: [function (require, module, exports) {
        var sui = require('@mysten/sui.js');

        var obelisk = require('@0xobelisk/client'); // var web3games = require('@web3games/web3games.js');


        window.obelisk = obelisk;
        window.sui = sui;
      }, {
        "@0xobelisk/client": 3,
        "@mysten/sui.js": 23
      }],
      3: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Obelisk = void 0;
        Object.defineProperty(exports, "SUI_CLOCK_OBJECT_ID", {
          enumerable: true,
          get: function () {
            return _sui.SUI_CLOCK_OBJECT_ID;
          }
        });
        Object.defineProperty(exports, "SUI_SYSTEM_STATE_OBJECT_ID", {
          enumerable: true,
          get: function () {
            return _sui.SUI_SYSTEM_STATE_OBJECT_ID;
          }
        });
        exports.SuiTxBlock = exports.SuiRpcProvider = exports.SuiContractFactory = exports.SuiAccountManager = void 0;
        Object.defineProperty(exports, "TransactionBlock", {
          enumerable: true,
          get: function () {
            return _sui.TransactionBlock;
          }
        });
        exports.getMetadata = getMetadata;

        var _sui = require("@mysten/sui.js");

        var _bip = require("@scure/bip39");

        var _english = require("@scure/bip39/wordlists/english");

        var _tsRetryPromise = require("ts-retry-promise");

        var _bcs = require("@mysten/bcs");

        var __accessCheck = (obj2, member, msg) => {
          if (!member.has(obj2)) throw TypeError("Cannot " + msg);
        };

        var __privateGet = (obj2, member, getter) => {
          __accessCheck(obj2, member, "read from private field");

          return getter ? getter.call(obj2) : member.get(obj2);
        };

        var __privateAdd = (obj2, member, value) => {
          if (member.has(obj2)) throw TypeError("Cannot add the same private member more than once");
          member instanceof WeakSet ? member.add(obj2) : member.set(obj2, value);
        }; // src/index.ts
        // src/obelisk.ts
        // src/libs/suiAccountManager/index.ts
        // src/libs/suiAccountManager/keypair.ts


        var getDerivePathForSUI = (derivePathParams = {}) => {
          const {
            accountIndex = 0,
            isExternal = false,
            addressIndex = 0
          } = derivePathParams;
          return `m/44'/784'/${accountIndex}'/${isExternal ? 1 : 0}'/${addressIndex}'`;
        };

        var getKeyPair = (mnemonics, derivePathParams = {}) => {
          const derivePath = getDerivePathForSUI(derivePathParams);
          return _sui.Ed25519Keypair.deriveKeypair(mnemonics, derivePath);
        }; // src/libs/suiAccountManager/util.ts


        var isHex = str => /^0x[0-9a-fA-F]+$|^[0-9a-fA-F]+$/.test(str);

        var isBase64 = str => /^[a-zA-Z0-9+/]+={0,2}$/g.test(str);

        var fromHEX = hexStr => {
          if (!hexStr) {
            throw new Error("cannot parse empty string to Uint8Array");
          }

          const intArr = hexStr.replace("0x", "").match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));

          if (!intArr || intArr.length === 0) {
            throw new Error(`Unable to parse HEX: ${hexStr}`);
          }

          return Uint8Array.from(intArr);
        };

        var hexOrBase64ToUint8Array = str => {
          if (isHex(str)) {
            return fromHEX(str);
          } else if (isBase64(str)) {
            return (0, _sui.fromB64)(str);
          } else {
            throw new Error("The string is not a valid hex or base64 string.");
          }
        };

        var PRIVATE_KEY_SIZE = 32;
        var LEGACY_PRIVATE_KEY_SIZE = 64;

        var normalizePrivateKey = key => {
          if (key.length === LEGACY_PRIVATE_KEY_SIZE) {
            key = key.slice(0, PRIVATE_KEY_SIZE);
          } else if (key.length === PRIVATE_KEY_SIZE + 1 && key[0] === 0) {
            return key.slice(1);
          } else if (key.length === PRIVATE_KEY_SIZE) {
            return key;
          }

          throw new Error("invalid secret key");
        }; // src/libs/suiAccountManager/crypto.ts


        var generateMnemonic = (numberOfWords = 24) => {
          const strength = numberOfWords === 12 ? 128 : 256;
          return (0, _bip.generateMnemonic)(_english.wordlist, strength);
        }; // src/libs/suiAccountManager/index.ts


        var SuiAccountManager = class {
          /**
           * Support the following ways to init the SuiToolkit:
           * 1. mnemonics
           * 2. secretKey (base64 or hex)
           * If none of them is provided, will generate a random mnemonics with 24 words.
           *
           * @param mnemonics, 12 or 24 mnemonics words, separated by space
           * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
           */
          constructor({
            mnemonics,
            secretKey
          } = {}) {
            this.mnemonics = mnemonics || "";
            this.secretKey = secretKey || "";

            if (!this.mnemonics && !this.secretKey) {
              this.mnemonics = generateMnemonic(24);
            }

            this.currentKeyPair = this.secretKey ? _sui.Ed25519Keypair.fromSecretKey(normalizePrivateKey(hexOrBase64ToUint8Array(this.secretKey))) : getKeyPair(this.mnemonics);
            this.currentAddress = this.currentKeyPair.getPublicKey().toSuiAddress();
          }
          /**
           * if derivePathParams is not provided or mnemonics is empty, it will return the currentKeyPair.
           * else:
           * it will generate keyPair from the mnemonic with the given derivePathParams.
           */


          getKeyPair(derivePathParams) {
            if (!derivePathParams || !this.mnemonics) return this.currentKeyPair;
            return getKeyPair(this.mnemonics, derivePathParams);
          }
          /**
           * if derivePathParams is not provided or mnemonics is empty, it will return the currentAddress.
           * else:
           * it will generate address from the mnemonic with the given derivePathParams.
           */


          getAddress(derivePathParams) {
            if (!derivePathParams || !this.mnemonics) return this.currentAddress;
            return getKeyPair(this.mnemonics, derivePathParams).getPublicKey().toSuiAddress();
          }
          /**
           * Switch the current account with the given derivePathParams.
           * This is only useful when the mnemonics is provided. For secretKey mode, it will always use the same account.
           */


          switchAccount(derivePathParams) {
            if (this.mnemonics) {
              this.currentKeyPair = getKeyPair(this.mnemonics, derivePathParams);
              this.currentAddress = this.currentKeyPair.getPublicKey().toSuiAddress();
            }
          }

        }; // src/libs/suiRpcProvider/index.ts
        // src/libs/suiRpcProvider/faucet.ts

        exports.SuiAccountManager = SuiAccountManager;

        var requestFaucet = async (address, provider) => {
          console.log("\nRequesting SUI from faucet for address: ", address);
          const headers = {
            authority: "faucet.testnet.sui.io",
            method: "POST",
            path: "/gas",
            scheme: "https",
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
            "content-length": "105",
            "content-type": "application/json",
            origin: "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil",
            cookie: '_ga=GA1.1.2092533979.1664032306; sui_io_cookie={"level":["necessary","analytics"],"revision":0,"data":null,"rfc_cookie":false}; _ga_YKP53WJMB0=GS1.1.1680531285.31.0.1680531334.11.0.0; _ga_0GW4F97GFL=GS1.1.1680826187.125.0.1680826187.60.0.0; __cf_bm=6rPjXUwuzUPy4yDlZuXgDj0v7xLPpUd5z0CFGCoN_YI-1680867579-0-AZMhU7/mKUUbUlOa27LmfW6eIFkBkXsPKqYgWjpjWpj2XzDckgUsRu/pxSRGfvXCspn3w7Df+uO1MR/b+XikJU0=; _cfuvid=zjwCXMmu19KBIVo_L9Qbq4TqFXJpophG3.EvFTxqdf4-1680867579342-0-604800000',
            "sec-ch-ua": '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "macOS",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "none",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
          };
          const resp = await (0, _tsRetryPromise.retry)(() => provider.requestSuiFromFaucet(address, headers), {
            backoff: "EXPONENTIAL",
            // overall timeout in 60 seconds
            timeout: 1e3 * 60,
            // skip retry if we hit the rate-limit error
            retryIf: error => !(error instanceof _sui.FaucetRateLimitError),
            logger: msg => console.warn(`Retry requesting faucet: ${msg}`)
          });
          (0, _sui.assert)(resp, _sui.FaucetResponse, "Request faucet failed\n");
          console.log("Request faucet success\n");
        }; // src/libs/suiRpcProvider/defaultChainConfigs.ts


        var getDefaultNetworkParams = (networkType = "devnet") => {
          switch (networkType) {
            case "localnet":
              return _sui.localnetConnection;

            case "devnet":
              return _sui.devnetConnection;

            case "testnet":
              return _sui.testnetConnection;

            case "mainnet":
              return _sui.mainnetConnection;

            default:
              return _sui.devnetConnection;
          }
        }; // src/libs/suiRpcProvider/index.ts


        var SuiRpcProvider = class {
          /**
           *
           * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
           * @param fullnodeUrl, the fullnode url, default is the preconfig fullnode url for the given network type
           * @param faucetUrl, the faucet url, default is the preconfig faucet url for the given network type
           */
          constructor({
            fullnodeUrl,
            faucetUrl,
            networkType
          } = {}) {
            const defaultNetworkParams = getDefaultNetworkParams(networkType || "devnet");
            this.fullnodeUrl = fullnodeUrl || defaultNetworkParams.fullnode;
            this.faucetUrl = faucetUrl || defaultNetworkParams.faucet;
            const connection = new _sui.Connection({
              fullnode: this.fullnodeUrl,
              faucet: this.faucetUrl
            });
            this.provider = new _sui.JsonRpcProvider(connection);
          }
          /**
           * Request some SUI from faucet
           * @Returns {Promise<boolean>}, true if the request is successful, false otherwise.
           */


          async requestFaucet(addr) {
            return requestFaucet(addr, this.provider);
          }

          async getBalance(addr, coinType) {
            return this.provider.getBalance({
              owner: addr,
              coinType
            });
          }

          async getDynamicFieldObject(parentId, name) {
            return this.provider.getDynamicFieldObject({
              parentId,
              name
            });
          }

          async getDynamicFields(parentId, cursor, limit) {
            return this.provider.getDynamicFields({
              parentId,
              cursor,
              limit
            });
          }

          async getObject(id) {
            const options = {
              showContent: true,
              showDisplay: true,
              showType: true
            };
            const object = await this.provider.getObject({
              id,
              options
            });
            const objectId = (0, _sui.getObjectId)(object);
            const objectType = (0, _sui.getObjectType)(object);
            const objectVersion = (0, _sui.getObjectVersion)(object);
            const objectFields = (0, _sui.getObjectFields)(object);
            const objectDisplay = (0, _sui.getObjectDisplay)(object);
            return {
              objectId,
              objectType,
              objectVersion,
              objectFields,
              objectDisplay
            };
          }

          async getObjects(ids) {
            const options = {
              showContent: true,
              showDisplay: true,
              showType: true
            };
            const objects = await this.provider.multiGetObjects({
              ids,
              options
            });
            const parsedObjects = objects.map(object => {
              const objectId = (0, _sui.getObjectId)(object);
              const objectType = (0, _sui.getObjectType)(object);
              const objectVersion = (0, _sui.getObjectVersion)(object);
              const objectFields = (0, _sui.getObjectFields)(object);
              const objectDisplay = (0, _sui.getObjectDisplay)(object);
              return {
                objectId,
                objectType,
                objectVersion,
                objectFields,
                objectDisplay
              };
            });
            return parsedObjects;
          }

          async getNormalizedMoveModulesByPackage(packageId) {
            return this.provider.getNormalizedMoveModulesByPackage({
              package: packageId
            });
          }
          /**
           * @description Select coins that add up to the given amount.
           * @param addr the address of the owner
           * @param amount the amount that is needed for the coin
           * @param coinType the coin type, default is '0x2::SUI::SUI'
           */


          async selectCoins(addr, amount, coinType = "0x2::SUI::SUI") {
            const coins = await this.provider.getCoins({
              owner: addr,
              coinType
            });
            const selectedCoins = [];
            let totalAmount = 0;
            coins.data.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));

            for (const coinData of coins.data) {
              selectedCoins.push({
                objectId: coinData.coinObjectId,
                digest: coinData.digest,
                version: coinData.version
              });
              totalAmount = totalAmount + parseInt(coinData.balance);

              if (totalAmount >= amount) {
                break;
              }
            }

            if (!selectedCoins.length) {
              throw new Error("No valid coins found for the transaction.");
            }

            return selectedCoins;
          }

        }; // src/libs/suiTxBuilder/index.ts
        // src/libs/suiTxBuilder/util.ts

        exports.SuiRpcProvider = SuiRpcProvider;

        var getDefaultSuiInputType = value => {
          if (typeof value === "string" && value.startsWith("0x")) {
            return "object";
          } else if (typeof value === "number" || typeof value === "bigint") {
            return "u64";
          } else if (typeof value === "boolean") {
            return "bool";
          } else {
            return "object";
          }
        };

        function makeVecParam(txBlock, args, type) {
          if (args.length === 0) throw new Error("Transaction builder error: Empty array is not allowed");
          const defaultSuiType = getDefaultSuiInputType(args[0]);

          if (type === "object" || !type && defaultSuiType === "object") {
            const objects = args.map(arg => typeof arg === "string" ? txBlock.object((0, _sui.normalizeSuiObjectId)(arg)) : arg);
            return txBlock.makeMoveVec({
              objects
            });
          } else {
            const vecType = type || defaultSuiType;
            return txBlock.pure(args, `vector<${vecType}>`);
          }
        }

        function isMoveVecArg(arg) {
          const isFullMoveVecArg = arg && arg.value && Array.isArray(arg.value) && arg.vecType;
          const isSimpleMoveVecArg = Array.isArray(arg);
          return isFullMoveVecArg || isSimpleMoveVecArg;
        }

        function convertArgs(txBlock, args) {
          return args.map(arg => {
            if (typeof arg === "string" && arg.startsWith("0x")) {
              return txBlock.object((0, _sui.normalizeSuiObjectId)(arg));
            } else if (isMoveVecArg(arg)) {
              const vecType = arg.vecType || void 0;
              return vecType ? makeVecParam(txBlock, arg.value, vecType) : makeVecParam(txBlock, arg);
            } else if (typeof arg !== "object") {
              return txBlock.pure(arg);
            } else {
              return arg;
            }
          });
        } // src/libs/suiTxBuilder/index.ts


        var SuiTxBlock = class {
          constructor(transaction) {
            this.txBlock = new _sui.TransactionBlock(transaction);
          } //======== override methods of TransactionBlock ============


          address(value) {
            return this.txBlock.pure(value, "address");
          }

          pure(value, type) {
            return this.txBlock.pure(value, type);
          }

          object(value) {
            return this.txBlock.object(value);
          }

          objectRef(ref) {
            return this.txBlock.objectRef(ref);
          }

          sharedObjectRef(ref) {
            return this.txBlock.sharedObjectRef(ref);
          }

          setSender(sender) {
            return this.txBlock.setSender(sender);
          }

          setSenderIfNotSet(sender) {
            return this.txBlock.setSenderIfNotSet(sender);
          }

          setExpiration(expiration) {
            return this.txBlock.setExpiration(expiration);
          }

          setGasPrice(price) {
            return this.txBlock.setGasPrice(price);
          }

          setGasBudget(budget) {
            return this.txBlock.setGasBudget(budget);
          }

          setGasOwner(owner) {
            return this.txBlock.setGasOwner(owner);
          }

          setGasPayment(payments) {
            return this.txBlock.setGasPayment(payments);
          }

          add(transaction) {
            return this.txBlock.add(transaction);
          }

          serialize() {
            return this.txBlock.serialize();
          }

          build(params = {}) {
            return this.txBlock.build(params);
          }

          getDigest({
            provider
          } = {}) {
            return this.txBlock.getDigest({
              provider
            });
          }

          get gas() {
            return this.txBlock.gas;
          }

          get blockData() {
            return this.txBlock.blockData;
          }

          transferObjects(objects, recipient) {
            const tx = this.txBlock;
            tx.transferObjects(convertArgs(this.txBlock, objects), tx.pure(recipient));
            return this;
          }

          splitCoins(coin, amounts) {
            const tx = this.txBlock;
            const coinObject = convertArgs(this.txBlock, [coin])[0];
            const res = tx.splitCoins(coinObject, amounts.map(m => tx.pure(m)));
            return amounts.map((_, i) => res[i]);
          }

          mergeCoins(destination, sources) {
            const destinationObject = convertArgs(this.txBlock, [destination])[0];
            const sourceObjects = convertArgs(this.txBlock, sources);
            return this.txBlock.mergeCoins(destinationObject, sourceObjects);
          }

          publish(...args) {
            return this.txBlock.publish(...args);
          }

          upgrade(...args) {
            return this.txBlock.upgrade(...args);
          }

          makeMoveVec(...args) {
            return this.txBlock.makeMoveVec(...args);
          }
          /**
           * @description Move call
           * @param target `${string}::${string}::${string}`, e.g. `0x3::sui_system::request_add_stake`
           * @param args the arguments of the move call, such as `['0x1', '0x2']`
           * @param typeArgs the type arguments of the move call, such as `['0x2::sui::SUI']`
           */


          moveCall(target, args = [], typeArgs = []) {
            const regex = /(?<package>[a-zA-Z0-9]+)::(?<module>[a-zA-Z0-9_]+)::(?<function>[a-zA-Z0-9_]+)/;
            const match = target.match(regex);
            if (match === null) throw new Error("Invalid target format. Expected `${string}::${string}::${string}`");
            const convertedArgs = convertArgs(this.txBlock, args);
            const tx = this.txBlock;
            return tx.moveCall({
              target,
              arguments: convertedArgs,
              typeArguments: typeArgs
            });
          } //======== enhance methods ============


          transferSuiToMany(recipients, amounts) {
            if (recipients.length !== amounts.length) {
              throw new Error("transferSuiToMany: recipients.length !== amounts.length");
            }

            const tx = this.txBlock;
            const coins = tx.splitCoins(tx.gas, amounts.map(amount => tx.pure(amount)));
            recipients.forEach((recipient, index) => {
              tx.transferObjects([coins[index]], tx.pure(recipient));
            });
            return this;
          }

          transferSui(recipient, amount) {
            return this.transferSuiToMany([recipient], [amount]);
          }

          takeAmountFromCoins(coins, amount) {
            const tx = this.txBlock;
            const coinObjects = convertArgs(this.txBlock, coins);
            const mergedCoin = coinObjects[0];

            if (coins.length > 1) {
              tx.mergeCoins(mergedCoin, coinObjects.slice(1));
            }

            const [sendCoin] = tx.splitCoins(mergedCoin, [tx.pure(amount)]);
            return [sendCoin, mergedCoin];
          }

          splitSUIFromGas(amounts) {
            const tx = this.txBlock;
            return tx.splitCoins(tx.gas, amounts.map(m => tx.pure(m)));
          }

          splitMultiCoins(coins, amounts) {
            const tx = this.txBlock;
            const coinObjects = convertArgs(this.txBlock, coins);
            const mergedCoin = coinObjects[0];

            if (coins.length > 1) {
              tx.mergeCoins(mergedCoin, coinObjects.slice(1));
            }

            const splitedCoins = tx.splitCoins(mergedCoin, amounts.map(m => tx.pure(m)));
            return {
              splitedCoins,
              mergedCoin
            };
          }

          transferCoinToMany(inputCoins, sender, recipients, amounts) {
            if (recipients.length !== amounts.length) {
              throw new Error("transferSuiToMany: recipients.length !== amounts.length");
            }

            const tx = this.txBlock;
            const {
              splitedCoins,
              mergedCoin
            } = this.splitMultiCoins(inputCoins, amounts);
            recipients.forEach((recipient, index) => {
              tx.transferObjects([splitedCoins[index]], tx.pure(recipient));
            });
            tx.transferObjects([mergedCoin], tx.pure(sender));
            return this;
          }

          transferCoin(inputCoins, sender, recipient, amount) {
            return this.transferCoinToMany(inputCoins, sender, [recipient], [amount]);
          }

          stakeSui(amount, validatorAddr) {
            const tx = this.txBlock;
            const [stakeCoin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
            tx.moveCall({
              target: "0x3::sui_system::request_add_stake",
              arguments: [tx.object(_sui.SUI_SYSTEM_STATE_OBJECT_ID), stakeCoin, tx.pure(validatorAddr)]
            });
            return tx;
          }

        }; // src/libs/suiContractFactory/index.ts

        exports.SuiTxBlock = SuiTxBlock;
        var SuiContractFactory = class {
          // readonly #query: MapMessageQuery<ApiTypes> = {};
          // readonly #tx: MapMessageTx<ApiTypes> = {};

          /**
           * Support the following ways to init the SuiToolkit:
           * 1. mnemonics
           * 2. secretKey (base64 or hex)
           * If none of them is provided, will generate a random mnemonics with 24 words.
           *
           * @param mnemonics, 12 or 24 mnemonics words, separated by space
           * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
           */
          constructor({
            packageId,
            metadata
          } = {}) {
            this.packageId = packageId || "";
            this.metadata = metadata || void 0;
          }

          getFuncByModuleName(moduleName) {
            Object.values(this.metadata).forEach(value => {
              const data = value;
              console.log(`moudle name: ${data.name}`);
              Object.entries(data.exposedFunctions).forEach(([key, value2]) => {
                console.log(`	func name: ${key}`);
                Object.values(value2.parameters).forEach(values => {});
              });
            });
          }

          getAllFunc() {
            Object.values(this.metadata).forEach(value => {
              const data = value;
              console.log(`moudle name: ${data.name}`);
              Object.entries(data.exposedFunctions).forEach(([key, value2]) => {
                console.log(`	func name: ${key}`);
                console.log(`		${value2.parameters.length}`);
                Object.values(value2.parameters).forEach(values => {
                  console.log(`		args: ${values}`);
                });
              });
            });
          }

          getAllModule() {
            Object.values(this.metadata).forEach((value, index) => {
              const data = value;
              console.log(`${index}. ${data.name}`);
            });
          }

          async worldCall() {} //   async call(arguments: ({
          //     kind: "Input";
          //     index: number;
          //     type?: "object" | "pure" | undefined;
          //     value?: any;
          // } | {
          //     kind: "GasCoin";
          // } | {
          //     kind: "Result";
          //     index: number;
          // } | {
          //     kind: "NestedResult";
          //     index: number;
          //     resultIndex: number;
          // })[], derivePathParams?: DerivePathParams) {
          //     const tx = new TransactionBlock();
          //     tx.moveCall({
          //       target: `${this.packageId}::${}::${}`,
          //       arguments,
          //     })
          //     return ;
          //   }


        }; // src/framework/util.ts

        exports.SuiContractFactory = SuiContractFactory;

        function parseTypeName(name) {
          const parsed = _sui.bcs.parseTypeName(name);

          return {
            typeName: parsed.name,
            typeArgs: parsed.params
          };
        }

        function obj(txb, arg) {
          return (0, _sui.is)(arg, _sui.TransactionArgument) ? arg : txb.object(arg);
        }

        function pure(txb, arg, type) {
          if ((0, _sui.is)(arg, _sui.TransactionArgument)) {
            return obj(txb, arg);
          }

          function convertType(type2) {
            const {
              typeName: typeName2,
              typeArgs: typeArgs2
            } = parseTypeName(type2);

            switch (typeName2) {
              case "0x1::string::String":
              case "0x1::ascii::String":
                return _bcs.BCS.STRING;

              case "0x2::object::ID":
                return _bcs.BCS.ADDRESS;

              case "0x1::option::Option":
                return `vector<${convertType(typeArgs2[0])}>`;

              case "vector":
                return `vector<${convertType(typeArgs2[0])}>`;

              default:
                return type2;
            }
          }

          function isOrHasNestedTransactionArgument(arg2) {
            if (Array.isArray(arg2)) {
              return arg2.some(item => isOrHasNestedTransactionArgument(item));
            }

            return (0, _sui.is)(arg2, _sui.TransactionArgument);
          }

          function convertArg(arg2, type2) {
            const {
              typeName: typeName2,
              typeArgs: typeArgs2
            } = parseTypeName(type2);

            if (typeName2 === "0x1::option::Option") {
              if (arg2 === null) {
                return [];
              } else {
                return [convertArg(arg2, typeArgs2[0])];
              }
            } else if (typeName2 === "vector" && Array.isArray(arg2)) {
              return arg2.map(item => convertArg(item, typeArgs2[0]));
            } else if (typeName2 === "0x2::object::ID" || typeName2 === "address") {
              return (0, _sui.normalizeSuiAddress)(arg2);
            } else {
              return arg2;
            }
          }

          const {
            typeName,
            typeArgs
          } = parseTypeName(type);

          switch (typeName) {
            case "0x1::option::Option":
              if (arg === null) {
                return txb.pure([], `vector<${convertType(typeArgs[0])}>`);
              }

              if (isOrHasNestedTransactionArgument(arg)) {
                throw new Error("nesting TransactionArgument is not currently supported");
              }

              break;

            case "vector":
              if (!Array.isArray(arg)) {
                throw new Error("expected an array for vector type");
              }

              if (arg.length === 0) {
                return txb.pure([], `vector<${convertType(typeArgs[0])}>`);
              }

              if (arg.some(arg2 => Array.isArray(arg2) && isOrHasNestedTransactionArgument(arg2))) {
                throw new Error("nesting TransactionArgument is not currently supported");
              }

              if ((0, _sui.is)(arg[0], _sui.TransactionArgument) && arg.filter(arg2 => !(0, _sui.is)(arg2, _sui.TransactionArgument)).length > 0) {
                throw new Error("mixing TransactionArgument with other types is not currently supported");
              }

              if ((0, _sui.is)(arg[0], _sui.TransactionArgument)) {
                return txb.makeMoveVec({
                  objects: arg,
                  type: typeArgs[0]
                });
              }

          }

          return txb.pure(convertArg(arg, type), convertType(type));
        } // src/obelisk.ts


        function isUndefined(value) {
          return value === void 0;
        }

        function withMeta(meta, creator) {
          creator.meta = meta;
          return creator;
        }

        function createQuery(meta, fn) {
          return withMeta(meta, async (tx, params, isRaw) => {
            const result = await fn(tx, params, isRaw);
            return result;
          });
        }

        function createTx(meta, fn) {
          return withMeta(meta, async (tx, params, isRaw) => {
            const result = await fn(tx, params, isRaw);
            return result;
          });
        }

        var _query, _tx, _exec, _read;

        var Obelisk = class {
          /**
           * Support the following ways to init the SuiToolkit:
           * 1. mnemonics
           * 2. secretKey (base64 or hex)
           * If none of them is provided, will generate a random mnemonics with 24 words.
           *
           * @param mnemonics, 12 or 24 mnemonics words, separated by space
           * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
           * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
           * @param fullnodeUrl, the fullnode url, default is the preconfig fullnode url for the given network type
           * @param faucetUrl, the faucet url, default is the preconfig faucet url for the given network type
           * @param packageId
           */
          constructor({
            mnemonics,
            secretKey,
            networkType,
            fullnodeUrl,
            faucetUrl,
            packageId,
            metadata
          } = {}) {
            __privateAdd(this, _query, {});

            __privateAdd(this, _tx, {});

            __privateAdd(this, _exec, async (meta, tx, params, isRaw) => {
              tx.moveCall({
                target: `${this.contractFactory.packageId}::${meta.moudleName}::${meta.funcName}`,
                arguments: params
              });

              if (isRaw === true) {
                return tx;
              }

              return await this.signAndSendTxn(tx);
            });

            __privateAdd(this, _read, async (meta, tx, params, isRaw) => {
              tx.moveCall({
                target: `${this.contractFactory.packageId}::${meta.moudleName}::${meta.funcName}`,
                arguments: params
              });

              if (isRaw === true) {
                return tx;
              }

              return await this.inspectTxn(tx);
            });

            this.accountManager = new SuiAccountManager({
              mnemonics,
              secretKey
            });
            this.rpcProvider = new SuiRpcProvider({
              fullnodeUrl,
              faucetUrl,
              networkType
            });
            this.epsId = "0xf2196f638c3174e18c0e31aa630a02fd516c2c5deec1ded72c0fea864c9f091a";
            this.componentsId = "0x3bc407eb543149e42846ade59ac2a3c901584af4339dc1ecd0affd090529545f";
            this.packageId = packageId;
            this.metadata = metadata;
            Object.values(metadata).forEach(value => {
              let data = value;
              let moduleName = data.name;
              Object.entries(data.exposedFunctions).forEach(([funcName, value2]) => {
                let meta = value2;
                meta.moudleName = moduleName;
                meta.funcName = funcName;

                if (isUndefined(__privateGet(this, _query)[moduleName])) {
                  __privateGet(this, _query)[moduleName] = {};
                }

                if (isUndefined(__privateGet(this, _query)[moduleName][funcName])) {
                  __privateGet(this, _query)[moduleName][funcName] = createQuery(meta, (tx, p, isRaw) => __privateGet(this, _read).call(this, meta, tx, p, isRaw));
                }

                if (isUndefined(__privateGet(this, _tx)[moduleName])) {
                  __privateGet(this, _tx)[moduleName] = {};
                }

                if (isUndefined(__privateGet(this, _tx)[moduleName][funcName])) {
                  __privateGet(this, _tx)[moduleName][funcName] = createTx(meta, (tx, p, isRaw) => __privateGet(this, _exec).call(this, meta, tx, p, isRaw));
                }
              });
            });
            this.contractFactory = new SuiContractFactory({
              packageId,
              metadata
            });
          } // async initialize() {
          //   const metadata = await this.loadData();
          //   this.metadata = metadata as SuiMoveNormalizedModules;
          //   this.contractFactory = new SuiContractFactory({
          //     packageId: this.packageId,
          //     metadata: this.metadata
          //   })
          //   return metadata
          // }


          get query() {
            return __privateGet(this, _query);
          }

          get tx() {
            return __privateGet(this, _tx);
          }
          /**
           * if derivePathParams is not provided or mnemonics is empty, it will return the currentSigner.
           * else:
           * it will generate signer from the mnemonic with the given derivePathParams.
           * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
           */


          getSigner(derivePathParams) {
            const keyPair = this.accountManager.getKeyPair(derivePathParams);
            return new _sui.RawSigner(keyPair, this.rpcProvider.provider);
          }
          /**
           * @description Switch the current account with the given derivePathParams
           * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
           */


          switchAccount(derivePathParams) {
            this.accountManager.switchAccount(derivePathParams);
          }
          /**
           * @description Get the address of the account for the given derivePathParams
           * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
           */


          getAddress(derivePathParams) {
            return this.accountManager.getAddress(derivePathParams);
          }

          currentAddress() {
            return this.accountManager.currentAddress;
          }

          provider() {
            return this.rpcProvider.provider;
          }

          getPackageId() {
            return this.contractFactory.packageId;
          }

          getMetadata() {
            return this.contractFactory.metadata;
          }
          /**
           * Request some SUI from faucet
           * @Returns {Promise<boolean>}, true if the request is successful, false otherwise.
           */


          async requestFaucet(derivePathParams) {
            const addr = this.accountManager.getAddress(derivePathParams);
            return this.rpcProvider.requestFaucet(addr);
          }

          async getBalance(coinType, derivePathParams) {
            const owner = this.accountManager.getAddress(derivePathParams);
            return this.rpcProvider.getBalance(owner, coinType);
          }

          async getObject(objectId) {
            return this.rpcProvider.getObject(objectId);
          }

          async getObjects(objectIds) {
            return this.rpcProvider.getObjects(objectIds);
          }

          async signTxn(tx, derivePathParams) {
            tx = tx instanceof SuiTxBlock ? tx.txBlock : tx;
            const signer = this.getSigner(derivePathParams);
            return signer.signTransactionBlock({
              transactionBlock: tx
            });
          }

          async signAndSendTxn(tx, derivePathParams) {
            tx = tx instanceof SuiTxBlock ? tx.txBlock : tx;
            const signer = this.getSigner(derivePathParams);
            return signer.signAndExecuteTransactionBlock({
              transactionBlock: tx,
              options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true
              }
            });
          }
          /**
           * Transfer the given amount of SUI to the recipient
           * @param recipient
           * @param amount
           * @param derivePathParams
           */


          async transferSui(recipient, amount, derivePathParams) {
            const tx = new SuiTxBlock();
            tx.transferSui(recipient, amount);
            return this.signAndSendTxn(tx, derivePathParams);
          }
          /**
           * Transfer to mutliple recipients
           * @param recipients the recipients addresses
           * @param amounts the amounts of SUI to transfer to each recipient, the length of amounts should be the same as the length of recipients
           * @param derivePathParams
           */


          async transferSuiToMany(recipients, amounts, derivePathParams) {
            const tx = new SuiTxBlock();
            tx.transferSuiToMany(recipients, amounts);
            return this.signAndSendTxn(tx, derivePathParams);
          }
          /**
           * Transfer the given amounts of coin to multiple recipients
           * @param recipients the list of recipient address
           * @param amounts the amounts to transfer for each recipient
           * @param coinType any custom coin type but not SUI
           * @param derivePathParams the derive path params for the current signer
           */


          async transferCoinToMany(recipients, amounts, coinType, derivePathParams) {
            const tx = new SuiTxBlock();
            const owner = this.accountManager.getAddress(derivePathParams);
            const totalAmount = amounts.reduce((a, b) => a + b, 0);
            const coins = await this.rpcProvider.selectCoins(owner, totalAmount, coinType);
            tx.transferCoinToMany(coins.map(c => c.objectId), owner, recipients, amounts);
            return this.signAndSendTxn(tx, derivePathParams);
          }

          async transferCoin(recipient, amount, coinType, derivePathParams) {
            return this.transferCoinToMany([recipient], [amount], coinType, derivePathParams);
          }

          async transferObjects(objects, recipient, derivePathParams) {
            const tx = new SuiTxBlock();
            tx.transferObjects(objects, recipient);
            return this.signAndSendTxn(tx, derivePathParams);
          }

          async moveCall(callParams) {
            const {
              target,
              arguments: args = [],
              typeArguments = [],
              derivePathParams
            } = callParams;
            const tx = new SuiTxBlock();
            tx.moveCall(target, args, typeArguments);
            return this.signAndSendTxn(tx, derivePathParams);
          }
          /**
           * Select coins with the given amount and coin type, the total amount is greater than or equal to the given amount
           * @param amount
           * @param coinType
           * @param owner
           */


          async selectCoinsWithAmount(amount, coinType, owner) {
            owner = owner || this.accountManager.currentAddress;
            const coins = await this.rpcProvider.selectCoins(owner, amount, coinType);
            return coins.map(c => c.objectId);
          }
          /**
           * stake the given amount of SUI to the validator
           * @param amount the amount of SUI to stake
           * @param validatorAddr the validator address
           * @param derivePathParams the derive path params for the current signer
           */


          async stakeSui(amount, validatorAddr, derivePathParams) {
            const tx = new SuiTxBlock();
            tx.stakeSui(amount, validatorAddr);
            return this.signAndSendTxn(tx, derivePathParams);
          }
          /**
           * Execute the transaction with on-chain data but without really submitting. Useful for querying the effects of a transaction.
           * Since the transaction is not submitted, its gas cost is not charged.
           * @param tx the transaction to execute
           * @param derivePathParams the derive path params
           * @returns the effects and events of the transaction, such as object changes, gas cost, event emitted.
           */


          async inspectTxn(tx, derivePathParams) {
            tx = tx instanceof SuiTxBlock ? tx.txBlock : tx;
            return this.rpcProvider.provider.devInspectTransactionBlock({
              transactionBlock: tx,
              sender: this.getAddress(derivePathParams)
            });
          }

          async getBirthTime(objectId, derivePathParams) {
            const tx = new _sui.TransactionBlock();
            tx.moveCall({
              // target: `0x12b216923e5454e1f076ccb5fc638b59f8aba2175c34df9899de71124d66badd::status_system::get_pet_state`,
              target: `0x6afbf113a5872b781a2a0068b95c0d9d0ee89428518fdd65f862c841eab45b82::pet_system::get_pet_basic_info`,
              arguments: [// tx.pure("0x6fa43c68221960f942572905f3c198a5bccaa0700506b3b6bd83dd9b007e6324"),
              // tx.pure("0xbf64721f0961a0426ccde6b8d9343e2cb2c26a105a5c33e57074580fd98b2cb1"),
              // tx.pure("0x6"),
              obj(tx, "0x26804211486be597a89c46c16b929d7031fb7c701ecf89d4c750e49459b4bea2"), pure(tx, "0x35ba3bfb8590dbd060f41cd58c7b140d67efd2126648409cd231c74cff2828b8", `0x2::object::ID`), obj(tx, "0x6")]
            });
            return await this.inspectTxn(tx, derivePathParams);
          }

          async getWorld(worldObjectId) {
            return this.rpcProvider.getObject(worldObjectId);
          }

          async getAllEntities(worldId, cursor, limit) {
            const parentId = (await this.rpcProvider.getObject(worldId)).objectFields.entities.fields.id.id;
            return await this.rpcProvider.getDynamicFields(parentId, cursor, limit);
          }

          async getEntity(worldId, entityId) {
            const parentId = (await this.rpcProvider.getObject(worldId)).objectFields.entities.fields.id.id;
            const name = {
              type: "0x2::object::ID",
              value: entityId
            };
            return await this.rpcProvider.getDynamicFieldObject(parentId, name);
          }

          async getEntityComponents(worldId, entityId, cursor, limit) {
            const parentContent = (await this.getEntity(worldId, entityId)).data.content;
            const parentId = parentContent.fields.value.fields.components.fields.id.id;
            return await this.rpcProvider.getDynamicFields(parentId, cursor, limit);
          }

          async getEntityComponent(entityId, componentId) {
            const parentId = (await this.rpcProvider.getObject(entityId)).objectFields.id.id;
            const name = {
              type: "0x2::object::ID",
              value: componentId
            };
            return await this.rpcProvider.getDynamicFieldObject(parentId, name);
          } // async loadData() {
          //   const jsonFileName = `metadata/${this.packageId}.json`;
          //   try {
          //     const data = await fs.promises.readFile(jsonFileName, 'utf-8');
          //     const jsonData = JSON.parse(data);
          //     return jsonData as SuiMoveNormalizedModules;
          //   } catch (error) {
          //     if (this.packageId !== undefined) {
          //       const jsonData = await this.rpcProvider.getNormalizedMoveModulesByPackage(this.packageId);
          //       fs.writeFile(jsonFileName, JSON.stringify(jsonData, null, 2), (err) => {
          //         if (err) {
          //           console.error('写入文件时出错:', err);
          //         } else {
          //           console.log('JSON 数据已保存到文件:', jsonFileName);
          //         }
          //       });
          //       return jsonData as SuiMoveNormalizedModules;
          //     } else {
          //       console.error('please set your package id.');
          //     }
          //   }
          // }


        };
        exports.Obelisk = Obelisk;
        _query = new WeakMap();
        _tx = new WeakMap();
        _exec = new WeakMap();
        _read = new WeakMap(); // src/metadata/index.ts

        async function getMetadata(networkType, packageId) {
          const rpcProvider = new SuiRpcProvider({
            networkType
          });

          if (packageId !== void 0) {
            const jsonData = await rpcProvider.getNormalizedMoveModulesByPackage(packageId);
            return jsonData;
          } else {
            console.error("please set your package id.");
          }
        }
      }, {
        "@mysten/bcs": 4,
        "@mysten/sui.js": 23,
        "@scure/bip39": 113,
        "@scure/bip39/wordlists/english": 114,
        "ts-retry-promise": 121
      }],
      4: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.BcsWriter = exports.BcsReader = exports.BCS = void 0;
        exports.decodeStr = decodeStr;
        exports.encodeStr = encodeStr;
        exports.fromB58 = void 0;
        exports.fromB64 = fromB64;
        exports.fromHEX = fromHEX;
        exports.getRustConfig = getRustConfig;
        exports.getSuiMoveConfig = getSuiMoveConfig;
        exports.registerPrimitives = registerPrimitives;
        exports.splitGenericParameters = splitGenericParameters;
        exports.toB58 = void 0;
        exports.toB64 = toB64;
        exports.toHEX = toHEX;

        var _bs = _interopRequireDefault(require("bs58"));

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : {
            default: obj
          };
        } // src/b64.ts


        function b64ToUint6(nChr) {
          return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
        }

        function fromB64(sBase64, nBlocksSize) {
          var sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ""),
              nInLen = sB64Enc.length,
              nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
              taBytes = new Uint8Array(nOutLen);

          for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);

            if (nMod4 === 3 || nInLen - nInIdx === 1) {
              for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
              }

              nUint24 = 0;
            }
          }

          return taBytes;
        }

        function uint6ToB64(nUint6) {
          return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65;
        }

        function toB64(aBytes) {
          var nMod3 = 2,
              sB64Enc = "";

          for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);

            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
              sB64Enc += String.fromCodePoint(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
              nUint24 = 0;
            }
          }

          return sB64Enc.slice(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? "" : nMod3 === 1 ? "=" : "==");
        } // src/hex.ts


        function fromHEX(hexStr) {
          let intArr = hexStr.replace("0x", "").match(/.{1,2}/g).map(byte => parseInt(byte, 16));

          if (intArr === null) {
            throw new Error(`Unable to parse HEX: ${hexStr}`);
          }

          return Uint8Array.from(intArr);
        }

        function toHEX(bytes) {
          return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
        } // src/index.ts


        var SUI_ADDRESS_LENGTH = 32;

        function toLittleEndian(bigint, size) {
          let result = new Uint8Array(size);
          let i = 0;

          while (bigint > 0) {
            result[i] = Number(bigint % BigInt(256));
            bigint = bigint / BigInt(256);
            i += 1;
          }

          return result;
        }

        var toB58 = buffer => _bs.default.encode(buffer);

        exports.toB58 = toB58;

        var fromB58 = str => _bs.default.decode(str);

        exports.fromB58 = fromB58;
        var BcsReader = class {
          /**
           * @param {Uint8Array} data Data to use as a buffer.
           */
          constructor(data) {
            this.bytePosition = 0;
            this.dataView = new DataView(data.buffer);
          }
          /**
           * Shift current cursor position by `bytes`.
           *
           * @param {Number} bytes Number of bytes to
           * @returns {this} Self for possible chaining.
           */


          shift(bytes) {
            this.bytePosition += bytes;
            return this;
          }
          /**
           * Read U8 value from the buffer and shift cursor by 1.
           * @returns
           */


          read8() {
            let value = this.dataView.getUint8(this.bytePosition);
            this.shift(1);
            return value;
          }
          /**
           * Read U16 value from the buffer and shift cursor by 2.
           * @returns
           */


          read16() {
            let value = this.dataView.getUint16(this.bytePosition, true);
            this.shift(2);
            return value;
          }
          /**
           * Read U32 value from the buffer and shift cursor by 4.
           * @returns
           */


          read32() {
            let value = this.dataView.getUint32(this.bytePosition, true);
            this.shift(4);
            return value;
          }
          /**
           * Read U64 value from the buffer and shift cursor by 8.
           * @returns
           */


          read64() {
            let value1 = this.read32();
            let value2 = this.read32();
            let result = value2.toString(16) + value1.toString(16).padStart(8, "0");
            return BigInt("0x" + result).toString(10);
          }
          /**
           * Read U128 value from the buffer and shift cursor by 16.
           */


          read128() {
            let value1 = BigInt(this.read64());
            let value2 = BigInt(this.read64());
            let result = value2.toString(16) + value1.toString(16).padStart(16, "0");
            return BigInt("0x" + result).toString(10);
          }
          /**
           * Read U128 value from the buffer and shift cursor by 32.
           * @returns
           */


          read256() {
            let value1 = BigInt(this.read128());
            let value2 = BigInt(this.read128());
            let result = value2.toString(16) + value1.toString(16).padStart(32, "0");
            return BigInt("0x" + result).toString(10);
          }
          /**
           * Read `num` number of bytes from the buffer and shift cursor by `num`.
           * @param num Number of bytes to read.
           */


          readBytes(num) {
            let start = this.bytePosition + this.dataView.byteOffset;
            let value = new Uint8Array(this.dataView.buffer, start, num);
            this.shift(num);
            return value;
          }
          /**
           * Read ULEB value - an integer of varying size. Used for enum indexes and
           * vector lengths.
           * @returns {Number} The ULEB value.
           */


          readULEB() {
            let start = this.bytePosition + this.dataView.byteOffset;
            let buffer = new Uint8Array(this.dataView.buffer, start);
            let {
              value,
              length
            } = ulebDecode(buffer);
            this.shift(length);
            return value;
          }
          /**
           * Read a BCS vector: read a length and then apply function `cb` X times
           * where X is the length of the vector, defined as ULEB in BCS bytes.
           * @param cb Callback to process elements of vector.
           * @returns {Array<Any>} Array of the resulting values, returned by callback.
           */


          readVec(cb) {
            let length = this.readULEB();
            let result = [];

            for (let i = 0; i < length; i++) {
              result.push(cb(this, i, length));
            }

            return result;
          }

        };
        exports.BcsReader = BcsReader;
        var BcsWriter = class {
          constructor({
            size = 1024,
            maxSize,
            allocateSize = 1024
          } = {}) {
            this.bytePosition = 0;
            this.size = size;
            this.maxSize = maxSize || size;
            this.allocateSize = allocateSize;
            this.dataView = new DataView(new ArrayBuffer(size));
          }

          ensureSizeOrGrow(bytes) {
            const requiredSize = this.bytePosition + bytes;

            if (requiredSize > this.size) {
              const nextSize = Math.min(this.maxSize, this.size + this.allocateSize);

              if (requiredSize > nextSize) {
                throw new Error(`Attempting to serialize to BCS, but buffer does not have enough size. Allocated size: ${this.size}, Max size: ${this.maxSize}, Required size: ${requiredSize}`);
              }

              this.size = nextSize;
              const nextBuffer = new ArrayBuffer(this.size);
              new Uint8Array(nextBuffer).set(new Uint8Array(this.dataView.buffer));
              this.dataView = new DataView(nextBuffer);
            }
          }
          /**
           * Shift current cursor position by `bytes`.
           *
           * @param {Number} bytes Number of bytes to
           * @returns {this} Self for possible chaining.
           */


          shift(bytes) {
            this.bytePosition += bytes;
            return this;
          }
          /**
           * Write a U8 value into a buffer and shift cursor position by 1.
           * @param {Number} value Value to write.
           * @returns {this}
           */


          write8(value) {
            this.ensureSizeOrGrow(1);
            this.dataView.setUint8(this.bytePosition, Number(value));
            return this.shift(1);
          }
          /**
           * Write a U16 value into a buffer and shift cursor position by 2.
           * @param {Number} value Value to write.
           * @returns {this}
           */


          write16(value) {
            this.ensureSizeOrGrow(2);
            this.dataView.setUint16(this.bytePosition, Number(value), true);
            return this.shift(2);
          }
          /**
           * Write a U32 value into a buffer and shift cursor position by 4.
           * @param {Number} value Value to write.
           * @returns {this}
           */


          write32(value) {
            this.ensureSizeOrGrow(4);
            this.dataView.setUint32(this.bytePosition, Number(value), true);
            return this.shift(4);
          }
          /**
           * Write a U64 value into a buffer and shift cursor position by 8.
           * @param {bigint} value Value to write.
           * @returns {this}
           */


          write64(value) {
            toLittleEndian(BigInt(value), 8).forEach(el => this.write8(el));
            return this;
          }
          /**
           * Write a U128 value into a buffer and shift cursor position by 16.
           *
           * @param {bigint} value Value to write.
           * @returns {this}
           */


          write128(value) {
            toLittleEndian(BigInt(value), 16).forEach(el => this.write8(el));
            return this;
          }
          /**
           * Write a U256 value into a buffer and shift cursor position by 16.
           *
           * @param {bigint} value Value to write.
           * @returns {this}
           */


          write256(value) {
            toLittleEndian(BigInt(value), 32).forEach(el => this.write8(el));
            return this;
          }
          /**
           * Write a ULEB value into a buffer and shift cursor position by number of bytes
           * written.
           * @param {Number} value Value to write.
           * @returns {this}
           */


          writeULEB(value) {
            ulebEncode(value).forEach(el => this.write8(el));
            return this;
          }
          /**
           * Write a vector into a buffer by first writing the vector length and then calling
           * a callback on each passed value.
           *
           * @param {Array<Any>} vector Array of elements to write.
           * @param {WriteVecCb} cb Callback to call on each element of the vector.
           * @returns {this}
           */


          writeVec(vector, cb) {
            this.writeULEB(vector.length);
            Array.from(vector).forEach((el, i) => cb(this, el, i, vector.length));
            return this;
          }
          /**
           * Adds support for iterations over the object.
           * @returns {Uint8Array}
           */


          *[Symbol.iterator]() {
            for (let i = 0; i < this.bytePosition; i++) {
              yield this.dataView.getUint8(i);
            }

            return this.toBytes();
          }
          /**
           * Get underlying buffer taking only value bytes (in case initial buffer size was bigger).
           * @returns {Uint8Array} Resulting bcs.
           */


          toBytes() {
            return new Uint8Array(this.dataView.buffer.slice(0, this.bytePosition));
          }
          /**
           * Represent data as 'hex' or 'base64'
           * @param encoding Encoding to use: 'base64' or 'hex'
           */


          toString(encoding) {
            return encodeStr(this.toBytes(), encoding);
          }

        };
        exports.BcsWriter = BcsWriter;

        function ulebEncode(num) {
          let arr = [];
          let len = 0;

          if (num === 0) {
            return [0];
          }

          while (num > 0) {
            arr[len] = num & 127;

            if (num >>= 7) {
              arr[len] |= 128;
            }

            len += 1;
          }

          return arr;
        }

        function ulebDecode(arr) {
          let total = 0;
          let shift = 0;
          let len = 0;

          while (true) {
            let byte = arr[len];
            len += 1;
            total |= (byte & 127) << shift;

            if ((byte & 128) === 0) {
              break;
            }

            shift += 7;
          }

          return {
            value: total,
            length: len
          };
        }

        var _BCS = class {
          /**
           * Construct a BCS instance with a prepared schema.
           *
           * @param schema A prepared schema with type definitions
           * @param withPrimitives Whether to register primitive types by default
           */
          constructor(schema) {
            /**
             * Map of kind `TypeName => TypeInterface`. Holds all
             * callbacks for (de)serialization of every registered type.
             *
             * If the value stored is a string, it is treated as an alias.
             */
            this.types = /* @__PURE__ */new Map();
            /**
             * Count temp keys to generate a new one when requested.
             */

            this.counter = 0;

            if (schema instanceof _BCS) {
              this.schema = schema.schema;
              this.types = new Map(schema.types);
              return;
            }

            this.schema = schema;
            this.registerAddressType(_BCS.ADDRESS, schema.addressLength, schema.addressEncoding);
            this.registerVectorType(schema.vectorType);

            if (schema.types && schema.types.structs) {
              for (let name of Object.keys(schema.types.structs)) {
                this.registerStructType(name, schema.types.structs[name]);
              }
            }

            if (schema.types && schema.types.enums) {
              for (let name of Object.keys(schema.types.enums)) {
                this.registerEnumType(name, schema.types.enums[name]);
              }
            }

            if (schema.types && schema.types.aliases) {
              for (let name of Object.keys(schema.types.aliases)) {
                this.registerAlias(name, schema.types.aliases[name]);
              }
            }

            if (schema.withPrimitives !== false) {
              registerPrimitives(this);
            }
          }
          /**
           * Name of the key to use for temporary struct definitions.
           * Returns a temp key + index (for a case when multiple temp
           * structs are processed).
           */


          tempKey() {
            return `bcs-struct-${++this.counter}`;
          }
          /**
           * Serialize data into bcs.
           *
           * @example
           * bcs.registerVectorType('vector<u8>', 'u8');
           *
           * let serialized = BCS
           *   .set('vector<u8>', [1,2,3,4,5,6])
           *   .toBytes();
           *
           * console.assert(toHex(serialized) === '06010203040506');
           *
           * @param type Name of the type to serialize (must be registered) or a struct type.
           * @param data Data to serialize.
           * @param size Serialization buffer size. Default 1024 = 1KB.
           * @return A BCS reader instance. Usually you'd want to call `.toBytes()`
           */


          ser(type, data, options) {
            if (typeof type === "string" || Array.isArray(type)) {
              const {
                name,
                params
              } = this.parseTypeName(type);
              return this.getTypeInterface(name).encode(this, data, options, params);
            }

            if (typeof type === "object") {
              const key = this.tempKey();
              const temp = new _BCS(this);
              return temp.registerStructType(key, type).ser(key, data, options);
            }

            throw new Error(`Incorrect type passed into the '.ser()' function. 
${JSON.stringify(type)}`);
          }
          /**
           * Deserialize BCS into a JS type.
           *
           * @example
           * let num = bcs.ser('u64', '4294967295').toString('hex');
           * let deNum = bcs.de('u64', num, 'hex');
           * console.assert(deNum.toString(10) === '4294967295');
           *
           * @param type Name of the type to deserialize (must be registered) or a struct type definition.
           * @param data Data to deserialize.
           * @param encoding Optional - encoding to use if data is of type String
           * @return Deserialized data.
           */


          de(type, data, encoding) {
            if (typeof data === "string") {
              if (encoding) {
                data = decodeStr(data, encoding);
              } else {
                throw new Error("To pass a string to `bcs.de`, specify encoding");
              }
            }

            if (typeof type === "string" || Array.isArray(type)) {
              const {
                name,
                params
              } = this.parseTypeName(type);
              return this.getTypeInterface(name).decode(this, data, params);
            }

            if (typeof type === "object") {
              const temp = new _BCS(this);
              const key = this.tempKey();
              return temp.registerStructType(key, type).de(key, data, encoding);
            }

            throw new Error(`Incorrect type passed into the '.de()' function. 
${JSON.stringify(type)}`);
          }
          /**
           * Check whether a `TypeInterface` has been loaded for a `type`.
           * @param type Name of the type to check.
           * @returns
           */


          hasType(type) {
            return this.types.has(type);
          }
          /**
           * Create an alias for a type.
           * WARNING: this can potentially lead to recursion
           * @param name Alias to use
           * @param forType Type to reference
           * @returns
           *
           * @example
           * ```
           * let bcs = new BCS(getSuiMoveConfig());
           * bcs.registerAlias('ObjectDigest', BCS.BASE58);
           * let b58_digest = bcs.de('ObjectDigest', '<digest_bytes>', 'base64');
           * ```
           */


          registerAlias(name, forType) {
            this.types.set(name, forType);
            return this;
          }
          /**
           * Method to register new types for BCS internal representation.
           * For each registered type 2 callbacks must be specified and one is optional:
           *
           * - encodeCb(writer, data) - write a way to serialize data with BcsWriter;
           * - decodeCb(reader) - write a way to deserialize data with BcsReader;
           * - validateCb(data) - validate data - either return bool or throw an error
           *
           * @example
           * // our type would be a string that consists only of numbers
           * bcs.registerType('number_string',
           *    (writer, data) => writer.writeVec(data, (w, el) => w.write8(el)),
           *    (reader) => reader.readVec((r) => r.read8()).join(''), // read each value as u8
           *    (value) => /[0-9]+/.test(value) // test that it has at least one digit
           * );
           * console.log(Array.from(bcs.ser('number_string', '12345').toBytes()) == [5,1,2,3,4,5]);
           *
           * @param name
           * @param encodeCb Callback to encode a value.
           * @param decodeCb Callback to decode a value.
           * @param validateCb Optional validator Callback to check type before serialization.
           */


          registerType(typeName, encodeCb, decodeCb, validateCb = () => true) {
            const {
              name,
              params: generics
            } = this.parseTypeName(typeName);
            this.types.set(name, {
              encode(self, data, options, typeParams) {
                const typeMap = generics.reduce((acc, value, index) => {
                  return Object.assign(acc, {
                    [value]: typeParams[index]
                  });
                }, {});
                return this._encodeRaw.call(self, new BcsWriter(options), data, typeParams, typeMap);
              },

              decode(self, data, typeParams) {
                const typeMap = generics.reduce((acc, value, index) => {
                  return Object.assign(acc, {
                    [value]: typeParams[index]
                  });
                }, {});
                return this._decodeRaw.call(self, new BcsReader(data), typeParams, typeMap);
              },

              // these methods should always be used with caution as they require pre-defined
              // reader and writer and mainly exist to allow multi-field (de)serialization;
              _encodeRaw(writer, data, typeParams, typeMap) {
                if (validateCb(data)) {
                  return encodeCb.call(this, writer, data, typeParams, typeMap);
                } else {
                  throw new Error(`Validation failed for type ${name}, data: ${data}`);
                }
              },

              _decodeRaw(reader, typeParams, typeMap) {
                return decodeCb.call(this, reader, typeParams, typeMap);
              }

            });
            return this;
          }
          /**
           * Register an address type which is a sequence of U8s of specified length.
           * @example
           * bcs.registerAddressType('address', SUI_ADDRESS_LENGTH);
           * let addr = bcs.de('address', 'c3aca510c785c7094ac99aeaa1e69d493122444df50bb8a99dfa790c654a79af');
           *
           * @param name Name of the address type.
           * @param length Byte length of the address.
           * @param encoding Encoding to use for the address type
           * @returns
           */


          registerAddressType(name, length, encoding = "hex") {
            switch (encoding) {
              case "base64":
                return this.registerType(name, function encodeAddress(writer, data) {
                  return fromB64(data).reduce((writer2, el) => writer2.write8(el), writer);
                }, function decodeAddress(reader) {
                  return toB64(reader.readBytes(length));
                });

              case "hex":
                return this.registerType(name, function encodeAddress(writer, data) {
                  return fromHEX(data).reduce((writer2, el) => writer2.write8(el), writer);
                }, function decodeAddress(reader) {
                  return toHEX(reader.readBytes(length));
                });

              default:
                throw new Error("Unsupported encoding! Use either hex or base64");
            }
          }
          /**
           * Register custom vector type inside the bcs.
           *
           * @example
           * bcs.registerVectorType('vector<T>'); // generic registration
           * let array = bcs.de('vector<u8>', '06010203040506', 'hex'); // [1,2,3,4,5,6];
           * let again = bcs.ser('vector<u8>', [1,2,3,4,5,6]).toString('hex');
           *
           * @param name Name of the type to register
           * @param elementType Optional name of the inner type of the vector
           * @return Returns self for chaining.
           */


          registerVectorType(typeName) {
            let {
              name,
              params
            } = this.parseTypeName(typeName);

            if (params.length > 1) {
              throw new Error("Vector can have only one type parameter; got " + name);
            }

            return this.registerType(typeName, function encodeVector(writer, data, typeParams, typeMap) {
              return writer.writeVec(data, (writer2, el) => {
                let elementType = typeParams[0];

                if (!elementType) {
                  throw new Error(`Incorrect number of type parameters passed a to vector '${typeName}'`);
                }

                let {
                  name: name2,
                  params: params2
                } = this.parseTypeName(elementType);

                if (this.hasType(name2)) {
                  return this.getTypeInterface(name2)._encodeRaw.call(this, writer2, el, params2, typeMap);
                }

                if (!(name2 in typeMap)) {
                  throw new Error(`Unable to find a matching type definition for ${name2} in vector; make sure you passed a generic`);
                }

                let {
                  name: innerName,
                  params: innerParams
                } = this.parseTypeName(typeMap[name2]);
                return this.getTypeInterface(innerName)._encodeRaw.call(this, writer2, el, innerParams, typeMap);
              });
            }, function decodeVector(reader, typeParams, typeMap) {
              return reader.readVec(reader2 => {
                let elementType = typeParams[0];

                if (!elementType) {
                  throw new Error(`Incorrect number of type parameters passed to a vector '${typeName}'`);
                }

                let {
                  name: name2,
                  params: params2
                } = this.parseTypeName(elementType);

                if (this.hasType(name2)) {
                  return this.getTypeInterface(name2)._decodeRaw.call(this, reader2, params2, typeMap);
                }

                if (!(name2 in typeMap)) {
                  throw new Error(`Unable to find a matching type definition for ${name2} in vector; make sure you passed a generic`);
                }

                let {
                  name: innerName,
                  params: innerParams
                } = this.parseTypeName(typeMap[name2]);
                return this.getTypeInterface(innerName)._decodeRaw.call(this, reader2, innerParams, typeMap);
              });
            });
          }
          /**
           * Safe method to register a custom Move struct. The first argument is a name of the
           * struct which is only used on the FrontEnd and has no affect on serialization results,
           * and the second is a struct description passed as an Object.
           *
           * The description object MUST have the same order on all of the platforms (ie in Move
           * or in Rust).
           *
           * @example
           * // Move / Rust struct
           * // struct Coin {
           * //   value: u64,
           * //   owner: vector<u8>, // name // Vec<u8> in Rust
           * //   is_locked: bool,
           * // }
           *
           * bcs.registerStructType('Coin', {
           *   value: bcs.U64,
           *   owner: bcs.STRING,
           *   is_locked: bcs.BOOL
           * });
           *
           * // Created in Rust with diem/bcs
           * // let rust_bcs_str = '80d1b105600000000e4269672057616c6c65742047757900';
           * let rust_bcs_str = [ // using an Array here as BCS works with Uint8Array
           *  128, 209, 177,   5,  96,  0,  0,
           *    0,  14,  66, 105, 103, 32, 87,
           *   97, 108, 108, 101, 116, 32, 71,
           *  117, 121,   0
           * ];
           *
           * // Let's encode the value as well
           * let test_set = bcs.ser('Coin', {
           *   owner: 'Big Wallet Guy',
           *   value: '412412400000',
           *   is_locked: false,
           * });
           *
           * console.assert(Array.from(test_set.toBytes()) === rust_bcs_str, 'Whoopsie, result mismatch');
           *
           * @param name Name of the type to register.
           * @param fields Fields of the struct. Must be in the correct order.
           * @return Returns BCS for chaining.
           */


          registerStructType(typeName, fields) {
            for (let key in fields) {
              let internalName = this.tempKey();
              let value = fields[key];

              if (!Array.isArray(value) && typeof value !== "string") {
                fields[key] = internalName;
                this.registerStructType(internalName, value);
              }
            }

            let struct = Object.freeze(fields);
            let canonicalOrder = Object.keys(struct);
            let {
              name: structName,
              params: generics
            } = this.parseTypeName(typeName);
            return this.registerType(typeName, function encodeStruct(writer, data, typeParams, typeMap) {
              if (!data || data.constructor !== Object) {
                throw new Error(`Expected ${structName} to be an Object, got: ${data}`);
              }

              if (typeParams.length !== generics.length) {
                throw new Error(`Incorrect number of generic parameters passed; expected: ${generics.length}, got: ${typeParams.length}`);
              }

              for (let key of canonicalOrder) {
                if (!(key in data)) {
                  throw new Error(`Struct ${structName} requires field ${key}:${struct[key]}`);
                }

                const {
                  name: fieldType,
                  params: fieldParams
                } = this.parseTypeName(struct[key]);

                if (!generics.includes(fieldType)) {
                  this.getTypeInterface(fieldType)._encodeRaw.call(this, writer, data[key], fieldParams, typeMap);
                } else {
                  const paramIdx = generics.indexOf(fieldType);
                  let {
                    name,
                    params
                  } = this.parseTypeName(typeParams[paramIdx]);

                  if (this.hasType(name)) {
                    this.getTypeInterface(name)._encodeRaw.call(this, writer, data[key], params, typeMap);

                    continue;
                  }

                  if (!(name in typeMap)) {
                    throw new Error(`Unable to find a matching type definition for ${name} in ${structName}; make sure you passed a generic`);
                  }

                  let {
                    name: innerName,
                    params: innerParams
                  } = this.parseTypeName(typeMap[name]);

                  this.getTypeInterface(innerName)._encodeRaw.call(this, writer, data[key], innerParams, typeMap);
                }
              }

              return writer;
            }, function decodeStruct(reader, typeParams, typeMap) {
              if (typeParams.length !== generics.length) {
                throw new Error(`Incorrect number of generic parameters passed; expected: ${generics.length}, got: ${typeParams.length}`);
              }

              let result = {};

              for (let key of canonicalOrder) {
                const {
                  name: fieldName,
                  params: fieldParams
                } = this.parseTypeName(struct[key]);

                if (!generics.includes(fieldName)) {
                  result[key] = this.getTypeInterface(fieldName)._decodeRaw.call(this, reader, fieldParams, typeMap);
                } else {
                  const paramIdx = generics.indexOf(fieldName);
                  let {
                    name,
                    params
                  } = this.parseTypeName(typeParams[paramIdx]);

                  if (this.hasType(name)) {
                    result[key] = this.getTypeInterface(name)._decodeRaw.call(this, reader, params, typeMap);
                    continue;
                  }

                  if (!(name in typeMap)) {
                    throw new Error(`Unable to find a matching type definition for ${name} in ${structName}; make sure you passed a generic`);
                  }

                  let {
                    name: innerName,
                    params: innerParams
                  } = this.parseTypeName(typeMap[name]);
                  result[key] = this.getTypeInterface(innerName)._decodeRaw.call(this, reader, innerParams, typeMap);
                }
              }

              return result;
            });
          }
          /**
           * Safe method to register custom enum type where each invariant holds the value of another type.
           * @example
           * bcs.registerStructType('Coin', { value: 'u64' });
           * bcs.registerEnumType('MyEnum', {
           *  single: 'Coin',
           *  multi: 'vector<Coin>',
           *  empty: null
           * });
           *
           * console.log(
           *  bcs.de('MyEnum', 'AICWmAAAAAAA', 'base64'), // { single: { value: 10000000 } }
           *  bcs.de('MyEnum', 'AQIBAAAAAAAAAAIAAAAAAAAA', 'base64')  // { multi: [ { value: 1 }, { value: 2 } ] }
           * )
           *
           * // and serialization
           * bcs.ser('MyEnum', { single: { value: 10000000 } }).toBytes();
           * bcs.ser('MyEnum', { multi: [ { value: 1 }, { value: 2 } ] });
           *
           * @param name
           * @param variants
           */


          registerEnumType(typeName, variants) {
            for (let key in variants) {
              let internalName = this.tempKey();
              let value = variants[key];

              if (value !== null && !Array.isArray(value) && typeof value !== "string") {
                variants[key] = internalName;
                this.registerStructType(internalName, value);
              }
            }

            let struct = Object.freeze(variants);
            let canonicalOrder = Object.keys(struct);
            let {
              name,
              params: canonicalTypeParams
            } = this.parseTypeName(typeName);
            return this.registerType(typeName, function encodeEnum(writer, data, typeParams, typeMap) {
              if (!data) {
                throw new Error(`Unable to write enum "${name}", missing data.
Received: "${data}"`);
              }

              if (typeof data !== "object") {
                throw new Error(`Incorrect data passed into enum "${name}", expected object with properties: "${canonicalOrder.join(" | ")}".
Received: "${JSON.stringify(data)}"`);
              }

              let key = Object.keys(data)[0];

              if (key === void 0) {
                throw new Error(`Empty object passed as invariant of the enum "${name}"`);
              }

              let orderByte = canonicalOrder.indexOf(key);

              if (orderByte === -1) {
                throw new Error(`Unknown invariant of the enum "${name}", allowed values: "${canonicalOrder.join(" | ")}"; received "${key}"`);
              }

              let invariant = canonicalOrder[orderByte];
              let invariantType = struct[invariant];
              writer.write8(orderByte);

              if (invariantType === null) {
                return writer;
              }

              let paramIndex = canonicalTypeParams.indexOf(invariantType);
              let typeOrParam = paramIndex === -1 ? invariantType : typeParams[paramIndex];
              {
                let {
                  name: name2,
                  params
                } = this.parseTypeName(typeOrParam);
                return this.getTypeInterface(name2)._encodeRaw.call(this, writer, data[key], params, typeMap);
              }
            }, function decodeEnum(reader, typeParams, typeMap) {
              let orderByte = reader.readULEB();
              let invariant = canonicalOrder[orderByte];
              let invariantType = struct[invariant];

              if (orderByte === -1) {
                throw new Error(`Decoding type mismatch, expected enum "${name}" invariant index, received "${orderByte}"`);
              }

              if (invariantType === null) {
                return {
                  [invariant]: true
                };
              }

              let paramIndex = canonicalTypeParams.indexOf(invariantType);
              let typeOrParam = paramIndex === -1 ? invariantType : typeParams[paramIndex];
              {
                let {
                  name: name2,
                  params
                } = this.parseTypeName(typeOrParam);
                return {
                  [invariant]: this.getTypeInterface(name2)._decodeRaw.call(this, reader, params, typeMap)
                };
              }
            });
          }
          /**
           * Get a set of encoders/decoders for specific type.
           * Mainly used to define custom type de/serialization logic.
           *
           * @param type
           * @returns {TypeInterface}
           */


          getTypeInterface(type) {
            let typeInterface = this.types.get(type);

            if (typeof typeInterface === "string") {
              let chain = [];

              while (typeof typeInterface === "string") {
                if (chain.includes(typeInterface)) {
                  throw new Error(`Recursive definition found: ${chain.join(" -> ")} -> ${typeInterface}`);
                }

                chain.push(typeInterface);
                typeInterface = this.types.get(typeInterface);
              }
            }

            if (typeInterface === void 0) {
              throw new Error(`Type ${type} is not registered`);
            }

            return typeInterface;
          }
          /**
           * Parse a type name and get the type's generics.
           * @example
           * let { typeName, typeParams } = parseTypeName('Option<Coin<SUI>>');
           * // typeName: Option
           * // typeParams: [ 'Coin<SUI>' ]
           *
           * @param name Name of the type to process
           * @returns Object with typeName and typeParams listed as Array
           */


          parseTypeName(name) {
            if (Array.isArray(name)) {
              let [typeName2, ...params2] = name;
              return {
                name: typeName2,
                params: params2
              };
            }

            if (typeof name !== "string") {
              throw new Error(`Illegal type passed as a name of the type: ${name}`);
            }

            let [left, right] = this.schema.genericSeparators || ["<", ">"];
            let l_bound = name.indexOf(left);
            let r_bound = Array.from(name).reverse().indexOf(right);

            if (l_bound === -1 && r_bound === -1) {
              return {
                name,
                params: []
              };
            }

            if (l_bound === -1 || r_bound === -1) {
              throw new Error(`Unclosed generic in name '${name}'`);
            }

            let typeName = name.slice(0, l_bound);
            let params = splitGenericParameters(name.slice(l_bound + 1, name.length - r_bound - 1), this.schema.genericSeparators);
            return {
              name: typeName,
              params
            };
          }

        };

        var BCS = _BCS; // Prefefined types constants

        exports.BCS = BCS;
        BCS.U8 = "u8";
        BCS.U16 = "u16";
        BCS.U32 = "u32";
        BCS.U64 = "u64";
        BCS.U128 = "u128";
        BCS.U256 = "u256";
        BCS.BOOL = "bool";
        BCS.VECTOR = "vector";
        BCS.ADDRESS = "address";
        BCS.STRING = "string";
        BCS.HEX = "hex-string";
        BCS.BASE58 = "base58-string";
        BCS.BASE64 = "base64-string";

        function encodeStr(data, encoding) {
          switch (encoding) {
            case "base58":
              return toB58(data);

            case "base64":
              return toB64(data);

            case "hex":
              return toHEX(data);

            default:
              throw new Error("Unsupported encoding, supported values are: base64, hex");
          }
        }

        function decodeStr(data, encoding) {
          switch (encoding) {
            case "base58":
              return fromB58(data);

            case "base64":
              return fromB64(data);

            case "hex":
              return fromHEX(data);

            default:
              throw new Error("Unsupported encoding, supported values are: base64, hex");
          }
        }

        function registerPrimitives(bcs) {
          bcs.registerType(BCS.U8, function (writer, data) {
            return writer.write8(data);
          }, function (reader) {
            return reader.read8();
          }, u8 => u8 < 256);
          bcs.registerType(BCS.U16, function (writer, data) {
            return writer.write16(data);
          }, function (reader) {
            return reader.read16();
          }, u16 => u16 < 65536);
          bcs.registerType(BCS.U32, function (writer, data) {
            return writer.write32(data);
          }, function (reader) {
            return reader.read32();
          }, u32 => u32 <= 4294967296n);
          bcs.registerType(BCS.U64, function (writer, data) {
            return writer.write64(data);
          }, function (reader) {
            return reader.read64();
          });
          bcs.registerType(BCS.U128, function (writer, data) {
            return writer.write128(data);
          }, function (reader) {
            return reader.read128();
          });
          bcs.registerType(BCS.U256, function (writer, data) {
            return writer.write256(data);
          }, function (reader) {
            return reader.read256();
          });
          bcs.registerType(BCS.BOOL, function (writer, data) {
            return writer.write8(data);
          }, function (reader) {
            return reader.read8().toString(10) === "1";
          });
          bcs.registerType(BCS.STRING, function (writer, data) {
            return writer.writeVec(Array.from(data), (writer2, el) => writer2.write8(el.charCodeAt(0)));
          }, function (reader) {
            return reader.readVec(reader2 => reader2.read8()).map(el => String.fromCharCode(Number(el))).join("");
          }, _str => true);
          bcs.registerType(BCS.HEX, function (writer, data) {
            return writer.writeVec(Array.from(fromHEX(data)), (writer2, el) => writer2.write8(el));
          }, function (reader) {
            let bytes = reader.readVec(reader2 => reader2.read8());
            return toHEX(new Uint8Array(bytes));
          });
          bcs.registerType(BCS.BASE58, function (writer, data) {
            return writer.writeVec(Array.from(fromB58(data)), (writer2, el) => writer2.write8(el));
          }, function (reader) {
            let bytes = reader.readVec(reader2 => reader2.read8());
            return toB58(new Uint8Array(bytes));
          });
          bcs.registerType(BCS.BASE64, function (writer, data) {
            return writer.writeVec(Array.from(fromB64(data)), (writer2, el) => writer2.write8(el));
          }, function (reader) {
            let bytes = reader.readVec(reader2 => reader2.read8());
            return toB64(new Uint8Array(bytes));
          });
        }

        function getRustConfig() {
          return {
            genericSeparators: ["<", ">"],
            vectorType: "Vec",
            addressLength: SUI_ADDRESS_LENGTH,
            addressEncoding: "hex"
          };
        }

        function getSuiMoveConfig() {
          return {
            genericSeparators: ["<", ">"],
            vectorType: "vector",
            addressLength: SUI_ADDRESS_LENGTH,
            addressEncoding: "hex"
          };
        }

        function splitGenericParameters(str, genericSeparators = ["<", ">"]) {
          const [left, right] = genericSeparators;
          const tok = [];
          let word = "";
          let nestedAngleBrackets = 0;

          for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (char === left) {
              nestedAngleBrackets++;
            }

            if (char === right) {
              nestedAngleBrackets--;
            }

            if (nestedAngleBrackets === 0 && char === ",") {
              tok.push(word.trim());
              word = "";
              continue;
            }

            word += char;
          }

          tok.push(word.trim());
          return tok;
        }
      }, {
        "bs58": 117
      }],
      5: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.PureCallArg = exports.ObjectCallArg = exports.Inputs = exports.BuilderCallArg = void 0;
        exports.getIdFromCallArg = getIdFromCallArg;
        exports.getSharedObjectInput = getSharedObjectInput;
        exports.isMutableSharedObjectInput = isMutableSharedObjectInput;
        exports.isSharedObjectInput = isSharedObjectInput;

        var _superstruct = require("superstruct");

        var _index = require("../types/index.js");

        var _bcs = require("./bcs.js");

        const ObjectArg = (0, _superstruct.union)([(0, _superstruct.object)({
          ImmOrOwned: _index.SuiObjectRef
        }), (0, _superstruct.object)({
          Shared: (0, _superstruct.object)({
            objectId: (0, _superstruct.string)(),
            initialSharedVersion: (0, _superstruct.union)([(0, _superstruct.integer)(), (0, _superstruct.string)()]),
            mutable: (0, _superstruct.boolean)()
          })
        })]);
        const PureCallArg = (0, _superstruct.object)({
          Pure: (0, _superstruct.array)((0, _superstruct.integer)())
        });
        exports.PureCallArg = PureCallArg;
        const ObjectCallArg = (0, _superstruct.object)({
          Object: ObjectArg
        });
        exports.ObjectCallArg = ObjectCallArg;
        const BuilderCallArg = (0, _superstruct.union)([PureCallArg, ObjectCallArg]);
        exports.BuilderCallArg = BuilderCallArg;
        const Inputs = {
          Pure(data, type) {
            return {
              Pure: Array.from(data instanceof Uint8Array ? data : // NOTE: We explicitly set this to be growable to infinity, because we have maxSize validation at the builder-level:
              _bcs.builder.ser(type, data, {
                maxSize: Infinity
              }).toBytes())
            };
          },

          ObjectRef({
            objectId,
            digest,
            version
          }) {
            return {
              Object: {
                ImmOrOwned: {
                  digest,
                  version,
                  objectId: (0, _index.normalizeSuiAddress)(objectId)
                }
              }
            };
          },

          SharedObjectRef({
            objectId,
            mutable,
            initialSharedVersion
          }) {
            return {
              Object: {
                Shared: {
                  mutable,
                  initialSharedVersion,
                  objectId: (0, _index.normalizeSuiAddress)(objectId)
                }
              }
            };
          }

        };
        exports.Inputs = Inputs;

        function getIdFromCallArg(arg) {
          if (typeof arg === "string") {
            return (0, _index.normalizeSuiAddress)(arg);
          }

          if ("ImmOrOwned" in arg.Object) {
            return (0, _index.normalizeSuiAddress)(arg.Object.ImmOrOwned.objectId);
          }

          return (0, _index.normalizeSuiAddress)(arg.Object.Shared.objectId);
        }

        function getSharedObjectInput(arg) {
          return typeof arg === "object" && "Object" in arg && "Shared" in arg.Object ? arg.Object.Shared : void 0;
        }

        function isSharedObjectInput(arg) {
          return !!getSharedObjectInput(arg);
        }

        function isMutableSharedObjectInput(arg) {
          return getSharedObjectInput(arg)?.mutable ?? false;
        }
      }, {
        "../types/index.js": 50,
        "./bcs.js": 9,
        "superstruct": 120
      }],
      6: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TransactionBlock = void 0;

        var _bcs = require("@mysten/bcs");

        var _superstruct = require("superstruct");

        var _index = require("../types/index.js");

        var _Transactions = require("./Transactions.js");

        var _Inputs = require("./Inputs.js");

        var _serializer = require("./serializer.js");

        var _TransactionBlockData = require("./TransactionBlockData.js");

        var _utils = require("./utils.js");

        var __accessCheck = (obj, member, msg) => {
          if (!member.has(obj)) throw TypeError("Cannot " + msg);
        };

        var __privateGet = (obj, member, getter) => {
          __accessCheck(obj, member, "read from private field");

          return getter ? getter.call(obj) : member.get(obj);
        };

        var __privateAdd = (obj, member, value) => {
          if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
          member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
        };

        var __privateSet = (obj, member, value, setter) => {
          __accessCheck(obj, member, "write to private field");

          setter ? setter.call(obj, value) : member.set(obj, value);
          return value;
        };

        var __privateMethod = (obj, member, method) => {
          __accessCheck(obj, member, "access private method");

          return method;
        };

        var _blockData, _input, input_fn, _getConfig, getConfig_fn, _validate, validate_fn, _prepareGasPayment, prepareGasPayment_fn, _prepareGasPrice, prepareGasPrice_fn, _prepareTransactions, prepareTransactions_fn, _prepare, prepare_fn;

        const DefaultOfflineLimits = {
          maxPureArgumentSize: 16 * 1024,
          maxTxGas: 5e10,
          maxGasObjects: 256,
          maxTxSizeBytes: 128 * 1024
        };

        function createTransactionResult(index) {
          const baseResult = {
            kind: "Result",
            index
          };
          const nestedResults = [];

          const nestedResultFor = resultIndex => nestedResults[resultIndex] ?? (nestedResults[resultIndex] = {
            kind: "NestedResult",
            index,
            resultIndex
          });

          return new Proxy(baseResult, {
            set() {
              throw new Error("The transaction result is a proxy, and does not support setting properties directly");
            },

            // TODO: Instead of making this return a concrete argument, we should ideally
            // make it reference-based (so that this gets resolved at build-time), which
            // allows re-ordering transactions.
            get(target, property) {
              if (property in target) {
                return Reflect.get(target, property);
              }

              if (property === Symbol.iterator) {
                return function* () {
                  let i = 0;

                  while (true) {
                    yield nestedResultFor(i);
                    i++;
                  }
                };
              }

              if (typeof property === "symbol") return;
              const resultIndex = parseInt(property, 10);
              if (Number.isNaN(resultIndex) || resultIndex < 0) return;
              return nestedResultFor(resultIndex);
            }

          });
        }

        function expectProvider(options) {
          if (!options.provider) {
            throw new Error(`No provider passed to Transaction#build, but transaction data was not sufficient to build offline.`);
          }

          return options.provider;
        }

        const TRANSACTION_BRAND = Symbol.for("@mysten/transaction");
        const LIMITS = {
          // The maximum gas that is allowed.
          maxTxGas: "max_tx_gas",
          // The maximum number of gas objects that can be selected for one transaction.
          maxGasObjects: "max_gas_payment_objects",
          // The maximum size (in bytes) that the transaction can be:
          maxTxSizeBytes: "max_tx_size_bytes",
          // The maximum size (in bytes) that pure arguments can be:
          maxPureArgumentSize: "max_pure_argument_size"
        };
        const GAS_SAFE_OVERHEAD = 1000n;
        const MAX_OBJECTS_PER_FETCH = 50;

        const chunk = (arr, size) => Array.from({
          length: Math.ceil(arr.length / size)
        }, (_, i) => arr.slice(i * size, i * size + size));

        const _TransactionBlock = class _TransactionBlock {
          constructor(transaction) {
            /**
             * Dynamically create a new input, which is separate from the `input`. This is important
             * for generated clients to be able to define unique inputs that are non-overlapping with the
             * defined inputs.
             *
             * For `Uint8Array` type automatically convert the input into a `Pure` CallArg, since this
             * is the format required for custom serialization.
             *
             */
            __privateAdd(this, _input);

            __privateAdd(this, _getConfig);

            __privateAdd(this, _validate); // The current default is just picking _all_ coins we can which may not be ideal.


            __privateAdd(this, _prepareGasPayment);

            __privateAdd(this, _prepareGasPrice);

            __privateAdd(this, _prepareTransactions);
            /**
             * Prepare the transaction by valdiating the transaction data and resolving all inputs
             * so that it can be built into bytes.
             */


            __privateAdd(this, _prepare);

            __privateAdd(this, _blockData, void 0);

            __privateSet(this, _blockData, new _TransactionBlockData.TransactionBlockDataBuilder(transaction ? transaction.blockData : void 0));
          }
          /** Returns `true` if the object is an instance of the Transaction builder class. */


          static is(obj) {
            return !!obj && typeof obj === "object" && obj[TRANSACTION_BRAND] === true;
          }
          /**
           * Converts from a serialize transaction kind (built with `build({ onlyTransactionKind: true })`) to a `Transaction` class.
           * Supports either a byte array, or base64-encoded bytes.
           */


          static fromKind(serialized) {
            const tx = new _TransactionBlock();

            __privateSet(tx, _blockData, _TransactionBlockData.TransactionBlockDataBuilder.fromKindBytes(typeof serialized === "string" ? (0, _bcs.fromB64)(serialized) : serialized));

            return tx;
          }
          /**
           * Converts from a serialized transaction format to a `Transaction` class.
           * There are two supported serialized formats:
           * - A string returned from `Transaction#serialize`. The serialized format must be compatible, or it will throw an error.
           * - A byte array (or base64-encoded bytes) containing BCS transaction data.
           */


          static from(serialized) {
            const tx = new _TransactionBlock();

            if (typeof serialized !== "string" || !serialized.startsWith("{")) {
              __privateSet(tx, _blockData, _TransactionBlockData.TransactionBlockDataBuilder.fromBytes(typeof serialized === "string" ? (0, _bcs.fromB64)(serialized) : serialized));
            } else {
              __privateSet(tx, _blockData, _TransactionBlockData.TransactionBlockDataBuilder.restore(JSON.parse(serialized)));
            }

            return tx;
          }
          /** A helper to retrieve the Transaction builder `Transactions` */


          static get Transactions() {
            return _Transactions.Transactions;
          }
          /** A helper to retrieve the Transaction builder `Inputs` */


          static get Inputs() {
            return _Inputs.Inputs;
          }

          setSender(sender) {
            __privateGet(this, _blockData).sender = sender;
          }
          /**
           * Sets the sender only if it has not already been set.
           * This is useful for sponsored transaction flows where the sender may not be the same as the signer address.
           */


          setSenderIfNotSet(sender) {
            if (!__privateGet(this, _blockData).sender) {
              __privateGet(this, _blockData).sender = sender;
            }
          }

          setExpiration(expiration) {
            __privateGet(this, _blockData).expiration = expiration;
          }

          setGasPrice(price) {
            __privateGet(this, _blockData).gasConfig.price = String(price);
          }

          setGasBudget(budget) {
            __privateGet(this, _blockData).gasConfig.budget = String(budget);
          }

          setGasOwner(owner) {
            __privateGet(this, _blockData).gasConfig.owner = owner;
          }

          setGasPayment(payments) {
            __privateGet(this, _blockData).gasConfig.payment = payments.map(payment => (0, _superstruct.mask)(payment, _index.SuiObjectRef));
          }
          /** Get a snapshot of the transaction data, in JSON form: */


          get blockData() {
            return __privateGet(this, _blockData).snapshot();
          } // Used to brand transaction classes so that they can be identified, even between multiple copies
          // of the builder.


          get [TRANSACTION_BRAND]() {
            return true;
          }
          /** Returns an argument for the gas coin, to be used in a transaction. */


          get gas() {
            return {
              kind: "GasCoin"
            };
          }
          /**
           * Add a new object input to the transaction.
           */


          object(value) {
            const id = (0, _Inputs.getIdFromCallArg)(value);

            const inserted = __privateGet(this, _blockData).inputs.find(i => i.type === "object" && id === (0, _Inputs.getIdFromCallArg)(i.value));

            return inserted ?? __privateMethod(this, _input, input_fn).call(this, "object", value);
          }
          /**
           * Add a new object input to the transaction using the fully-resolved object reference.
           * If you only have an object ID, use `builder.object(id)` instead.
           */


          objectRef(...args) {
            return this.object(_Inputs.Inputs.ObjectRef(...args));
          }
          /**
           * Add a new shared object input to the transaction using the fully-resolved shared object reference.
           * If you only have an object ID, use `builder.object(id)` instead.
           */


          sharedObjectRef(...args) {
            return this.object(_Inputs.Inputs.SharedObjectRef(...args));
          }
          /**
           * Add a new non-object input to the transaction.
           */


          pure(value, type) {
            return __privateMethod(this, _input, input_fn).call(this, "pure", value instanceof Uint8Array ? _Inputs.Inputs.Pure(value) : type ? _Inputs.Inputs.Pure(value, type) : value);
          }
          /** Add a transaction to the transaction block. */


          add(transaction) {
            const index = __privateGet(this, _blockData).transactions.push(transaction);

            return createTransactionResult(index - 1);
          } // Method shorthands:


          splitCoins(...args) {
            return this.add(_Transactions.Transactions.SplitCoins(...args));
          }

          mergeCoins(...args) {
            return this.add(_Transactions.Transactions.MergeCoins(...args));
          }

          publish(...args) {
            return this.add(_Transactions.Transactions.Publish(...args));
          }

          upgrade(...args) {
            return this.add(_Transactions.Transactions.Upgrade(...args));
          }

          moveCall(...args) {
            return this.add(_Transactions.Transactions.MoveCall(...args));
          }

          transferObjects(...args) {
            return this.add(_Transactions.Transactions.TransferObjects(...args));
          }

          makeMoveVec(...args) {
            return this.add(_Transactions.Transactions.MakeMoveVec(...args));
          }
          /**
           * Serialize the transaction to a string so that it can be sent to a separate context.
           * This is different from `build` in that it does not serialize to BCS bytes, and instead
           * uses a separate format that is unique to the transaction builder. This allows
           * us to serialize partially-complete transactions, that can then be completed and
           * built in a separate context.
           *
           * For example, a dapp can construct a transaction, but not provide gas objects
           * or a gas budget. The transaction then can be sent to the wallet, where this
           * information is automatically filled in (e.g. by querying for coin objects
           * and performing a dry run).
           */


          serialize() {
            return JSON.stringify(__privateGet(this, _blockData).snapshot());
          }
          /** Build the transaction to BCS bytes. */


          async build(options = {}) {
            await __privateMethod(this, _prepare, prepare_fn).call(this, options);
            return __privateGet(this, _blockData).build({
              maxSizeBytes: __privateMethod(this, _getConfig, getConfig_fn).call(this, "maxTxSizeBytes", options),
              onlyTransactionKind: options.onlyTransactionKind
            });
          }
          /** Derive transaction digest */


          async getDigest({
            provider
          } = {}) {
            await __privateMethod(this, _prepare, prepare_fn).call(this, {
              provider
            });
            return __privateGet(this, _blockData).getDigest();
          }

        };

        _blockData = new WeakMap();
        _input = new WeakSet();

        input_fn = function (type, value) {
          const index = __privateGet(this, _blockData).inputs.length;

          const input = (0, _utils.create)({
            kind: "Input",
            // bigints can't be serialized to JSON, so just string-convert them here:
            value: typeof value === "bigint" ? String(value) : value,
            index,
            type
          }, _Transactions.TransactionBlockInput);

          __privateGet(this, _blockData).inputs.push(input);

          return input;
        };

        _getConfig = new WeakSet();

        getConfig_fn = function (key, {
          protocolConfig,
          limits
        }) {
          if (limits && typeof limits[key] === "number") {
            return limits[key];
          }

          if (!protocolConfig) {
            return DefaultOfflineLimits[key];
          }

          const attribute = protocolConfig?.attributes[LIMITS[key]];

          if (!attribute) {
            throw new Error(`Missing expected protocol config: "${LIMITS[key]}"`);
          }

          const value = "u64" in attribute ? attribute.u64 : "u32" in attribute ? attribute.u32 : attribute.f64;

          if (!value) {
            throw new Error(`Unexpected protocol config value found for: "${LIMITS[key]}"`);
          }

          return Number(value);
        };

        _validate = new WeakSet();

        validate_fn = function (options) {
          const maxPureArgumentSize = __privateMethod(this, _getConfig, getConfig_fn).call(this, "maxPureArgumentSize", options);

          __privateGet(this, _blockData).inputs.forEach((input, index) => {
            if ((0, _superstruct.is)(input.value, _Inputs.PureCallArg)) {
              if (input.value.Pure.length > maxPureArgumentSize) {
                throw new Error(`Input at index ${index} is too large, max pure input size is ${maxPureArgumentSize} bytes, got ${input.value.Pure.length} bytes`);
              }
            }
          });
        };

        _prepareGasPayment = new WeakSet();

        prepareGasPayment_fn = async function (options) {
          if (__privateGet(this, _blockData).gasConfig.payment) {
            const maxGasObjects = __privateMethod(this, _getConfig, getConfig_fn).call(this, "maxGasObjects", options);

            if (__privateGet(this, _blockData).gasConfig.payment.length > maxGasObjects) {
              throw new Error(`Payment objects exceed maximum amount: ${maxGasObjects}`);
            }
          }

          if (options.onlyTransactionKind || __privateGet(this, _blockData).gasConfig.payment) {
            return;
          }

          const gasOwner = __privateGet(this, _blockData).gasConfig.owner ?? __privateGet(this, _blockData).sender;

          const coins = await expectProvider(options).getCoins({
            owner: gasOwner,
            coinType: _index.SUI_TYPE_ARG
          });
          const paymentCoins = coins.data.filter(coin => {
            const matchingInput = __privateGet(this, _blockData).inputs.find(input => {
              if ((0, _superstruct.is)(input.value, _Inputs.BuilderCallArg) && "Object" in input.value && "ImmOrOwned" in input.value.Object) {
                return coin.coinObjectId === input.value.Object.ImmOrOwned.objectId;
              }

              return false;
            });

            return !matchingInput;
          }).slice(0, __privateMethod(this, _getConfig, getConfig_fn).call(this, "maxGasObjects", options) - 1).map(coin => ({
            objectId: coin.coinObjectId,
            digest: coin.digest,
            version: coin.version
          }));

          if (!paymentCoins.length) {
            throw new Error("No valid gas coins found for the transaction.");
          }

          this.setGasPayment(paymentCoins);
        };

        _prepareGasPrice = new WeakSet();

        prepareGasPrice_fn = async function (options) {
          if (options.onlyTransactionKind || __privateGet(this, _blockData).gasConfig.price) {
            return;
          }

          this.setGasPrice(await expectProvider(options).getReferenceGasPrice());
        };

        _prepareTransactions = new WeakSet();

        prepareTransactions_fn = async function (options) {
          const {
            inputs,
            transactions
          } = __privateGet(this, _blockData);

          const moveModulesToResolve = [];
          const objectsToResolve = [];
          transactions.forEach(transaction => {
            if (transaction.kind === "MoveCall") {
              const needsResolution = transaction.arguments.some(arg => arg.kind === "Input" && !(0, _superstruct.is)(inputs[arg.index].value, _Inputs.BuilderCallArg));

              if (needsResolution) {
                moveModulesToResolve.push(transaction);
              }

              return;
            }

            const transactionType = (0, _Transactions.getTransactionType)(transaction);
            if (!transactionType.schema) return;
            Object.entries(transaction).forEach(([key, value]) => {
              if (key === "kind") return;
              const keySchema = transactionType.schema[key];
              const isArray = keySchema.type === "array";
              const wellKnownEncoding = isArray ? keySchema.schema[_utils.TRANSACTION_TYPE] : keySchema[_utils.TRANSACTION_TYPE];
              if (!wellKnownEncoding) return;

              const encodeInput = index => {
                const input = inputs[index];

                if (!input) {
                  throw new Error(`Missing input ${value.index}`);
                }

                if ((0, _superstruct.is)(input.value, _Inputs.BuilderCallArg)) return;

                if (wellKnownEncoding.kind === "object" && typeof input.value === "string") {
                  objectsToResolve.push({
                    id: input.value,
                    input
                  });
                } else if (wellKnownEncoding.kind === "pure") {
                  input.value = _Inputs.Inputs.Pure(input.value, wellKnownEncoding.type);
                } else {
                  throw new Error("Unexpected input format.");
                }
              };

              if (isArray) {
                value.forEach(arrayItem => {
                  if (arrayItem.kind !== "Input") return;
                  encodeInput(arrayItem.index);
                });
              } else {
                if (value.kind !== "Input") return;
                encodeInput(value.index);
              }
            });
          });

          if (moveModulesToResolve.length) {
            await Promise.all(moveModulesToResolve.map(async moveCall => {
              const [packageId, moduleName, functionName] = moveCall.target.split("::");
              const normalized = await expectProvider(options).getNormalizedMoveFunction({
                package: (0, _index.normalizeSuiObjectId)(packageId),
                module: moduleName,
                function: functionName
              });
              const hasTxContext = normalized.parameters.length > 0 && (0, _serializer.isTxContext)(normalized.parameters.at(-1));
              const params = hasTxContext ? normalized.parameters.slice(0, normalized.parameters.length - 1) : normalized.parameters;

              if (params.length !== moveCall.arguments.length) {
                throw new Error("Incorrect number of arguments.");
              }

              params.forEach((param, i) => {
                const arg = moveCall.arguments[i];
                if (arg.kind !== "Input") return;
                const input = inputs[arg.index];
                if ((0, _superstruct.is)(input.value, _Inputs.BuilderCallArg)) return;
                const inputValue = input.value;
                const serType = (0, _serializer.getPureSerializationType)(param, inputValue);

                if (serType) {
                  input.value = _Inputs.Inputs.Pure(inputValue, serType);
                  return;
                }

                const structVal = (0, _index.extractStructTag)(param);

                if (structVal != null || typeof param === "object" && "TypeParameter" in param) {
                  if (typeof inputValue !== "string") {
                    throw new Error(`Expect the argument to be an object id string, got ${JSON.stringify(inputValue, null, 2)}`);
                  }

                  objectsToResolve.push({
                    id: inputValue,
                    input,
                    normalizedType: param
                  });
                  return;
                }

                throw new Error(`Unknown call arg type ${JSON.stringify(param, null, 2)} for value ${JSON.stringify(inputValue, null, 2)}`);
              });
            }));
          }

          if (objectsToResolve.length) {
            const dedupedIds = [...new Set(objectsToResolve.map(({
              id
            }) => id))];
            const objectChunks = chunk(dedupedIds, MAX_OBJECTS_PER_FETCH);
            const objects = (await Promise.all(objectChunks.map(chunk2 => expectProvider(options).multiGetObjects({
              ids: chunk2,
              options: {
                showOwner: true
              }
            })))).flat();
            let objectsById = new Map(dedupedIds.map((id, index) => {
              return [id, objects[index]];
            }));
            const invalidObjects = Array.from(objectsById).filter(([_, obj]) => obj.error).map(([id, _]) => id);

            if (invalidObjects.length) {
              throw new Error(`The following input objects are not invalid: ${invalidObjects.join(", ")}`);
            }

            objectsToResolve.forEach(({
              id,
              input,
              normalizedType
            }) => {
              const object = objectsById.get(id);
              const initialSharedVersion = (0, _index.getSharedObjectInitialVersion)(object);

              if (initialSharedVersion) {
                const mutable = (0, _Inputs.isMutableSharedObjectInput)(input.value) || normalizedType != null && (0, _index.extractMutableReference)(normalizedType) != null;
                input.value = _Inputs.Inputs.SharedObjectRef({
                  objectId: id,
                  initialSharedVersion,
                  mutable
                });
              } else {
                input.value = _Inputs.Inputs.ObjectRef((0, _index.getObjectReference)(object));
              }
            });
          }
        };

        _prepare = new WeakSet();

        prepare_fn = async function (options) {
          if (!options.onlyTransactionKind && !__privateGet(this, _blockData).sender) {
            throw new Error("Missing transaction sender");
          }

          if (!options.protocolConfig && !options.limits && options.provider) {
            options.protocolConfig = await options.provider.getProtocolConfig();
          }

          await Promise.all([__privateMethod(this, _prepareGasPrice, prepareGasPrice_fn).call(this, options), __privateMethod(this, _prepareTransactions, prepareTransactions_fn).call(this, options)]);

          if (!options.onlyTransactionKind) {
            await __privateMethod(this, _prepareGasPayment, prepareGasPayment_fn).call(this, options);

            if (!__privateGet(this, _blockData).gasConfig.budget) {
              const dryRunResult = await expectProvider(options).dryRunTransactionBlock({
                transactionBlock: __privateGet(this, _blockData).build({
                  maxSizeBytes: __privateMethod(this, _getConfig, getConfig_fn).call(this, "maxTxSizeBytes", options),
                  overrides: {
                    gasConfig: {
                      budget: String(__privateMethod(this, _getConfig, getConfig_fn).call(this, "maxTxGas", options)),
                      payment: []
                    }
                  }
                })
              });

              if (dryRunResult.effects.status.status !== "success") {
                throw new Error(`Dry run failed, could not automatically determine a budget: ${dryRunResult.effects.status.error}`, {
                  cause: dryRunResult
                });
              }

              const safeOverhead = GAS_SAFE_OVERHEAD * BigInt(this.blockData.gasConfig.price || 1n);
              const baseComputationCostWithOverhead = BigInt(dryRunResult.effects.gasUsed.computationCost) + safeOverhead;
              const gasBudget = baseComputationCostWithOverhead + BigInt(dryRunResult.effects.gasUsed.storageCost) - BigInt(dryRunResult.effects.gasUsed.storageRebate);
              this.setGasBudget(gasBudget > baseComputationCostWithOverhead ? gasBudget : baseComputationCostWithOverhead);
            }
          }

          __privateMethod(this, _validate, validate_fn).call(this, options);
        };

        let TransactionBlock = _TransactionBlock;
        exports.TransactionBlock = TransactionBlock;
      }, {
        "../types/index.js": 50,
        "./Inputs.js": 5,
        "./TransactionBlockData.js": 7,
        "./Transactions.js": 8,
        "./serializer.js": 11,
        "./utils.js": 12,
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      7: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TransactionExpiration = exports.TransactionBlockDataBuilder = exports.SerializedTransactionDataBuilder = void 0;

        var _bcs = require("@mysten/bcs");

        var _superstruct = require("superstruct");

        var _hash = require("../cryptography/hash.js");

        var _index = require("../types/index.js");

        var _bcs2 = require("./bcs.js");

        var _Transactions = require("./Transactions.js");

        var _Inputs = require("./Inputs.js");

        var _utils = require("./utils.js");

        const TransactionExpiration = (0, _superstruct.optional)((0, _superstruct.nullable)((0, _superstruct.union)([(0, _superstruct.object)({
          Epoch: (0, _superstruct.integer)()
        }), (0, _superstruct.object)({
          None: (0, _superstruct.union)([(0, _superstruct.literal)(true), (0, _superstruct.literal)(null)])
        })])));
        exports.TransactionExpiration = TransactionExpiration;
        const SuiAddress = (0, _superstruct.string)();
        const StringEncodedBigint = (0, _superstruct.define)("StringEncodedBigint", val => {
          if (!["string", "number", "bigint"].includes(typeof val)) return false;

          try {
            BigInt(val);
            return true;
          } catch {
            return false;
          }
        });
        const GasConfig = (0, _superstruct.object)({
          budget: (0, _superstruct.optional)(StringEncodedBigint),
          price: (0, _superstruct.optional)(StringEncodedBigint),
          payment: (0, _superstruct.optional)((0, _superstruct.array)(_index.SuiObjectRef)),
          owner: (0, _superstruct.optional)(SuiAddress)
        });
        const SerializedTransactionDataBuilder = (0, _superstruct.object)({
          version: (0, _superstruct.literal)(1),
          sender: (0, _superstruct.optional)(SuiAddress),
          expiration: TransactionExpiration,
          gasConfig: GasConfig,
          inputs: (0, _superstruct.array)(_Transactions.TransactionBlockInput),
          transactions: (0, _superstruct.array)(_Transactions.TransactionType)
        });
        exports.SerializedTransactionDataBuilder = SerializedTransactionDataBuilder;

        function prepareSuiAddress(address) {
          return (0, _index.normalizeSuiAddress)(address).replace("0x", "");
        }

        class TransactionBlockDataBuilder {
          constructor(clone) {
            this.version = 1;
            this.sender = clone?.sender;
            this.expiration = clone?.expiration;
            this.gasConfig = clone?.gasConfig ?? {};
            this.inputs = clone?.inputs ?? [];
            this.transactions = clone?.transactions ?? [];
          }

          static fromKindBytes(bytes) {
            const kind = _bcs2.builder.de("TransactionKind", bytes);

            const programmableTx = kind?.ProgrammableTransaction;

            if (!programmableTx) {
              throw new Error("Unable to deserialize from bytes.");
            }

            const serialized = (0, _utils.create)({
              version: 1,
              gasConfig: {},
              inputs: programmableTx.inputs.map((value, index) => (0, _utils.create)({
                kind: "Input",
                value,
                index,
                type: (0, _superstruct.is)(value, _Inputs.PureCallArg) ? "pure" : "object"
              }, _Transactions.TransactionBlockInput)),
              transactions: programmableTx.transactions
            }, SerializedTransactionDataBuilder);
            return TransactionBlockDataBuilder.restore(serialized);
          }

          static fromBytes(bytes) {
            const rawData = _bcs2.builder.de("TransactionData", bytes);

            const data = rawData?.V1;
            const programmableTx = data?.kind?.ProgrammableTransaction;

            if (!data || !programmableTx) {
              throw new Error("Unable to deserialize from bytes.");
            }

            const serialized = (0, _utils.create)({
              version: 1,
              sender: data.sender,
              expiration: data.expiration,
              gasConfig: data.gasData,
              inputs: programmableTx.inputs.map((value, index) => (0, _utils.create)({
                kind: "Input",
                value,
                index,
                type: (0, _superstruct.is)(value, _Inputs.PureCallArg) ? "pure" : "object"
              }, _Transactions.TransactionBlockInput)),
              transactions: programmableTx.transactions
            }, SerializedTransactionDataBuilder);
            return TransactionBlockDataBuilder.restore(serialized);
          }

          static restore(data) {
            (0, _superstruct.assert)(data, SerializedTransactionDataBuilder);
            const transactionData = new TransactionBlockDataBuilder();
            Object.assign(transactionData, data);
            return transactionData;
          }
          /**
           * Generate transaction digest.
           *
           * @param bytes BCS serialized transaction data
           * @returns transaction digest.
           */


          static getDigestFromBytes(bytes) {
            const hash = (0, _hash.hashTypedData)("TransactionData", bytes);
            return (0, _bcs.toB58)(hash);
          }

          build({
            maxSizeBytes = Infinity,
            overrides,
            onlyTransactionKind
          } = {}) {
            const inputs = this.inputs.map(input => {
              (0, _superstruct.assert)(input.value, _Inputs.BuilderCallArg);
              return input.value;
            });
            const kind = {
              ProgrammableTransaction: {
                inputs,
                transactions: this.transactions
              }
            };

            if (onlyTransactionKind) {
              return _bcs2.builder.ser("TransactionKind", kind, {
                maxSize: maxSizeBytes
              }).toBytes();
            }

            const expiration = overrides?.expiration ?? this.expiration;
            const sender = overrides?.sender ?? this.sender;
            const gasConfig = { ...this.gasConfig,
              ...overrides?.gasConfig
            };

            if (!sender) {
              throw new Error("Missing transaction sender");
            }

            if (!gasConfig.budget) {
              throw new Error("Missing gas budget");
            }

            if (!gasConfig.payment) {
              throw new Error("Missing gas payment");
            }

            if (!gasConfig.price) {
              throw new Error("Missing gas price");
            }

            const transactionData = {
              sender: prepareSuiAddress(sender),
              expiration: expiration ? expiration : {
                None: true
              },
              gasData: {
                payment: gasConfig.payment,
                owner: prepareSuiAddress(this.gasConfig.owner ?? sender),
                price: BigInt(gasConfig.price),
                budget: BigInt(gasConfig.budget)
              },
              kind: {
                ProgrammableTransaction: {
                  inputs,
                  transactions: this.transactions
                }
              }
            };
            return _bcs2.builder.ser("TransactionData", {
              V1: transactionData
            }, {
              maxSize: maxSizeBytes
            }).toBytes();
          }

          getDigest() {
            const bytes = this.build({
              onlyTransactionKind: false
            });
            return TransactionBlockDataBuilder.getDigestFromBytes(bytes);
          }

          snapshot() {
            return (0, _utils.create)(this, SerializedTransactionDataBuilder);
          }

        }

        exports.TransactionBlockDataBuilder = TransactionBlockDataBuilder;
      }, {
        "../cryptography/hash.js": 13,
        "../types/index.js": 50,
        "./Inputs.js": 5,
        "./Transactions.js": 8,
        "./bcs.js": 9,
        "./utils.js": 12,
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      8: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.UpgradeTransaction = exports.UpgradePolicy = exports.TransferObjectsTransaction = exports.Transactions = exports.TransactionType = exports.TransactionBlockInput = exports.TransactionArgument = exports.SplitCoinsTransaction = exports.PureTransactionArgument = exports.PublishTransaction = exports.ObjectTransactionArgument = exports.MoveCallTransaction = exports.MergeCoinsTransaction = exports.MakeMoveVecTransaction = void 0;
        exports.getTransactionType = getTransactionType;

        var _bcs = require("@mysten/bcs");

        var _superstruct = require("superstruct");

        var _common = require("../types/common.js");

        var _utils = require("./utils.js");

        var _typeTagSerializer = require("../signers/txn-data-serializers/type-tag-serializer.js");

        const option = some => (0, _superstruct.union)([(0, _superstruct.object)({
          None: (0, _superstruct.union)([(0, _superstruct.literal)(true), (0, _superstruct.literal)(null)])
        }), (0, _superstruct.object)({
          Some: some
        })]);

        const TransactionBlockInput = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("Input"),
          index: (0, _superstruct.integer)(),
          value: (0, _superstruct.optional)((0, _superstruct.any)()),
          type: (0, _superstruct.optional)((0, _superstruct.union)([(0, _superstruct.literal)("pure"), (0, _superstruct.literal)("object")]))
        });
        exports.TransactionBlockInput = TransactionBlockInput;
        const TransactionArgumentTypes = [TransactionBlockInput, (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("GasCoin")
        }), (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("Result"),
          index: (0, _superstruct.integer)()
        }), (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("NestedResult"),
          index: (0, _superstruct.integer)(),
          resultIndex: (0, _superstruct.integer)()
        })];
        const TransactionArgument = (0, _superstruct.union)([...TransactionArgumentTypes]);
        exports.TransactionArgument = TransactionArgument;
        const ObjectTransactionArgument = (0, _superstruct.union)([...TransactionArgumentTypes]);
        exports.ObjectTransactionArgument = ObjectTransactionArgument;
        ObjectTransactionArgument[_utils.TRANSACTION_TYPE] = {
          kind: "object"
        };

        const PureTransactionArgument = type => {
          const struct = (0, _superstruct.union)([...TransactionArgumentTypes]);
          struct[_utils.TRANSACTION_TYPE] = {
            kind: "pure",
            type
          };
          return struct;
        };

        exports.PureTransactionArgument = PureTransactionArgument;
        const MoveCallTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("MoveCall"),
          target: (0, _superstruct.define)("target", (0, _superstruct.string)().validator),
          typeArguments: (0, _superstruct.array)((0, _superstruct.string)()),
          arguments: (0, _superstruct.array)(TransactionArgument)
        });
        exports.MoveCallTransaction = MoveCallTransaction;
        const TransferObjectsTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("TransferObjects"),
          objects: (0, _superstruct.array)(ObjectTransactionArgument),
          address: PureTransactionArgument(_bcs.BCS.ADDRESS)
        });
        exports.TransferObjectsTransaction = TransferObjectsTransaction;
        const SplitCoinsTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("SplitCoins"),
          coin: ObjectTransactionArgument,
          amounts: (0, _superstruct.array)(PureTransactionArgument("u64"))
        });
        exports.SplitCoinsTransaction = SplitCoinsTransaction;
        const MergeCoinsTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("MergeCoins"),
          destination: ObjectTransactionArgument,
          sources: (0, _superstruct.array)(ObjectTransactionArgument)
        });
        exports.MergeCoinsTransaction = MergeCoinsTransaction;
        const MakeMoveVecTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("MakeMoveVec"),
          // TODO: ideally we should use `TypeTag` instead of `record()` here,
          // but TypeTag is recursively defined and it's tricky to define a
          // recursive struct in superstruct
          type: (0, _superstruct.optional)(option((0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.unknown)()))),
          objects: (0, _superstruct.array)(ObjectTransactionArgument)
        });
        exports.MakeMoveVecTransaction = MakeMoveVecTransaction;
        const PublishTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("Publish"),
          modules: (0, _superstruct.array)((0, _superstruct.array)((0, _superstruct.integer)())),
          dependencies: (0, _superstruct.array)(_common.ObjectId)
        });
        exports.PublishTransaction = PublishTransaction;

        var UpgradePolicy = /* @__PURE__ */(UpgradePolicy2 => {
          UpgradePolicy2[UpgradePolicy2["COMPATIBLE"] = 0] = "COMPATIBLE";
          UpgradePolicy2[UpgradePolicy2["ADDITIVE"] = 128] = "ADDITIVE";
          UpgradePolicy2[UpgradePolicy2["DEP_ONLY"] = 192] = "DEP_ONLY";
          return UpgradePolicy2;
        })(UpgradePolicy || {});

        exports.UpgradePolicy = UpgradePolicy;
        const UpgradeTransaction = (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("Upgrade"),
          modules: (0, _superstruct.array)((0, _superstruct.array)((0, _superstruct.integer)())),
          dependencies: (0, _superstruct.array)(_common.ObjectId),
          packageId: _common.ObjectId,
          ticket: ObjectTransactionArgument
        });
        exports.UpgradeTransaction = UpgradeTransaction;
        const TransactionTypes = [MoveCallTransaction, TransferObjectsTransaction, SplitCoinsTransaction, MergeCoinsTransaction, PublishTransaction, UpgradeTransaction, MakeMoveVecTransaction];
        const TransactionType = (0, _superstruct.union)([...TransactionTypes]);
        exports.TransactionType = TransactionType;

        function getTransactionType(data) {
          (0, _superstruct.assert)(data, TransactionType);
          return TransactionTypes.find(schema => (0, _superstruct.is)(data, schema));
        }

        const Transactions = {
          MoveCall(input) {
            return (0, _utils.create)({
              kind: "MoveCall",
              target: input.target,
              arguments: input.arguments ?? [],
              typeArguments: input.typeArguments ?? []
            }, MoveCallTransaction);
          },

          TransferObjects(objects, address) {
            return (0, _utils.create)({
              kind: "TransferObjects",
              objects,
              address
            }, TransferObjectsTransaction);
          },

          SplitCoins(coin, amounts) {
            return (0, _utils.create)({
              kind: "SplitCoins",
              coin,
              amounts
            }, SplitCoinsTransaction);
          },

          MergeCoins(destination, sources) {
            return (0, _utils.create)({
              kind: "MergeCoins",
              destination,
              sources
            }, MergeCoinsTransaction);
          },

          Publish({
            modules,
            dependencies
          }) {
            return (0, _utils.create)({
              kind: "Publish",
              modules: modules.map(module => typeof module === "string" ? Array.from((0, _bcs.fromB64)(module)) : module),
              dependencies: dependencies.map(dep => (0, _common.normalizeSuiObjectId)(dep))
            }, PublishTransaction);
          },

          Upgrade({
            modules,
            dependencies,
            packageId,
            ticket
          }) {
            return (0, _utils.create)({
              kind: "Upgrade",
              modules: modules.map(module => typeof module === "string" ? Array.from((0, _bcs.fromB64)(module)) : module),
              dependencies: dependencies.map(dep => (0, _common.normalizeSuiObjectId)(dep)),
              packageId,
              ticket
            }, UpgradeTransaction);
          },

          MakeMoveVec({
            type,
            objects
          }) {
            return (0, _utils.create)({
              kind: "MakeMoveVec",
              type: type ? {
                Some: _typeTagSerializer.TypeTagSerializer.parseFromStr(type)
              } : {
                None: null
              },
              objects
            }, MakeMoveVecTransaction);
          }

        };
        exports.Transactions = Transactions;
      }, {
        "../signers/txn-data-serializers/type-tag-serializer.js": 41,
        "../types/common.js": 45,
        "./utils.js": 12,
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      9: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.builder = exports.VECTOR = exports.TYPE_TAG = exports.TRANSACTION_INNER = exports.TRANSACTION = exports.PUBLIC_KEY = exports.PROGRAMMABLE_TX_BLOCK = exports.PROGRAMMABLE_CALL_INNER = exports.PROGRAMMABLE_CALL = exports.OPTION = exports.OBJECT_ARG = exports.MULTISIG_PUBLIC_KEY = exports.MULTISIG_PK_MAP = exports.MULTISIG = exports.ENUM_KIND = exports.COMPRESSED_SIGNATURE = exports.CALL_ARG = exports.ARGUMENT_INNER = exports.ARGUMENT = void 0;

        var _bcs = require("@mysten/bcs");

        var _suiBcs = require("../types/sui-bcs.js");

        var _index = require("../types/index.js");

        var _typeTagSerializer = require("../signers/txn-data-serializers/type-tag-serializer.js");

        const ARGUMENT_INNER = "Argument";
        exports.ARGUMENT_INNER = ARGUMENT_INNER;
        const VECTOR = "vector";
        exports.VECTOR = VECTOR;
        const OPTION = "Option";
        exports.OPTION = OPTION;
        const CALL_ARG = "CallArg";
        exports.CALL_ARG = CALL_ARG;
        const TYPE_TAG = "TypeTag";
        exports.TYPE_TAG = TYPE_TAG;
        const OBJECT_ARG = "ObjectArg";
        exports.OBJECT_ARG = OBJECT_ARG;
        const PROGRAMMABLE_TX_BLOCK = "ProgrammableTransaction";
        exports.PROGRAMMABLE_TX_BLOCK = PROGRAMMABLE_TX_BLOCK;
        const PROGRAMMABLE_CALL_INNER = "ProgrammableMoveCall";
        exports.PROGRAMMABLE_CALL_INNER = PROGRAMMABLE_CALL_INNER;
        const TRANSACTION_INNER = "Transaction";
        exports.TRANSACTION_INNER = TRANSACTION_INNER;
        const COMPRESSED_SIGNATURE = "CompressedSignature";
        exports.COMPRESSED_SIGNATURE = COMPRESSED_SIGNATURE;
        const PUBLIC_KEY = "PublicKey";
        exports.PUBLIC_KEY = PUBLIC_KEY;
        const MULTISIG_PUBLIC_KEY = "MultiSigPublicKey";
        exports.MULTISIG_PUBLIC_KEY = MULTISIG_PUBLIC_KEY;
        const MULTISIG_PK_MAP = "MultiSigPkMap";
        exports.MULTISIG_PK_MAP = MULTISIG_PK_MAP;
        const MULTISIG = "MultiSig";
        exports.MULTISIG = MULTISIG;
        const ENUM_KIND = "EnumKind";
        exports.ENUM_KIND = ENUM_KIND;
        const TRANSACTION = [ENUM_KIND, TRANSACTION_INNER];
        exports.TRANSACTION = TRANSACTION;
        const ARGUMENT = [ENUM_KIND, ARGUMENT_INNER];
        exports.ARGUMENT = ARGUMENT;
        const PROGRAMMABLE_CALL = "SimpleProgrammableMoveCall";
        exports.PROGRAMMABLE_CALL = PROGRAMMABLE_CALL;
        const builder = new _bcs.BCS(_suiBcs.bcs);
        exports.builder = builder;
        registerFixedArray(builder, "FixedArray[64]", 64);
        registerFixedArray(builder, "FixedArray[33]", 33);
        registerFixedArray(builder, "FixedArray[32]", 32);
        builder.registerStructType(PROGRAMMABLE_TX_BLOCK, {
          inputs: [VECTOR, CALL_ARG],
          transactions: [VECTOR, TRANSACTION]
        }).registerEnumType(ARGUMENT_INNER, {
          GasCoin: null,
          Input: {
            index: _bcs.BCS.U16
          },
          Result: {
            index: _bcs.BCS.U16
          },
          NestedResult: {
            index: _bcs.BCS.U16,
            resultIndex: _bcs.BCS.U16
          }
        }).registerStructType(PROGRAMMABLE_CALL_INNER, {
          package: _bcs.BCS.ADDRESS,
          module: _bcs.BCS.STRING,
          function: _bcs.BCS.STRING,
          type_arguments: [VECTOR, TYPE_TAG],
          arguments: [VECTOR, ARGUMENT]
        }).registerEnumType(TRANSACTION_INNER, {
          /**
           * A Move Call - any public Move function can be called via
           * this transaction. The results can be used that instant to pass
           * into the next transaction.
           */
          MoveCall: PROGRAMMABLE_CALL,

          /**
           * Transfer vector of objects to a receiver.
           */
          TransferObjects: {
            objects: [VECTOR, ARGUMENT],
            address: ARGUMENT
          },

          /**
           * Split `amount` from a `coin`.
           */
          SplitCoins: {
            coin: ARGUMENT,
            amounts: [VECTOR, ARGUMENT]
          },

          /**
           * Merge Vector of Coins (`sources`) into a `destination`.
           */
          MergeCoins: {
            destination: ARGUMENT,
            sources: [VECTOR, ARGUMENT]
          },

          /**
           * Publish a Move module.
           */
          Publish: {
            modules: [VECTOR, [VECTOR, _bcs.BCS.U8]],
            dependencies: [VECTOR, _bcs.BCS.ADDRESS]
          },

          /**
           * Build a vector of objects using the input arguments.
           * It is impossible to construct a `vector<T: key>` otherwise,
           * so this call serves a utility function.
           */
          MakeMoveVec: {
            type: [OPTION, TYPE_TAG],
            objects: [VECTOR, ARGUMENT]
          },

          /**  */
          Upgrade: {
            modules: [VECTOR, [VECTOR, _bcs.BCS.U8]],
            dependencies: [VECTOR, _bcs.BCS.ADDRESS],
            packageId: _bcs.BCS.ADDRESS,
            ticket: ARGUMENT
          }
        }).registerEnumType(COMPRESSED_SIGNATURE, {
          ED25519: ["FixedArray[64]", "u8"],
          Secp256k1: ["FixedArray[64]", "u8"],
          Secp256r1: ["FixedArray[64]", "u8"]
        }).registerEnumType(PUBLIC_KEY, {
          ED25519: ["FixedArray[32]", "u8"],
          Secp256k1: ["FixedArray[33]", "u8"],
          Secp256r1: ["FixedArray[33]", "u8"]
        }).registerStructType(MULTISIG_PK_MAP, {
          pubKey: PUBLIC_KEY,
          weight: _bcs.BCS.U8
        }).registerStructType(MULTISIG_PUBLIC_KEY, {
          pk_map: [VECTOR, MULTISIG_PK_MAP],
          threshold: _bcs.BCS.U16
        }).registerStructType(MULTISIG, {
          sigs: [VECTOR, COMPRESSED_SIGNATURE],
          bitmap: _bcs.BCS.U16,
          multisig_pk: MULTISIG_PUBLIC_KEY
        });
        builder.registerType([ENUM_KIND, "T"], function encode(writer, data, typeParams, typeMap) {
          const kind = data.kind;
          const invariant = {
            [kind]: data
          };
          const [enumType] = typeParams;
          return this.getTypeInterface(enumType)._encodeRaw.call(this, writer, invariant, typeParams, typeMap);
        }, function decode(reader, typeParams, typeMap) {
          const [enumType] = typeParams;

          const data = this.getTypeInterface(enumType)._decodeRaw.call(this, reader, typeParams, typeMap);

          const kind = Object.keys(data)[0];
          return {
            kind,
            ...data[kind]
          };
        }, data => {
          if (typeof data !== "object" && !("kind" in data)) {
            throw new Error(`EnumKind: Missing property "kind" in the input ${JSON.stringify(data)}`);
          }

          return true;
        });
        builder.registerType(PROGRAMMABLE_CALL, function encodeProgrammableTx(writer, data, typeParams, typeMap) {
          const [pkg, module, fun] = data.target.split("::");
          const type_arguments = data.typeArguments.map(tag => _typeTagSerializer.TypeTagSerializer.parseFromStr(tag, true));
          return this.getTypeInterface(PROGRAMMABLE_CALL_INNER)._encodeRaw.call(this, writer, {
            package: (0, _index.normalizeSuiAddress)(pkg),
            module,
            function: fun,
            type_arguments,
            arguments: data.arguments
          }, typeParams, typeMap);
        }, function decodeProgrammableTx(reader, typeParams, typeMap) {
          let data = builder.getTypeInterface(PROGRAMMABLE_CALL_INNER)._decodeRaw.call(this, reader, typeParams, typeMap);

          return {
            target: [data.package, data.module, data.function].join("::"),
            arguments: data.arguments,
            typeArguments: data.type_arguments.map(_typeTagSerializer.TypeTagSerializer.tagToString)
          };
        }, // Validation callback to error out if the data format is invalid.
        // TODO: make sure TypeTag can be parsed.
        data => {
          return data.target.split("::").length === 3;
        });

        function registerFixedArray(bcs2, name, length) {
          bcs2.registerType(name, function encode2(writer, data, typeParams, typeMap) {
            if (data.length !== length) {
              throw new Error(`Expected fixed array of length ${length}, got ${data.length}`);
            }

            if (typeParams.length !== 1) {
              throw new Error(`Expected one type parameter in a fixed array, got ${typeParams.length}`);
            }

            let [type] = typeof typeParams[0] === "string" ? [typeParams[0], []] : typeParams[0];

            for (let piece of data) {
              this.getTypeInterface(type)._encodeRaw.call(this, writer, piece, typeParams, typeMap);
            }

            return writer;
          }, function decode2(reader, typeParams, typeMap) {
            if (typeParams.length !== 1) {
              throw new Error(`Expected one type parameter in a fixed array, got ${typeParams.length}`);
            }

            let result = [];
            let [type] = typeof typeParams[0] === "string" ? [typeParams[0], []] : typeParams[0];

            for (let i = 0; i < length; i++) {
              result.push(this.getTypeInterface(type)._decodeRaw.call(this, reader, typeParams, typeMap));
            }

            return result;
          });
        }
      }, {
        "../signers/txn-data-serializers/type-tag-serializer.js": 41,
        "../types/index.js": 50,
        "../types/sui-bcs.js": 57,
        "@mysten/bcs": 4
      }],
      10: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _TransactionBlock = require("./TransactionBlock.js");

        Object.keys(_TransactionBlock).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _TransactionBlock[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _TransactionBlock[key];
            }
          });
        });

        var _Transactions = require("./Transactions.js");

        Object.keys(_Transactions).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _Transactions[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _Transactions[key];
            }
          });
        });

        var _Inputs = require("./Inputs.js");

        Object.keys(_Inputs).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _Inputs[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _Inputs[key];
            }
          });
        });

        var _bcs = require("./bcs.js");

        Object.keys(_bcs).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _bcs[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _bcs[key];
            }
          });
        });

        var _serializer = require("./serializer.js");

        Object.keys(_serializer).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _serializer[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _serializer[key];
            }
          });
        });
      }, {
        "./Inputs.js": 5,
        "./TransactionBlock.js": 6,
        "./Transactions.js": 8,
        "./bcs.js": 9,
        "./serializer.js": 11
      }],
      11: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.getPureSerializationType = getPureSerializationType;
        exports.isTxContext = isTxContext;

        var _index = require("../types/index.js");

        const STD_ASCII_MODULE_NAME = "ascii";
        const STD_ASCII_STRUCT_NAME = "String";
        const STD_UTF8_MODULE_NAME = "string";
        const STD_UTF8_STRUCT_NAME = "String";
        const STD_OPTION_MODULE_NAME = "option";
        const STD_OPTION_STRUCT_NAME = "Option";
        const RESOLVED_SUI_ID = {
          address: _index.SUI_FRAMEWORK_ADDRESS,
          module: _index.OBJECT_MODULE_NAME,
          name: _index.ID_STRUCT_NAME
        };
        const RESOLVED_ASCII_STR = {
          address: _index.MOVE_STDLIB_ADDRESS,
          module: STD_ASCII_MODULE_NAME,
          name: STD_ASCII_STRUCT_NAME
        };
        const RESOLVED_UTF8_STR = {
          address: _index.MOVE_STDLIB_ADDRESS,
          module: STD_UTF8_MODULE_NAME,
          name: STD_UTF8_STRUCT_NAME
        };
        const RESOLVED_STD_OPTION = {
          address: _index.MOVE_STDLIB_ADDRESS,
          module: STD_OPTION_MODULE_NAME,
          name: STD_OPTION_STRUCT_NAME
        };

        const isSameStruct = (a, b) => a.address === b.address && a.module === b.module && a.name === b.name;

        function isTxContext(param) {
          const struct = (0, _index.extractStructTag)(param)?.Struct;
          return struct?.address === "0x2" && struct?.module === "tx_context" && struct?.name === "TxContext";
        }

        function expectType(typeName, argVal) {
          if (typeof argVal === "undefined") {
            return;
          }

          if (typeof argVal !== typeName) {
            throw new Error(`Expect ${argVal} to be ${typeName}, received ${typeof argVal}`);
          }
        }

        const allowedTypes = ["Address", "Bool", "U8", "U16", "U32", "U64", "U128", "U256"];

        function getPureSerializationType(normalizedType, argVal) {
          if (typeof normalizedType === "string" && allowedTypes.includes(normalizedType)) {
            if (normalizedType in ["U8", "U16", "U32", "U64", "U128", "U256"]) {
              expectType("number", argVal);
            } else if (normalizedType === "Bool") {
              expectType("boolean", argVal);
            } else if (normalizedType === "Address") {
              expectType("string", argVal);

              if (argVal && !(0, _index.isValidSuiAddress)(argVal)) {
                throw new Error("Invalid Sui Address");
              }
            }

            return normalizedType.toLowerCase();
          } else if (typeof normalizedType === "string") {
            throw new Error(`Unknown pure normalized type ${JSON.stringify(normalizedType, null, 2)}`);
          }

          if ("Vector" in normalizedType) {
            if ((argVal === void 0 || typeof argVal === "string") && normalizedType.Vector === "U8") {
              return "string";
            }

            if (argVal !== void 0 && !Array.isArray(argVal)) {
              throw new Error(`Expect ${argVal} to be a array, received ${typeof argVal}`);
            }

            const innerType = getPureSerializationType(normalizedType.Vector, // undefined when argVal is empty
            argVal ? argVal[0] : void 0);

            if (innerType === void 0) {
              return;
            }

            return `vector<${innerType}>`;
          }

          if ("Struct" in normalizedType) {
            if (isSameStruct(normalizedType.Struct, RESOLVED_ASCII_STR)) {
              return "string";
            } else if (isSameStruct(normalizedType.Struct, RESOLVED_UTF8_STR)) {
              return "utf8string";
            } else if (isSameStruct(normalizedType.Struct, RESOLVED_SUI_ID)) {
              return "address";
            } else if (isSameStruct(normalizedType.Struct, RESOLVED_STD_OPTION)) {
              const optionToVec = {
                Vector: normalizedType.Struct.typeArguments[0]
              };
              return getPureSerializationType(optionToVec, argVal);
            }
          }

          return void 0;
        }
      }, {
        "../types/index.js": 50
      }],
      12: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TRANSACTION_TYPE = void 0;
        exports.create = create;

        var _superstruct = require("superstruct");

        function create(value, struct) {
          return (0, _superstruct.create)(value, struct);
        }

        const TRANSACTION_TYPE = Symbol("transaction-argument-type");
        exports.TRANSACTION_TYPE = TRANSACTION_TYPE;
      }, {
        "superstruct": 120
      }],
      13: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hashTypedData = hashTypedData;

        var _blake2b = require("@noble/hashes/blake2b");

        function hashTypedData(typeTag, data) {
          const typeTagBytes = Array.from(`${typeTag}::`).map(e => e.charCodeAt(0));
          const dataWithTag = new Uint8Array(typeTagBytes.length + data.length);
          dataWithTag.set(typeTagBytes);
          dataWithTag.set(data, typeTagBytes.length);
          return (0, _blake2b.blake2b)(dataWithTag, {
            dkLen: 32
          });
        }
      }, {
        "@noble/hashes/blake2b": 91
      }],
      14: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.PRIVATE_KEY_SIZE = exports.LEGACY_PRIVATE_KEY_SIZE = void 0;
        const PRIVATE_KEY_SIZE = 32;
        exports.PRIVATE_KEY_SIZE = PRIVATE_KEY_SIZE;
        const LEGACY_PRIVATE_KEY_SIZE = 64;
        exports.LEGACY_PRIVATE_KEY_SIZE = LEGACY_PRIVATE_KEY_SIZE;
      }, {}],
      15: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.isValidBIP32Path = isValidBIP32Path;
        exports.isValidHardenedPath = isValidHardenedPath;
        exports.mnemonicToSeed = mnemonicToSeed;
        exports.mnemonicToSeedHex = mnemonicToSeedHex;

        var _bcs = require("@mysten/bcs");

        var _bip = require("@scure/bip39");

        function isValidHardenedPath(path) {
          if (!new RegExp("^m\\/44'\\/784'\\/[0-9]+'\\/[0-9]+'\\/[0-9]+'+$").test(path)) {
            return false;
          }

          return true;
        }

        function isValidBIP32Path(path) {
          if (!new RegExp("^m\\/(54|74)'\\/784'\\/[0-9]+'\\/[0-9]+\\/[0-9]+$").test(path)) {
            return false;
          }

          return true;
        }

        function mnemonicToSeed(mnemonics) {
          return (0, _bip.mnemonicToSeedSync)(mnemonics, "");
        }

        function mnemonicToSeedHex(mnemonics) {
          return (0, _bcs.toHEX)(mnemonicToSeed(mnemonics));
        }
      }, {
        "@mysten/bcs": 4,
        "@scure/bip39": 113
      }],
      16: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.MAX_SIGNER_IN_MULTISIG = void 0;
        exports.combinePartialSigs = combinePartialSigs;
        exports.decodeMultiSig = decodeMultiSig;
        exports.toMultiSigAddress = toMultiSigAddress;

        var _bcs = require("@mysten/bcs");

        var _signature = require("./signature.js");

        var _utils = require("./utils.js");

        var _blake2b = require("@noble/hashes/blake2b");

        var _utils2 = require("@noble/hashes/utils");

        var _index = require("../types/index.js");

        var _publickey = require("../keypairs/ed25519/publickey.js");

        var _publickey2 = require("../keypairs/secp256k1/publickey.js");

        var _publickey3 = require("../keypairs/secp256r1/publickey.js");

        var _bcs2 = require("../builder/bcs.js");

        const MAX_SIGNER_IN_MULTISIG = 10;
        exports.MAX_SIGNER_IN_MULTISIG = MAX_SIGNER_IN_MULTISIG;

        function toMultiSigAddress(pks, threshold) {
          if (pks.length > MAX_SIGNER_IN_MULTISIG) {
            throw new Error(`Max number of signers in a multisig is ${MAX_SIGNER_IN_MULTISIG}`);
          }

          let maxLength = 1 + (64 + 1) * MAX_SIGNER_IN_MULTISIG + 2;
          let tmp = new Uint8Array(maxLength);
          tmp.set([_signature.SIGNATURE_SCHEME_TO_FLAG["MultiSig"]]);
          let arr = to_uint8array(threshold);
          tmp.set(arr, 1);
          let i = 3;

          for (const pk of pks) {
            tmp.set([pk.pubKey.flag()], i);
            tmp.set(pk.pubKey.toBytes(), i + 1);
            tmp.set([pk.weight], i + 1 + pk.pubKey.toBytes().length);
            i += pk.pubKey.toBytes().length + 2;
          }

          return (0, _index.normalizeSuiAddress)((0, _utils2.bytesToHex)((0, _blake2b.blake2b)(tmp.slice(0, i), {
            dkLen: 32
          })));
        }

        function combinePartialSigs(sigs, pks, threshold) {
          let multisig_pk = {
            pk_map: pks.map(x => toPkWeightPair(x)),
            threshold
          };
          let bitmap = 0;
          let compressed_sigs = new Array(sigs.length);

          for (let i = 0; i < sigs.length; i++) {
            let parsed = (0, _utils.toSingleSignaturePubkeyPair)(sigs[i]);
            let bytes2 = Array.from(parsed.signature.map(x => Number(x)));

            if (parsed.signatureScheme === "ED25519") {
              compressed_sigs[i] = {
                ED25519: bytes2
              };
            } else if (parsed.signatureScheme === "Secp256k1") {
              compressed_sigs[i] = {
                Secp256k1: bytes2
              };
            } else if (parsed.signatureScheme === "Secp256r1") {
              compressed_sigs[i] = {
                Secp256r1: bytes2
              };
            }

            for (let j = 0; j < pks.length; j++) {
              if (parsed.pubKey.equals(pks[j].pubKey)) {
                bitmap |= 1 << j;
                break;
              }
            }
          }

          let multisig = {
            sigs: compressed_sigs,
            bitmap,
            multisig_pk
          };

          const bytes = _bcs2.builder.ser("MultiSig", multisig).toBytes();

          let tmp = new Uint8Array(bytes.length + 1);
          tmp.set([_signature.SIGNATURE_SCHEME_TO_FLAG["MultiSig"]]);
          tmp.set(bytes, 1);
          return (0, _bcs.toB64)(tmp);
        }

        function decodeMultiSig(signature) {
          const parsed = (0, _bcs.fromB64)(signature);

          if (parsed.length < 1 || parsed[0] !== _signature.SIGNATURE_SCHEME_TO_FLAG["MultiSig"]) {
            throw new Error("Invalid MultiSig flag");
          }

          const multisig = _bcs2.builder.de("MultiSig", parsed.slice(1));

          let res = new Array(multisig.sigs.length);

          for (let i = 0; i < multisig.sigs.length; i++) {
            let s = multisig.sigs[i];
            let pk_index = as_indices(multisig.bitmap).at(i);
            let pk_bytes = Object.values(multisig.multisig_pk.pk_map[pk_index].pubKey)[0];
            const scheme = Object.keys(s)[0];

            if (scheme === "MultiSig") {
              throw new Error("MultiSig is not supported inside MultiSig");
            }

            const SIGNATURE_SCHEME_TO_PUBLIC_KEY = {
              ED25519: _publickey.Ed25519PublicKey,
              Secp256k1: _publickey2.Secp256k1PublicKey,
              Secp256r1: _publickey3.Secp256r1PublicKey
            };
            const PublicKey = SIGNATURE_SCHEME_TO_PUBLIC_KEY[scheme];
            res[i] = {
              signatureScheme: scheme,
              signature: Uint8Array.from(Object.values(s)[0]),
              pubKey: new PublicKey(pk_bytes)
            };
          }

          return res;
        }

        function toPkWeightPair(pair) {
          let pk_bytes = Array.from(pair.pubKey.toBytes().map(x => Number(x)));

          switch (pair.pubKey.flag()) {
            case _signature.SIGNATURE_SCHEME_TO_FLAG["Secp256k1"]:
              return {
                pubKey: {
                  Secp256k1: pk_bytes
                },
                weight: pair.weight
              };

            case _signature.SIGNATURE_SCHEME_TO_FLAG["Secp256r1"]:
              return {
                pubKey: {
                  Secp256r1: pk_bytes
                },
                weight: pair.weight
              };

            case _signature.SIGNATURE_SCHEME_TO_FLAG["ED25519"]:
              return {
                pubKey: {
                  ED25519: pk_bytes
                },
                weight: pair.weight
              };

            default:
              throw new Error("Unsupported signature scheme");
          }
        }

        function to_uint8array(threshold) {
          if (threshold < 0 || threshold > 65535) {
            throw new Error("Invalid threshold");
          }

          let arr = new Uint8Array(2);
          arr[0] = threshold & 255;
          arr[1] = threshold >> 8;
          return arr;
        }

        function as_indices(bitmap) {
          if (bitmap < 0 || bitmap > 1024) {
            throw new Error("Invalid bitmap");
          }

          let res = [];

          for (let i = 0; i < 10; i++) {
            if ((bitmap & 1 << i) !== 0) {
              res.push(i);
            }
          }

          return Uint8Array.from(res);
        }
      }, {
        "../builder/bcs.js": 9,
        "../keypairs/ed25519/publickey.js": 26,
        "../keypairs/secp256k1/publickey.js": 29,
        "../keypairs/secp256r1/publickey.js": 32,
        "../types/index.js": 50,
        "./signature.js": 18,
        "./utils.js": 19,
        "@mysten/bcs": 4,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/utils": 98
      }],
      17: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.bytesEqual = bytesEqual;

        function bytesEqual(a, b) {
          if (a === b) return true;

          if (a.length !== b.length) {
            return false;
          }

          for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
              return false;
            }
          }

          return true;
        }
      }, {}],
      18: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SIGNATURE_SCHEME_TO_FLAG = exports.SIGNATURE_FLAG_TO_SCHEME = void 0;
        const SIGNATURE_SCHEME_TO_FLAG = {
          ED25519: 0,
          Secp256k1: 1,
          Secp256r1: 2,
          MultiSig: 3
        };
        exports.SIGNATURE_SCHEME_TO_FLAG = SIGNATURE_SCHEME_TO_FLAG;
        const SIGNATURE_FLAG_TO_SCHEME = {
          0: "ED25519",
          1: "Secp256k1",
          2: "Secp256r1",
          3: "MultiSig"
        };
        exports.SIGNATURE_FLAG_TO_SCHEME = SIGNATURE_FLAG_TO_SCHEME;
      }, {}],
      19: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.fromExportedKeypair = fromExportedKeypair;
        exports.publicKeyFromSerialized = publicKeyFromSerialized;
        exports.toParsedSignaturePubkeyPair = toParsedSignaturePubkeyPair;
        exports.toSerializedSignature = toSerializedSignature;
        exports.toSingleSignaturePubkeyPair = toSingleSignaturePubkeyPair;

        var _bcs = require("@mysten/bcs");

        var _signature = require("./signature.js");

        var _publickey = require("../keypairs/secp256r1/publickey.js");

        var _publickey2 = require("../keypairs/secp256k1/publickey.js");

        var _publickey3 = require("../keypairs/ed25519/publickey.js");

        var _multisig = require("./multisig.js");

        var _keypair = require("../keypairs/ed25519/keypair.js");

        var _keypair2 = require("../keypairs/secp256k1/keypair.js");

        var _keypair3 = require("./keypair.js");

        function toSerializedSignature({
          signature,
          signatureScheme,
          pubKey
        }) {
          const serializedSignature = new Uint8Array(1 + signature.length + pubKey.toBytes().length);
          serializedSignature.set([_signature.SIGNATURE_SCHEME_TO_FLAG[signatureScheme]]);
          serializedSignature.set(signature, 1);
          serializedSignature.set(pubKey.toBytes(), 1 + signature.length);
          return (0, _bcs.toB64)(serializedSignature);
        }

        function toParsedSignaturePubkeyPair(serializedSignature) {
          const bytes = (0, _bcs.fromB64)(serializedSignature);
          const signatureScheme = _signature.SIGNATURE_FLAG_TO_SCHEME[bytes[0]];

          if (signatureScheme === "MultiSig") {
            try {
              return (0, _multisig.decodeMultiSig)(serializedSignature);
            } catch (e) {
              throw new Error("legacy multisig viewing unsupported");
            }
          }

          const SIGNATURE_SCHEME_TO_PUBLIC_KEY = {
            ED25519: _publickey3.Ed25519PublicKey,
            Secp256k1: _publickey2.Secp256k1PublicKey,
            Secp256r1: _publickey.Secp256r1PublicKey
          };
          const PublicKey = SIGNATURE_SCHEME_TO_PUBLIC_KEY[signatureScheme];
          const signature = bytes.slice(1, bytes.length - PublicKey.SIZE);
          const pubkeyBytes = bytes.slice(1 + signature.length);
          const pubKey = new PublicKey(pubkeyBytes);
          return [{
            signatureScheme,
            signature,
            pubKey
          }];
        }

        function toSingleSignaturePubkeyPair(serializedSignature) {
          const res = toParsedSignaturePubkeyPair(serializedSignature);

          if (res.length !== 1) {
            throw Error("Expected a single signature");
          }

          return res[0];
        }

        function publicKeyFromSerialized(schema, pubKey) {
          if (schema === "ED25519") {
            return new _publickey3.Ed25519PublicKey(pubKey);
          }

          if (schema === "Secp256k1") {
            return new _publickey2.Secp256k1PublicKey(pubKey);
          }

          throw new Error("Unknown public key schema");
        }

        function fromExportedKeypair(keypair) {
          const secretKey = (0, _bcs.fromB64)(keypair.privateKey);

          switch (keypair.schema) {
            case "ED25519":
              let pureSecretKey = secretKey;

              if (secretKey.length === _keypair3.LEGACY_PRIVATE_KEY_SIZE) {
                pureSecretKey = secretKey.slice(0, _keypair3.PRIVATE_KEY_SIZE);
              }

              return _keypair.Ed25519Keypair.fromSecretKey(pureSecretKey);

            case "Secp256k1":
              return _keypair2.Secp256k1Keypair.fromSecretKey(secretKey);

            default:
              throw new Error(`Invalid keypair schema ${keypair.schema}`);
          }
        }
      }, {
        "../keypairs/ed25519/keypair.js": 25,
        "../keypairs/ed25519/publickey.js": 26,
        "../keypairs/secp256k1/keypair.js": 28,
        "../keypairs/secp256k1/publickey.js": 29,
        "../keypairs/secp256r1/publickey.js": 32,
        "./keypair.js": 14,
        "./multisig.js": 16,
        "./signature.js": 18,
        "@mysten/bcs": 4
      }],
      20: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.VALIDATORS_EVENTS_QUERY = exports.UID_STRUCT_NAME = exports.SUI_TYPE_ARG = exports.SUI_SYSTEM_ADDRESS = exports.SUI_FRAMEWORK_ADDRESS = exports.SUI_CLOCK_OBJECT_ID = exports.PAY_SPLIT_COIN_VEC_FUNC_NAME = exports.PAY_MODULE_NAME = exports.PAY_JOIN_COIN_FUNC_NAME = exports.OBJECT_MODULE_NAME = exports.MOVE_STDLIB_ADDRESS = exports.ID_STRUCT_NAME = exports.Delegation = exports.CoinMetadataStruct = exports.Coin = exports.COIN_TYPE_ARG_REGEX = void 0;
        exports.isObjectDataFull = isObjectDataFull;

        var _objects = require("../types/objects.js");

        var _common = require("../types/common.js");

        var _option = require("../types/option.js");

        var _superstruct = require("superstruct");

        const SUI_SYSTEM_ADDRESS = "0x3";
        exports.SUI_SYSTEM_ADDRESS = SUI_SYSTEM_ADDRESS;
        const SUI_FRAMEWORK_ADDRESS = "0x2";
        exports.SUI_FRAMEWORK_ADDRESS = SUI_FRAMEWORK_ADDRESS;
        const MOVE_STDLIB_ADDRESS = "0x1";
        exports.MOVE_STDLIB_ADDRESS = MOVE_STDLIB_ADDRESS;
        const OBJECT_MODULE_NAME = "object";
        exports.OBJECT_MODULE_NAME = OBJECT_MODULE_NAME;
        const UID_STRUCT_NAME = "UID";
        exports.UID_STRUCT_NAME = UID_STRUCT_NAME;
        const ID_STRUCT_NAME = "ID";
        exports.ID_STRUCT_NAME = ID_STRUCT_NAME;
        const SUI_TYPE_ARG = `${SUI_FRAMEWORK_ADDRESS}::sui::SUI`;
        exports.SUI_TYPE_ARG = SUI_TYPE_ARG;
        const VALIDATORS_EVENTS_QUERY = "0x3::validator_set::ValidatorEpochInfoEventV2";
        exports.VALIDATORS_EVENTS_QUERY = VALIDATORS_EVENTS_QUERY;
        const SUI_CLOCK_OBJECT_ID = (0, _common.normalizeSuiObjectId)("0x6");
        exports.SUI_CLOCK_OBJECT_ID = SUI_CLOCK_OBJECT_ID;
        const PAY_MODULE_NAME = "pay";
        exports.PAY_MODULE_NAME = PAY_MODULE_NAME;
        const PAY_SPLIT_COIN_VEC_FUNC_NAME = "split_vec";
        exports.PAY_SPLIT_COIN_VEC_FUNC_NAME = PAY_SPLIT_COIN_VEC_FUNC_NAME;
        const PAY_JOIN_COIN_FUNC_NAME = "join";
        exports.PAY_JOIN_COIN_FUNC_NAME = PAY_JOIN_COIN_FUNC_NAME;
        const COIN_TYPE_ARG_REGEX = /^0x2::coin::Coin<(.+)>$/;
        exports.COIN_TYPE_ARG_REGEX = COIN_TYPE_ARG_REGEX;

        function isObjectDataFull(resp) {
          return !!resp.data || !!resp.type;
        }

        const CoinMetadataStruct = (0, _superstruct.object)({
          decimals: (0, _superstruct.number)(),
          name: (0, _superstruct.string)(),
          symbol: (0, _superstruct.string)(),
          description: (0, _superstruct.string)(),
          iconUrl: (0, _superstruct.nullable)((0, _superstruct.string)()),
          id: (0, _superstruct.nullable)(_common.ObjectId)
        });
        exports.CoinMetadataStruct = CoinMetadataStruct;

        class Coin {
          static isCoin(data) {
            return Coin.getType(data)?.match(COIN_TYPE_ARG_REGEX) != null;
          }

          static getCoinType(type) {
            const [, res] = type.match(COIN_TYPE_ARG_REGEX) ?? [];
            return res || null;
          }

          static getCoinTypeArg(obj) {
            const type = Coin.getType(obj);
            return type ? Coin.getCoinType(type) : null;
          }

          static isSUI(obj) {
            const arg = Coin.getCoinTypeArg(obj);
            return arg ? Coin.getCoinSymbol(arg) === "SUI" : false;
          }

          static getCoinSymbol(coinTypeArg) {
            return coinTypeArg.substring(coinTypeArg.lastIndexOf(":") + 1);
          }

          static getCoinStructTag(coinTypeArg) {
            return {
              address: (0, _common.normalizeSuiObjectId)(coinTypeArg.split("::")[0]),
              module: coinTypeArg.split("::")[1],
              name: coinTypeArg.split("::")[2],
              typeParams: []
            };
          }

          static getID(obj) {
            if ("fields" in obj) {
              return obj.fields.id.id;
            }

            return (0, _objects.getObjectId)(obj);
          }

          static totalBalance(coins) {
            return coins.reduce((partialSum, c) => partialSum + Coin.getBalanceFromCoinStruct(c), BigInt(0));
          }
          /**
           * Sort coin by balance in an ascending order
           */


          static sortByBalance(coins) {
            return [...coins].sort((a, b) => Coin.getBalanceFromCoinStruct(a) < Coin.getBalanceFromCoinStruct(b) ? -1 : Coin.getBalanceFromCoinStruct(a) > Coin.getBalanceFromCoinStruct(b) ? 1 : 0);
          }

          static getBalanceFromCoinStruct(coin) {
            return BigInt(coin.balance);
          }

          static getBalance(data) {
            if (!Coin.isCoin(data)) {
              return void 0;
            }

            const balance = (0, _objects.getObjectFields)(data)?.balance;
            return BigInt(balance);
          }

          static getType(data) {
            if (isObjectDataFull(data)) {
              return (0, _objects.getObjectType)(data);
            }

            return data.type;
          }

        }

        exports.Coin = Coin;

        const _Delegation = class _Delegation {
          static isDelegationSuiObject(obj) {
            return "type" in obj && obj.type === _Delegation.SUI_OBJECT_TYPE;
          }

          constructor(obj) {
            this.suiObject = obj;
          }

          nextRewardUnclaimedEpoch() {
            return this.suiObject.data.fields.next_reward_unclaimed_epoch;
          }

          activeDelegation() {
            return BigInt((0, _option.getOption)(this.suiObject.data.fields.active_delegation) || 0);
          }

          delegateAmount() {
            return this.suiObject.data.fields.delegate_amount;
          }

          endingEpoch() {
            return (0, _option.getOption)(this.suiObject.data.fields.ending_epoch);
          }

          validatorAddress() {
            return this.suiObject.data.fields.validator_address;
          }

          isActive() {
            return this.activeDelegation() > 0 && !this.endingEpoch();
          }

          hasUnclaimedRewards(epoch) {
            return this.nextRewardUnclaimedEpoch() <= epoch && (this.isActive() || (this.endingEpoch() || 0) > epoch);
          }

        };

        _Delegation.SUI_OBJECT_TYPE = "0x2::delegation::Delegation";
        let Delegation = _Delegation;
        exports.Delegation = Delegation;
      }, {
        "../types/common.js": 45,
        "../types/objects.js": 54,
        "../types/option.js": 55,
        "superstruct": 120
      }],
      21: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _framework = require("./framework.js");

        Object.keys(_framework).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _framework[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _framework[key];
            }
          });
        });

        var _suiSystemState = require("./sui-system-state.js");

        Object.keys(_suiSystemState).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _suiSystemState[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _suiSystemState[key];
            }
          });
        });
      }, {
        "./framework.js": 20,
        "./sui-system-state.js": 22
      }],
      22: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.WITHDRAW_STAKE_FUN_NAME = exports.SuiSystemStateUtil = exports.SUI_SYSTEM_STATE_OBJECT_ID = exports.SUI_SYSTEM_MODULE_NAME = exports.ADD_STAKE_LOCKED_COIN_FUN_NAME = exports.ADD_STAKE_FUN_NAME = void 0;

        var _index = require("../builder/index.js");

        var _index2 = require("../types/index.js");

        const SUI_SYSTEM_STATE_OBJECT_ID = (0, _index2.normalizeSuiObjectId)("0x5");
        exports.SUI_SYSTEM_STATE_OBJECT_ID = SUI_SYSTEM_STATE_OBJECT_ID;
        const SUI_SYSTEM_MODULE_NAME = "sui_system";
        exports.SUI_SYSTEM_MODULE_NAME = SUI_SYSTEM_MODULE_NAME;
        const ADD_STAKE_FUN_NAME = "request_add_stake";
        exports.ADD_STAKE_FUN_NAME = ADD_STAKE_FUN_NAME;
        const ADD_STAKE_LOCKED_COIN_FUN_NAME = "request_add_stake_with_locked_coin";
        exports.ADD_STAKE_LOCKED_COIN_FUN_NAME = ADD_STAKE_LOCKED_COIN_FUN_NAME;
        const WITHDRAW_STAKE_FUN_NAME = "request_withdraw_stake";
        exports.WITHDRAW_STAKE_FUN_NAME = WITHDRAW_STAKE_FUN_NAME;

        class SuiSystemStateUtil {
          /**
           * Create a new transaction for staking coins ready to be signed and executed with `signer-and-provider`.
           *
           * @param coins the coins to be staked
           * @param amount the amount to stake
           * @param gasBudget omittable only for DevInspect mode
           */
          static async newRequestAddStakeTxn(provider, coins, amount, validatorAddress) {
            const tx = new _index.TransactionBlock();
            const coin = tx.splitCoins(tx.gas, [tx.pure(amount)]);
            tx.moveCall({
              target: `${_index2.SUI_SYSTEM_ADDRESS}::${SUI_SYSTEM_MODULE_NAME}::${ADD_STAKE_FUN_NAME}`,
              arguments: [tx.object(SUI_SYSTEM_STATE_OBJECT_ID), coin, tx.pure(validatorAddress)]
            });
            const coinObjects = await provider.multiGetObjects({
              ids: coins,
              options: {
                showOwner: true
              }
            });
            tx.setGasPayment(coinObjects.map(obj => (0, _index2.getObjectReference)(obj)));
            return tx;
          }
          /**
           * Create a new transaction for withdrawing coins ready to be signed and
           * executed with `signer-and-provider`.
           *
           * @param stake the stake object created in the requestAddStake txn
           * @param stakedCoinId the coins to withdraw
           * @param gasBudget omittable only for DevInspect mode
           */


          static async newRequestWithdrawlStakeTxn(stake, stakedCoinId) {
            const tx = new _index.TransactionBlock();
            tx.moveCall({
              target: `${_index2.SUI_SYSTEM_ADDRESS}::${SUI_SYSTEM_MODULE_NAME}::${WITHDRAW_STAKE_FUN_NAME}`,
              arguments: [tx.object(SUI_SYSTEM_STATE_OBJECT_ID), tx.object(stake), tx.object(stakedCoinId)]
            });
            return tx;
          }

        }

        exports.SuiSystemStateUtil = SuiSystemStateUtil;
      }, {
        "../builder/index.js": 10,
        "../types/index.js": 50
      }],
      23: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        var _exportNames = {
          fromB64: true,
          toB64: true,
          is: true,
          assert: true
        };
        Object.defineProperty(exports, "assert", {
          enumerable: true,
          get: function () {
            return _superstruct.assert;
          }
        });
        Object.defineProperty(exports, "fromB64", {
          enumerable: true,
          get: function () {
            return _bcs.fromB64;
          }
        });
        Object.defineProperty(exports, "is", {
          enumerable: true,
          get: function () {
            return _superstruct.is;
          }
        });
        Object.defineProperty(exports, "toB64", {
          enumerable: true,
          get: function () {
            return _bcs.toB64;
          }
        });

        var _index = require("./keypairs/ed25519/index.js");

        Object.keys(_index).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index[key];
            }
          });
        });

        var _index2 = require("./keypairs/secp256k1/index.js");

        Object.keys(_index2).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index2[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index2[key];
            }
          });
        });

        var _index3 = require("./keypairs/secp256r1/index.js");

        Object.keys(_index3).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index3[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index3[key];
            }
          });
        });

        var _keypair = require("./cryptography/keypair.js");

        Object.keys(_keypair).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _keypair[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _keypair[key];
            }
          });
        });

        var _multisig = require("./cryptography/multisig.js");

        Object.keys(_multisig).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _multisig[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _multisig[key];
            }
          });
        });

        var _publickey = require("./cryptography/publickey.js");

        Object.keys(_publickey).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _publickey[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _publickey[key];
            }
          });
        });

        var _mnemonics = require("./cryptography/mnemonics.js");

        Object.keys(_mnemonics).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _mnemonics[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _mnemonics[key];
            }
          });
        });

        var _signature = require("./cryptography/signature.js");

        Object.keys(_signature).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _signature[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _signature[key];
            }
          });
        });

        var _utils = require("./cryptography/utils.js");

        Object.keys(_utils).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _utils[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _utils[key];
            }
          });
        });

        var _jsonRpcProvider = require("./providers/json-rpc-provider.js");

        Object.keys(_jsonRpcProvider).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _jsonRpcProvider[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _jsonRpcProvider[key];
            }
          });
        });

        var _client = require("./rpc/client.js");

        Object.keys(_client).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _client[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _client[key];
            }
          });
        });

        var _faucetClient = require("./rpc/faucet-client.js");

        Object.keys(_faucetClient).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _faucetClient[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _faucetClient[key];
            }
          });
        });

        var _websocketClient = require("./rpc/websocket-client.js");

        Object.keys(_websocketClient).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _websocketClient[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _websocketClient[key];
            }
          });
        });

        var _connection = require("./rpc/connection.js");

        Object.keys(_connection).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _connection[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _connection[key];
            }
          });
        });

        var _typeTagSerializer = require("./signers/txn-data-serializers/type-tag-serializer.js");

        Object.keys(_typeTagSerializer).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _typeTagSerializer[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _typeTagSerializer[key];
            }
          });
        });

        var _signer = require("./signers/signer.js");

        Object.keys(_signer).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _signer[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _signer[key];
            }
          });
        });

        var _rawSigner = require("./signers/raw-signer.js");

        Object.keys(_rawSigner).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _rawSigner[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _rawSigner[key];
            }
          });
        });

        var _signerWithProvider = require("./signers/signer-with-provider.js");

        Object.keys(_signerWithProvider).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _signerWithProvider[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _signerWithProvider[key];
            }
          });
        });

        var _types = require("./signers/types.js");

        Object.keys(_types).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _types[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _types[key];
            }
          });
        });

        var _index4 = require("./types/index.js");

        Object.keys(_index4).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index4[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index4[key];
            }
          });
        });

        var _format = require("./utils/format.js");

        Object.keys(_format).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _format[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _format[key];
            }
          });
        });

        var _intent = require("./utils/intent.js");

        Object.keys(_intent).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _intent[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _intent[key];
            }
          });
        });

        var _verify = require("./utils/verify.js");

        Object.keys(_verify).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _verify[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _verify[key];
            }
          });
        });

        var _errors = require("./utils/errors.js");

        Object.keys(_errors).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _errors[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _errors[key];
            }
          });
        });

        var _index5 = require("./framework/index.js");

        Object.keys(_index5).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index5[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index5[key];
            }
          });
        });

        var _index6 = require("./builder/index.js");

        Object.keys(_index6).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _index6[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _index6[key];
            }
          });
        });

        var _bcs = require("@mysten/bcs");

        var _superstruct = require("superstruct");
      }, {
        "./builder/index.js": 10,
        "./cryptography/keypair.js": 14,
        "./cryptography/mnemonics.js": 15,
        "./cryptography/multisig.js": 16,
        "./cryptography/publickey.js": 17,
        "./cryptography/signature.js": 18,
        "./cryptography/utils.js": 19,
        "./framework/index.js": 21,
        "./keypairs/ed25519/index.js": 24,
        "./keypairs/secp256k1/index.js": 27,
        "./keypairs/secp256r1/index.js": 30,
        "./providers/json-rpc-provider.js": 33,
        "./rpc/client.js": 34,
        "./rpc/connection.js": 35,
        "./rpc/faucet-client.js": 36,
        "./rpc/websocket-client.js": 37,
        "./signers/raw-signer.js": 38,
        "./signers/signer-with-provider.js": 39,
        "./signers/signer.js": 40,
        "./signers/txn-data-serializers/type-tag-serializer.js": 41,
        "./signers/types.js": 42,
        "./types/index.js": 50,
        "./utils/errors.js": 61,
        "./utils/format.js": 62,
        "./utils/intent.js": 63,
        "./utils/verify.js": 64,
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      24: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _keypair = require("./keypair.js");

        Object.keys(_keypair).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _keypair[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _keypair[key];
            }
          });
        });

        var _publickey = require("./publickey.js");

        Object.keys(_publickey).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _publickey[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _publickey[key];
            }
          });
        });
      }, {
        "./keypair.js": 25,
        "./publickey.js": 26
      }],
      25: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Ed25519Keypair = exports.DEFAULT_ED25519_DERIVATION_PATH = void 0;

        var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

        var _publickey = require("./publickey.js");

        var _mnemonics = require("../../cryptography/mnemonics.js");

        var _ed25519HdKey = require("../../utils/ed25519-hd-key.js");

        var _bcs = require("@mysten/bcs");

        var _keypair = require("../../cryptography/keypair.js");

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : {
            default: obj
          };
        }

        const DEFAULT_ED25519_DERIVATION_PATH = "m/44'/784'/0'/0'/0'";
        exports.DEFAULT_ED25519_DERIVATION_PATH = DEFAULT_ED25519_DERIVATION_PATH;

        class Ed25519Keypair {
          /**
           * Create a new Ed25519 keypair instance.
           * Generate random keypair if no {@link Ed25519Keypair} is provided.
           *
           * @param keypair Ed25519 keypair
           */
          constructor(keypair) {
            if (keypair) {
              this.keypair = keypair;
            } else {
              this.keypair = _tweetnacl.default.sign.keyPair();
            }
          }
          /**
           * Get the key scheme of the keypair ED25519
           */


          getKeyScheme() {
            return "ED25519";
          }
          /**
           * Generate a new random Ed25519 keypair
           */


          static generate() {
            return new Ed25519Keypair(_tweetnacl.default.sign.keyPair());
          }
          /**
           * Create a Ed25519 keypair from a raw secret key byte array, also known as seed.
           * This is NOT the private scalar which is result of hashing and bit clamping of
           * the raw secret key.
           *
           * The sui.keystore key is a list of Base64 encoded `flag || privkey`. To import
           * a key from sui.keystore to typescript, decode from base64 and remove the first
           * flag byte after checking it is indeed the Ed25519 scheme flag 0x00 (See more
           * on flag for signature scheme: https://github.com/MystenLabs/sui/blob/818406c5abdf7de1b80915a0519071eec3a5b1c7/crates/sui-types/src/crypto.rs#L1650):
           * ```
           * import { Ed25519Keypair, fromB64 } from '@mysten/sui.js';
           * const raw = fromB64(t[1]);
           * if (raw[0] !== 0 || raw.length !== PRIVATE_KEY_SIZE + 1) {
           *   throw new Error('invalid key');
           * }
           * const imported = Ed25519Keypair.fromSecretKey(raw.slice(1))
           * ```
           * @throws error if the provided secret key is invalid and validation is not skipped.
           *
           * @param secretKey secret key byte array
           * @param options: skip secret key validation
           */


          static fromSecretKey(secretKey, options) {
            const secretKeyLength = secretKey.length;

            if (secretKeyLength !== _keypair.PRIVATE_KEY_SIZE) {
              throw new Error(`Wrong secretKey size. Expected ${_keypair.PRIVATE_KEY_SIZE} bytes, got ${secretKeyLength}.`);
            }

            const keypair = _tweetnacl.default.sign.keyPair.fromSeed(secretKey);

            if (!options || !options.skipValidation) {
              const encoder = new TextEncoder();
              const signData = encoder.encode("sui validation");

              const signature = _tweetnacl.default.sign.detached(signData, keypair.secretKey);

              if (!_tweetnacl.default.sign.detached.verify(signData, signature, keypair.publicKey)) {
                throw new Error("provided secretKey is invalid");
              }
            }

            return new Ed25519Keypair(keypair);
          }
          /**
           * The public key for this Ed25519 keypair
           */


          getPublicKey() {
            return new _publickey.Ed25519PublicKey(this.keypair.publicKey);
          }
          /**
           * Return the signature for the provided data using Ed25519.
           */


          signData(data) {
            return _tweetnacl.default.sign.detached(data, this.keypair.secretKey);
          }
          /**
           * Derive Ed25519 keypair from mnemonics and path. The mnemonics must be normalized
           * and validated against the english wordlist.
           *
           * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
           * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
           */


          static deriveKeypair(mnemonics, path) {
            if (path == null) {
              path = DEFAULT_ED25519_DERIVATION_PATH;
            }

            if (!(0, _mnemonics.isValidHardenedPath)(path)) {
              throw new Error("Invalid derivation path");
            }

            const {
              key
            } = (0, _ed25519HdKey.derivePath)(path, (0, _mnemonics.mnemonicToSeedHex)(mnemonics));
            return Ed25519Keypair.fromSecretKey(key);
          }
          /**
           * Derive Ed25519 keypair from mnemonicSeed and path.
           *
           * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
           * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
           */


          static deriveKeypairFromSeed(seedHex, path) {
            if (path == null) {
              path = DEFAULT_ED25519_DERIVATION_PATH;
            }

            if (!(0, _mnemonics.isValidHardenedPath)(path)) {
              throw new Error("Invalid derivation path");
            }

            const {
              key
            } = (0, _ed25519HdKey.derivePath)(path, seedHex);
            return Ed25519Keypair.fromSecretKey(key);
          }
          /**
           * This returns an exported keypair object, the private key field is the pure 32-byte seed.
           */


          export() {
            return {
              schema: "ED25519",
              privateKey: (0, _bcs.toB64)(this.keypair.secretKey.slice(0, _keypair.PRIVATE_KEY_SIZE))
            };
          }

        }

        exports.Ed25519Keypair = Ed25519Keypair;
      }, {
        "../../cryptography/keypair.js": 14,
        "../../cryptography/mnemonics.js": 15,
        "../../utils/ed25519-hd-key.js": 60,
        "./publickey.js": 26,
        "@mysten/bcs": 4,
        "tweetnacl": 123
      }],
      26: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Ed25519PublicKey = void 0;

        var _blake2b = require("@noble/hashes/blake2b");

        var _bcs = require("@mysten/bcs");

        var _publickey = require("../../cryptography/publickey.js");

        var _signature = require("../../cryptography/signature.js");

        var _index = require("../../types/index.js");

        var _utils = require("@noble/hashes/utils");

        const PUBLIC_KEY_SIZE = 32;

        class Ed25519PublicKey {
          /**
           * Create a new Ed25519PublicKey object
           * @param value ed25519 public key as buffer or base-64 encoded string
           */
          constructor(value) {
            if (typeof value === "string") {
              this.data = (0, _bcs.fromB64)(value);
            } else if (value instanceof Uint8Array) {
              this.data = value;
            } else {
              this.data = Uint8Array.from(value);
            }

            if (this.data.length !== PUBLIC_KEY_SIZE) {
              throw new Error(`Invalid public key input. Expected ${PUBLIC_KEY_SIZE} bytes, got ${this.data.length}`);
            }
          }
          /**
           * Checks if two Ed25519 public keys are equal
           */


          equals(publicKey) {
            return (0, _publickey.bytesEqual)(this.toBytes(), publicKey.toBytes());
          }
          /**
           * Return the base-64 representation of the Ed25519 public key
           */


          toBase64() {
            return (0, _bcs.toB64)(this.toBytes());
          }
          /**
           * Return the byte array representation of the Ed25519 public key
           */


          toBytes() {
            return this.data;
          }
          /**
           * Return the base-64 representation of the Ed25519 public key
           */


          toString() {
            return this.toBase64();
          }
          /**
           * Return the Sui address associated with this Ed25519 public key
           */


          toSuiAddress() {
            let tmp = new Uint8Array(PUBLIC_KEY_SIZE + 1);
            tmp.set([_signature.SIGNATURE_SCHEME_TO_FLAG["ED25519"]]);
            tmp.set(this.toBytes(), 1);
            return (0, _index.normalizeSuiAddress)((0, _utils.bytesToHex)((0, _blake2b.blake2b)(tmp, {
              dkLen: 32
            })).slice(0, _index.SUI_ADDRESS_LENGTH * 2));
          }
          /**
           * Return the Sui address associated with this Ed25519 public key
           */


          flag() {
            return _signature.SIGNATURE_SCHEME_TO_FLAG["ED25519"];
          }

        }

        exports.Ed25519PublicKey = Ed25519PublicKey;
        Ed25519PublicKey.SIZE = PUBLIC_KEY_SIZE;
      }, {
        "../../cryptography/publickey.js": 17,
        "../../cryptography/signature.js": 18,
        "../../types/index.js": 50,
        "@mysten/bcs": 4,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/utils": 98
      }],
      27: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _keypair = require("./keypair.js");

        Object.keys(_keypair).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _keypair[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _keypair[key];
            }
          });
        });

        var _publickey = require("./publickey.js");

        Object.keys(_publickey).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _publickey[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _publickey[key];
            }
          });
        });
      }, {
        "./keypair.js": 28,
        "./publickey.js": 29
      }],
      28: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Secp256k1Keypair = exports.DEFAULT_SECP256K1_DERIVATION_PATH = void 0;

        var _sha = require("@noble/hashes/sha256");

        var _publickey = require("./publickey.js");

        var _secp256k = require("@noble/curves/secp256k1");

        var _mnemonics = require("../../cryptography/mnemonics.js");

        var _bip = require("@scure/bip32");

        var _bcs = require("@mysten/bcs");

        var _utils = require("@noble/hashes/utils");

        var _blake2b = require("@noble/hashes/blake2b");

        const DEFAULT_SECP256K1_DERIVATION_PATH = "m/54'/784'/0'/0/0";
        exports.DEFAULT_SECP256K1_DERIVATION_PATH = DEFAULT_SECP256K1_DERIVATION_PATH;

        class Secp256k1Keypair {
          /**
           * Create a new keypair instance.
           * Generate random keypair if no {@link Secp256k1Keypair} is provided.
           *
           * @param keypair secp256k1 keypair
           */
          constructor(keypair) {
            if (keypair) {
              this.keypair = keypair;
            } else {
              const secretKey = _secp256k.secp256k1.utils.randomPrivateKey();

              const publicKey = _secp256k.secp256k1.getPublicKey(secretKey, true);

              this.keypair = {
                publicKey,
                secretKey
              };
            }
          }
          /**
           * Get the key scheme of the keypair Secp256k1
           */


          getKeyScheme() {
            return "Secp256k1";
          }
          /**
           * Generate a new random keypair
           */


          static generate() {
            return new Secp256k1Keypair();
          }
          /**
           * Create a keypair from a raw secret key byte array.
           *
           * This method should only be used to recreate a keypair from a previously
           * generated secret key. Generating keypairs from a random seed should be done
           * with the {@link Keypair.fromSeed} method.
           *
           * @throws error if the provided secret key is invalid and validation is not skipped.
           *
           * @param secretKey secret key byte array
           * @param options: skip secret key validation
           */


          static fromSecretKey(secretKey, options) {
            const publicKey = _secp256k.secp256k1.getPublicKey(secretKey, true);

            if (!options || !options.skipValidation) {
              const encoder = new TextEncoder();
              const signData = encoder.encode("sui validation");
              const msgHash = (0, _utils.bytesToHex)((0, _blake2b.blake2b)(signData, {
                dkLen: 32
              }));

              const signature = _secp256k.secp256k1.sign(msgHash, secretKey);

              if (!_secp256k.secp256k1.verify(signature, msgHash, publicKey, {
                lowS: true
              })) {
                throw new Error("Provided secretKey is invalid");
              }
            }

            return new Secp256k1Keypair({
              publicKey,
              secretKey
            });
          }
          /**
           * Generate a keypair from a 32 byte seed.
           *
           * @param seed seed byte array
           */


          static fromSeed(seed) {
            let publicKey = _secp256k.secp256k1.getPublicKey(seed, true);

            return new Secp256k1Keypair({
              publicKey,
              secretKey: seed
            });
          }
          /**
           * The public key for this keypair
           */


          getPublicKey() {
            return new _publickey.Secp256k1PublicKey(this.keypair.publicKey);
          }
          /**
           * Return the signature for the provided data.
           */


          signData(data) {
            const msgHash = (0, _sha.sha256)(data);

            const sig = _secp256k.secp256k1.sign(msgHash, this.keypair.secretKey, {
              lowS: true
            });

            return sig.toCompactRawBytes();
          }
          /**
           * Derive Secp256k1 keypair from mnemonics and path. The mnemonics must be normalized
           * and validated against the english wordlist.
           *
           * If path is none, it will default to m/54'/784'/0'/0/0, otherwise the path must
           * be compliant to BIP-32 in form m/54'/784'/{account_index}'/{change_index}/{address_index}.
           */


          static deriveKeypair(mnemonics, path) {
            if (path == null) {
              path = DEFAULT_SECP256K1_DERIVATION_PATH;
            }

            if (!(0, _mnemonics.isValidBIP32Path)(path)) {
              throw new Error("Invalid derivation path");
            }

            const key = _bip.HDKey.fromMasterSeed((0, _mnemonics.mnemonicToSeed)(mnemonics)).derive(path);

            if (key.publicKey == null || key.privateKey == null) {
              throw new Error("Invalid key");
            }

            return new Secp256k1Keypair({
              publicKey: key.publicKey,
              secretKey: key.privateKey
            });
          }

          export() {
            return {
              schema: "Secp256k1",
              privateKey: (0, _bcs.toB64)(this.keypair.secretKey)
            };
          }

        }

        exports.Secp256k1Keypair = Secp256k1Keypair;
      }, {
        "../../cryptography/mnemonics.js": 15,
        "./publickey.js": 29,
        "@mysten/bcs": 4,
        "@noble/curves/secp256k1": 80,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/sha256": 96,
        "@noble/hashes/utils": 98,
        "@scure/bip32": 112
      }],
      29: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Secp256k1PublicKey = void 0;

        var _bcs = require("@mysten/bcs");

        var _blake2b = require("@noble/hashes/blake2b");

        var _utils = require("@noble/hashes/utils");

        var _index = require("../../types/index.js");

        var _publickey = require("../../cryptography/publickey.js");

        var _signature = require("../../cryptography/signature.js");

        const SECP256K1_PUBLIC_KEY_SIZE = 33;

        class Secp256k1PublicKey {
          /**
           * Create a new Secp256k1PublicKey object
           * @param value secp256k1 public key as buffer or base-64 encoded string
           */
          constructor(value) {
            if (typeof value === "string") {
              this.data = (0, _bcs.fromB64)(value);
            } else if (value instanceof Uint8Array) {
              this.data = value;
            } else {
              this.data = Uint8Array.from(value);
            }

            if (this.data.length !== SECP256K1_PUBLIC_KEY_SIZE) {
              throw new Error(`Invalid public key input. Expected ${SECP256K1_PUBLIC_KEY_SIZE} bytes, got ${this.data.length}`);
            }
          }
          /**
           * Checks if two Secp256k1 public keys are equal
           */


          equals(publicKey) {
            return (0, _publickey.bytesEqual)(this.toBytes(), publicKey.toBytes());
          }
          /**
           * Return the base-64 representation of the Secp256k1 public key
           */


          toBase64() {
            return (0, _bcs.toB64)(this.toBytes());
          }
          /**
           * Return the byte array representation of the Secp256k1 public key
           */


          toBytes() {
            return this.data;
          }
          /**
           * Return the base-64 representation of the Secp256k1 public key
           */


          toString() {
            return this.toBase64();
          }
          /**
           * Return the Sui address associated with this Secp256k1 public key
           */


          toSuiAddress() {
            let tmp = new Uint8Array(SECP256K1_PUBLIC_KEY_SIZE + 1);
            tmp.set([_signature.SIGNATURE_SCHEME_TO_FLAG["Secp256k1"]]);
            tmp.set(this.toBytes(), 1);
            return (0, _index.normalizeSuiAddress)((0, _utils.bytesToHex)((0, _blake2b.blake2b)(tmp, {
              dkLen: 32
            })).slice(0, _index.SUI_ADDRESS_LENGTH * 2));
          }
          /**
           * Return the Sui address associated with this Secp256k1 public key
           */


          flag() {
            return _signature.SIGNATURE_SCHEME_TO_FLAG["Secp256k1"];
          }

        }

        exports.Secp256k1PublicKey = Secp256k1PublicKey;
        Secp256k1PublicKey.SIZE = SECP256K1_PUBLIC_KEY_SIZE;
      }, {
        "../../cryptography/publickey.js": 17,
        "../../cryptography/signature.js": 18,
        "../../types/index.js": 50,
        "@mysten/bcs": 4,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/utils": 98
      }],
      30: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _keypair = require("./keypair.js");

        Object.keys(_keypair).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _keypair[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _keypair[key];
            }
          });
        });

        var _publickey = require("./publickey.js");

        Object.keys(_publickey).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (key in exports && exports[key] === _publickey[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _publickey[key];
            }
          });
        });
      }, {
        "./keypair.js": 31,
        "./publickey.js": 32
      }],
      31: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Secp256r1Keypair = exports.DEFAULT_SECP256R1_DERIVATION_PATH = void 0;

        var _sha = require("@noble/hashes/sha256");

        var _publickey = require("./publickey.js");

        var _p = require("@noble/curves/p256");

        var _mnemonics = require("../../cryptography/mnemonics.js");

        var _bip = require("@scure/bip32");

        var _bcs = require("@mysten/bcs");

        var _utils = require("@noble/hashes/utils");

        var _blake2b = require("@noble/hashes/blake2b");

        const DEFAULT_SECP256R1_DERIVATION_PATH = "m/74'/784'/0'/0/0";
        exports.DEFAULT_SECP256R1_DERIVATION_PATH = DEFAULT_SECP256R1_DERIVATION_PATH;

        class Secp256r1Keypair {
          /**
           * Create a new keypair instance.
           * Generate random keypair if no {@link Secp256r1Keypair} is provided.
           *
           * @param keypair Secp256r1 keypair
           */
          constructor(keypair) {
            if (keypair) {
              this.keypair = keypair;
            } else {
              const secretKey = _p.secp256r1.utils.randomPrivateKey();

              const publicKey = _p.secp256r1.getPublicKey(secretKey, true);

              this.keypair = {
                publicKey,
                secretKey
              };
            }
          }
          /**
           * Get the key scheme of the keypair Secp256r1
           */


          getKeyScheme() {
            return "Secp256r1";
          }
          /**
           * Generate a new random keypair
           */


          static generate() {
            return new Secp256r1Keypair();
          }
          /**
           * Create a keypair from a raw secret key byte array.
           *
           * This method should only be used to recreate a keypair from a previously
           * generated secret key. Generating keypairs from a random seed should be done
           * with the {@link Keypair.fromSeed} method.
           *
           * @throws error if the provided secret key is invalid and validation is not skipped.
           *
           * @param secretKey secret key byte array
           * @param options: skip secret key validation
           */


          static fromSecretKey(secretKey, options) {
            const publicKey = _p.secp256r1.getPublicKey(secretKey, true);

            if (!options || !options.skipValidation) {
              const encoder = new TextEncoder();
              const signData = encoder.encode("sui validation");
              const msgHash = (0, _utils.bytesToHex)((0, _blake2b.blake2b)(signData, {
                dkLen: 32
              }));

              const signature = _p.secp256r1.sign(msgHash, secretKey, {
                lowS: true
              });

              if (!_p.secp256r1.verify(signature, msgHash, publicKey, {
                lowS: true
              })) {
                throw new Error("Provided secretKey is invalid");
              }
            }

            return new Secp256r1Keypair({
              publicKey,
              secretKey
            });
          }
          /**
           * Generate a keypair from a 32 byte seed.
           *
           * @param seed seed byte array
           */


          static fromSeed(seed) {
            let publicKey = _p.secp256r1.getPublicKey(seed, true);

            return new Secp256r1Keypair({
              publicKey,
              secretKey: seed
            });
          }
          /**
           * The public key for this keypair
           */


          getPublicKey() {
            return new _publickey.Secp256r1PublicKey(this.keypair.publicKey);
          }
          /**
           * Return the signature for the provided data.
           */


          signData(data) {
            const msgHash = (0, _sha.sha256)(data);

            const sig = _p.secp256r1.sign(msgHash, this.keypair.secretKey, {
              lowS: true
            });

            return sig.toCompactRawBytes();
          }
          /**
           * Derive Secp256r1 keypair from mnemonics and path. The mnemonics must be normalized
           * and validated against the english wordlist.
           *
           * If path is none, it will default to m/74'/784'/0'/0/0, otherwise the path must
           * be compliant to BIP-32 in form m/74'/784'/{account_index}'/{change_index}/{address_index}.
           */


          static deriveKeypair(mnemonics, path) {
            if (path == null) {
              path = DEFAULT_SECP256R1_DERIVATION_PATH;
            }

            if (!(0, _mnemonics.isValidBIP32Path)(path)) {
              throw new Error("Invalid derivation path");
            }

            const privateKey = _bip.HDKey.fromMasterSeed((0, _mnemonics.mnemonicToSeed)(mnemonics)).derive(path).privateKey;

            return Secp256r1Keypair.fromSecretKey(privateKey);
          }

          export() {
            return {
              schema: "Secp256r1",
              privateKey: (0, _bcs.toB64)(this.keypair.secretKey)
            };
          }

        }

        exports.Secp256r1Keypair = Secp256r1Keypair;
      }, {
        "../../cryptography/mnemonics.js": 15,
        "./publickey.js": 32,
        "@mysten/bcs": 4,
        "@noble/curves/p256": 79,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/sha256": 96,
        "@noble/hashes/utils": 98,
        "@scure/bip32": 112
      }],
      32: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Secp256r1PublicKey = void 0;

        var _bcs = require("@mysten/bcs");

        var _blake2b = require("@noble/hashes/blake2b");

        var _utils = require("@noble/hashes/utils");

        var _index = require("../../types/index.js");

        var _publickey = require("../../cryptography/publickey.js");

        var _signature = require("../../cryptography/signature.js");

        const SECP256R1_PUBLIC_KEY_SIZE = 33;

        class Secp256r1PublicKey {
          /**
           * Create a new Secp256r1PublicKey object
           * @param value secp256r1 public key as buffer or base-64 encoded string
           */
          constructor(value) {
            if (typeof value === "string") {
              this.data = (0, _bcs.fromB64)(value);
            } else if (value instanceof Uint8Array) {
              this.data = value;
            } else {
              this.data = Uint8Array.from(value);
            }

            if (this.data.length !== SECP256R1_PUBLIC_KEY_SIZE) {
              throw new Error(`Invalid public key input. Expected ${SECP256R1_PUBLIC_KEY_SIZE} bytes, got ${this.data.length}`);
            }
          }
          /**
           * Checks if two Secp256r1 public keys are equal
           */


          equals(publicKey) {
            return (0, _publickey.bytesEqual)(this.toBytes(), publicKey.toBytes());
          }
          /**
           * Return the base-64 representation of the Secp256r1 public key
           */


          toBase64() {
            return (0, _bcs.toB64)(this.toBytes());
          }
          /**
           * Return the byte array representation of the Secp256r1 public key
           */


          toBytes() {
            return this.data;
          }
          /**
           * Return the base-64 representation of the Secp256r1 public key
           */


          toString() {
            return this.toBase64();
          }
          /**
           * Return the Sui address associated with this Secp256r1 public key
           */


          toSuiAddress() {
            let tmp = new Uint8Array(SECP256R1_PUBLIC_KEY_SIZE + 1);
            tmp.set([_signature.SIGNATURE_SCHEME_TO_FLAG["Secp256r1"]]);
            tmp.set(this.toBytes(), 1);
            return (0, _index.normalizeSuiAddress)((0, _utils.bytesToHex)((0, _blake2b.blake2b)(tmp, {
              dkLen: 32
            })).slice(0, _index.SUI_ADDRESS_LENGTH * 2));
          }
          /**
           * Return the Sui address associated with this Secp256r1 public key
           */


          flag() {
            return _signature.SIGNATURE_SCHEME_TO_FLAG["Secp256r1"];
          }

        }

        exports.Secp256r1PublicKey = Secp256r1PublicKey;
        Secp256r1PublicKey.SIZE = SECP256R1_PUBLIC_KEY_SIZE;
      }, {
        "../../cryptography/publickey.js": 17,
        "../../cryptography/signature.js": 18,
        "../../types/index.js": 50,
        "@mysten/bcs": 4,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/utils": 98
      }],
      33: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.JsonRpcProvider = void 0;

        var _client = require("../rpc/client.js");

        var _index = require("../types/index.js");

        var _dynamic_fields = require("../types/dynamic_fields.js");

        var _websocketClient = require("../rpc/websocket-client.js");

        var _faucetClient = require("../rpc/faucet-client.js");

        var _superstruct = require("superstruct");

        var _bcs = require("@mysten/bcs");

        var _connection = require("../rpc/connection.js");

        var _index2 = require("../builder/index.js");

        var _checkpoints = require("../types/checkpoints.js");

        var _metrics = require("../types/metrics.js");

        var _epochs = require("../types/epochs.js");

        const DEFAULT_OPTIONS = {
          socketOptions: _websocketClient.DEFAULT_CLIENT_OPTIONS,
          versionCacheTimeoutInSeconds: 600
        };

        class JsonRpcProvider {
          /**
           * Establish a connection to a Sui RPC endpoint
           *
           * @param connection The `Connection` object containing configuration for the network.
           * @param options configuration options for the provider
           */
          constructor(connection = _connection.devnetConnection, options = DEFAULT_OPTIONS) {
            this.options = options;
            this.connection = connection;
            const opts = { ...DEFAULT_OPTIONS,
              ...options
            };
            this.options = opts;
            this.client = opts.rpcClient ?? new _client.JsonRpcClient(this.connection.fullnode);
            this.wsClient = opts.websocketClient ?? new _websocketClient.WebsocketClient(this.connection.websocket, opts.socketOptions);
          }

          async getRpcApiVersion() {
            if (this.rpcApiVersion && this.cacheExpiry && this.cacheExpiry <= Date.now()) {
              return this.rpcApiVersion;
            }

            try {
              const resp = await this.client.requestWithType("rpc.discover", [], (0, _superstruct.any)());
              this.rpcApiVersion = resp.info.version;
              this.cacheExpiry = // Date.now() is in milliseconds, but the timeout is in seconds
              Date.now() + (this.options.versionCacheTimeoutInSeconds ?? 0) * 1e3;
              return this.rpcApiVersion;
            } catch (err) {
              console.warn("Error fetching version number of the RPC API", err);
            }

            return void 0;
          }

          async requestSuiFromFaucet(recipient, httpHeaders) {
            if (!this.connection.faucet) {
              throw new Error("Faucet URL is not specified");
            }

            return (0, _faucetClient.requestSuiFromFaucet)(this.connection.faucet, recipient, httpHeaders);
          }
          /**
           * Get all Coin<`coin_type`> objects owned by an address.
           */


          async getCoins(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getCoins", [input.owner, input.coinType, input.cursor, input.limit], _index.PaginatedCoins);
          }
          /**
           * Get all Coin objects owned by an address.
           */


          async getAllCoins(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getAllCoins", [input.owner, input.cursor, input.limit], _index.PaginatedCoins);
          }
          /**
           * Get the total coin balance for one coin type, owned by the address owner.
           */


          async getBalance(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getBalance", [input.owner, input.coinType], _index.CoinBalance);
          }
          /**
           * Get the total coin balance for all coin types, owned by the address owner.
           */


          async getAllBalances(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getAllBalances", [input.owner], (0, _superstruct.array)(_index.CoinBalance));
          }
          /**
           * Fetch CoinMetadata for a given coin type
           */


          async getCoinMetadata(input) {
            return await this.client.requestWithType("suix_getCoinMetadata", [input.coinType], _index.CoinMetadataStruct);
          }
          /**
           *  Fetch total supply for a coin
           */


          async getTotalSupply(input) {
            return await this.client.requestWithType("suix_getTotalSupply", [input.coinType], _index.CoinSupply);
          }
          /**
           * Invoke any RPC method
           * @param method the method to be invoked
           * @param args the arguments to be passed to the RPC request
           */


          async call(method, params) {
            return await this.client.request(method, params);
          }
          /**
           * Get Move function argument types like read, write and full access
           */


          async getMoveFunctionArgTypes(input) {
            return await this.client.requestWithType("sui_getMoveFunctionArgTypes", [input.package, input.module, input.function], _index.SuiMoveFunctionArgTypes);
          }
          /**
           * Get a map from module name to
           * structured representations of Move modules
           */


          async getNormalizedMoveModulesByPackage(input) {
            return await this.client.requestWithType("sui_getNormalizedMoveModulesByPackage", [input.package], _index.SuiMoveNormalizedModules);
          }
          /**
           * Get a structured representation of Move module
           */


          async getNormalizedMoveModule(input) {
            return await this.client.requestWithType("sui_getNormalizedMoveModule", [input.package, input.module], _index.SuiMoveNormalizedModule);
          }
          /**
           * Get a structured representation of Move function
           */


          async getNormalizedMoveFunction(input) {
            return await this.client.requestWithType("sui_getNormalizedMoveFunction", [input.package, input.module, input.function], _index.SuiMoveNormalizedFunction);
          }
          /**
           * Get a structured representation of Move struct
           */


          async getNormalizedMoveStruct(input) {
            return await this.client.requestWithType("sui_getNormalizedMoveStruct", [input.package, input.module, input.struct], _index.SuiMoveNormalizedStruct);
          }
          /**
           * Get all objects owned by an address
           */


          async getOwnedObjects(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getOwnedObjects", [input.owner, {
              filter: input.filter,
              options: input.options
            }, input.cursor, input.limit], _index.PaginatedObjectsResponse);
          }
          /**
           * Get details about an object
           */


          async getObject(input) {
            if (!input.id || !(0, _index.isValidSuiObjectId)((0, _index.normalizeSuiObjectId)(input.id))) {
              throw new Error("Invalid Sui Object id");
            }

            return await this.client.requestWithType("sui_getObject", [input.id, input.options], _index.SuiObjectResponse);
          }

          async tryGetPastObject(input) {
            return await this.client.requestWithType("sui_tryGetPastObject", [input.id, input.version, input.options], _index.ObjectRead);
          }
          /**
           * Batch get details about a list of objects. If any of the object ids are duplicates the call will fail
           */


          async multiGetObjects(input) {
            input.ids.forEach(id => {
              if (!id || !(0, _index.isValidSuiObjectId)((0, _index.normalizeSuiObjectId)(id))) {
                throw new Error(`Invalid Sui Object id ${id}`);
              }
            });
            const hasDuplicates = input.ids.length !== new Set(input.ids).size;

            if (hasDuplicates) {
              throw new Error(`Duplicate object ids in batch call ${input.ids}`);
            }

            return await this.client.requestWithType("sui_multiGetObjects", [input.ids, input.options], (0, _superstruct.array)(_index.SuiObjectResponse));
          }
          /**
           * Get transaction blocks for a given query criteria
           */


          async queryTransactionBlocks(input) {
            return await this.client.requestWithType("suix_queryTransactionBlocks", [{
              filter: input.filter,
              options: input.options
            }, input.cursor, input.limit, (input.order || "descending") === "descending"], _index.PaginatedTransactionResponse);
          }

          async getTransactionBlock(input) {
            if (!(0, _index.isValidTransactionDigest)(input.digest)) {
              throw new Error("Invalid Transaction digest");
            }

            return await this.client.requestWithType("sui_getTransactionBlock", [input.digest, input.options], _index.SuiTransactionBlockResponse);
          }

          async multiGetTransactionBlocks(input) {
            input.digests.forEach(d => {
              if (!(0, _index.isValidTransactionDigest)(d)) {
                throw new Error(`Invalid Transaction digest ${d}`);
              }
            });
            const hasDuplicates = input.digests.length !== new Set(input.digests).size;

            if (hasDuplicates) {
              throw new Error(`Duplicate digests in batch call ${input.digests}`);
            }

            return await this.client.requestWithType("sui_multiGetTransactionBlocks", [input.digests, input.options], (0, _superstruct.array)(_index.SuiTransactionBlockResponse));
          }

          async executeTransactionBlock(input) {
            return await this.client.requestWithType("sui_executeTransactionBlock", [typeof input.transactionBlock === "string" ? input.transactionBlock : (0, _bcs.toB64)(input.transactionBlock), Array.isArray(input.signature) ? input.signature : [input.signature], input.options, input.requestType], _index.SuiTransactionBlockResponse);
          }
          /**
           * Get total number of transactions
           */


          async getTotalTransactionBlocks() {
            const resp = await this.client.requestWithType("sui_getTotalTransactionBlocks", [], (0, _superstruct.string)());
            return BigInt(resp);
          }
          /**
           * Getting the reference gas price for the network
           */


          async getReferenceGasPrice() {
            const resp = await this.client.requestWithType("suix_getReferenceGasPrice", [], (0, _superstruct.string)());
            return BigInt(resp);
          }
          /**
           * Return the delegated stakes for an address
           */


          async getStakes(input) {
            if (!input.owner || !(0, _index.isValidSuiAddress)((0, _index.normalizeSuiAddress)(input.owner))) {
              throw new Error("Invalid Sui address");
            }

            return await this.client.requestWithType("suix_getStakes", [input.owner], (0, _superstruct.array)(_index.DelegatedStake));
          }
          /**
           * Return the delegated stakes queried by id.
           */


          async getStakesByIds(input) {
            input.stakedSuiIds.forEach(id => {
              if (!id || !(0, _index.isValidSuiObjectId)((0, _index.normalizeSuiObjectId)(id))) {
                throw new Error(`Invalid Sui Stake id ${id}`);
              }
            });
            return await this.client.requestWithType("suix_getStakesByIds", [input.stakedSuiIds], (0, _superstruct.array)(_index.DelegatedStake));
          }
          /**
           * Return the latest system state content.
           */


          async getLatestSuiSystemState() {
            return await this.client.requestWithType("suix_getLatestSuiSystemState", [], _index.SuiSystemStateSummary);
          }
          /**
           * Get events for a given query criteria
           */


          async queryEvents(input) {
            return await this.client.requestWithType("suix_queryEvents", [input.query, input.cursor, input.limit, (input.order || "descending") === "descending"], _index.PaginatedEvents);
          }
          /**
           * Subscribe to get notifications whenever an event matching the filter occurs
           */


          async subscribeEvent(input) {
            return this.wsClient.request({
              method: "suix_subscribeEvent",
              unsubscribe: "suix_unsubscribeEvent",
              params: [input.filter],
              onMessage: input.onMessage
            });
          }

          async subscribeTransaction(input) {
            return this.wsClient.request({
              method: "suix_subscribeTransaction",
              unsubscribe: "suix_unsubscribeTransaction",
              params: [input.filter],
              onMessage: input.onMessage
            });
          }
          /**
           * Runs the transaction block in dev-inspect mode. Which allows for nearly any
           * transaction (or Move call) with any arguments. Detailed results are
           * provided, including both the transaction effects and any return values.
           */


          async devInspectTransactionBlock(input) {
            let devInspectTxBytes;

            if (_index2.TransactionBlock.is(input.transactionBlock)) {
              input.transactionBlock.setSenderIfNotSet(input.sender);
              devInspectTxBytes = (0, _bcs.toB64)(await input.transactionBlock.build({
                provider: this,
                onlyTransactionKind: true
              }));
            } else if (typeof input.transactionBlock === "string") {
              devInspectTxBytes = input.transactionBlock;
            } else if (input.transactionBlock instanceof Uint8Array) {
              devInspectTxBytes = (0, _bcs.toB64)(input.transactionBlock);
            } else {
              throw new Error("Unknown transaction block format.");
            }

            return await this.client.requestWithType("sui_devInspectTransactionBlock", [input.sender, devInspectTxBytes, input.gasPrice, input.epoch], _index.DevInspectResults);
          }
          /**
           * Dry run a transaction block and return the result.
           */


          async dryRunTransactionBlock(input) {
            return await this.client.requestWithType("sui_dryRunTransactionBlock", [typeof input.transactionBlock === "string" ? input.transactionBlock : (0, _bcs.toB64)(input.transactionBlock)], _index.DryRunTransactionBlockResponse);
          }
          /**
           * Return the list of dynamic field objects owned by an object
           */


          async getDynamicFields(input) {
            if (!input.parentId || !(0, _index.isValidSuiObjectId)((0, _index.normalizeSuiObjectId)(input.parentId))) {
              throw new Error("Invalid Sui Object id");
            }

            return await this.client.requestWithType("suix_getDynamicFields", [input.parentId, input.cursor, input.limit], _dynamic_fields.DynamicFieldPage);
          }
          /**
           * Return the dynamic field object information for a specified object
           */


          async getDynamicFieldObject(input) {
            return await this.client.requestWithType("suix_getDynamicFieldObject", [input.parentId, input.name], _index.SuiObjectResponse);
          }
          /**
           * Get the sequence number of the latest checkpoint that has been executed
           */


          async getLatestCheckpointSequenceNumber() {
            const resp = await this.client.requestWithType("sui_getLatestCheckpointSequenceNumber", [], (0, _superstruct.string)());
            return String(resp);
          }
          /**
           * Returns information about a given checkpoint
           */


          async getCheckpoint(input) {
            return await this.client.requestWithType("sui_getCheckpoint", [input.id], _index.Checkpoint);
          }
          /**
           * Returns historical checkpoints paginated
           */


          async getCheckpoints(input) {
            const resp = await this.client.requestWithType("sui_getCheckpoints", [input.cursor, input?.limit, input.descendingOrder], _checkpoints.CheckpointPage);
            return resp;
          }
          /**
           * Return the committee information for the asked epoch
           */


          async getCommitteeInfo(input) {
            return await this.client.requestWithType("suix_getCommitteeInfo", [input?.epoch], _index.CommitteeInfo);
          }

          async getNetworkMetrics() {
            return await this.client.requestWithType("suix_getNetworkMetrics", [], _metrics.NetworkMetrics);
          }

          async getAddressMetrics() {
            return await this.client.requestWithType("suix_getLatestAddressMetrics", [], _metrics.AddressMetrics);
          }
          /**
           * Return the committee information for the asked epoch
           */


          async getEpochs(input) {
            return await this.client.requestWithType("suix_getEpochs", [input?.cursor, input?.limit, input?.descendingOrder], _epochs.EpochPage);
          }
          /**
           * Returns list of top move calls by usage
           */


          async getMoveCallMetrics() {
            return await this.client.requestWithType("suix_getMoveCallMetrics", [], _index.MoveCallMetrics);
          }
          /**
           * Return the committee information for the asked epoch
           */


          async getCurrentEpoch() {
            return await this.client.requestWithType("suix_getCurrentEpoch", [], _epochs.EpochInfo);
          }
          /**
           * Return the Validators APYs
           */


          async getValidatorsApy() {
            return await this.client.requestWithType("suix_getValidatorsApy", [], _index.ValidatorsApy);
          } // TODO: Migrate this to `sui_getChainIdentifier` once it is widely available.


          async getChainIdentifier() {
            const checkpoint = await this.getCheckpoint({
              id: "0"
            });
            const bytes = (0, _bcs.fromB58)(checkpoint.digest);
            return (0, _bcs.toHEX)(bytes.slice(0, 4));
          }

          async resolveNameServiceAddress(input) {
            return await this.client.requestWithType("suix_resolveNameServiceAddress", [input.name], (0, _superstruct.nullable)(_index.SuiAddress));
          }

          async resolveNameServiceNames(input) {
            return await this.client.requestWithType("suix_resolveNameServiceNames", [input.address], _index.ResolvedNameServiceNames);
          }

          async getProtocolConfig(input) {
            return await this.client.requestWithType("sui_getProtocolConfig", [input?.version], _index.ProtocolConfig);
          }
          /**
           * Wait for a transaction block result to be available over the API.
           * This can be used in conjunction with `executeTransactionBlock` to wait for the transaction to
           * be available via the API.
           * This currently polls the `getTransactionBlock` API to check for the transaction.
           */


          async waitForTransactionBlock({
            signal,
            timeout = 60 * 1e3,
            pollInterval = 2 * 1e3,
            ...input
          }) {
            const timeoutSignal = AbortSignal.timeout(timeout);
            const timeoutPromise = new Promise((_, reject) => {
              timeoutSignal.addEventListener("abort", () => reject(timeoutSignal.reason));
            });
            timeoutPromise.catch(() => {});

            while (!timeoutSignal.aborted) {
              signal?.throwIfAborted();

              try {
                return await this.getTransactionBlock(input);
              } catch (e) {
                await Promise.race([new Promise(resolve => setTimeout(resolve, pollInterval)), timeoutPromise]);
              }
            }

            timeoutSignal.throwIfAborted();
            throw new Error("Unexpected error while waiting for transaction block.");
          }

        }

        exports.JsonRpcProvider = JsonRpcProvider;
      }, {
        "../builder/index.js": 10,
        "../rpc/client.js": 34,
        "../rpc/connection.js": 35,
        "../rpc/faucet-client.js": 36,
        "../rpc/websocket-client.js": 37,
        "../types/checkpoints.js": 43,
        "../types/dynamic_fields.js": 46,
        "../types/epochs.js": 47,
        "../types/index.js": 50,
        "../types/metrics.js": 51,
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      34: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.JsonRpcClient = void 0;

        var _clientJs = require("@open-rpc/client-js");

        require("superstruct");

        var _version = require("../version.js");

        require("../utils/errors.js");

        class JsonRpcClient {
          constructor(url, httpHeaders) {
            const transport = new _clientJs.HTTPTransport(url, {
              headers: {
                "Content-Type": "application/json",
                "Client-Sdk-Type": "typescript",
                "Client-Sdk-Version": _version.PACKAGE_VERSION,
                "Client-Target-Api-Version": _version.TARGETED_RPC_VERSION,
                ...httpHeaders
              }
            });
            this.rpcClient = new _clientJs.Client(new _clientJs.RequestManager([transport]));
          }

          async requestWithType(method, args, struct) {
            const req = {
              method,
              args
            };
            const response = await this.request(method, args);

            if (false) {
              const [err] = validate(response, struct);

              if (err) {
                throw new RPCValidationError({
                  req,
                  result: response,
                  cause: err
                });
              }
            }

            return response;
          }

          async request(method, params) {
            return await this.rpcClient.request({
              method,
              params
            });
          }

        }

        exports.JsonRpcClient = JsonRpcClient;
      }, {
        "../utils/errors.js": 61,
        "../version.js": 65,
        "@open-rpc/client-js": 103,
        "superstruct": 120
      }],
      35: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.testnetConnection = exports.mainnetConnection = exports.localnetConnection = exports.devnetConnection = exports.Connection = void 0;

        var __accessCheck = (obj, member, msg) => {
          if (!member.has(obj)) throw TypeError("Cannot " + msg);
        };

        var __privateGet = (obj, member, getter) => {
          __accessCheck(obj, member, "read from private field");

          return getter ? getter.call(obj) : member.get(obj);
        };

        var __privateAdd = (obj, member, value) => {
          if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
          member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
        };

        var __privateSet = (obj, member, value, setter) => {
          __accessCheck(obj, member, "write to private field");

          setter ? setter.call(obj, value) : member.set(obj, value);
          return value;
        };

        var _options;

        class Connection {
          constructor(options) {
            __privateAdd(this, _options, void 0);

            __privateSet(this, _options, options);
          }

          get fullnode() {
            return __privateGet(this, _options).fullnode;
          } // TODO: Decide if we should default the websocket URL like this:


          get websocket() {
            return __privateGet(this, _options).websocket || __privateGet(this, _options).fullnode;
          }

          get faucet() {
            return __privateGet(this, _options).faucet;
          }

        }

        exports.Connection = Connection;
        _options = new WeakMap();
        const localnetConnection = new Connection({
          fullnode: "http://127.0.0.1:9000",
          faucet: "http://127.0.0.1:9123/gas"
        });
        exports.localnetConnection = localnetConnection;
        const devnetConnection = new Connection({
          fullnode: "https://fullnode.devnet.sui.io:443/",
          faucet: "https://faucet.devnet.sui.io/gas"
        });
        exports.devnetConnection = devnetConnection;
        const testnetConnection = new Connection({
          fullnode: "https://fullnode.testnet.sui.io:443/",
          faucet: "https://faucet.testnet.sui.io/gas"
        });
        exports.testnetConnection = testnetConnection;
        const mainnetConnection = new Connection({
          fullnode: "https://fullnode.mainnet.sui.io:443/"
        });
        exports.mainnetConnection = mainnetConnection;
      }, {}],
      36: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.requestSuiFromFaucet = requestSuiFromFaucet;

        var _errors = require("../utils/errors.js");

        async function requestSuiFromFaucet(endpoint, recipient, httpHeaders) {
          const res = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({
              FixedAmountRequest: {
                recipient
              }
            }),
            headers: {
              "Content-Type": "application/json",
              ...(httpHeaders || {})
            }
          });

          if (res.status === 429) {
            throw new _errors.FaucetRateLimitError(`Too many requests from this client have been sent to the faucet. Please retry later`);
          }

          let parsed;

          try {
            parsed = await res.json();
          } catch (e) {
            throw new Error(`Encountered error when parsing response from faucet, error: ${e}, status ${res.status}, response ${res}`);
          }

          if (parsed.error) {
            throw new Error(`Faucet returns error: ${parsed.error}`);
          }

          return parsed;
        }
      }, {
        "../utils/errors.js": 61
      }],
      37: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.getWebsocketUrl = exports.WebsocketClient = exports.DEFAULT_CLIENT_OPTIONS = void 0;

        var _clientJs = require("@open-rpc/client-js");

        var __accessCheck = (obj, member, msg) => {
          if (!member.has(obj)) throw TypeError("Cannot " + msg);
        };

        var __privateGet = (obj, member, getter) => {
          __accessCheck(obj, member, "read from private field");

          return getter ? getter.call(obj) : member.get(obj);
        };

        var __privateAdd = (obj, member, value) => {
          if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
          member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
        };

        var __privateSet = (obj, member, value, setter) => {
          __accessCheck(obj, member, "write to private field");

          setter ? setter.call(obj, value) : member.set(obj, value);
          return value;
        };

        var __privateWrapper = (obj, member, setter, getter) => ({
          set _(value) {
            __privateSet(obj, member, value, setter);
          },

          get _() {
            return __privateGet(obj, member, getter);
          }

        });

        var __privateMethod = (obj, member, method) => {
          __accessCheck(obj, member, "access private method");

          return method;
        };

        var _client, _subscriptions, _disconnects, _setupClient, setupClient_fn, _reconnect, reconnect_fn;

        const getWebsocketUrl = (httpUrl, port) => {
          const url = new URL(httpUrl);
          url.protocol = url.protocol.replace("http", "ws");

          if (port) {
            url.port = port.toString();
          }

          return url.toString();
        };

        exports.getWebsocketUrl = getWebsocketUrl;
        const DEFAULT_CLIENT_OPTIONS = {
          callTimeout: 3e4,
          reconnectTimeout: 3e3,
          maxReconnects: 5
        };
        exports.DEFAULT_CLIENT_OPTIONS = DEFAULT_CLIENT_OPTIONS;

        class WebsocketClient {
          constructor(endpoint, options = DEFAULT_CLIENT_OPTIONS) {
            this.endpoint = endpoint;
            this.options = options;

            __privateAdd(this, _setupClient);

            __privateAdd(this, _reconnect);

            __privateAdd(this, _client, void 0);

            __privateAdd(this, _subscriptions, void 0);

            __privateAdd(this, _disconnects, void 0);

            if (this.endpoint.startsWith("http")) {
              this.endpoint = getWebsocketUrl(this.endpoint);
            }

            __privateSet(this, _client, null);

            __privateSet(this, _subscriptions, /* @__PURE__ */new Map());

            __privateSet(this, _disconnects, 0);
          }

          async request(input) {
            const client = __privateMethod(this, _setupClient, setupClient_fn).call(this);

            const id = await client.request({
              method: input.method,
              params: input.params
            }, this.options.callTimeout);

            __privateGet(this, _subscriptions).set(input.id || id, { ...input,
              // Always set the latest actual subscription ID:
              id
            });

            return async () => {
              const client2 = __privateMethod(this, _setupClient, setupClient_fn).call(this);

              const subscription = __privateGet(this, _subscriptions).get(id);

              if (!subscription) return false;

              __privateGet(this, _subscriptions).delete(id);

              return client2.request({
                method: input.unsubscribe,
                params: [subscription.id]
              }, this.options.callTimeout);
            };
          }

        }

        exports.WebsocketClient = WebsocketClient;
        _client = new WeakMap();
        _subscriptions = new WeakMap();
        _disconnects = new WeakMap();
        _setupClient = new WeakSet();

        setupClient_fn = function () {
          if (__privateGet(this, _client)) {
            return __privateGet(this, _client);
          }

          const transport = new _clientJs.WebSocketTransport(this.endpoint);
          const requestManager = new _clientJs.RequestManager([transport]);

          __privateSet(this, _client, new _clientJs.Client(requestManager));

          transport.connection.addEventListener("open", () => {
            __privateSet(this, _disconnects, 0);
          });
          transport.connection.addEventListener("close", () => {
            __privateWrapper(this, _disconnects)._++;

            if (__privateGet(this, _disconnects) <= this.options.maxReconnects) {
              setTimeout(() => {
                __privateMethod(this, _reconnect, reconnect_fn).call(this);
              }, this.options.reconnectTimeout);
            }
          });

          __privateGet(this, _client).onNotification(data => {
            const params = data.params;

            __privateGet(this, _subscriptions).forEach(subscription => {
              if (subscription.method === data.method && params.subscription === subscription.id) {
                subscription.onMessage(params.result);
              }
            });
          });

          return __privateGet(this, _client);
        };

        _reconnect = new WeakSet();

        reconnect_fn = function () {
          __privateGet(this, _client)?.close();

          __privateSet(this, _client, null);

          __privateGet(this, _subscriptions).forEach(subscription => this.request(subscription));
        };
      }, {
        "@open-rpc/client-js": 103
      }],
      38: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.RawSigner = void 0;

        var _blake2b = require("@noble/hashes/blake2b");

        var _signerWithProvider = require("./signer-with-provider.js");

        var _utils = require("../cryptography/utils.js");

        class RawSigner extends _signerWithProvider.SignerWithProvider {
          constructor(keypair, provider) {
            super(provider);
            this.keypair = keypair;
          }

          async getAddress() {
            return this.keypair.getPublicKey().toSuiAddress();
          }

          async signData(data) {
            const pubkey = this.keypair.getPublicKey();
            const digest = (0, _blake2b.blake2b)(data, {
              dkLen: 32
            });
            const signature = this.keypair.signData(digest);
            const signatureScheme = this.keypair.getKeyScheme();
            return (0, _utils.toSerializedSignature)({
              signatureScheme,
              signature,
              pubKey: pubkey
            });
          }

          connect(provider) {
            return new RawSigner(this.keypair, provider);
          }

        }

        exports.RawSigner = RawSigner;
      }, {
        "../cryptography/utils.js": 19,
        "./signer-with-provider.js": 39,
        "@noble/hashes/blake2b": 91
      }],
      39: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SignerWithProvider = void 0;

        var _bcs = require("@mysten/bcs");

        var _index = require("../builder/index.js");

        var _TransactionBlockData = require("../builder/TransactionBlockData.js");

        var _index2 = require("../types/index.js");

        var _intent = require("../utils/intent.js");

        class SignerWithProvider {
          ///////////////////
          // Sub-classes MAY override these

          /**
           * Request gas tokens from a faucet server and send to the signer
           * address
           * @param httpHeaders optional request headers
           */
          async requestSuiFromFaucet(httpHeaders) {
            return this.provider.requestSuiFromFaucet(await this.getAddress(), httpHeaders);
          }

          constructor(provider) {
            this.provider = provider;
          }
          /**
           * Sign a message using the keypair, with the `PersonalMessage` intent.
           */


          async signMessage(input) {
            const signature = await this.signData((0, _intent.messageWithIntent)(_intent.IntentScope.PersonalMessage, input.message));
            return {
              messageBytes: (0, _bcs.toB64)(input.message),
              signature
            };
          }

          async prepareTransactionBlock(transactionBlock) {
            if (_index.TransactionBlock.is(transactionBlock)) {
              transactionBlock.setSenderIfNotSet(await this.getAddress());
              return await transactionBlock.build({
                provider: this.provider
              });
            }

            if (transactionBlock instanceof Uint8Array) {
              return transactionBlock;
            }

            throw new Error("Unknown transaction format");
          }
          /**
           * Sign a transaction.
           */


          async signTransactionBlock(input) {
            const transactionBlockBytes = await this.prepareTransactionBlock(input.transactionBlock);
            const intentMessage = (0, _intent.messageWithIntent)(_intent.IntentScope.TransactionData, transactionBlockBytes);
            const signature = await this.signData(intentMessage);
            return {
              transactionBlockBytes: (0, _bcs.toB64)(transactionBlockBytes),
              signature
            };
          }
          /**
           * Sign a transaction block and submit to the Fullnode for execution.
           *
           * @param options specify which fields to return (e.g., transaction, effects, events, etc).
           * By default, only the transaction digest will be returned.
           * @param requestType WaitForEffectsCert or WaitForLocalExecution, see details in `ExecuteTransactionRequestType`.
           * Defaults to `WaitForLocalExecution` if options.show_effects or options.show_events is true
           */


          async signAndExecuteTransactionBlock(input) {
            const {
              transactionBlockBytes,
              signature
            } = await this.signTransactionBlock({
              transactionBlock: input.transactionBlock
            });
            return await this.provider.executeTransactionBlock({
              transactionBlock: transactionBlockBytes,
              signature,
              options: input.options,
              requestType: input.requestType
            });
          }
          /**
           * Derive transaction digest from
           * @param tx BCS serialized transaction data or a `Transaction` object
           * @returns transaction digest
           */


          async getTransactionBlockDigest(tx) {
            if (_index.TransactionBlock.is(tx)) {
              tx.setSenderIfNotSet(await this.getAddress());
              return tx.getDigest({
                provider: this.provider
              });
            } else if (tx instanceof Uint8Array) {
              return _TransactionBlockData.TransactionBlockDataBuilder.getDigestFromBytes(tx);
            } else {
              throw new Error("Unknown transaction format.");
            }
          }
          /**
           * Runs the transaction in dev-inpsect mode. Which allows for nearly any
           * transaction (or Move call) with any arguments. Detailed results are
           * provided, including both the transaction effects and any return values.
           */


          async devInspectTransactionBlock(input) {
            const address = await this.getAddress();
            return this.provider.devInspectTransactionBlock({
              sender: address,
              ...input
            });
          }
          /**
           * Dry run a transaction and return the result.
           */


          async dryRunTransactionBlock(input) {
            let dryRunTxBytes;

            if (_index.TransactionBlock.is(input.transactionBlock)) {
              input.transactionBlock.setSenderIfNotSet(await this.getAddress());
              dryRunTxBytes = await input.transactionBlock.build({
                provider: this.provider
              });
            } else if (typeof input.transactionBlock === "string") {
              dryRunTxBytes = (0, _bcs.fromB64)(input.transactionBlock);
            } else if (input.transactionBlock instanceof Uint8Array) {
              dryRunTxBytes = input.transactionBlock;
            } else {
              throw new Error("Unknown transaction format");
            }

            return this.provider.dryRunTransactionBlock({
              transactionBlock: dryRunTxBytes
            });
          }
          /**
           * Returns the estimated gas cost for the transaction
           * @param tx The transaction to estimate the gas cost. When string it is assumed it's a serialized tx in base64
           * @returns total gas cost estimation
           * @throws whens fails to estimate the gas cost
           */


          async getGasCostEstimation(...args) {
            const txEffects = await this.dryRunTransactionBlock(...args);
            const gasEstimation = (0, _index2.getTotalGasUsedUpperBound)(txEffects.effects);

            if (typeof gasEstimation === "undefined") {
              throw new Error("Failed to estimate the gas cost from transaction");
            }

            return gasEstimation;
          }

        }

        exports.SignerWithProvider = SignerWithProvider;
      }, {
        "../builder/TransactionBlockData.js": 7,
        "../builder/index.js": 10,
        "../types/index.js": 50,
        "../utils/intent.js": 63,
        "@mysten/bcs": 4
      }],
      40: [function (require, module, exports) {}, {}],
      41: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TypeTagSerializer = void 0;

        var _bcs = require("@mysten/bcs");

        var _index = require("../../types/index.js");

        const VECTOR_REGEX = /^vector<(.+)>$/;
        const STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;

        class TypeTagSerializer {
          static parseFromStr(str, normalizeAddress = false) {
            if (str === "address") {
              return {
                address: null
              };
            } else if (str === "bool") {
              return {
                bool: null
              };
            } else if (str === "u8") {
              return {
                u8: null
              };
            } else if (str === "u16") {
              return {
                u16: null
              };
            } else if (str === "u32") {
              return {
                u32: null
              };
            } else if (str === "u64") {
              return {
                u64: null
              };
            } else if (str === "u128") {
              return {
                u128: null
              };
            } else if (str === "u256") {
              return {
                u256: null
              };
            } else if (str === "signer") {
              return {
                signer: null
              };
            }

            const vectorMatch = str.match(VECTOR_REGEX);

            if (vectorMatch) {
              return {
                vector: TypeTagSerializer.parseFromStr(vectorMatch[1], normalizeAddress)
              };
            }

            const structMatch = str.match(STRUCT_REGEX);

            if (structMatch) {
              const address = normalizeAddress ? (0, _index.normalizeSuiAddress)(structMatch[1]) : structMatch[1];
              return {
                struct: {
                  address,
                  module: structMatch[2],
                  name: structMatch[3],
                  typeParams: structMatch[5] === void 0 ? [] : TypeTagSerializer.parseStructTypeArgs(structMatch[5], normalizeAddress)
                }
              };
            }

            throw new Error(`Encountered unexpected token when parsing type args for ${str}`);
          }

          static parseStructTypeArgs(str, normalizeAddress = false) {
            return (0, _bcs.splitGenericParameters)(str).map(tok => TypeTagSerializer.parseFromStr(tok, normalizeAddress));
          }

          static tagToString(tag) {
            if ("bool" in tag) {
              return "bool";
            }

            if ("u8" in tag) {
              return "u8";
            }

            if ("u16" in tag) {
              return "u16";
            }

            if ("u32" in tag) {
              return "u32";
            }

            if ("u64" in tag) {
              return "u64";
            }

            if ("u128" in tag) {
              return "u128";
            }

            if ("u256" in tag) {
              return "u256";
            }

            if ("address" in tag) {
              return "address";
            }

            if ("signer" in tag) {
              return "signer";
            }

            if ("vector" in tag) {
              return `vector<${TypeTagSerializer.tagToString(tag.vector)}>`;
            }

            if ("struct" in tag) {
              const struct = tag.struct;
              const typeParams = struct.typeParams.map(TypeTagSerializer.tagToString).join(", ");
              return `${struct.address}::${struct.module}::${struct.name}${typeParams ? `<${typeParams}>` : ""}`;
            }

            throw new Error("Invalid TypeTag");
          }

        }

        exports.TypeTagSerializer = TypeTagSerializer;
      }, {
        "../../types/index.js": 50,
        "@mysten/bcs": 4
      }],
      42: [function (require, module, exports) {}, {}],
      43: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.ValidatorSignature = exports.GasCostSummary = exports.ExecutionDigests = exports.EndOfEpochData = exports.ECMHLiveObjectSetDigest = exports.CheckpointPage = exports.CheckpointDigest = exports.CheckpointCommitment = exports.Checkpoint = exports.CheckPointContentsDigest = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const GasCostSummary = (0, _superstruct.object)({
          computationCost: (0, _superstruct.string)(),
          storageCost: (0, _superstruct.string)(),
          storageRebate: (0, _superstruct.string)(),
          nonRefundableStorageFee: (0, _superstruct.string)()
        });
        exports.GasCostSummary = GasCostSummary;
        const CheckPointContentsDigest = (0, _superstruct.string)();
        exports.CheckPointContentsDigest = CheckPointContentsDigest;
        const CheckpointDigest = (0, _superstruct.string)();
        exports.CheckpointDigest = CheckpointDigest;
        const ECMHLiveObjectSetDigest = (0, _superstruct.object)({
          digest: (0, _superstruct.array)((0, _superstruct.number)())
        });
        exports.ECMHLiveObjectSetDigest = ECMHLiveObjectSetDigest;
        const CheckpointCommitment = (0, _superstruct.any)();
        exports.CheckpointCommitment = CheckpointCommitment;
        const ValidatorSignature = (0, _superstruct.string)();
        exports.ValidatorSignature = ValidatorSignature;
        const EndOfEpochData = (0, _superstruct.object)({
          nextEpochCommittee: (0, _superstruct.array)((0, _superstruct.tuple)([(0, _superstruct.string)(), (0, _superstruct.string)()])),
          nextEpochProtocolVersion: (0, _superstruct.string)(),
          epochCommitments: (0, _superstruct.array)(CheckpointCommitment)
        });
        exports.EndOfEpochData = EndOfEpochData;
        const ExecutionDigests = (0, _superstruct.object)({
          transaction: _common.TransactionDigest,
          effects: _common.TransactionEffectsDigest
        });
        exports.ExecutionDigests = ExecutionDigests;
        const Checkpoint = (0, _superstruct.object)({
          epoch: (0, _superstruct.string)(),
          sequenceNumber: (0, _superstruct.string)(),
          digest: CheckpointDigest,
          networkTotalTransactions: (0, _superstruct.string)(),
          previousDigest: (0, _superstruct.optional)(CheckpointDigest),
          epochRollingGasCostSummary: GasCostSummary,
          timestampMs: (0, _superstruct.string)(),
          endOfEpochData: (0, _superstruct.optional)(EndOfEpochData),
          // TODO(jian): remove optional after 0.30.0 is released
          validatorSignature: (0, _superstruct.optional)(ValidatorSignature),
          transactions: (0, _superstruct.array)(_common.TransactionDigest),
          checkpointCommitments: (0, _superstruct.array)(CheckpointCommitment)
        });
        exports.Checkpoint = Checkpoint;
        const CheckpointPage = (0, _superstruct.object)({
          data: (0, _superstruct.array)(Checkpoint),
          nextCursor: (0, _superstruct.nullable)((0, _superstruct.string)()),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.CheckpointPage = CheckpointPage;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      44: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.PaginatedCoins = exports.CoinSupply = exports.CoinStruct = exports.CoinBalance = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const CoinStruct = (0, _superstruct.object)({
          coinType: (0, _superstruct.string)(),
          // TODO(chris): rename this to objectId
          coinObjectId: _common.ObjectId,
          version: (0, _superstruct.string)(),
          digest: _common.TransactionDigest,
          balance: (0, _superstruct.string)(),
          // TODO (jian): remove this when we move to 0.34
          lockedUntilEpoch: (0, _superstruct.optional)((0, _superstruct.nullable)((0, _superstruct.number)())),
          previousTransaction: _common.TransactionDigest
        });
        exports.CoinStruct = CoinStruct;
        const PaginatedCoins = (0, _superstruct.object)({
          data: (0, _superstruct.array)(CoinStruct),
          nextCursor: (0, _superstruct.nullable)(_common.ObjectId),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.PaginatedCoins = PaginatedCoins;
        const CoinBalance = (0, _superstruct.object)({
          coinType: (0, _superstruct.string)(),
          coinObjectCount: (0, _superstruct.number)(),
          totalBalance: (0, _superstruct.string)(),
          lockedBalance: (0, _superstruct.object)({
            epochId: (0, _superstruct.optional)((0, _superstruct.number)()),
            number: (0, _superstruct.optional)((0, _superstruct.number)())
          })
        });
        exports.CoinBalance = CoinBalance;
        const CoinSupply = (0, _superstruct.object)({
          value: (0, _superstruct.string)()
        });
        exports.CoinSupply = CoinSupply;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      45: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TransactionEventDigest = exports.TransactionEffectsDigest = exports.TransactionDigest = exports.SuiJsonValue = exports.SuiAddress = exports.SequenceNumber = exports.SUI_ADDRESS_LENGTH = exports.ProtocolConfig = exports.ObjectOwner = exports.ObjectId = void 0;
        exports.isValidSuiAddress = isValidSuiAddress;
        exports.isValidSuiObjectId = isValidSuiObjectId;
        exports.isValidTransactionDigest = isValidTransactionDigest;
        exports.normalizeStructTag = normalizeStructTag;
        exports.normalizeSuiAddress = normalizeSuiAddress;
        exports.normalizeSuiObjectId = normalizeSuiObjectId;
        exports.parseStructTag = parseStructTag;

        var _superstruct = require("superstruct");

        var _bcs = require("@mysten/bcs");

        const TransactionDigest = (0, _superstruct.string)();
        exports.TransactionDigest = TransactionDigest;
        const TransactionEffectsDigest = (0, _superstruct.string)();
        exports.TransactionEffectsDigest = TransactionEffectsDigest;
        const TransactionEventDigest = (0, _superstruct.string)();
        exports.TransactionEventDigest = TransactionEventDigest;
        const ObjectId = (0, _superstruct.string)();
        exports.ObjectId = ObjectId;
        const SuiAddress = (0, _superstruct.string)();
        exports.SuiAddress = SuiAddress;
        const SequenceNumber = (0, _superstruct.string)();
        exports.SequenceNumber = SequenceNumber;
        const ObjectOwner = (0, _superstruct.union)([(0, _superstruct.object)({
          AddressOwner: SuiAddress
        }), (0, _superstruct.object)({
          ObjectOwner: SuiAddress
        }), (0, _superstruct.object)({
          Shared: (0, _superstruct.object)({
            initial_shared_version: (0, _superstruct.number)()
          })
        }), (0, _superstruct.literal)("Immutable")]);
        exports.ObjectOwner = ObjectOwner;
        const SuiJsonValue = (0, _superstruct.define)("SuiJsonValue", () => true);
        exports.SuiJsonValue = SuiJsonValue;
        const ProtocolConfigValue = (0, _superstruct.union)([(0, _superstruct.object)({
          u32: (0, _superstruct.string)()
        }), (0, _superstruct.object)({
          u64: (0, _superstruct.string)()
        }), (0, _superstruct.object)({
          f64: (0, _superstruct.string)()
        })]);
        const ProtocolConfig = (0, _superstruct.object)({
          attributes: (0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.nullable)(ProtocolConfigValue)),
          featureFlags: (0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.boolean)()),
          maxSupportedProtocolVersion: (0, _superstruct.string)(),
          minSupportedProtocolVersion: (0, _superstruct.string)(),
          protocolVersion: (0, _superstruct.string)()
        });
        exports.ProtocolConfig = ProtocolConfig;
        const TX_DIGEST_LENGTH = 32;

        function isValidTransactionDigest(value) {
          try {
            const buffer = (0, _bcs.fromB58)(value);
            return buffer.length === TX_DIGEST_LENGTH;
          } catch (e) {
            return false;
          }
        }

        const SUI_ADDRESS_LENGTH = 32;
        exports.SUI_ADDRESS_LENGTH = SUI_ADDRESS_LENGTH;

        function isValidSuiAddress(value) {
          return isHex(value) && getHexByteLength(value) === SUI_ADDRESS_LENGTH;
        }

        function isValidSuiObjectId(value) {
          return isValidSuiAddress(value);
        }

        function parseTypeTag(type) {
          if (!type.includes("::")) return type;
          return parseStructTag(type);
        }

        function parseStructTag(type) {
          const [address, module] = type.split("::");
          const rest = type.slice(address.length + module.length + 4);
          const name = rest.includes("<") ? rest.slice(0, rest.indexOf("<")) : rest;
          const typeParams = rest.includes("<") ? (0, _bcs.splitGenericParameters)(rest.slice(rest.indexOf("<") + 1, rest.lastIndexOf(">"))).map(typeParam => parseTypeTag(typeParam.trim())) : [];
          return {
            address: normalizeSuiAddress(address),
            module,
            name,
            typeParams
          };
        }

        function normalizeStructTag(type) {
          const {
            address,
            module,
            name,
            typeParams
          } = typeof type === "string" ? parseStructTag(type) : type;
          const formattedTypeParams = typeParams.length > 0 ? `<${typeParams.map(typeParam => typeof typeParam === "string" ? typeParam : normalizeStructTag(typeParam)).join(",")}>` : "";
          return `${address}::${module}::${name}${formattedTypeParams}`;
        }

        function normalizeSuiAddress(value, forceAdd0x = false) {
          let address = value.toLowerCase();

          if (!forceAdd0x && address.startsWith("0x")) {
            address = address.slice(2);
          }

          return `0x${address.padStart(SUI_ADDRESS_LENGTH * 2, "0")}`;
        }

        function normalizeSuiObjectId(value, forceAdd0x = false) {
          return normalizeSuiAddress(value, forceAdd0x);
        }

        function isHex(value) {
          return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0;
        }

        function getHexByteLength(value) {
          return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2;
        }
      }, {
        "@mysten/bcs": 4,
        "superstruct": 120
      }],
      46: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.DynamicFieldType = exports.DynamicFieldPage = exports.DynamicFieldName = exports.DynamicFieldInfo = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const DynamicFieldType = (0, _superstruct.union)([(0, _superstruct.literal)("DynamicField"), (0, _superstruct.literal)("DynamicObject")]);
        exports.DynamicFieldType = DynamicFieldType;
        const DynamicFieldName = (0, _superstruct.object)({
          type: (0, _superstruct.string)(),
          value: (0, _superstruct.any)()
        });
        exports.DynamicFieldName = DynamicFieldName;
        const DynamicFieldInfo = (0, _superstruct.object)({
          name: DynamicFieldName,
          bcsName: (0, _superstruct.string)(),
          type: DynamicFieldType,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: (0, _superstruct.number)(),
          digest: (0, _superstruct.string)()
        });
        exports.DynamicFieldInfo = DynamicFieldInfo;
        const DynamicFieldPage = (0, _superstruct.object)({
          data: (0, _superstruct.array)(DynamicFieldInfo),
          nextCursor: (0, _superstruct.nullable)(_common.ObjectId),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.DynamicFieldPage = DynamicFieldPage;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      47: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.EpochPage = exports.EpochInfo = exports.EndOfEpochInfo = void 0;

        var _superstruct = require("superstruct");

        var _validator = require("./validator.js");

        const EndOfEpochInfo = (0, _superstruct.object)({
          lastCheckpointId: (0, _superstruct.string)(),
          epochEndTimestamp: (0, _superstruct.string)(),
          protocolVersion: (0, _superstruct.string)(),
          referenceGasPrice: (0, _superstruct.string)(),
          totalStake: (0, _superstruct.string)(),
          storageFundReinvestment: (0, _superstruct.string)(),
          storageCharge: (0, _superstruct.string)(),
          storageRebate: (0, _superstruct.string)(),
          storageFundBalance: (0, _superstruct.string)(),
          stakeSubsidyAmount: (0, _superstruct.string)(),
          totalGasFees: (0, _superstruct.string)(),
          totalStakeRewardsDistributed: (0, _superstruct.string)(),
          leftoverStorageFundInflow: (0, _superstruct.string)()
        });
        exports.EndOfEpochInfo = EndOfEpochInfo;
        const EpochInfo = (0, _superstruct.object)({
          epoch: (0, _superstruct.string)(),
          validators: (0, _superstruct.array)(_validator.SuiValidatorSummary),
          epochTotalTransactions: (0, _superstruct.string)(),
          firstCheckpointId: (0, _superstruct.string)(),
          epochStartTimestamp: (0, _superstruct.string)(),
          endOfEpochInfo: (0, _superstruct.nullable)(EndOfEpochInfo),
          referenceGasPrice: (0, _superstruct.nullable)((0, _superstruct.number)())
        });
        exports.EpochInfo = EpochInfo;
        const EpochPage = (0, _superstruct.object)({
          data: (0, _superstruct.array)(EpochInfo),
          nextCursor: (0, _superstruct.nullable)((0, _superstruct.string)()),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.EpochPage = EpochPage;
      }, {
        "./validator.js": 59,
        "superstruct": 120
      }],
      48: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SuiEvent = exports.PaginatedEvents = exports.EventId = void 0;
        exports.getEventPackage = getEventPackage;
        exports.getEventSender = getEventSender;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const EventId = (0, _superstruct.object)({
          txDigest: _common.TransactionDigest,
          eventSeq: _common.SequenceNumber
        });
        exports.EventId = EventId;
        const SuiEvent = (0, _superstruct.object)({
          id: EventId,
          // Move package where this event was emitted.
          packageId: _common.ObjectId,
          // Move module where this event was emitted.
          transactionModule: (0, _superstruct.string)(),
          // Sender's Sui address.
          sender: _common.SuiAddress,
          // Move event type.
          type: (0, _superstruct.string)(),
          // Parsed json value of the event
          parsedJson: (0, _superstruct.optional)((0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.any)())),
          // Base 58 encoded bcs bytes of the move event
          bcs: (0, _superstruct.optional)((0, _superstruct.string)()),
          timestampMs: (0, _superstruct.optional)((0, _superstruct.string)())
        });
        exports.SuiEvent = SuiEvent;
        const PaginatedEvents = (0, _superstruct.object)({
          data: (0, _superstruct.array)(SuiEvent),
          nextCursor: (0, _superstruct.nullable)(EventId),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.PaginatedEvents = PaginatedEvents;

        function getEventSender(event) {
          return event.sender;
        }

        function getEventPackage(event) {
          return event.packageId;
        }
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      49: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.FaucetResponse = exports.FaucetCoinInfo = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const FaucetCoinInfo = (0, _superstruct.object)({
          amount: (0, _superstruct.number)(),
          id: _common.ObjectId,
          transferTxDigest: _common.TransactionDigest
        });
        exports.FaucetCoinInfo = FaucetCoinInfo;
        const FaucetResponse = (0, _superstruct.object)({
          transferredGasObjects: (0, _superstruct.array)(FaucetCoinInfo),
          error: (0, _superstruct.nullable)((0, _superstruct.string)())
        });
        exports.FaucetResponse = FaucetResponse;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      50: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        var _exportNames = {
          GasCostSummary: true,
          CheckpointDigest: true,
          Checkpoint: true
        };
        Object.defineProperty(exports, "Checkpoint", {
          enumerable: true,
          get: function () {
            return _checkpoints.Checkpoint;
          }
        });
        Object.defineProperty(exports, "CheckpointDigest", {
          enumerable: true,
          get: function () {
            return _checkpoints.CheckpointDigest;
          }
        });
        Object.defineProperty(exports, "GasCostSummary", {
          enumerable: true,
          get: function () {
            return _checkpoints.GasCostSummary;
          }
        });

        var _common = require("./common.js");

        Object.keys(_common).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _common[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _common[key];
            }
          });
        });

        var _objects = require("./objects.js");

        Object.keys(_objects).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _objects[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _objects[key];
            }
          });
        });

        var _events = require("./events.js");

        Object.keys(_events).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _events[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _events[key];
            }
          });
        });

        var _transactions = require("./transactions.js");

        Object.keys(_transactions).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _transactions[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _transactions[key];
            }
          });
        });

        var _framework = require("../framework/framework.js");

        Object.keys(_framework).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _framework[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _framework[key];
            }
          });
        });

        var _suiBcs = require("./sui-bcs.js");

        Object.keys(_suiBcs).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _suiBcs[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _suiBcs[key];
            }
          });
        });

        var _faucet = require("./faucet.js");

        Object.keys(_faucet).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _faucet[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _faucet[key];
            }
          });
        });

        var _normalized = require("./normalized.js");

        Object.keys(_normalized).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _normalized[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _normalized[key];
            }
          });
        });

        var _validator = require("./validator.js");

        Object.keys(_validator).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _validator[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _validator[key];
            }
          });
        });

        var _coin = require("./coin.js");

        Object.keys(_coin).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _coin[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _coin[key];
            }
          });
        });

        var _epochs = require("./epochs.js");

        Object.keys(_epochs).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _epochs[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _epochs[key];
            }
          });
        });

        var _subscriptions = require("./subscriptions.js");

        Object.keys(_subscriptions).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _subscriptions[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _subscriptions[key];
            }
          });
        });

        var _nameService = require("./name-service.js");

        Object.keys(_nameService).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _nameService[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _nameService[key];
            }
          });
        });

        var _dynamic_fields = require("./dynamic_fields.js");

        Object.keys(_dynamic_fields).forEach(function (key) {
          if (key === "default" || key === "__esModule") return;
          if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
          if (key in exports && exports[key] === _dynamic_fields[key]) return;
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
              return _dynamic_fields[key];
            }
          });
        });

        var _checkpoints = require("./checkpoints.js");
      }, {
        "../framework/framework.js": 20,
        "./checkpoints.js": 43,
        "./coin.js": 44,
        "./common.js": 45,
        "./dynamic_fields.js": 46,
        "./epochs.js": 47,
        "./events.js": 48,
        "./faucet.js": 49,
        "./name-service.js": 52,
        "./normalized.js": 53,
        "./objects.js": 54,
        "./subscriptions.js": 56,
        "./sui-bcs.js": 57,
        "./transactions.js": 58,
        "./validator.js": 59
      }],
      51: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.NetworkMetrics = exports.AddressMetrics = void 0;

        var _superstruct = require("superstruct");

        const NetworkMetrics = (0, _superstruct.object)({
          currentTps: (0, _superstruct.number)(),
          tps30Days: (0, _superstruct.number)(),
          currentCheckpoint: (0, _superstruct.string)(),
          currentEpoch: (0, _superstruct.string)(),
          totalAddresses: (0, _superstruct.string)(),
          totalObjects: (0, _superstruct.string)(),
          totalPackages: (0, _superstruct.string)()
        });
        exports.NetworkMetrics = NetworkMetrics;
        const AddressMetrics = (0, _superstruct.object)({
          checkpoint: (0, _superstruct.number)(),
          epoch: (0, _superstruct.number)(),
          timestampMs: (0, _superstruct.number)(),
          cumulativeAddresses: (0, _superstruct.number)(),
          cumulativeActiveAddresses: (0, _superstruct.number)(),
          dailyActiveAddresses: (0, _superstruct.number)()
        });
        exports.AddressMetrics = AddressMetrics;
      }, {
        "superstruct": 120
      }],
      52: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.ResolvedNameServiceNames = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const ResolvedNameServiceNames = (0, _superstruct.object)({
          data: (0, _superstruct.array)((0, _superstruct.string)()),
          hasNextPage: (0, _superstruct.boolean)(),
          nextCursor: (0, _superstruct.nullable)(_common.ObjectId)
        });
        exports.ResolvedNameServiceNames = ResolvedNameServiceNames;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      53: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SuiMoveVisibility = exports.SuiMoveStructTypeParameter = exports.SuiMoveNormalizedTypeParameterType = exports.SuiMoveNormalizedType = exports.SuiMoveNormalizedStructType = exports.SuiMoveNormalizedStruct = exports.SuiMoveNormalizedModules = exports.SuiMoveNormalizedModule = exports.SuiMoveNormalizedFunction = exports.SuiMoveNormalizedField = exports.SuiMoveModuleId = exports.SuiMoveFunctionArgTypes = exports.SuiMoveFunctionArgType = exports.SuiMoveAbilitySet = exports.MoveCallMetrics = exports.MoveCallMetric = void 0;
        exports.extractMutableReference = extractMutableReference;
        exports.extractReference = extractReference;
        exports.extractStructTag = extractStructTag;

        var _superstruct = require("superstruct");

        const SuiMoveFunctionArgType = (0, _superstruct.union)([(0, _superstruct.string)(), (0, _superstruct.object)({
          Object: (0, _superstruct.string)()
        })]);
        exports.SuiMoveFunctionArgType = SuiMoveFunctionArgType;
        const SuiMoveFunctionArgTypes = (0, _superstruct.array)(SuiMoveFunctionArgType);
        exports.SuiMoveFunctionArgTypes = SuiMoveFunctionArgTypes;
        const SuiMoveModuleId = (0, _superstruct.object)({
          address: (0, _superstruct.string)(),
          name: (0, _superstruct.string)()
        });
        exports.SuiMoveModuleId = SuiMoveModuleId;
        const SuiMoveVisibility = (0, _superstruct.union)([(0, _superstruct.literal)("Private"), (0, _superstruct.literal)("Public"), (0, _superstruct.literal)("Friend")]);
        exports.SuiMoveVisibility = SuiMoveVisibility;
        const SuiMoveAbilitySet = (0, _superstruct.object)({
          abilities: (0, _superstruct.array)((0, _superstruct.string)())
        });
        exports.SuiMoveAbilitySet = SuiMoveAbilitySet;
        const SuiMoveStructTypeParameter = (0, _superstruct.object)({
          constraints: SuiMoveAbilitySet,
          isPhantom: (0, _superstruct.boolean)()
        });
        exports.SuiMoveStructTypeParameter = SuiMoveStructTypeParameter;
        const SuiMoveNormalizedTypeParameterType = (0, _superstruct.object)({
          TypeParameter: (0, _superstruct.number)()
        });
        exports.SuiMoveNormalizedTypeParameterType = SuiMoveNormalizedTypeParameterType;
        const MoveCallMetric = (0, _superstruct.tuple)([(0, _superstruct.object)({
          module: (0, _superstruct.string)(),
          package: (0, _superstruct.string)(),
          function: (0, _superstruct.string)()
        }), (0, _superstruct.string)()]);
        exports.MoveCallMetric = MoveCallMetric;
        const MoveCallMetrics = (0, _superstruct.object)({
          rank3Days: (0, _superstruct.array)(MoveCallMetric),
          rank7Days: (0, _superstruct.array)(MoveCallMetric),
          rank30Days: (0, _superstruct.array)(MoveCallMetric)
        });
        exports.MoveCallMetrics = MoveCallMetrics;

        function isSuiMoveNormalizedType(value) {
          if (!value) return false;
          if (typeof value === "string") return true;
          if ((0, _superstruct.is)(value, SuiMoveNormalizedTypeParameterType)) return true;
          if (isSuiMoveNormalizedStructType(value)) return true;
          if (typeof value !== "object") return false;
          const valueProperties = value;
          if ((0, _superstruct.is)(valueProperties.Reference, SuiMoveNormalizedType)) return true;
          if ((0, _superstruct.is)(valueProperties.MutableReference, SuiMoveNormalizedType)) return true;
          if ((0, _superstruct.is)(valueProperties.Vector, SuiMoveNormalizedType)) return true;
          return false;
        }

        const SuiMoveNormalizedType = (0, _superstruct.define)("SuiMoveNormalizedType", isSuiMoveNormalizedType);
        exports.SuiMoveNormalizedType = SuiMoveNormalizedType;

        function isSuiMoveNormalizedStructType(value) {
          if (!value || typeof value !== "object") return false;
          const valueProperties = value;
          if (!valueProperties.Struct || typeof valueProperties.Struct !== "object") return false;
          const structProperties = valueProperties.Struct;

          if (typeof structProperties.address !== "string" || typeof structProperties.module !== "string" || typeof structProperties.name !== "string" || !Array.isArray(structProperties.typeArguments) || !structProperties.typeArguments.every(value2 => isSuiMoveNormalizedType(value2))) {
            return false;
          }

          return true;
        }

        const SuiMoveNormalizedStructType = (0, _superstruct.define)("SuiMoveNormalizedStructType", isSuiMoveNormalizedStructType);
        exports.SuiMoveNormalizedStructType = SuiMoveNormalizedStructType;
        const SuiMoveNormalizedFunction = (0, _superstruct.object)({
          visibility: SuiMoveVisibility,
          isEntry: (0, _superstruct.boolean)(),
          typeParameters: (0, _superstruct.array)(SuiMoveAbilitySet),
          parameters: (0, _superstruct.array)(SuiMoveNormalizedType),
          return: (0, _superstruct.array)(SuiMoveNormalizedType)
        });
        exports.SuiMoveNormalizedFunction = SuiMoveNormalizedFunction;
        const SuiMoveNormalizedField = (0, _superstruct.object)({
          name: (0, _superstruct.string)(),
          type: SuiMoveNormalizedType
        });
        exports.SuiMoveNormalizedField = SuiMoveNormalizedField;
        const SuiMoveNormalizedStruct = (0, _superstruct.object)({
          abilities: SuiMoveAbilitySet,
          typeParameters: (0, _superstruct.array)(SuiMoveStructTypeParameter),
          fields: (0, _superstruct.array)(SuiMoveNormalizedField)
        });
        exports.SuiMoveNormalizedStruct = SuiMoveNormalizedStruct;
        const SuiMoveNormalizedModule = (0, _superstruct.object)({
          fileFormatVersion: (0, _superstruct.number)(),
          address: (0, _superstruct.string)(),
          name: (0, _superstruct.string)(),
          friends: (0, _superstruct.array)(SuiMoveModuleId),
          structs: (0, _superstruct.record)((0, _superstruct.string)(), SuiMoveNormalizedStruct),
          exposedFunctions: (0, _superstruct.record)((0, _superstruct.string)(), SuiMoveNormalizedFunction)
        });
        exports.SuiMoveNormalizedModule = SuiMoveNormalizedModule;
        const SuiMoveNormalizedModules = (0, _superstruct.record)((0, _superstruct.string)(), SuiMoveNormalizedModule);
        exports.SuiMoveNormalizedModules = SuiMoveNormalizedModules;

        function extractMutableReference(normalizedType) {
          return typeof normalizedType === "object" && "MutableReference" in normalizedType ? normalizedType.MutableReference : void 0;
        }

        function extractReference(normalizedType) {
          return typeof normalizedType === "object" && "Reference" in normalizedType ? normalizedType.Reference : void 0;
        }

        function extractStructTag(normalizedType) {
          if (typeof normalizedType === "object" && "Struct" in normalizedType) {
            return normalizedType;
          }

          const ref = extractReference(normalizedType);
          const mutRef = extractMutableReference(normalizedType);

          if (typeof ref === "object" && "Struct" in ref) {
            return ref;
          }

          if (typeof mutRef === "object" && "Struct" in mutRef) {
            return mutRef;
          }

          return void 0;
        }
      }, {
        "superstruct": 120
      }],
      54: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SuiRawMovePackage = exports.SuiRawMoveObject = exports.SuiRawData = exports.SuiParsedData = exports.SuiObjectResponseError = exports.SuiObjectResponse = exports.SuiObjectRef = exports.SuiObjectInfo = exports.SuiObjectDataOptions = exports.SuiObjectData = exports.SuiMovePackage = exports.SuiMoveObject = exports.SuiGasData = exports.SUI_DECIMALS = exports.PaginatedObjectsResponse = exports.ObjectType = exports.ObjectStatus = exports.ObjectRead = exports.ObjectDigest = exports.ObjectContentFields = exports.MovePackageContent = exports.MIST_PER_SUI = exports.GetOwnedObjectsResponse = exports.DisplayFieldsResponse = exports.DisplayFieldsBackwardCompatibleResponse = exports.CheckpointedObjectId = void 0;
        exports.getMoveObject = getMoveObject;
        exports.getMoveObjectType = getMoveObjectType;
        exports.getMovePackageContent = getMovePackageContent;
        exports.getObjectDeletedResponse = getObjectDeletedResponse;
        exports.getObjectDisplay = getObjectDisplay;
        exports.getObjectFields = getObjectFields;
        exports.getObjectId = getObjectId;
        exports.getObjectNotExistsResponse = getObjectNotExistsResponse;
        exports.getObjectOwner = getObjectOwner;
        exports.getObjectPreviousTransactionDigest = getObjectPreviousTransactionDigest;
        exports.getObjectReference = getObjectReference;
        exports.getObjectType = getObjectType;
        exports.getObjectVersion = getObjectVersion;
        exports.getSharedObjectInitialVersion = getSharedObjectInitialVersion;
        exports.getSuiObjectData = getSuiObjectData;
        exports.hasPublicTransfer = hasPublicTransfer;
        exports.isImmutableObject = isImmutableObject;
        exports.isSharedObject = isSharedObject;
        exports.isSuiObjectResponse = isSuiObjectResponse;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        const ObjectType = (0, _superstruct.union)([(0, _superstruct.string)(), (0, _superstruct.literal)("package")]);
        exports.ObjectType = ObjectType;
        const SuiObjectRef = (0, _superstruct.object)({
          /** Base64 string representing the object digest */
          digest: _common.TransactionDigest,

          /** Hex code as string representing the object id */
          objectId: (0, _superstruct.string)(),

          /** Object version */
          version: (0, _superstruct.union)([(0, _superstruct.number)(), (0, _superstruct.string)()])
        });
        exports.SuiObjectRef = SuiObjectRef;
        const SuiGasData = (0, _superstruct.object)({
          payment: (0, _superstruct.array)(SuiObjectRef),

          /** Gas Object's owner */
          owner: (0, _superstruct.string)(),
          price: (0, _superstruct.string)(),
          budget: (0, _superstruct.string)()
        });
        exports.SuiGasData = SuiGasData;
        const SuiObjectInfo = (0, _superstruct.assign)(SuiObjectRef, (0, _superstruct.object)({
          type: (0, _superstruct.string)(),
          owner: _common.ObjectOwner,
          previousTransaction: _common.TransactionDigest
        }));
        exports.SuiObjectInfo = SuiObjectInfo;
        const ObjectContentFields = (0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.any)());
        exports.ObjectContentFields = ObjectContentFields;
        const MovePackageContent = (0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.string)());
        exports.MovePackageContent = MovePackageContent;
        const SuiMoveObject = (0, _superstruct.object)({
          /** Move type (e.g., "0x2::coin::Coin<0x2::sui::SUI>") */
          type: (0, _superstruct.string)(),

          /** Fields and values stored inside the Move object */
          fields: ObjectContentFields,
          hasPublicTransfer: (0, _superstruct.boolean)()
        });
        exports.SuiMoveObject = SuiMoveObject;
        const SuiMovePackage = (0, _superstruct.object)({
          /** A mapping from module name to disassembled Move bytecode */
          disassembled: MovePackageContent
        });
        exports.SuiMovePackage = SuiMovePackage;
        const SuiParsedData = (0, _superstruct.union)([(0, _superstruct.assign)(SuiMoveObject, (0, _superstruct.object)({
          dataType: (0, _superstruct.literal)("moveObject")
        })), (0, _superstruct.assign)(SuiMovePackage, (0, _superstruct.object)({
          dataType: (0, _superstruct.literal)("package")
        }))]);
        exports.SuiParsedData = SuiParsedData;
        const SuiRawMoveObject = (0, _superstruct.object)({
          /** Move type (e.g., "0x2::coin::Coin<0x2::sui::SUI>") */
          type: (0, _superstruct.string)(),
          hasPublicTransfer: (0, _superstruct.boolean)(),
          version: (0, _superstruct.number)(),
          bcsBytes: (0, _superstruct.string)()
        });
        exports.SuiRawMoveObject = SuiRawMoveObject;
        const SuiRawMovePackage = (0, _superstruct.object)({
          id: _common.ObjectId,

          /** A mapping from module name to Move bytecode enocded in base64*/
          moduleMap: (0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.string)())
        });
        exports.SuiRawMovePackage = SuiRawMovePackage;
        const SuiRawData = (0, _superstruct.union)([(0, _superstruct.assign)(SuiRawMoveObject, (0, _superstruct.object)({
          dataType: (0, _superstruct.literal)("moveObject")
        })), (0, _superstruct.assign)(SuiRawMovePackage, (0, _superstruct.object)({
          dataType: (0, _superstruct.literal)("package")
        }))]);
        exports.SuiRawData = SuiRawData;
        const SUI_DECIMALS = 9;
        exports.SUI_DECIMALS = SUI_DECIMALS;
        const MIST_PER_SUI = BigInt(1e9);
        exports.MIST_PER_SUI = MIST_PER_SUI;
        const ObjectDigest = (0, _superstruct.string)();
        exports.ObjectDigest = ObjectDigest;
        const SuiObjectResponseError = (0, _superstruct.object)({
          code: (0, _superstruct.string)(),
          error: (0, _superstruct.optional)((0, _superstruct.string)()),
          object_id: (0, _superstruct.optional)(_common.ObjectId),
          parent_object_id: (0, _superstruct.optional)(_common.ObjectId),
          version: (0, _superstruct.optional)((0, _superstruct.number)()),
          digest: (0, _superstruct.optional)(ObjectDigest)
        });
        exports.SuiObjectResponseError = SuiObjectResponseError;
        const DisplayFieldsResponse = (0, _superstruct.object)({
          data: (0, _superstruct.nullable)((0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.string)())),
          error: (0, _superstruct.nullable)(SuiObjectResponseError)
        });
        exports.DisplayFieldsResponse = DisplayFieldsResponse;
        const DisplayFieldsBackwardCompatibleResponse = (0, _superstruct.union)([DisplayFieldsResponse, (0, _superstruct.optional)((0, _superstruct.record)((0, _superstruct.string)(), (0, _superstruct.string)()))]);
        exports.DisplayFieldsBackwardCompatibleResponse = DisplayFieldsBackwardCompatibleResponse;
        const SuiObjectData = (0, _superstruct.object)({
          objectId: _common.ObjectId,
          version: _common.SequenceNumber,
          digest: ObjectDigest,

          /**
           * Type of the object, default to be undefined unless SuiObjectDataOptions.showType is set to true
           */
          type: (0, _superstruct.optional)((0, _superstruct.string)()),

          /**
           * Move object content or package content, default to be undefined unless SuiObjectDataOptions.showContent is set to true
           */
          content: (0, _superstruct.optional)(SuiParsedData),

          /**
           * Move object content or package content in BCS bytes, default to be undefined unless SuiObjectDataOptions.showBcs is set to true
           */
          bcs: (0, _superstruct.optional)(SuiRawData),

          /**
           * The owner of this object. Default to be undefined unless SuiObjectDataOptions.showOwner is set to true
           */
          owner: (0, _superstruct.optional)(_common.ObjectOwner),

          /**
           * The digest of the transaction that created or last mutated this object.
           * Default to be undefined unless SuiObjectDataOptions.showPreviousTransaction is set to true
           */
          previousTransaction: (0, _superstruct.optional)(_common.TransactionDigest),

          /**
           * The amount of SUI we would rebate if this object gets deleted.
           * This number is re-calculated each time the object is mutated based on
           * the present storage gas price.
           * Default to be undefined unless SuiObjectDataOptions.showStorageRebate is set to true
           */
          storageRebate: (0, _superstruct.optional)((0, _superstruct.string)()),

          /**
           * Display metadata for this object, default to be undefined unless SuiObjectDataOptions.showDisplay is set to true
           * This can also be None if the struct type does not have Display defined
           * See more details in https://forums.sui.io/t/nft-object-display-proposal/4872
           */
          display: (0, _superstruct.optional)(DisplayFieldsBackwardCompatibleResponse)
        });
        exports.SuiObjectData = SuiObjectData;
        const SuiObjectDataOptions = (0, _superstruct.object)({
          /* Whether to fetch the object type, default to be true */
          showType: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the object content, default to be false */
          showContent: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the object content in BCS bytes, default to be false */
          showBcs: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the object owner, default to be false */
          showOwner: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the previous transaction digest, default to be false */
          showPreviousTransaction: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the storage rebate, default to be false */
          showStorageRebate: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to fetch the display metadata, default to be false */
          showDisplay: (0, _superstruct.optional)((0, _superstruct.boolean)())
        });
        exports.SuiObjectDataOptions = SuiObjectDataOptions;
        const ObjectStatus = (0, _superstruct.union)([(0, _superstruct.literal)("Exists"), (0, _superstruct.literal)("notExists"), (0, _superstruct.literal)("Deleted")]);
        exports.ObjectStatus = ObjectStatus;
        const GetOwnedObjectsResponse = (0, _superstruct.array)(SuiObjectInfo);
        exports.GetOwnedObjectsResponse = GetOwnedObjectsResponse;
        const SuiObjectResponse = (0, _superstruct.object)({
          data: (0, _superstruct.optional)(SuiObjectData),
          error: (0, _superstruct.optional)(SuiObjectResponseError)
        });
        exports.SuiObjectResponse = SuiObjectResponse;

        function getSuiObjectData(resp) {
          return resp.data;
        }

        function getObjectDeletedResponse(resp) {
          if (resp.error && "object_id" in resp.error && "version" in resp.error && "digest" in resp.error) {
            const error = resp.error;
            return {
              objectId: error.object_id,
              version: error.version,
              digest: error.digest
            };
          }

          return void 0;
        }

        function getObjectNotExistsResponse(resp) {
          if (resp.error && "object_id" in resp.error && !("version" in resp.error) && !("digest" in resp.error)) {
            return resp.error.object_id;
          }

          return void 0;
        }

        function getObjectReference(resp) {
          if ("reference" in resp) {
            return resp.reference;
          }

          const exists = getSuiObjectData(resp);

          if (exists) {
            return {
              objectId: exists.objectId,
              version: exists.version,
              digest: exists.digest
            };
          }

          return getObjectDeletedResponse(resp);
        }

        function getObjectId(data) {
          if ("objectId" in data) {
            return data.objectId;
          }

          return getObjectReference(data)?.objectId ?? getObjectNotExistsResponse(data);
        }

        function getObjectVersion(data) {
          if ("version" in data) {
            return data.version;
          }

          return getObjectReference(data)?.version;
        }

        function isSuiObjectResponse(resp) {
          return resp.data !== void 0;
        }

        function getObjectType(resp) {
          const data = isSuiObjectResponse(resp) ? resp.data : resp;

          if (!data?.type && "data" in resp) {
            if (data?.content?.dataType === "package") {
              return "package";
            }

            return getMoveObjectType(resp);
          }

          return data?.type;
        }

        function getObjectPreviousTransactionDigest(resp) {
          return getSuiObjectData(resp)?.previousTransaction;
        }

        function getObjectOwner(resp) {
          if ((0, _superstruct.is)(resp, _common.ObjectOwner)) {
            return resp;
          }

          return getSuiObjectData(resp)?.owner;
        }

        function getObjectDisplay(resp) {
          const display = getSuiObjectData(resp)?.display;

          if (!display) {
            return {
              data: null,
              error: null
            };
          }

          if ((0, _superstruct.is)(display, DisplayFieldsResponse)) {
            return display;
          }

          return {
            data: display,
            error: null
          };
        }

        function getSharedObjectInitialVersion(resp) {
          const owner = getObjectOwner(resp);

          if (typeof owner === "object" && "Shared" in owner) {
            return owner.Shared.initial_shared_version;
          } else {
            return void 0;
          }
        }

        function isSharedObject(resp) {
          const owner = getObjectOwner(resp);
          return typeof owner === "object" && "Shared" in owner;
        }

        function isImmutableObject(resp) {
          const owner = getObjectOwner(resp);
          return owner === "Immutable";
        }

        function getMoveObjectType(resp) {
          return getMoveObject(resp)?.type;
        }

        function getObjectFields(resp) {
          if ("fields" in resp) {
            return resp.fields;
          }

          return getMoveObject(resp)?.fields;
        }

        function isSuiObjectDataWithContent(data) {
          return data.content !== void 0;
        }

        function getMoveObject(data) {
          const suiObject = "data" in data ? getSuiObjectData(data) : data;

          if (!suiObject || !isSuiObjectDataWithContent(suiObject) || suiObject.content.dataType !== "moveObject") {
            return void 0;
          }

          return suiObject.content;
        }

        function hasPublicTransfer(data) {
          return getMoveObject(data)?.hasPublicTransfer ?? false;
        }

        function getMovePackageContent(data) {
          if ("disassembled" in data) {
            return data.disassembled;
          }

          const suiObject = getSuiObjectData(data);

          if (suiObject?.content?.dataType !== "package") {
            return void 0;
          }

          return suiObject.content.disassembled;
        }

        const CheckpointedObjectId = (0, _superstruct.object)({
          objectId: _common.ObjectId,
          atCheckpoint: (0, _superstruct.optional)((0, _superstruct.number)())
        });
        exports.CheckpointedObjectId = CheckpointedObjectId;
        const PaginatedObjectsResponse = (0, _superstruct.object)({
          data: (0, _superstruct.array)(SuiObjectResponse),
          // TODO: remove union after 0.30.0 is released
          nextCursor: (0, _superstruct.union)([(0, _superstruct.nullable)(_common.ObjectId), (0, _superstruct.nullable)(CheckpointedObjectId)]),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.PaginatedObjectsResponse = PaginatedObjectsResponse;
        const ObjectRead = (0, _superstruct.union)([(0, _superstruct.object)({
          details: SuiObjectData,
          status: (0, _superstruct.literal)("VersionFound")
        }), (0, _superstruct.object)({
          details: _common.ObjectId,
          status: (0, _superstruct.literal)("ObjectNotExists")
        }), (0, _superstruct.object)({
          details: SuiObjectRef,
          status: (0, _superstruct.literal)("ObjectDeleted")
        }), (0, _superstruct.object)({
          details: (0, _superstruct.tuple)([_common.ObjectId, (0, _superstruct.number)()]),
          status: (0, _superstruct.literal)("VersionNotFound")
        }), (0, _superstruct.object)({
          details: (0, _superstruct.object)({
            asked_version: (0, _superstruct.number)(),
            latest_version: (0, _superstruct.number)(),
            object_id: _common.ObjectId
          }),
          status: (0, _superstruct.literal)("VersionTooHigh")
        })]);
        exports.ObjectRead = ObjectRead;
      }, {
        "./common.js": 45,
        "superstruct": 120
      }],
      55: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.getOption = getOption;

        function getOption(option) {
          if (typeof option === "object" && option !== null && "type" in option && option.type.startsWith("0x1::option::Option<")) {
            return void 0;
          }

          return option;
        }
      }, {}],
      56: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SubscriptionId = void 0;

        var _superstruct = require("superstruct");

        const SubscriptionId = (0, _superstruct.number)();
        exports.SubscriptionId = SubscriptionId;
      }, {
        "superstruct": 120
      }],
      57: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.bcs = void 0;
        exports.isPureArg = isPureArg;

        var _bcs = require("@mysten/bcs");

        function isPureArg(arg) {
          return arg.Pure !== void 0;
        }

        const VECTOR = "vector";
        const TransactionDataV1 = {
          kind: "TransactionKind",
          sender: _bcs.BCS.ADDRESS,
          gasData: "GasData",
          expiration: "TransactionExpiration"
        };
        const BCS_SPEC = {
          enums: {
            "Option<T>": {
              None: null,
              Some: "T"
            },
            ObjectArg: {
              ImmOrOwned: "SuiObjectRef",
              Shared: "SharedObjectRef"
            },
            CallArg: {
              Pure: [VECTOR, _bcs.BCS.U8],
              Object: "ObjectArg",
              ObjVec: [VECTOR, "ObjectArg"]
            },
            TypeTag: {
              bool: null,
              u8: null,
              u64: null,
              u128: null,
              address: null,
              signer: null,
              vector: "TypeTag",
              struct: "StructTag",
              u16: null,
              u32: null,
              u256: null
            },
            TransactionKind: {
              // can not be called from sui.js; dummy placement
              // to set the enum counter right for ProgrammableTransact
              ProgrammableTransaction: "ProgrammableTransaction",
              ChangeEpoch: null,
              Genesis: null,
              ConsensusCommitPrologue: null
            },
            TransactionExpiration: {
              None: null,
              Epoch: "unsafe_u64"
            },
            TransactionData: {
              V1: "TransactionDataV1"
            }
          },
          structs: {
            SuiObjectRef: {
              objectId: _bcs.BCS.ADDRESS,
              version: _bcs.BCS.U64,
              digest: "ObjectDigest"
            },
            SharedObjectRef: {
              objectId: _bcs.BCS.ADDRESS,
              initialSharedVersion: _bcs.BCS.U64,
              mutable: _bcs.BCS.BOOL
            },
            StructTag: {
              address: _bcs.BCS.ADDRESS,
              module: _bcs.BCS.STRING,
              name: _bcs.BCS.STRING,
              typeParams: [VECTOR, "TypeTag"]
            },
            GasData: {
              payment: [VECTOR, "SuiObjectRef"],
              owner: _bcs.BCS.ADDRESS,
              price: _bcs.BCS.U64,
              budget: _bcs.BCS.U64
            },
            // Signed transaction data needed to generate transaction digest.
            SenderSignedData: {
              data: "TransactionData",
              txSignatures: [VECTOR, [VECTOR, _bcs.BCS.U8]]
            },
            TransactionDataV1
          },
          aliases: {
            ObjectDigest: _bcs.BCS.BASE58
          }
        };
        const bcs = new _bcs.BCS({ ...(0, _bcs.getSuiMoveConfig)(),
          types: BCS_SPEC
        });
        exports.bcs = bcs;
        bcs.registerType("utf8string", (writer, str) => {
          const bytes = Array.from(new TextEncoder().encode(str));
          return writer.writeVec(bytes, (writer2, el) => writer2.write8(el));
        }, reader => {
          let bytes = reader.readVec(reader2 => reader2.read8());
          return new TextDecoder().decode(new Uint8Array(bytes));
        });
        bcs.registerType("unsafe_u64", (writer, data) => writer.write64(data), reader => Number.parseInt(reader.read64(), 10));
      }, {
        "@mysten/bcs": 4
      }],
      58: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TransactionEvents = exports.TransactionEffectsModifiedAtVersions = exports.TransactionEffects = exports.SuiTransactionBlockResponseOptions = exports.SuiTransactionBlockResponse = exports.SuiTransactionBlockKind = exports.SuiTransactionBlockData = exports.SuiTransactionBlock = exports.SuiTransaction = exports.SuiObjectChangeWrapped = exports.SuiObjectChangeTransferred = exports.SuiObjectChangePublished = exports.SuiObjectChangeMutated = exports.SuiObjectChangeDeleted = exports.SuiObjectChangeCreated = exports.SuiObjectChange = exports.SuiConsensusCommitPrologue = exports.SuiChangeEpoch = exports.SuiCallArg = exports.SuiArgument = exports.ProgrammableTransaction = exports.PaginatedTransactionResponse = exports.OwnedObjectRef = exports.MoveCallSuiTransaction = exports.Genesis = exports.GenericAuthoritySignature = exports.GasCostSummary = exports.ExecutionStatusType = exports.ExecutionStatus = exports.EpochId = exports.DryRunTransactionBlockResponse = exports.DevInspectResults = exports.BalanceChange = exports.AuthoritySignature = exports.AuthorityQuorumSignInfo = exports.AuthorityName = void 0;
        exports.getChangeEpochTransaction = getChangeEpochTransaction;
        exports.getConsensusCommitPrologueTransaction = getConsensusCommitPrologueTransaction;
        exports.getCreatedObjects = getCreatedObjects;
        exports.getEvents = getEvents;
        exports.getExecutionStatus = getExecutionStatus;
        exports.getExecutionStatusError = getExecutionStatusError;
        exports.getExecutionStatusGasSummary = getExecutionStatusGasSummary;
        exports.getExecutionStatusType = getExecutionStatusType;
        exports.getGasData = getGasData;
        exports.getNewlyCreatedCoinRefsAfterSplit = getNewlyCreatedCoinRefsAfterSplit;
        exports.getObjectChanges = getObjectChanges;
        exports.getProgrammableTransaction = getProgrammableTransaction;
        exports.getPublishedObjectChanges = getPublishedObjectChanges;
        exports.getTimestampFromTransactionResponse = getTimestampFromTransactionResponse;
        exports.getTotalGasUsed = getTotalGasUsed;
        exports.getTotalGasUsedUpperBound = getTotalGasUsedUpperBound;
        exports.getTransaction = getTransaction;
        exports.getTransactionDigest = getTransactionDigest;
        exports.getTransactionEffects = getTransactionEffects;
        exports.getTransactionGasBudget = getTransactionGasBudget;
        exports.getTransactionGasObject = getTransactionGasObject;
        exports.getTransactionGasPrice = getTransactionGasPrice;
        exports.getTransactionKind = getTransactionKind;
        exports.getTransactionKindName = getTransactionKindName;
        exports.getTransactionSender = getTransactionSender;
        exports.getTransactionSignature = getTransactionSignature;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        var _events = require("./events.js");

        var _objects = require("./objects.js");

        const EpochId = (0, _superstruct.string)();
        exports.EpochId = EpochId;
        const SuiChangeEpoch = (0, _superstruct.object)({
          epoch: EpochId,
          storage_charge: (0, _superstruct.string)(),
          computation_charge: (0, _superstruct.string)(),
          storage_rebate: (0, _superstruct.string)(),
          epoch_start_timestamp_ms: (0, _superstruct.optional)((0, _superstruct.string)())
        });
        exports.SuiChangeEpoch = SuiChangeEpoch;
        const SuiConsensusCommitPrologue = (0, _superstruct.object)({
          epoch: EpochId,
          round: (0, _superstruct.string)(),
          commit_timestamp_ms: (0, _superstruct.string)()
        });
        exports.SuiConsensusCommitPrologue = SuiConsensusCommitPrologue;
        const Genesis = (0, _superstruct.object)({
          objects: (0, _superstruct.array)(_common.ObjectId)
        });
        exports.Genesis = Genesis;
        const SuiArgument = (0, _superstruct.union)([(0, _superstruct.literal)("GasCoin"), (0, _superstruct.object)({
          Input: (0, _superstruct.number)()
        }), (0, _superstruct.object)({
          Result: (0, _superstruct.number)()
        }), (0, _superstruct.object)({
          NestedResult: (0, _superstruct.tuple)([(0, _superstruct.number)(), (0, _superstruct.number)()])
        })]);
        exports.SuiArgument = SuiArgument;
        const MoveCallSuiTransaction = (0, _superstruct.object)({
          arguments: (0, _superstruct.optional)((0, _superstruct.array)(SuiArgument)),
          type_arguments: (0, _superstruct.optional)((0, _superstruct.array)((0, _superstruct.string)())),
          package: _common.ObjectId,
          module: (0, _superstruct.string)(),
          function: (0, _superstruct.string)()
        });
        exports.MoveCallSuiTransaction = MoveCallSuiTransaction;
        const SuiTransaction = (0, _superstruct.union)([(0, _superstruct.object)({
          MoveCall: MoveCallSuiTransaction
        }), (0, _superstruct.object)({
          TransferObjects: (0, _superstruct.tuple)([(0, _superstruct.array)(SuiArgument), SuiArgument])
        }), (0, _superstruct.object)({
          SplitCoins: (0, _superstruct.tuple)([SuiArgument, (0, _superstruct.array)(SuiArgument)])
        }), (0, _superstruct.object)({
          MergeCoins: (0, _superstruct.tuple)([SuiArgument, (0, _superstruct.array)(SuiArgument)])
        }), (0, _superstruct.object)({
          Publish: (0, _superstruct.union)([// TODO: Remove this after 0.34 is released:
          (0, _superstruct.tuple)([_objects.SuiMovePackage, (0, _superstruct.array)(_common.ObjectId)]), (0, _superstruct.array)(_common.ObjectId)])
        }), (0, _superstruct.object)({
          Upgrade: (0, _superstruct.union)([// TODO: Remove this after 0.34 is released:
          (0, _superstruct.tuple)([_objects.SuiMovePackage, (0, _superstruct.array)(_common.ObjectId), _common.ObjectId, SuiArgument]), (0, _superstruct.tuple)([(0, _superstruct.array)(_common.ObjectId), _common.ObjectId, SuiArgument])])
        }), (0, _superstruct.object)({
          MakeMoveVec: (0, _superstruct.tuple)([(0, _superstruct.nullable)((0, _superstruct.string)()), (0, _superstruct.array)(SuiArgument)])
        })]);
        exports.SuiTransaction = SuiTransaction;
        const SuiCallArg = (0, _superstruct.union)([(0, _superstruct.object)({
          type: (0, _superstruct.literal)("pure"),
          valueType: (0, _superstruct.nullable)((0, _superstruct.string)()),
          value: _common.SuiJsonValue
        }), (0, _superstruct.object)({
          type: (0, _superstruct.literal)("object"),
          objectType: (0, _superstruct.literal)("immOrOwnedObject"),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber,
          digest: _objects.ObjectDigest
        }), (0, _superstruct.object)({
          type: (0, _superstruct.literal)("object"),
          objectType: (0, _superstruct.literal)("sharedObject"),
          objectId: _common.ObjectId,
          initialSharedVersion: _common.SequenceNumber,
          mutable: (0, _superstruct.boolean)()
        })]);
        exports.SuiCallArg = SuiCallArg;
        const ProgrammableTransaction = (0, _superstruct.object)({
          transactions: (0, _superstruct.array)(SuiTransaction),
          inputs: (0, _superstruct.array)(SuiCallArg)
        });
        exports.ProgrammableTransaction = ProgrammableTransaction;
        const SuiTransactionBlockKind = (0, _superstruct.union)([(0, _superstruct.assign)(SuiChangeEpoch, (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("ChangeEpoch")
        })), (0, _superstruct.assign)(SuiConsensusCommitPrologue, (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("ConsensusCommitPrologue")
        })), (0, _superstruct.assign)(Genesis, (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("Genesis")
        })), (0, _superstruct.assign)(ProgrammableTransaction, (0, _superstruct.object)({
          kind: (0, _superstruct.literal)("ProgrammableTransaction")
        }))]);
        exports.SuiTransactionBlockKind = SuiTransactionBlockKind;
        const SuiTransactionBlockData = (0, _superstruct.object)({
          // Eventually this will become union(literal('v1'), literal('v2'), ...)
          messageVersion: (0, _superstruct.literal)("v1"),
          transaction: SuiTransactionBlockKind,
          sender: _common.SuiAddress,
          gasData: _objects.SuiGasData
        });
        exports.SuiTransactionBlockData = SuiTransactionBlockData;
        const AuthoritySignature = (0, _superstruct.string)();
        exports.AuthoritySignature = AuthoritySignature;
        const GenericAuthoritySignature = (0, _superstruct.union)([AuthoritySignature, (0, _superstruct.array)(AuthoritySignature)]);
        exports.GenericAuthoritySignature = GenericAuthoritySignature;
        const AuthorityQuorumSignInfo = (0, _superstruct.object)({
          epoch: EpochId,
          signature: GenericAuthoritySignature,
          signers_map: (0, _superstruct.array)((0, _superstruct.number)())
        });
        exports.AuthorityQuorumSignInfo = AuthorityQuorumSignInfo;
        const GasCostSummary = (0, _superstruct.object)({
          computationCost: (0, _superstruct.string)(),
          storageCost: (0, _superstruct.string)(),
          storageRebate: (0, _superstruct.string)(),
          nonRefundableStorageFee: (0, _superstruct.string)()
        });
        exports.GasCostSummary = GasCostSummary;
        const ExecutionStatusType = (0, _superstruct.union)([(0, _superstruct.literal)("success"), (0, _superstruct.literal)("failure")]);
        exports.ExecutionStatusType = ExecutionStatusType;
        const ExecutionStatus = (0, _superstruct.object)({
          status: ExecutionStatusType,
          error: (0, _superstruct.optional)((0, _superstruct.string)())
        });
        exports.ExecutionStatus = ExecutionStatus;
        const OwnedObjectRef = (0, _superstruct.object)({
          owner: _common.ObjectOwner,
          reference: _objects.SuiObjectRef
        });
        exports.OwnedObjectRef = OwnedObjectRef;
        const TransactionEffectsModifiedAtVersions = (0, _superstruct.object)({
          objectId: _common.ObjectId,
          sequenceNumber: _common.SequenceNumber
        });
        exports.TransactionEffectsModifiedAtVersions = TransactionEffectsModifiedAtVersions;
        const TransactionEffects = (0, _superstruct.object)({
          // Eventually this will become union(literal('v1'), literal('v2'), ...)
          messageVersion: (0, _superstruct.literal)("v1"),

          /** The status of the execution */
          status: ExecutionStatus,

          /** The epoch when this transaction was executed */
          executedEpoch: EpochId,

          /** The version that every modified (mutated or deleted) object had before it was modified by this transaction. **/
          modifiedAtVersions: (0, _superstruct.optional)((0, _superstruct.array)(TransactionEffectsModifiedAtVersions)),
          gasUsed: GasCostSummary,

          /** The object references of the shared objects used in this transaction. Empty if no shared objects were used. */
          sharedObjects: (0, _superstruct.optional)((0, _superstruct.array)(_objects.SuiObjectRef)),

          /** The transaction digest */
          transactionDigest: _common.TransactionDigest,

          /** ObjectRef and owner of new objects created */
          created: (0, _superstruct.optional)((0, _superstruct.array)(OwnedObjectRef)),

          /** ObjectRef and owner of mutated objects, including gas object */
          mutated: (0, _superstruct.optional)((0, _superstruct.array)(OwnedObjectRef)),

          /**
           * ObjectRef and owner of objects that are unwrapped in this transaction.
           * Unwrapped objects are objects that were wrapped into other objects in the past,
           * and just got extracted out.
           */
          unwrapped: (0, _superstruct.optional)((0, _superstruct.array)(OwnedObjectRef)),

          /** Object Refs of objects now deleted (the old refs) */
          deleted: (0, _superstruct.optional)((0, _superstruct.array)(_objects.SuiObjectRef)),

          /** Object Refs of objects now deleted (the old refs) */
          unwrappedThenDeleted: (0, _superstruct.optional)((0, _superstruct.array)(_objects.SuiObjectRef)),

          /** Object refs of objects now wrapped in other objects */
          wrapped: (0, _superstruct.optional)((0, _superstruct.array)(_objects.SuiObjectRef)),

          /**
           * The updated gas object reference. Have a dedicated field for convenient access.
           * It's also included in mutated.
           */
          gasObject: OwnedObjectRef,

          /** The events emitted during execution. Note that only successful transactions emit events */
          eventsDigest: (0, _superstruct.optional)(_common.TransactionEventDigest),

          /** The set of transaction digests this transaction depends on */
          dependencies: (0, _superstruct.optional)((0, _superstruct.array)(_common.TransactionDigest))
        });
        exports.TransactionEffects = TransactionEffects;
        const TransactionEvents = (0, _superstruct.array)(_events.SuiEvent);
        exports.TransactionEvents = TransactionEvents;
        const ReturnValueType = (0, _superstruct.tuple)([(0, _superstruct.array)((0, _superstruct.number)()), (0, _superstruct.string)()]);
        const MutableReferenceOutputType = (0, _superstruct.tuple)([SuiArgument, (0, _superstruct.array)((0, _superstruct.number)()), (0, _superstruct.string)()]);
        const ExecutionResultType = (0, _superstruct.object)({
          mutableReferenceOutputs: (0, _superstruct.optional)((0, _superstruct.array)(MutableReferenceOutputType)),
          returnValues: (0, _superstruct.optional)((0, _superstruct.array)(ReturnValueType))
        });
        const DevInspectResults = (0, _superstruct.object)({
          effects: TransactionEffects,
          events: TransactionEvents,
          results: (0, _superstruct.optional)((0, _superstruct.array)(ExecutionResultType)),
          error: (0, _superstruct.optional)((0, _superstruct.string)())
        });
        exports.DevInspectResults = DevInspectResults;
        const AuthorityName = (0, _superstruct.string)();
        exports.AuthorityName = AuthorityName;
        const SuiTransactionBlock = (0, _superstruct.object)({
          data: SuiTransactionBlockData,
          txSignatures: (0, _superstruct.array)((0, _superstruct.string)())
        });
        exports.SuiTransactionBlock = SuiTransactionBlock;
        const SuiObjectChangePublished = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("published"),
          packageId: _common.ObjectId,
          version: _common.SequenceNumber,
          digest: _objects.ObjectDigest,
          modules: (0, _superstruct.array)((0, _superstruct.string)())
        });
        exports.SuiObjectChangePublished = SuiObjectChangePublished;
        const SuiObjectChangeTransferred = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("transferred"),
          sender: _common.SuiAddress,
          recipient: _common.ObjectOwner,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber,
          digest: _objects.ObjectDigest
        });
        exports.SuiObjectChangeTransferred = SuiObjectChangeTransferred;
        const SuiObjectChangeMutated = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("mutated"),
          sender: _common.SuiAddress,
          owner: _common.ObjectOwner,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber,
          previousVersion: _common.SequenceNumber,
          digest: _objects.ObjectDigest
        });
        exports.SuiObjectChangeMutated = SuiObjectChangeMutated;
        const SuiObjectChangeDeleted = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("deleted"),
          sender: _common.SuiAddress,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber
        });
        exports.SuiObjectChangeDeleted = SuiObjectChangeDeleted;
        const SuiObjectChangeWrapped = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("wrapped"),
          sender: _common.SuiAddress,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber
        });
        exports.SuiObjectChangeWrapped = SuiObjectChangeWrapped;
        const SuiObjectChangeCreated = (0, _superstruct.object)({
          type: (0, _superstruct.literal)("created"),
          sender: _common.SuiAddress,
          owner: _common.ObjectOwner,
          objectType: (0, _superstruct.string)(),
          objectId: _common.ObjectId,
          version: _common.SequenceNumber,
          digest: _objects.ObjectDigest
        });
        exports.SuiObjectChangeCreated = SuiObjectChangeCreated;
        const SuiObjectChange = (0, _superstruct.union)([SuiObjectChangePublished, SuiObjectChangeTransferred, SuiObjectChangeMutated, SuiObjectChangeDeleted, SuiObjectChangeWrapped, SuiObjectChangeCreated]);
        exports.SuiObjectChange = SuiObjectChange;
        const BalanceChange = (0, _superstruct.object)({
          owner: _common.ObjectOwner,
          coinType: (0, _superstruct.string)(),

          /* Coin balance change(positive means receive, negative means send) */
          amount: (0, _superstruct.string)()
        });
        exports.BalanceChange = BalanceChange;
        const SuiTransactionBlockResponse = (0, _superstruct.object)({
          digest: _common.TransactionDigest,
          transaction: (0, _superstruct.optional)(SuiTransactionBlock),
          effects: (0, _superstruct.optional)(TransactionEffects),
          events: (0, _superstruct.optional)(TransactionEvents),
          timestampMs: (0, _superstruct.optional)((0, _superstruct.string)()),
          checkpoint: (0, _superstruct.optional)((0, _superstruct.string)()),
          confirmedLocalExecution: (0, _superstruct.optional)((0, _superstruct.boolean)()),
          objectChanges: (0, _superstruct.optional)((0, _superstruct.array)(SuiObjectChange)),
          balanceChanges: (0, _superstruct.optional)((0, _superstruct.array)(BalanceChange)),

          /* Errors that occurred in fetching/serializing the transaction. */
          errors: (0, _superstruct.optional)((0, _superstruct.array)((0, _superstruct.string)()))
        });
        exports.SuiTransactionBlockResponse = SuiTransactionBlockResponse;
        const SuiTransactionBlockResponseOptions = (0, _superstruct.object)({
          /* Whether to show transaction input data. Default to be false. */
          showInput: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to show transaction effects. Default to be false. */
          showEffects: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to show transaction events. Default to be false. */
          showEvents: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to show object changes. Default to be false. */
          showObjectChanges: (0, _superstruct.optional)((0, _superstruct.boolean)()),

          /* Whether to show coin balance changes. Default to be false. */
          showBalanceChanges: (0, _superstruct.optional)((0, _superstruct.boolean)())
        });
        exports.SuiTransactionBlockResponseOptions = SuiTransactionBlockResponseOptions;
        const PaginatedTransactionResponse = (0, _superstruct.object)({
          data: (0, _superstruct.array)(SuiTransactionBlockResponse),
          nextCursor: (0, _superstruct.nullable)(_common.TransactionDigest),
          hasNextPage: (0, _superstruct.boolean)()
        });
        exports.PaginatedTransactionResponse = PaginatedTransactionResponse;
        const DryRunTransactionBlockResponse = (0, _superstruct.object)({
          effects: TransactionEffects,
          events: TransactionEvents,
          objectChanges: (0, _superstruct.array)(SuiObjectChange),
          balanceChanges: (0, _superstruct.array)(BalanceChange),
          // TODO: Remove optional when this is rolled out to all networks:
          input: (0, _superstruct.optional)(SuiTransactionBlockData)
        });
        exports.DryRunTransactionBlockResponse = DryRunTransactionBlockResponse;

        function getTransaction(tx) {
          return tx.transaction;
        }

        function getTransactionDigest(tx) {
          return tx.digest;
        }

        function getTransactionSignature(tx) {
          return tx.transaction?.txSignatures;
        }

        function getTransactionSender(tx) {
          return tx.transaction?.data.sender;
        }

        function getGasData(tx) {
          return tx.transaction?.data.gasData;
        }

        function getTransactionGasObject(tx) {
          return getGasData(tx)?.payment;
        }

        function getTransactionGasPrice(tx) {
          return getGasData(tx)?.price;
        }

        function getTransactionGasBudget(tx) {
          return getGasData(tx)?.budget;
        }

        function getChangeEpochTransaction(data) {
          return data.kind === "ChangeEpoch" ? data : void 0;
        }

        function getConsensusCommitPrologueTransaction(data) {
          return data.kind === "ConsensusCommitPrologue" ? data : void 0;
        }

        function getTransactionKind(data) {
          return data.transaction?.data.transaction;
        }

        function getTransactionKindName(data) {
          return data.kind;
        }

        function getProgrammableTransaction(data) {
          return data.kind === "ProgrammableTransaction" ? data : void 0;
        }

        function getExecutionStatusType(data) {
          return getExecutionStatus(data)?.status;
        }

        function getExecutionStatus(data) {
          return getTransactionEffects(data)?.status;
        }

        function getExecutionStatusError(data) {
          return getExecutionStatus(data)?.error;
        }

        function getExecutionStatusGasSummary(data) {
          if ((0, _superstruct.is)(data, TransactionEffects)) {
            return data.gasUsed;
          }

          return getTransactionEffects(data)?.gasUsed;
        }

        function getTotalGasUsed(data) {
          const gasSummary = getExecutionStatusGasSummary(data);
          return gasSummary ? BigInt(gasSummary.computationCost) + BigInt(gasSummary.storageCost) - BigInt(gasSummary.storageRebate) : void 0;
        }

        function getTotalGasUsedUpperBound(data) {
          const gasSummary = getExecutionStatusGasSummary(data);
          return gasSummary ? BigInt(gasSummary.computationCost) + BigInt(gasSummary.storageCost) : void 0;
        }

        function getTransactionEffects(data) {
          return data.effects;
        }

        function getEvents(data) {
          return data.events;
        }

        function getCreatedObjects(data) {
          return getTransactionEffects(data)?.created;
        }

        function getTimestampFromTransactionResponse(data) {
          return data.timestampMs ?? void 0;
        }

        function getNewlyCreatedCoinRefsAfterSplit(data) {
          return getTransactionEffects(data)?.created?.map(c => c.reference);
        }

        function getObjectChanges(data) {
          return data.objectChanges;
        }

        function getPublishedObjectChanges(data) {
          return data.objectChanges?.filter(a => (0, _superstruct.is)(a, SuiObjectChangePublished)) ?? [];
        }
      }, {
        "./common.js": 45,
        "./events.js": 48,
        "./objects.js": 54,
        "superstruct": 120
      }],
      59: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.ValidatorsApy = exports.Validators = exports.SuiValidatorSummary = exports.SuiSystemStateSummary = exports.SuiSupplyFields = exports.StakeSubsidyFields = exports.StakeSubsidy = exports.StakeObject = exports.DelegationStakingPoolFields = exports.DelegationStakingPool = exports.DelegatedStake = exports.ContentsFieldsWithdraw = exports.ContentsFields = exports.Contents = exports.CommitteeInfo = exports.Balance = exports.Apy = void 0;

        var _superstruct = require("superstruct");

        var _common = require("./common.js");

        var _transactions = require("./transactions.js");

        const Apy = (0, _superstruct.object)({
          apy: (0, _superstruct.number)(),
          address: _common.SuiAddress
        });
        exports.Apy = Apy;
        const ValidatorsApy = (0, _superstruct.object)({
          epoch: (0, _superstruct.string)(),
          apys: (0, _superstruct.array)(Apy)
        });
        exports.ValidatorsApy = ValidatorsApy;
        const Balance = (0, _superstruct.object)({
          value: (0, _superstruct.number)()
        });
        exports.Balance = Balance;
        const StakeObject = (0, _superstruct.object)({
          stakedSuiId: _common.ObjectId,
          stakeRequestEpoch: _transactions.EpochId,
          stakeActiveEpoch: _transactions.EpochId,
          principal: (0, _superstruct.string)(),
          status: (0, _superstruct.union)([(0, _superstruct.literal)("Active"), (0, _superstruct.literal)("Pending"), (0, _superstruct.literal)("Unstaked")]),
          estimatedReward: (0, _superstruct.optional)((0, _superstruct.string)())
        });
        exports.StakeObject = StakeObject;
        const DelegatedStake = (0, _superstruct.object)({
          validatorAddress: _common.SuiAddress,
          stakingPool: _common.ObjectId,
          stakes: (0, _superstruct.array)(StakeObject)
        });
        exports.DelegatedStake = DelegatedStake;
        const StakeSubsidyFields = (0, _superstruct.object)({
          balance: (0, _superstruct.object)({
            value: (0, _superstruct.number)()
          }),
          distribution_counter: (0, _superstruct.number)(),
          current_distribution_amount: (0, _superstruct.number)(),
          stake_subsidy_period_length: (0, _superstruct.number)(),
          stake_subsidy_decrease_rate: (0, _superstruct.number)()
        });
        exports.StakeSubsidyFields = StakeSubsidyFields;
        const StakeSubsidy = (0, _superstruct.object)({
          type: (0, _superstruct.string)(),
          fields: StakeSubsidyFields
        });
        exports.StakeSubsidy = StakeSubsidy;
        const SuiSupplyFields = (0, _superstruct.object)({
          value: (0, _superstruct.number)()
        });
        exports.SuiSupplyFields = SuiSupplyFields;
        const ContentsFields = (0, _superstruct.object)({
          id: (0, _superstruct.string)(),
          size: (0, _superstruct.number)(),
          head: (0, _superstruct.object)({
            vec: (0, _superstruct.array)()
          }),
          tail: (0, _superstruct.object)({
            vec: (0, _superstruct.array)()
          })
        });
        exports.ContentsFields = ContentsFields;
        const ContentsFieldsWithdraw = (0, _superstruct.object)({
          id: (0, _superstruct.string)(),
          size: (0, _superstruct.number)()
        });
        exports.ContentsFieldsWithdraw = ContentsFieldsWithdraw;
        const Contents = (0, _superstruct.object)({
          type: (0, _superstruct.string)(),
          fields: ContentsFields
        });
        exports.Contents = Contents;
        const DelegationStakingPoolFields = (0, _superstruct.object)({
          exchangeRates: (0, _superstruct.object)({
            id: (0, _superstruct.string)(),
            size: (0, _superstruct.number)()
          }),
          id: (0, _superstruct.string)(),
          pendingStake: (0, _superstruct.number)(),
          pendingPoolTokenWithdraw: (0, _superstruct.number)(),
          pendingTotalSuiWithdraw: (0, _superstruct.number)(),
          poolTokenBalance: (0, _superstruct.number)(),
          rewardsPool: (0, _superstruct.object)({
            value: (0, _superstruct.number)()
          }),
          activationEpoch: (0, _superstruct.object)({
            vec: (0, _superstruct.array)()
          }),
          deactivationEpoch: (0, _superstruct.object)({
            vec: (0, _superstruct.array)()
          }),
          suiBalance: (0, _superstruct.number)()
        });
        exports.DelegationStakingPoolFields = DelegationStakingPoolFields;
        const DelegationStakingPool = (0, _superstruct.object)({
          type: (0, _superstruct.string)(),
          fields: DelegationStakingPoolFields
        });
        exports.DelegationStakingPool = DelegationStakingPool;
        const Validators = (0, _superstruct.array)((0, _superstruct.tuple)([_transactions.AuthorityName, (0, _superstruct.string)()]));
        exports.Validators = Validators;
        const CommitteeInfo = (0, _superstruct.object)({
          epoch: _transactions.EpochId,

          /** Array of (validator public key, stake unit) tuple */
          validators: Validators
        });
        exports.CommitteeInfo = CommitteeInfo;
        const SuiValidatorSummary = (0, _superstruct.object)({
          suiAddress: _common.SuiAddress,
          protocolPubkeyBytes: (0, _superstruct.string)(),
          networkPubkeyBytes: (0, _superstruct.string)(),
          workerPubkeyBytes: (0, _superstruct.string)(),
          proofOfPossessionBytes: (0, _superstruct.string)(),
          operationCapId: (0, _superstruct.string)(),
          name: (0, _superstruct.string)(),
          description: (0, _superstruct.string)(),
          imageUrl: (0, _superstruct.string)(),
          projectUrl: (0, _superstruct.string)(),
          p2pAddress: (0, _superstruct.string)(),
          netAddress: (0, _superstruct.string)(),
          primaryAddress: (0, _superstruct.string)(),
          workerAddress: (0, _superstruct.string)(),
          nextEpochProtocolPubkeyBytes: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochProofOfPossession: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochNetworkPubkeyBytes: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochWorkerPubkeyBytes: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochNetAddress: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochP2pAddress: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochPrimaryAddress: (0, _superstruct.nullable)((0, _superstruct.string)()),
          nextEpochWorkerAddress: (0, _superstruct.nullable)((0, _superstruct.string)()),
          votingPower: (0, _superstruct.string)(),
          gasPrice: (0, _superstruct.string)(),
          commissionRate: (0, _superstruct.string)(),
          nextEpochStake: (0, _superstruct.string)(),
          nextEpochGasPrice: (0, _superstruct.string)(),
          nextEpochCommissionRate: (0, _superstruct.string)(),
          stakingPoolId: (0, _superstruct.string)(),
          stakingPoolActivationEpoch: (0, _superstruct.nullable)((0, _superstruct.string)()),
          stakingPoolDeactivationEpoch: (0, _superstruct.nullable)((0, _superstruct.string)()),
          stakingPoolSuiBalance: (0, _superstruct.string)(),
          rewardsPool: (0, _superstruct.string)(),
          poolTokenBalance: (0, _superstruct.string)(),
          pendingStake: (0, _superstruct.string)(),
          pendingPoolTokenWithdraw: (0, _superstruct.string)(),
          pendingTotalSuiWithdraw: (0, _superstruct.string)(),
          exchangeRatesId: (0, _superstruct.string)(),
          exchangeRatesSize: (0, _superstruct.string)()
        });
        exports.SuiValidatorSummary = SuiValidatorSummary;
        const SuiSystemStateSummary = (0, _superstruct.object)({
          epoch: (0, _superstruct.string)(),
          protocolVersion: (0, _superstruct.string)(),
          systemStateVersion: (0, _superstruct.string)(),
          storageFundTotalObjectStorageRebates: (0, _superstruct.string)(),
          storageFundNonRefundableBalance: (0, _superstruct.string)(),
          referenceGasPrice: (0, _superstruct.string)(),
          safeMode: (0, _superstruct.boolean)(),
          safeModeStorageRewards: (0, _superstruct.string)(),
          safeModeComputationRewards: (0, _superstruct.string)(),
          safeModeStorageRebates: (0, _superstruct.string)(),
          safeModeNonRefundableStorageFee: (0, _superstruct.string)(),
          epochStartTimestampMs: (0, _superstruct.string)(),
          epochDurationMs: (0, _superstruct.string)(),
          stakeSubsidyStartEpoch: (0, _superstruct.string)(),
          maxValidatorCount: (0, _superstruct.string)(),
          minValidatorJoiningStake: (0, _superstruct.string)(),
          validatorLowStakeThreshold: (0, _superstruct.string)(),
          validatorVeryLowStakeThreshold: (0, _superstruct.string)(),
          validatorLowStakeGracePeriod: (0, _superstruct.string)(),
          stakeSubsidyBalance: (0, _superstruct.string)(),
          stakeSubsidyDistributionCounter: (0, _superstruct.string)(),
          stakeSubsidyCurrentDistributionAmount: (0, _superstruct.string)(),
          stakeSubsidyPeriodLength: (0, _superstruct.string)(),
          stakeSubsidyDecreaseRate: (0, _superstruct.number)(),
          totalStake: (0, _superstruct.string)(),
          activeValidators: (0, _superstruct.array)(SuiValidatorSummary),
          pendingActiveValidatorsId: (0, _superstruct.string)(),
          pendingActiveValidatorsSize: (0, _superstruct.string)(),
          pendingRemovals: (0, _superstruct.array)((0, _superstruct.string)()),
          stakingPoolMappingsId: (0, _superstruct.string)(),
          stakingPoolMappingsSize: (0, _superstruct.string)(),
          inactivePoolsId: (0, _superstruct.string)(),
          inactivePoolsSize: (0, _superstruct.string)(),
          validatorCandidatesId: (0, _superstruct.string)(),
          validatorCandidatesSize: (0, _superstruct.string)(),
          atRiskValidators: (0, _superstruct.array)((0, _superstruct.tuple)([_common.SuiAddress, (0, _superstruct.string)()])),
          validatorReportRecords: (0, _superstruct.array)((0, _superstruct.tuple)([_common.SuiAddress, (0, _superstruct.array)(_common.SuiAddress)]))
        });
        exports.SuiSystemStateSummary = SuiSystemStateSummary;
      }, {
        "./common.js": 45,
        "./transactions.js": 58,
        "superstruct": 120
      }],
      60: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.replaceDerive = exports.pathRegex = exports.isValidPath = exports.getPublicKey = exports.getMasterKeyFromSeed = exports.derivePath = void 0;

        var _sha = require("@noble/hashes/sha512");

        var _hmac = require("@noble/hashes/hmac");

        var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

        var _bcs = require("@mysten/bcs");

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : {
            default: obj
          };
        }

        const ED25519_CURVE = "ed25519 seed";
        const HARDENED_OFFSET = 2147483648;
        const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
        exports.pathRegex = pathRegex;

        const replaceDerive = val => val.replace("'", "");

        exports.replaceDerive = replaceDerive;

        const getMasterKeyFromSeed = seed => {
          const h = _hmac.hmac.create(_sha.sha512, ED25519_CURVE);

          const I = h.update((0, _bcs.fromHEX)(seed)).digest();
          const IL = I.slice(0, 32);
          const IR = I.slice(32);
          return {
            key: IL,
            chainCode: IR
          };
        };

        exports.getMasterKeyFromSeed = getMasterKeyFromSeed;

        const CKDPriv = ({
          key,
          chainCode
        }, index) => {
          const indexBuffer = new ArrayBuffer(4);
          const cv = new DataView(indexBuffer);
          cv.setUint32(0, index);
          const data = new Uint8Array(1 + key.length + indexBuffer.byteLength);
          data.set(new Uint8Array(1).fill(0));
          data.set(key, 1);
          data.set(new Uint8Array(indexBuffer, 0, indexBuffer.byteLength), key.length + 1);

          const I = _hmac.hmac.create(_sha.sha512, chainCode).update(data).digest();

          const IL = I.slice(0, 32);
          const IR = I.slice(32);
          return {
            key: IL,
            chainCode: IR
          };
        };

        const getPublicKey = (privateKey, withZeroByte = true) => {
          const keyPair = _tweetnacl.default.sign.keyPair.fromSeed(privateKey);

          const signPk = keyPair.secretKey.subarray(32);
          const newArr = new Uint8Array(signPk.length + 1);
          newArr.set([0]);
          newArr.set(signPk, 1);
          return withZeroByte ? newArr : signPk;
        };

        exports.getPublicKey = getPublicKey;

        const isValidPath = path => {
          if (!pathRegex.test(path)) {
            return false;
          }

          return !path.split("/").slice(1).map(replaceDerive).some(isNaN
          /* ts T_T*/
          );
        };

        exports.isValidPath = isValidPath;

        const derivePath = (path, seed, offset = HARDENED_OFFSET) => {
          if (!isValidPath(path)) {
            throw new Error("Invalid derivation path");
          }

          const {
            key,
            chainCode
          } = getMasterKeyFromSeed(seed);
          const segments = path.split("/").slice(1).map(replaceDerive).map(el => parseInt(el, 10));
          return segments.reduce((parentKeys, segment) => CKDPriv(parentKeys, segment + offset), {
            key,
            chainCode
          });
        };

        exports.derivePath = derivePath;
      }, {
        "@mysten/bcs": 4,
        "@noble/hashes/hmac": 93,
        "@noble/hashes/sha512": 97,
        "tweetnacl": 123
      }],
      61: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.RPCValidationError = exports.FaucetRateLimitError = void 0;

        class RPCValidationError extends Error {
          constructor(options) {
            super("RPC Validation Error: The response returned from RPC server does not match the TypeScript definition. This is likely because the SDK version is not compatible with the RPC server.", {
              cause: options.cause
            });
            this.req = options.req;
            this.result = options.result;
            this.message = this.toString();
          }

          toString() {
            let str = super.toString();

            if (this.cause) {
              str += `
Cause: ${this.cause}`;
            }

            if (this.result) {
              str += `
Reponse Received: ${JSON.stringify(this.result, null, 2)}`;
            }

            return str;
          }

        }

        exports.RPCValidationError = RPCValidationError;

        class FaucetRateLimitError extends Error {}

        exports.FaucetRateLimitError = FaucetRateLimitError;
      }, {}],
      62: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.formatAddress = formatAddress;
        exports.formatDigest = formatDigest;
        const ELLIPSIS = "\u2026";

        function formatAddress(address) {
          if (address.length <= 6) {
            return address;
          }

          const offset = address.startsWith("0x") ? 2 : 0;
          return `0x${address.slice(offset, offset + 4)}${ELLIPSIS}${address.slice(-4)}`;
        }

        function formatDigest(digest) {
          return `${digest.slice(0, 10)}${ELLIPSIS}`;
        }
      }, {}],
      63: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.IntentVersion = exports.IntentScope = exports.AppId = void 0;
        exports.messageWithIntent = messageWithIntent;

        var AppId = /* @__PURE__ */(AppId2 => {
          AppId2[AppId2["Sui"] = 0] = "Sui";
          return AppId2;
        })(AppId || {});

        exports.AppId = AppId;

        var IntentVersion = /* @__PURE__ */(IntentVersion2 => {
          IntentVersion2[IntentVersion2["V0"] = 0] = "V0";
          return IntentVersion2;
        })(IntentVersion || {});

        exports.IntentVersion = IntentVersion;

        var IntentScope = /* @__PURE__ */(IntentScope2 => {
          IntentScope2[IntentScope2["TransactionData"] = 0] = "TransactionData";
          IntentScope2[IntentScope2["TransactionEffects"] = 1] = "TransactionEffects";
          IntentScope2[IntentScope2["CheckpointSummary"] = 2] = "CheckpointSummary";
          IntentScope2[IntentScope2["PersonalMessage"] = 3] = "PersonalMessage";
          return IntentScope2;
        })(IntentScope || {});

        exports.IntentScope = IntentScope;

        function intentWithScope(scope) {
          return [scope, 0
          /* V0 */
          , 0
          /* Sui */
          ];
        }

        function messageWithIntent(scope, message) {
          const intent = intentWithScope(scope);
          const intentMessage = new Uint8Array(intent.length + message.length);
          intentMessage.set(intent);
          intentMessage.set(message, intent.length);
          return intentMessage;
        }
      }, {}],
      64: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.verifyMessage = verifyMessage;

        var _bcs = require("@mysten/bcs");

        var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

        var _intent = require("./intent.js");

        var _secp256k = require("@noble/curves/secp256k1");

        var _sha = require("@noble/hashes/sha256");

        var _blake2b = require("@noble/hashes/blake2b");

        var _utils = require("../cryptography/utils.js");

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : {
            default: obj
          };
        }

        async function verifyMessage(message, serializedSignature, scope) {
          const signature = (0, _utils.toSingleSignaturePubkeyPair)(serializedSignature);
          const messageBytes = (0, _intent.messageWithIntent)(scope, typeof message === "string" ? (0, _bcs.fromB64)(message) : message);
          const digest = (0, _blake2b.blake2b)(messageBytes, {
            dkLen: 32
          });

          switch (signature.signatureScheme) {
            case "ED25519":
              return _tweetnacl.default.sign.detached.verify(digest, signature.signature, signature.pubKey.toBytes());

            case "Secp256k1":
              return _secp256k.secp256k1.verify(_secp256k.secp256k1.Signature.fromCompact(signature.signature), (0, _sha.sha256)(digest), signature.pubKey.toBytes());

            default:
              throw new Error(`Unknown signature scheme: "${signature.signatureScheme}"`);
          }
        }
      }, {
        "../cryptography/utils.js": 19,
        "./intent.js": 63,
        "@mysten/bcs": 4,
        "@noble/curves/secp256k1": 80,
        "@noble/hashes/blake2b": 91,
        "@noble/hashes/sha256": 96,
        "tweetnacl": 123
      }],
      65: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TARGETED_RPC_VERSION = exports.PACKAGE_VERSION = void 0;
        const PACKAGE_VERSION = "0.37.1";
        exports.PACKAGE_VERSION = PACKAGE_VERSION;
        const TARGETED_RPC_VERSION = "1.5.0";
        exports.TARGETED_RPC_VERSION = TARGETED_RPC_VERSION;
      }, {}],
      66: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.createCurve = exports.getHash = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        const hmac_1 = require("@noble/hashes/hmac");

        const utils_1 = require("@noble/hashes/utils");

        const weierstrass_js_1 = require("./abstract/weierstrass.js"); // connects noble-curves to noble-hashes


        function getHash(hash) {
          return {
            hash,
            hmac: (key, ...msgs) => (0, hmac_1.hmac)(hash, key, (0, utils_1.concatBytes)(...msgs)),
            randomBytes: utils_1.randomBytes
          };
        }

        exports.getHash = getHash;

        function createCurve(curveDef, defHash) {
          const create = hash => (0, weierstrass_js_1.weierstrass)({ ...curveDef,
            ...getHash(hash)
          });

          return Object.freeze({ ...create(defHash),
            create
          });
        }

        exports.createCurve = createCurve;
      }, {
        "./abstract/weierstrass.js": 71,
        "@noble/hashes/hmac": 84,
        "@noble/hashes/utils": 86
      }],
      67: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.validateBasic = exports.wNAF = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // Abelian group utilities

        const modular_js_1 = require("./modular.js");

        const utils_js_1 = require("./utils.js");

        const _0n = BigInt(0);

        const _1n = BigInt(1); // Elliptic curve multiplication of Point by scalar. Fragile.
        // Scalars should always be less than curve order: this should be checked inside of a curve itself.
        // Creates precomputation tables for fast multiplication:
        // - private scalar is split by fixed size windows of W bits
        // - every window point is collected from window's table & added to accumulator
        // - since windows are different, same point inside tables won't be accessed more than once per calc
        // - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
        // - +1 window is neccessary for wNAF
        // - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
        // TODO: Research returning 2d JS array of windows, instead of a single window. This would allow
        // windows to be in different memory locations


        function wNAF(c, bits) {
          const constTimeNegate = (condition, item) => {
            const neg = item.negate();
            return condition ? neg : item;
          };

          const opts = W => {
            const windows = Math.ceil(bits / W) + 1; // +1, because

            const windowSize = 2 ** (W - 1); // -1 because we skip zero

            return {
              windows,
              windowSize
            };
          };

          return {
            constTimeNegate,

            // non-const time multiplication ladder
            unsafeLadder(elm, n) {
              let p = c.ZERO;
              let d = elm;

              while (n > _0n) {
                if (n & _1n) p = p.add(d);
                d = d.double();
                n >>= _1n;
              }

              return p;
            },

            /**
             * Creates a wNAF precomputation window. Used for caching.
             * Default window size is set by `utils.precompute()` and is equal to 8.
             * Number of precomputed points depends on the curve size:
             * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
             * - 𝑊 is the window size
             * - 𝑛 is the bitlength of the curve order.
             * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
             * @returns precomputed point tables flattened to a single array
             */
            precomputeWindow(elm, W) {
              const {
                windows,
                windowSize
              } = opts(W);
              const points = [];
              let p = elm;
              let base = p;

              for (let window = 0; window < windows; window++) {
                base = p;
                points.push(base); // =1, because we skip zero

                for (let i = 1; i < windowSize; i++) {
                  base = base.add(p);
                  points.push(base);
                }

                p = base.double();
              }

              return points;
            },

            /**
             * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
             * @param W window size
             * @param precomputes precomputed tables
             * @param n scalar (we don't check here, but should be less than curve order)
             * @returns real and fake (for const-time) points
             */
            wNAF(W, precomputes, n) {
              // TODO: maybe check that scalar is less than group order? wNAF behavious is undefined otherwise
              // But need to carefully remove other checks before wNAF. ORDER == bits here
              const {
                windows,
                windowSize
              } = opts(W);
              let p = c.ZERO;
              let f = c.BASE;
              const mask = BigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.

              const maxNumber = 2 ** W;
              const shiftBy = BigInt(W);

              for (let window = 0; window < windows; window++) {
                const offset = window * windowSize; // Extract W bits.

                let wbits = Number(n & mask); // Shift number by W bits.

                n >>= shiftBy; // If the bits are bigger than max size, we'll split those.
                // +224 => 256 - 32

                if (wbits > windowSize) {
                  wbits -= maxNumber;
                  n += _1n;
                } // This code was first written with assumption that 'f' and 'p' will never be infinity point:
                // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
                // there is negate now: it is possible that negated element from low value
                // would be the same as high element, which will create carry into next window.
                // It's not obvious how this can fail, but still worth investigating later.
                // Check if we're onto Zero point.
                // Add random point inside current window to f.


                const offset1 = offset;
                const offset2 = offset + Math.abs(wbits) - 1; // -1 because we skip zero

                const cond1 = window % 2 !== 0;
                const cond2 = wbits < 0;

                if (wbits === 0) {
                  // The most important part for const-time getPublicKey
                  f = f.add(constTimeNegate(cond1, precomputes[offset1]));
                } else {
                  p = p.add(constTimeNegate(cond2, precomputes[offset2]));
                }
              } // JIT-compiler should not eliminate f here, since it will later be used in normalizeZ()
              // Even if the variable is still unused, there are some checks which will
              // throw an exception, so compiler needs to prove they won't happen, which is hard.
              // At this point there is a way to F be infinity-point even if p is not,
              // which makes it less const-time: around 1 bigint multiply.


              return {
                p,
                f
              };
            },

            wNAFCached(P, precomputesMap, n, transform) {
              // @ts-ignore
              const W = P._WINDOW_SIZE || 1; // Calculate precomputes on a first run, reuse them after

              let comp = precomputesMap.get(P);

              if (!comp) {
                comp = this.precomputeWindow(P, W);

                if (W !== 1) {
                  precomputesMap.set(P, transform(comp));
                }
              }

              return this.wNAF(W, comp, n);
            }

          };
        }

        exports.wNAF = wNAF;

        function validateBasic(curve) {
          (0, modular_js_1.validateField)(curve.Fp);
          (0, utils_js_1.validateObject)(curve, {
            n: 'bigint',
            h: 'bigint',
            Gx: 'field',
            Gy: 'field'
          }, {
            nBitLength: 'isSafeInteger',
            nByteLength: 'isSafeInteger'
          }); // Set defaults

          return Object.freeze({ ...(0, modular_js_1.nLength)(curve.n, curve.nBitLength),
            ...curve,
            ...{
              p: curve.Fp.ORDER
            }
          });
        }

        exports.validateBasic = validateBasic;
      }, {
        "./modular.js": 69,
        "./utils.js": 70
      }],
      68: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.createHasher = exports.isogenyMap = exports.hash_to_field = exports.expand_message_xof = exports.expand_message_xmd = void 0;

        const modular_js_1 = require("./modular.js");

        const utils_js_1 = require("./utils.js");

        function validateDST(dst) {
          if (dst instanceof Uint8Array) return dst;
          if (typeof dst === 'string') return (0, utils_js_1.utf8ToBytes)(dst);
          throw new Error('DST must be Uint8Array or string');
        } // Octet Stream to Integer. "spec" implementation of os2ip is 2.5x slower vs bytesToNumberBE.


        const os2ip = utils_js_1.bytesToNumberBE; // Integer to Octet Stream (numberToBytesBE)

        function i2osp(value, length) {
          if (value < 0 || value >= 1 << 8 * length) {
            throw new Error(`bad I2OSP call: value=${value} length=${length}`);
          }

          const res = Array.from({
            length
          }).fill(0);

          for (let i = length - 1; i >= 0; i--) {
            res[i] = value & 0xff;
            value >>>= 8;
          }

          return new Uint8Array(res);
        }

        function strxor(a, b) {
          const arr = new Uint8Array(a.length);

          for (let i = 0; i < a.length; i++) {
            arr[i] = a[i] ^ b[i];
          }

          return arr;
        }

        function isBytes(item) {
          if (!(item instanceof Uint8Array)) throw new Error('Uint8Array expected');
        }

        function isNum(item) {
          if (!Number.isSafeInteger(item)) throw new Error('number expected');
        } // Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits
        // https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-11#section-5.4.1


        function expand_message_xmd(msg, DST, lenInBytes, H) {
          isBytes(msg);
          isBytes(DST);
          isNum(lenInBytes); // https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-16#section-5.3.3

          if (DST.length > 255) DST = H((0, utils_js_1.concatBytes)((0, utils_js_1.utf8ToBytes)('H2C-OVERSIZE-DST-'), DST));
          const {
            outputLen: b_in_bytes,
            blockLen: r_in_bytes
          } = H;
          const ell = Math.ceil(lenInBytes / b_in_bytes);
          if (ell > 255) throw new Error('Invalid xmd length');
          const DST_prime = (0, utils_js_1.concatBytes)(DST, i2osp(DST.length, 1));
          const Z_pad = i2osp(0, r_in_bytes);
          const l_i_b_str = i2osp(lenInBytes, 2); // len_in_bytes_str

          const b = new Array(ell);
          const b_0 = H((0, utils_js_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
          b[0] = H((0, utils_js_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));

          for (let i = 1; i <= ell; i++) {
            const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
            b[i] = H((0, utils_js_1.concatBytes)(...args));
          }

          const pseudo_random_bytes = (0, utils_js_1.concatBytes)(...b);
          return pseudo_random_bytes.slice(0, lenInBytes);
        }

        exports.expand_message_xmd = expand_message_xmd;

        function expand_message_xof(msg, DST, lenInBytes, k, H) {
          isBytes(msg);
          isBytes(DST);
          isNum(lenInBytes); // https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-16#section-5.3.3
          // DST = H('H2C-OVERSIZE-DST-' || a_very_long_DST, Math.ceil((lenInBytes * k) / 8));

          if (DST.length > 255) {
            const dkLen = Math.ceil(2 * k / 8);
            DST = H.create({
              dkLen
            }).update((0, utils_js_1.utf8ToBytes)('H2C-OVERSIZE-DST-')).update(DST).digest();
          }

          if (lenInBytes > 65535 || DST.length > 255) throw new Error('expand_message_xof: invalid lenInBytes');
          return H.create({
            dkLen: lenInBytes
          }).update(msg).update(i2osp(lenInBytes, 2)) // 2. DST_prime = DST || I2OSP(len(DST), 1)
          .update(DST).update(i2osp(DST.length, 1)).digest();
        }

        exports.expand_message_xof = expand_message_xof;
        /**
         * Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F
         * https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-11#section-5.3
         * @param msg a byte string containing the message to hash
         * @param count the number of elements of F to output
         * @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
         * @returns [u_0, ..., u_(count - 1)], a list of field elements.
         */

        function hash_to_field(msg, count, options) {
          (0, utils_js_1.validateObject)(options, {
            DST: 'string',
            p: 'bigint',
            m: 'isSafeInteger',
            k: 'isSafeInteger',
            hash: 'hash'
          });
          const {
            p,
            k,
            m,
            hash,
            expand,
            DST: _DST
          } = options;
          isBytes(msg);
          isNum(count);
          const DST = validateDST(_DST);
          const log2p = p.toString(2).length;
          const L = Math.ceil((log2p + k) / 8); // section 5.1 of ietf draft link above

          const len_in_bytes = count * m * L;
          let prb; // pseudo_random_bytes

          if (expand === 'xmd') {
            prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
          } else if (expand === 'xof') {
            prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
          } else if (expand === '_internal_pass') {
            // for internal tests only
            prb = msg;
          } else {
            throw new Error('expand must be "xmd" or "xof"');
          }

          const u = new Array(count);

          for (let i = 0; i < count; i++) {
            const e = new Array(m);

            for (let j = 0; j < m; j++) {
              const elm_offset = L * (j + i * m);
              const tv = prb.subarray(elm_offset, elm_offset + L);
              e[j] = (0, modular_js_1.mod)(os2ip(tv), p);
            }

            u[i] = e;
          }

          return u;
        }

        exports.hash_to_field = hash_to_field;

        function isogenyMap(field, map) {
          // Make same order as in spec
          const COEFF = map.map(i => Array.from(i).reverse());
          return (x, y) => {
            const [xNum, xDen, yNum, yDen] = COEFF.map(val => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
            x = field.div(xNum, xDen); // xNum / xDen

            y = field.mul(y, field.div(yNum, yDen)); // y * (yNum / yDev)

            return {
              x,
              y
            };
          };
        }

        exports.isogenyMap = isogenyMap;

        function createHasher(Point, mapToCurve, def) {
          if (typeof mapToCurve !== 'function') throw new Error('mapToCurve() must be defined');
          return {
            // Encodes byte string to elliptic curve
            // https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-16#section-3
            hashToCurve(msg, options) {
              const u = hash_to_field(msg, 2, { ...def,
                DST: def.DST,
                ...options
              });
              const u0 = Point.fromAffine(mapToCurve(u[0]));
              const u1 = Point.fromAffine(mapToCurve(u[1]));
              const P = u0.add(u1).clearCofactor();
              P.assertValidity();
              return P;
            },

            // https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-16#section-3
            encodeToCurve(msg, options) {
              const u = hash_to_field(msg, 1, { ...def,
                DST: def.encodeDST,
                ...options
              });
              const P = Point.fromAffine(mapToCurve(u[0])).clearCofactor();
              P.assertValidity();
              return P;
            }

          };
        }

        exports.createHasher = createHasher;
      }, {
        "./modular.js": 69,
        "./utils.js": 70
      }],
      69: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hashToPrivateScalar = exports.FpSqrtEven = exports.FpSqrtOdd = exports.Field = exports.nLength = exports.FpIsSquare = exports.FpDiv = exports.FpInvertBatch = exports.FpPow = exports.validateField = exports.isNegativeLE = exports.FpSqrt = exports.tonelliShanks = exports.invert = exports.pow2 = exports.pow = exports.mod = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // Utilities for modular arithmetics and finite fields

        const utils_js_1 = require("./utils.js"); // prettier-ignore


        const _0n = BigInt(0),
              _1n = BigInt(1),
              _2n = BigInt(2),
              _3n = BigInt(3); // prettier-ignore


        const _4n = BigInt(4),
              _5n = BigInt(5),
              _8n = BigInt(8); // prettier-ignore


        const _9n = BigInt(9),
              _16n = BigInt(16); // Calculates a modulo b


        function mod(a, b) {
          const result = a % b;
          return result >= _0n ? result : b + result;
        }

        exports.mod = mod;
        /**
         * Efficiently exponentiate num to power and do modular division.
         * Unsafe in some contexts: uses ladder, so can expose bigint bits.
         * @example
         * powMod(2n, 6n, 11n) // 64n % 11n == 9n
         */
        // TODO: use field version && remove

        function pow(num, power, modulo) {
          if (modulo <= _0n || power < _0n) throw new Error('Expected power/modulo > 0');
          if (modulo === _1n) return _0n;
          let res = _1n;

          while (power > _0n) {
            if (power & _1n) res = res * num % modulo;
            num = num * num % modulo;
            power >>= _1n;
          }

          return res;
        }

        exports.pow = pow; // Does x ^ (2 ^ power) mod p. pow2(30, 4) == 30 ^ (2 ^ 4)

        function pow2(x, power, modulo) {
          let res = x;

          while (power-- > _0n) {
            res *= res;
            res %= modulo;
          }

          return res;
        }

        exports.pow2 = pow2; // Inverses number over modulo

        function invert(number, modulo) {
          if (number === _0n || modulo <= _0n) {
            throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
          } // Eucledian GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
          // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.


          let a = mod(number, modulo);
          let b = modulo; // prettier-ignore

          let x = _0n,
              y = _1n,
              u = _1n,
              v = _0n;

          while (a !== _0n) {
            // JIT applies optimization if those two lines follow each other
            const q = b / a;
            const r = b % a;
            const m = x - u * q;
            const n = y - v * q; // prettier-ignore

            b = a, a = r, x = u, y = v, u = m, v = n;
          }

          const gcd = b;
          if (gcd !== _1n) throw new Error('invert: does not exist');
          return mod(x, modulo);
        }

        exports.invert = invert; // Tonelli-Shanks algorithm
        // Paper 1: https://eprint.iacr.org/2012/685.pdf (page 12)
        // Paper 2: Square Roots from 1; 24, 51, 10 to Dan Shanks

        function tonelliShanks(P) {
          // Legendre constant: used to calculate Legendre symbol (a | p),
          // which denotes the value of a^((p-1)/2) (mod p).
          // (a | p) ≡ 1    if a is a square (mod p)
          // (a | p) ≡ -1   if a is not a square (mod p)
          // (a | p) ≡ 0    if a ≡ 0 (mod p)
          const legendreC = (P - _1n) / _2n;
          let Q, S, Z; // Step 1: By factoring out powers of 2 from p - 1,
          // find q and s such that p - 1 = q*(2^s) with q odd

          for (Q = P - _1n, S = 0; Q % _2n === _0n; Q /= _2n, S++); // Step 2: Select a non-square z such that (z | p) ≡ -1 and set c ≡ zq


          for (Z = _2n; Z < P && pow(Z, legendreC, P) !== P - _1n; Z++); // Fast-path


          if (S === 1) {
            const p1div4 = (P + _1n) / _4n;
            return function tonelliFast(Fp, n) {
              const root = Fp.pow(n, p1div4);
              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // Slow-path


          const Q1div2 = (Q + _1n) / _2n;
          return function tonelliSlow(Fp, n) {
            // Step 0: Check that n is indeed a square: (n | p) should not be ≡ -1
            if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE)) throw new Error('Cannot find square root');
            let r = S; // TODO: will fail at Fp2/etc

            let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q); // will update both x and b

            let x = Fp.pow(n, Q1div2); // first guess at the square root

            let b = Fp.pow(n, Q); // first guess at the fudge factor

            while (!Fp.eql(b, Fp.ONE)) {
              if (Fp.eql(b, Fp.ZERO)) return Fp.ZERO; // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm (4. If t = 0, return r = 0)
              // Find m such b^(2^m)==1

              let m = 1;

              for (let t2 = Fp.sqr(b); m < r; m++) {
                if (Fp.eql(t2, Fp.ONE)) break;
                t2 = Fp.sqr(t2); // t2 *= t2
              } // NOTE: r-m-1 can be bigger than 32, need to convert to bigint before shift, otherwise there will be overflow


              const ge = Fp.pow(g, _1n << BigInt(r - m - 1)); // ge = 2^(r-m-1)

              g = Fp.sqr(ge); // g = ge * ge

              x = Fp.mul(x, ge); // x *= ge

              b = Fp.mul(b, g); // b *= g

              r = m;
            }

            return x;
          };
        }

        exports.tonelliShanks = tonelliShanks;

        function FpSqrt(P) {
          // NOTE: different algorithms can give different roots, it is up to user to decide which one they want.
          // For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
          // P ≡ 3 (mod 4)
          // √n = n^((P+1)/4)
          if (P % _4n === _3n) {
            // Not all roots possible!
            // const ORDER =
            //   0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
            // const NUM = 72057594037927816n;
            const p1div4 = (P + _1n) / _4n;
            return function sqrt3mod4(Fp, n) {
              const root = Fp.pow(n, p1div4); // Throw if root**2 != n

              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // Atkin algorithm for q ≡ 5 (mod 8), https://eprint.iacr.org/2012/685.pdf (page 10)


          if (P % _8n === _5n) {
            const c1 = (P - _5n) / _8n;
            return function sqrt5mod8(Fp, n) {
              const n2 = Fp.mul(n, _2n);
              const v = Fp.pow(n2, c1);
              const nv = Fp.mul(n, v);
              const i = Fp.mul(Fp.mul(nv, _2n), v);
              const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // P ≡ 9 (mod 16)


          if (P % _16n === _9n) {// NOTE: tonelli is too slow for bls-Fp2 calculations even on start
            // Means we cannot use sqrt for constants at all!
            //
            // const c1 = Fp.sqrt(Fp.negate(Fp.ONE)); //  1. c1 = sqrt(-1) in F, i.e., (c1^2) == -1 in F
            // const c2 = Fp.sqrt(c1);                //  2. c2 = sqrt(c1) in F, i.e., (c2^2) == c1 in F
            // const c3 = Fp.sqrt(Fp.negate(c1));     //  3. c3 = sqrt(-c1) in F, i.e., (c3^2) == -c1 in F
            // const c4 = (P + _7n) / _16n;           //  4. c4 = (q + 7) / 16        # Integer arithmetic
            // sqrt = (x) => {
            //   let tv1 = Fp.pow(x, c4);             //  1. tv1 = x^c4
            //   let tv2 = Fp.mul(c1, tv1);           //  2. tv2 = c1 * tv1
            //   const tv3 = Fp.mul(c2, tv1);         //  3. tv3 = c2 * tv1
            //   let tv4 = Fp.mul(c3, tv1);           //  4. tv4 = c3 * tv1
            //   const e1 = Fp.equals(Fp.square(tv2), x); //  5.  e1 = (tv2^2) == x
            //   const e2 = Fp.equals(Fp.square(tv3), x); //  6.  e2 = (tv3^2) == x
            //   tv1 = Fp.cmov(tv1, tv2, e1); //  7. tv1 = CMOV(tv1, tv2, e1)  # Select tv2 if (tv2^2) == x
            //   tv2 = Fp.cmov(tv4, tv3, e2); //  8. tv2 = CMOV(tv4, tv3, e2)  # Select tv3 if (tv3^2) == x
            //   const e3 = Fp.equals(Fp.square(tv2), x); //  9.  e3 = (tv2^2) == x
            //   return Fp.cmov(tv1, tv2, e3); //  10.  z = CMOV(tv1, tv2, e3)  # Select the sqrt from tv1 and tv2
            // }
          } // Other cases: Tonelli-Shanks algorithm


          return tonelliShanks(P);
        }

        exports.FpSqrt = FpSqrt; // Little-endian check for first LE bit (last BE bit);

        const isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;

        exports.isNegativeLE = isNegativeLE; // prettier-ignore

        const FIELD_FIELDS = ['create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr', 'eql', 'add', 'sub', 'mul', 'pow', 'div', 'addN', 'subN', 'mulN', 'sqrN'];

        function validateField(field) {
          const initial = {
            ORDER: 'bigint',
            MASK: 'bigint',
            BYTES: 'isSafeInteger',
            BITS: 'isSafeInteger'
          };
          const opts = FIELD_FIELDS.reduce((map, val) => {
            map[val] = 'function';
            return map;
          }, initial);
          return (0, utils_js_1.validateObject)(field, opts);
        }

        exports.validateField = validateField; // Generic field functions

        function FpPow(f, num, power) {
          // Should have same speed as pow for bigints
          // TODO: benchmark!
          if (power < _0n) throw new Error('Expected power > 0');
          if (power === _0n) return f.ONE;
          if (power === _1n) return num;
          let p = f.ONE;
          let d = num;

          while (power > _0n) {
            if (power & _1n) p = f.mul(p, d);
            d = f.sqr(d);
            power >>= _1n;
          }

          return p;
        }

        exports.FpPow = FpPow; // 0 is non-invertible: non-batched version will throw on 0

        function FpInvertBatch(f, nums) {
          const tmp = new Array(nums.length); // Walk from first to last, multiply them by each other MOD p

          const lastMultiplied = nums.reduce((acc, num, i) => {
            if (f.is0(num)) return acc;
            tmp[i] = acc;
            return f.mul(acc, num);
          }, f.ONE); // Invert last element

          const inverted = f.inv(lastMultiplied); // Walk from last to first, multiply them by inverted each other MOD p

          nums.reduceRight((acc, num, i) => {
            if (f.is0(num)) return acc;
            tmp[i] = f.mul(acc, tmp[i]);
            return f.mul(acc, num);
          }, inverted);
          return tmp;
        }

        exports.FpInvertBatch = FpInvertBatch;

        function FpDiv(f, lhs, rhs) {
          return f.mul(lhs, typeof rhs === 'bigint' ? invert(rhs, f.ORDER) : f.inv(rhs));
        }

        exports.FpDiv = FpDiv; // This function returns True whenever the value x is a square in the field F.

        function FpIsSquare(f) {
          const legendreConst = (f.ORDER - _1n) / _2n; // Integer arithmetic

          return x => {
            const p = f.pow(x, legendreConst);
            return f.eql(p, f.ZERO) || f.eql(p, f.ONE);
          };
        }

        exports.FpIsSquare = FpIsSquare; // CURVE.n lengths

        function nLength(n, nBitLength) {
          // Bit size, byte size of CURVE.n
          const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;

          const nByteLength = Math.ceil(_nBitLength / 8);
          return {
            nBitLength: _nBitLength,
            nByteLength
          };
        }

        exports.nLength = nLength;
        /**
         * Initializes a galois field over prime. Non-primes are not supported for now.
         * Do not init in loop: slow. Very fragile: always run a benchmark on change.
         * Major performance gains:
         * a) non-normalized operations like mulN instead of mul
         * b) `Object.freeze`
         * c) Same object shape: never add or remove keys
         * @param ORDER prime positive bigint
         * @param bitLen how many bits the field consumes
         * @param isLE (def: false) if encoding / decoding should be in little-endian
         * @param redef optional faster redefinitions of sqrt and other methods
         */

        function Field(ORDER, bitLen, isLE = false, redef = {}) {
          if (ORDER <= _0n) throw new Error(`Expected Fp ORDER > 0, got ${ORDER}`);
          const {
            nBitLength: BITS,
            nByteLength: BYTES
          } = nLength(ORDER, bitLen);
          if (BYTES > 2048) throw new Error('Field lengths over 2048 bytes are not supported');
          const sqrtP = FpSqrt(ORDER);
          const f = Object.freeze({
            ORDER,
            BITS,
            BYTES,
            MASK: (0, utils_js_1.bitMask)(BITS),
            ZERO: _0n,
            ONE: _1n,
            create: num => mod(num, ORDER),
            isValid: num => {
              if (typeof num !== 'bigint') throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
              return _0n <= num && num < ORDER; // 0 is valid element, but it's not invertible
            },
            is0: num => num === _0n,
            isOdd: num => (num & _1n) === _1n,
            neg: num => mod(-num, ORDER),
            eql: (lhs, rhs) => lhs === rhs,
            sqr: num => mod(num * num, ORDER),
            add: (lhs, rhs) => mod(lhs + rhs, ORDER),
            sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
            mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
            pow: (num, power) => FpPow(f, num, power),
            div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
            // Same as above, but doesn't normalize
            sqrN: num => num * num,
            addN: (lhs, rhs) => lhs + rhs,
            subN: (lhs, rhs) => lhs - rhs,
            mulN: (lhs, rhs) => lhs * rhs,
            inv: num => invert(num, ORDER),
            sqrt: redef.sqrt || (n => sqrtP(f, n)),
            invertBatch: lst => FpInvertBatch(f, lst),
            // TODO: do we really need constant cmov?
            // We don't have const-time bigints anyway, so probably will be not very useful
            cmov: (a, b, c) => c ? b : a,
            toBytes: num => isLE ? (0, utils_js_1.numberToBytesLE)(num, BYTES) : (0, utils_js_1.numberToBytesBE)(num, BYTES),
            fromBytes: bytes => {
              if (bytes.length !== BYTES) throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes.length}`);
              return isLE ? (0, utils_js_1.bytesToNumberLE)(bytes) : (0, utils_js_1.bytesToNumberBE)(bytes);
            }
          });
          return Object.freeze(f);
        }

        exports.Field = Field;

        function FpSqrtOdd(Fp, elm) {
          if (!Fp.isOdd) throw new Error(`Field doesn't have isOdd`);
          const root = Fp.sqrt(elm);
          return Fp.isOdd(root) ? root : Fp.neg(root);
        }

        exports.FpSqrtOdd = FpSqrtOdd;

        function FpSqrtEven(Fp, elm) {
          if (!Fp.isOdd) throw new Error(`Field doesn't have isOdd`);
          const root = Fp.sqrt(elm);
          return Fp.isOdd(root) ? Fp.neg(root) : root;
        }

        exports.FpSqrtEven = FpSqrtEven;
        /**
         * FIPS 186 B.4.1-compliant "constant-time" private key generation utility.
         * Can take (n+8) or more bytes of uniform input e.g. from CSPRNG or KDF
         * and convert them into private scalar, with the modulo bias being neglible.
         * Needs at least 40 bytes of input for 32-byte private key.
         * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
         * @param hash hash output from SHA3 or a similar function
         * @returns valid private scalar
         */

        function hashToPrivateScalar(hash, groupOrder, isLE = false) {
          hash = (0, utils_js_1.ensureBytes)('privateHash', hash);
          const hashLen = hash.length;
          const minLen = nLength(groupOrder).nByteLength + 8;
          if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error(`hashToPrivateScalar: expected ${minLen}-1024 bytes of input, got ${hashLen}`);
          const num = isLE ? (0, utils_js_1.bytesToNumberLE)(hash) : (0, utils_js_1.bytesToNumberBE)(hash);
          return mod(num, groupOrder - _1n) + _1n;
        }

        exports.hashToPrivateScalar = hashToPrivateScalar;
      }, {
        "./utils.js": 70
      }],
      70: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.validateObject = exports.createHmacDrbg = exports.bitMask = exports.bitSet = exports.bitGet = exports.bitLen = exports.utf8ToBytes = exports.equalBytes = exports.concatBytes = exports.ensureBytes = exports.numberToVarBytesBE = exports.numberToBytesLE = exports.numberToBytesBE = exports.bytesToNumberLE = exports.bytesToNumberBE = exports.hexToBytes = exports.hexToNumber = exports.numberToHexUnpadded = exports.bytesToHex = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        const _0n = BigInt(0);

        const _1n = BigInt(1);

        const _2n = BigInt(2);

        const u8a = a => a instanceof Uint8Array;

        const hexes = Array.from({
          length: 256
        }, (v, i) => i.toString(16).padStart(2, '0'));

        function bytesToHex(bytes) {
          if (!u8a(bytes)) throw new Error('Uint8Array expected'); // pre-caching improves the speed 6x

          let hex = '';

          for (let i = 0; i < bytes.length; i++) {
            hex += hexes[bytes[i]];
          }

          return hex;
        }

        exports.bytesToHex = bytesToHex;

        function numberToHexUnpadded(num) {
          const hex = num.toString(16);
          return hex.length & 1 ? `0${hex}` : hex;
        }

        exports.numberToHexUnpadded = numberToHexUnpadded;

        function hexToNumber(hex) {
          if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex); // Big Endian

          return BigInt(hex === '' ? '0' : `0x${hex}`);
        }

        exports.hexToNumber = hexToNumber; // Caching slows it down 2-3x

        function hexToBytes(hex) {
          if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
          if (hex.length % 2) throw new Error('hex string is invalid: unpadded ' + hex.length);
          const array = new Uint8Array(hex.length / 2);

          for (let i = 0; i < array.length; i++) {
            const j = i * 2;
            const hexByte = hex.slice(j, j + 2);
            const byte = Number.parseInt(hexByte, 16);
            if (Number.isNaN(byte) || byte < 0) throw new Error('invalid byte sequence');
            array[i] = byte;
          }

          return array;
        }

        exports.hexToBytes = hexToBytes; // Big Endian

        function bytesToNumberBE(bytes) {
          return hexToNumber(bytesToHex(bytes));
        }

        exports.bytesToNumberBE = bytesToNumberBE;

        function bytesToNumberLE(bytes) {
          if (!u8a(bytes)) throw new Error('Uint8Array expected');
          return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
        }

        exports.bytesToNumberLE = bytesToNumberLE;

        const numberToBytesBE = (n, len) => hexToBytes(n.toString(16).padStart(len * 2, '0'));

        exports.numberToBytesBE = numberToBytesBE;

        const numberToBytesLE = (n, len) => (0, exports.numberToBytesBE)(n, len).reverse();

        exports.numberToBytesLE = numberToBytesLE; // Returns variable number bytes (minimal bigint encoding?)

        const numberToVarBytesBE = n => hexToBytes(numberToHexUnpadded(n));

        exports.numberToVarBytesBE = numberToVarBytesBE;

        function ensureBytes(title, hex, expectedLength) {
          let res;

          if (typeof hex === 'string') {
            try {
              res = hexToBytes(hex);
            } catch (e) {
              throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
            }
          } else if (u8a(hex)) {
            // Uint8Array.from() instead of hash.slice() because node.js Buffer
            // is instance of Uint8Array, and its slice() creates **mutable** copy
            res = Uint8Array.from(hex);
          } else {
            throw new Error(`${title} must be hex string or Uint8Array`);
          }

          const len = res.length;
          if (typeof expectedLength === 'number' && len !== expectedLength) throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
          return res;
        }

        exports.ensureBytes = ensureBytes; // Copies several Uint8Arrays into one.

        function concatBytes(...arrs) {
          const r = new Uint8Array(arrs.reduce((sum, a) => sum + a.length, 0));
          let pad = 0; // walk through each item, ensure they have proper type

          arrs.forEach(a => {
            if (!u8a(a)) throw new Error('Uint8Array expected');
            r.set(a, pad);
            pad += a.length;
          });
          return r;
        }

        exports.concatBytes = concatBytes;

        function equalBytes(b1, b2) {
          // We don't care about timing attacks here
          if (b1.length !== b2.length) return false;

          for (let i = 0; i < b1.length; i++) if (b1[i] !== b2[i]) return false;

          return true;
        }

        exports.equalBytes = equalBytes;

        function utf8ToBytes(str) {
          if (typeof str !== 'string') {
            throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
          }

          return new TextEncoder().encode(str);
        }

        exports.utf8ToBytes = utf8ToBytes; // Bit operations
        // Amount of bits inside bigint (Same as n.toString(2).length)

        function bitLen(n) {
          let len;

          for (len = 0; n > _0n; n >>= _1n, len += 1);

          return len;
        }

        exports.bitLen = bitLen; // Gets single bit at position. NOTE: first bit position is 0 (same as arrays)
        // Same as !!+Array.from(n.toString(2)).reverse()[pos]

        const bitGet = (n, pos) => n >> BigInt(pos) & _1n;

        exports.bitGet = bitGet; // Sets single bit at position

        const bitSet = (n, pos, value) => n | (value ? _1n : _0n) << BigInt(pos);

        exports.bitSet = bitSet; // Return mask for N bits (Same as BigInt(`0b${Array(i).fill('1').join('')}`))
        // Not using ** operator with bigints for old engines.

        const bitMask = n => (_2n << BigInt(n - 1)) - _1n;

        exports.bitMask = bitMask; // DRBG

        const u8n = data => new Uint8Array(data); // creates Uint8Array


        const u8fr = arr => Uint8Array.from(arr); // another shortcut

        /**
         * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
         * @returns function that will call DRBG until 2nd arg returns something meaningful
         * @example
         *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
         *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
         */


        function createHmacDrbg(hashLen, qByteLen, hmacFn) {
          if (typeof hashLen !== 'number' || hashLen < 2) throw new Error('hashLen must be a number');
          if (typeof qByteLen !== 'number' || qByteLen < 2) throw new Error('qByteLen must be a number');
          if (typeof hmacFn !== 'function') throw new Error('hmacFn must be a function'); // Step B, Step C: set hashLen to 8*ceil(hlen/8)

          let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.

          let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same

          let i = 0; // Iterations counter, will throw when over 1000

          const reset = () => {
            v.fill(1);
            k.fill(0);
            i = 0;
          };

          const h = (...b) => hmacFn(k, v, ...b); // hmac(k)(v, ...values)


          const reseed = (seed = u8n()) => {
            // HMAC-DRBG reseed() function. Steps D-G
            k = h(u8fr([0x00]), seed); // k = hmac(k || v || 0x00 || seed)

            v = h(); // v = hmac(k || v)

            if (seed.length === 0) return;
            k = h(u8fr([0x01]), seed); // k = hmac(k || v || 0x01 || seed)

            v = h(); // v = hmac(k || v)
          };

          const gen = () => {
            // HMAC-DRBG generate() function
            if (i++ >= 1000) throw new Error('drbg: tried 1000 values');
            let len = 0;
            const out = [];

            while (len < qByteLen) {
              v = h();
              const sl = v.slice();
              out.push(sl);
              len += v.length;
            }

            return concatBytes(...out);
          };

          const genUntil = (seed, pred) => {
            reset();
            reseed(seed); // Steps D-G

            let res = undefined; // Step H: grind until k is in [1..n-1]

            while (!(res = pred(gen()))) reseed();

            reset();
            return res;
          };

          return genUntil;
        }

        exports.createHmacDrbg = createHmacDrbg; // Validating curves and fields

        const validatorFns = {
          bigint: val => typeof val === 'bigint',
          function: val => typeof val === 'function',
          boolean: val => typeof val === 'boolean',
          string: val => typeof val === 'string',
          isSafeInteger: val => Number.isSafeInteger(val),
          array: val => Array.isArray(val),
          field: (val, object) => object.Fp.isValid(val),
          hash: val => typeof val === 'function' && Number.isSafeInteger(val.outputLen)
        }; // type Record<K extends string | number | symbol, T> = { [P in K]: T; }

        function validateObject(object, validators, optValidators = {}) {
          const checkField = (fieldName, type, isOptional) => {
            const checkVal = validatorFns[type];
            if (typeof checkVal !== 'function') throw new Error(`Invalid validator "${type}", expected function`);
            const val = object[fieldName];
            if (isOptional && val === undefined) return;

            if (!checkVal(val, object)) {
              throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
            }
          };

          for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);

          for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);

          return object;
        }

        exports.validateObject = validateObject; // validate type tests
        // const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
        // const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
        // // Should fail type-check
        // const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
        // const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
        // const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
        // const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
      }, {}],
      71: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.mapToCurveSimpleSWU = exports.SWUFpSqrtRatio = exports.weierstrass = exports.weierstrassPoints = exports.DER = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // Short Weierstrass curve. The formula is: y² = x³ + ax + b

        const mod = require("./modular.js");

        const ut = require("./utils.js");

        const utils_js_1 = require("./utils.js");

        const curve_js_1 = require("./curve.js");

        function validatePointOpts(curve) {
          const opts = (0, curve_js_1.validateBasic)(curve);
          ut.validateObject(opts, {
            a: 'field',
            b: 'field'
          }, {
            allowedPrivateKeyLengths: 'array',
            wrapPrivateKey: 'boolean',
            isTorsionFree: 'function',
            clearCofactor: 'function',
            allowInfinityPoint: 'boolean',
            fromBytes: 'function',
            toBytes: 'function'
          });
          const {
            endo,
            Fp,
            a
          } = opts;

          if (endo) {
            if (!Fp.eql(a, Fp.ZERO)) {
              throw new Error('Endomorphism can only be defined for Koblitz curves that have a=0');
            }

            if (typeof endo !== 'object' || typeof endo.beta !== 'bigint' || typeof endo.splitScalar !== 'function') {
              throw new Error('Expected endomorphism with beta: bigint and splitScalar: function');
            }
          }

          return Object.freeze({ ...opts
          });
        } // ASN.1 DER encoding utilities


        const {
          bytesToNumberBE: b2n,
          hexToBytes: h2b
        } = ut;
        exports.DER = {
          // asn.1 DER encoding utils
          Err: class DERErr extends Error {
            constructor(m = '') {
              super(m);
            }

          },

          _parseInt(data) {
            const {
              Err: E
            } = exports.DER;
            if (data.length < 2 || data[0] !== 0x02) throw new E('Invalid signature integer tag');
            const len = data[1];
            const res = data.subarray(2, len + 2);
            if (!len || res.length !== len) throw new E('Invalid signature integer: wrong length'); // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
            // since we always use positive integers here. It must always be empty:
            // - add zero byte if exists
            // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)

            if (res[0] & 0b10000000) throw new E('Invalid signature integer: negative');
            if (res[0] === 0x00 && !(res[1] & 0b10000000)) throw new E('Invalid signature integer: unnecessary leading zero');
            return {
              d: b2n(res),
              l: data.subarray(len + 2)
            }; // d is data, l is left
          },

          toSig(hex) {
            // parse DER signature
            const {
              Err: E
            } = exports.DER;
            const data = typeof hex === 'string' ? h2b(hex) : hex;
            if (!(data instanceof Uint8Array)) throw new Error('ui8a expected');
            let l = data.length;
            if (l < 2 || data[0] != 0x30) throw new E('Invalid signature tag');
            if (data[1] !== l - 2) throw new E('Invalid signature: incorrect length');

            const {
              d: r,
              l: sBytes
            } = exports.DER._parseInt(data.subarray(2));

            const {
              d: s,
              l: rBytesLeft
            } = exports.DER._parseInt(sBytes);

            if (rBytesLeft.length) throw new E('Invalid signature: left bytes after parsing');
            return {
              r,
              s
            };
          },

          hexFromSig(sig) {
            // Add leading zero if first byte has negative bit enabled. More details in '_parseInt'
            const slice = s => Number.parseInt(s[0], 16) & 0b1000 ? '00' + s : s;

            const h = num => {
              const hex = num.toString(16);
              return hex.length & 1 ? `0${hex}` : hex;
            };

            const s = slice(h(sig.s));
            const r = slice(h(sig.r));
            const shl = s.length / 2;
            const rhl = r.length / 2;
            const sl = h(shl);
            const rl = h(rhl);
            return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`;
          }

        }; // Be friendly to bad ECMAScript parsers by not using bigint literals
        // prettier-ignore

        const _0n = BigInt(0),
              _1n = BigInt(1),
              _2n = BigInt(2),
              _3n = BigInt(3),
              _4n = BigInt(4);

        function weierstrassPoints(opts) {
          const CURVE = validatePointOpts(opts);
          const {
            Fp
          } = CURVE; // All curves has same field / group length as for now, but they can differ

          const toBytes = CURVE.toBytes || ((c, point, isCompressed) => {
            const a = point.toAffine();
            return ut.concatBytes(Uint8Array.from([0x04]), Fp.toBytes(a.x), Fp.toBytes(a.y));
          });

          const fromBytes = CURVE.fromBytes || (bytes => {
            // const head = bytes[0];
            const tail = bytes.subarray(1); // if (head !== 0x04) throw new Error('Only non-compressed encoding is supported');

            const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
            const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
            return {
              x,
              y
            };
          });
          /**
           * y² = x³ + ax + b: Short weierstrass curve formula
           * @returns y²
           */


          function weierstrassEquation(x) {
            const {
              a,
              b
            } = CURVE;
            const x2 = Fp.sqr(x); // x * x

            const x3 = Fp.mul(x2, x); // x2 * x

            return Fp.add(Fp.add(x3, Fp.mul(x, a)), b); // x3 + a * x + b
          } // Validate whether the passed curve params are valid.
          // We check if curve equation works for generator point.
          // `assertValidity()` won't work: `isTorsionFree()` is not available at this point in bls12-381.
          // ProjectivePoint class has not been initialized yet.


          if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx))) throw new Error('bad generator point: equation left != right'); // Valid group elements reside in range 1..n-1

          function isWithinCurveOrder(num) {
            return typeof num === 'bigint' && _0n < num && num < CURVE.n;
          }

          function assertGE(num) {
            if (!isWithinCurveOrder(num)) throw new Error('Expected valid bigint: 0 < bigint < curve.n');
          } // Validates if priv key is valid and converts it to bigint.
          // Supports options allowedPrivateKeyLengths and wrapPrivateKey.


          function normPrivateKeyToScalar(key) {
            const {
              allowedPrivateKeyLengths: lengths,
              nByteLength,
              wrapPrivateKey,
              n
            } = CURVE;

            if (lengths && typeof key !== 'bigint') {
              if (key instanceof Uint8Array) key = ut.bytesToHex(key); // Normalize to hex string, pad. E.g. P521 would norm 130-132 char hex to 132-char bytes

              if (typeof key !== 'string' || !lengths.includes(key.length)) throw new Error('Invalid key');
              key = key.padStart(nByteLength * 2, '0');
            }

            let num;

            try {
              num = typeof key === 'bigint' ? key : ut.bytesToNumberBE((0, utils_js_1.ensureBytes)('private key', key, nByteLength));
            } catch (error) {
              throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
            }

            if (wrapPrivateKey) num = mod.mod(num, n); // disabled by default, enabled for BLS

            assertGE(num); // num in range [1..N-1]

            return num;
          }

          const pointPrecomputes = new Map();

          function assertPrjPoint(other) {
            if (!(other instanceof Point)) throw new Error('ProjectivePoint expected');
          }
          /**
           * Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
           * Default Point works in 2d / affine coordinates: (x, y)
           * We're doing calculations in projective, because its operations don't require costly inversion.
           */


          class Point {
            constructor(px, py, pz) {
              this.px = px;
              this.py = py;
              this.pz = pz;
              if (px == null || !Fp.isValid(px)) throw new Error('x required');
              if (py == null || !Fp.isValid(py)) throw new Error('y required');
              if (pz == null || !Fp.isValid(pz)) throw new Error('z required');
            } // Does not validate if the point is on-curve.
            // Use fromHex instead, or call assertValidity() later.


            static fromAffine(p) {
              const {
                x,
                y
              } = p || {};
              if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error('invalid affine point');
              if (p instanceof Point) throw new Error('projective point not allowed');

              const is0 = i => Fp.eql(i, Fp.ZERO); // fromAffine(x:0, y:0) would produce (x:0, y:0, z:1), but we need (x:0, y:1, z:0)


              if (is0(x) && is0(y)) return Point.ZERO;
              return new Point(x, y, Fp.ONE);
            }

            get x() {
              return this.toAffine().x;
            }

            get y() {
              return this.toAffine().y;
            }
            /**
             * Takes a bunch of Projective Points but executes only one
             * inversion on all of them. Inversion is very slow operation,
             * so this improves performance massively.
             * Optimization: converts a list of projective points to a list of identical points with Z=1.
             */


            static normalizeZ(points) {
              const toInv = Fp.invertBatch(points.map(p => p.pz));
              return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
            }
            /**
             * Converts hash string or Uint8Array to Point.
             * @param hex short/long ECDSA hex
             */


            static fromHex(hex) {
              const P = Point.fromAffine(fromBytes((0, utils_js_1.ensureBytes)('pointHex', hex)));
              P.assertValidity();
              return P;
            } // Multiplies generator point by privateKey.


            static fromPrivateKey(privateKey) {
              return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
            } // "Private method", don't use it directly


            _setWindowSize(windowSize) {
              this._WINDOW_SIZE = windowSize;
              pointPrecomputes.delete(this);
            } // A point on curve is valid if it conforms to equation.


            assertValidity() {
              // Zero is valid point too!
              if (this.is0()) {
                if (CURVE.allowInfinityPoint) return;
                throw new Error('bad point: ZERO');
              } // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`


              const {
                x,
                y
              } = this.toAffine(); // Check if x, y are valid field elements

              if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error('bad point: x or y not FE');
              const left = Fp.sqr(y); // y²

              const right = weierstrassEquation(x); // x³ + ax + b

              if (!Fp.eql(left, right)) throw new Error('bad point: equation left != right');
              if (!this.isTorsionFree()) throw new Error('bad point: not in prime-order subgroup');
            }

            hasEvenY() {
              const {
                y
              } = this.toAffine();
              if (Fp.isOdd) return !Fp.isOdd(y);
              throw new Error("Field doesn't support isOdd");
            }
            /**
             * Compare one point to another.
             */


            equals(other) {
              assertPrjPoint(other);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              const {
                px: X2,
                py: Y2,
                pz: Z2
              } = other;
              const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
              const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
              return U1 && U2;
            }
            /**
             * Flips point to one corresponding to (x, -y) in Affine coordinates.
             */


            negate() {
              return new Point(this.px, Fp.neg(this.py), this.pz);
            } // Renes-Costello-Batina exception-free doubling formula.
            // There is 30% faster Jacobian formula, but it is not complete.
            // https://eprint.iacr.org/2015/1060, algorithm 3
            // Cost: 8M + 3S + 3*a + 2*b3 + 15add.


            double() {
              const {
                a,
                b
              } = CURVE;
              const b3 = Fp.mul(b, _3n);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              let X3 = Fp.ZERO,
                  Y3 = Fp.ZERO,
                  Z3 = Fp.ZERO; // prettier-ignore

              let t0 = Fp.mul(X1, X1); // step 1

              let t1 = Fp.mul(Y1, Y1);
              let t2 = Fp.mul(Z1, Z1);
              let t3 = Fp.mul(X1, Y1);
              t3 = Fp.add(t3, t3); // step 5

              Z3 = Fp.mul(X1, Z1);
              Z3 = Fp.add(Z3, Z3);
              X3 = Fp.mul(a, Z3);
              Y3 = Fp.mul(b3, t2);
              Y3 = Fp.add(X3, Y3); // step 10

              X3 = Fp.sub(t1, Y3);
              Y3 = Fp.add(t1, Y3);
              Y3 = Fp.mul(X3, Y3);
              X3 = Fp.mul(t3, X3);
              Z3 = Fp.mul(b3, Z3); // step 15

              t2 = Fp.mul(a, t2);
              t3 = Fp.sub(t0, t2);
              t3 = Fp.mul(a, t3);
              t3 = Fp.add(t3, Z3);
              Z3 = Fp.add(t0, t0); // step 20

              t0 = Fp.add(Z3, t0);
              t0 = Fp.add(t0, t2);
              t0 = Fp.mul(t0, t3);
              Y3 = Fp.add(Y3, t0);
              t2 = Fp.mul(Y1, Z1); // step 25

              t2 = Fp.add(t2, t2);
              t0 = Fp.mul(t2, t3);
              X3 = Fp.sub(X3, t0);
              Z3 = Fp.mul(t2, t1);
              Z3 = Fp.add(Z3, Z3); // step 30

              Z3 = Fp.add(Z3, Z3);
              return new Point(X3, Y3, Z3);
            } // Renes-Costello-Batina exception-free addition formula.
            // There is 30% faster Jacobian formula, but it is not complete.
            // https://eprint.iacr.org/2015/1060, algorithm 1
            // Cost: 12M + 0S + 3*a + 3*b3 + 23add.


            add(other) {
              assertPrjPoint(other);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              const {
                px: X2,
                py: Y2,
                pz: Z2
              } = other;
              let X3 = Fp.ZERO,
                  Y3 = Fp.ZERO,
                  Z3 = Fp.ZERO; // prettier-ignore

              const a = CURVE.a;
              const b3 = Fp.mul(CURVE.b, _3n);
              let t0 = Fp.mul(X1, X2); // step 1

              let t1 = Fp.mul(Y1, Y2);
              let t2 = Fp.mul(Z1, Z2);
              let t3 = Fp.add(X1, Y1);
              let t4 = Fp.add(X2, Y2); // step 5

              t3 = Fp.mul(t3, t4);
              t4 = Fp.add(t0, t1);
              t3 = Fp.sub(t3, t4);
              t4 = Fp.add(X1, Z1);
              let t5 = Fp.add(X2, Z2); // step 10

              t4 = Fp.mul(t4, t5);
              t5 = Fp.add(t0, t2);
              t4 = Fp.sub(t4, t5);
              t5 = Fp.add(Y1, Z1);
              X3 = Fp.add(Y2, Z2); // step 15

              t5 = Fp.mul(t5, X3);
              X3 = Fp.add(t1, t2);
              t5 = Fp.sub(t5, X3);
              Z3 = Fp.mul(a, t4);
              X3 = Fp.mul(b3, t2); // step 20

              Z3 = Fp.add(X3, Z3);
              X3 = Fp.sub(t1, Z3);
              Z3 = Fp.add(t1, Z3);
              Y3 = Fp.mul(X3, Z3);
              t1 = Fp.add(t0, t0); // step 25

              t1 = Fp.add(t1, t0);
              t2 = Fp.mul(a, t2);
              t4 = Fp.mul(b3, t4);
              t1 = Fp.add(t1, t2);
              t2 = Fp.sub(t0, t2); // step 30

              t2 = Fp.mul(a, t2);
              t4 = Fp.add(t4, t2);
              t0 = Fp.mul(t1, t4);
              Y3 = Fp.add(Y3, t0);
              t0 = Fp.mul(t5, t4); // step 35

              X3 = Fp.mul(t3, X3);
              X3 = Fp.sub(X3, t0);
              t0 = Fp.mul(t3, t1);
              Z3 = Fp.mul(t5, Z3);
              Z3 = Fp.add(Z3, t0); // step 40

              return new Point(X3, Y3, Z3);
            }

            subtract(other) {
              return this.add(other.negate());
            }

            is0() {
              return this.equals(Point.ZERO);
            }

            wNAF(n) {
              return wnaf.wNAFCached(this, pointPrecomputes, n, comp => {
                const toInv = Fp.invertBatch(comp.map(p => p.pz));
                return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
              });
            }
            /**
             * Non-constant-time multiplication. Uses double-and-add algorithm.
             * It's faster, but should only be used when you don't care about
             * an exposed private key e.g. sig verification, which works over *public* keys.
             */


            multiplyUnsafe(n) {
              const I = Point.ZERO;
              if (n === _0n) return I;
              assertGE(n); // Will throw on 0

              if (n === _1n) return this;
              const {
                endo
              } = CURVE;
              if (!endo) return wnaf.unsafeLadder(this, n); // Apply endomorphism

              let {
                k1neg,
                k1,
                k2neg,
                k2
              } = endo.splitScalar(n);
              let k1p = I;
              let k2p = I;
              let d = this;

              while (k1 > _0n || k2 > _0n) {
                if (k1 & _1n) k1p = k1p.add(d);
                if (k2 & _1n) k2p = k2p.add(d);
                d = d.double();
                k1 >>= _1n;
                k2 >>= _1n;
              }

              if (k1neg) k1p = k1p.negate();
              if (k2neg) k2p = k2p.negate();
              k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
              return k1p.add(k2p);
            }
            /**
             * Constant time multiplication.
             * Uses wNAF method. Windowed method may be 10% faster,
             * but takes 2x longer to generate and consumes 2x memory.
             * Uses precomputes when available.
             * Uses endomorphism for Koblitz curves.
             * @param scalar by which the point would be multiplied
             * @returns New point
             */


            multiply(scalar) {
              assertGE(scalar);
              let n = scalar;
              let point, fake; // Fake point is used to const-time mult

              const {
                endo
              } = CURVE;

              if (endo) {
                const {
                  k1neg,
                  k1,
                  k2neg,
                  k2
                } = endo.splitScalar(n);
                let {
                  p: k1p,
                  f: f1p
                } = this.wNAF(k1);
                let {
                  p: k2p,
                  f: f2p
                } = this.wNAF(k2);
                k1p = wnaf.constTimeNegate(k1neg, k1p);
                k2p = wnaf.constTimeNegate(k2neg, k2p);
                k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
                point = k1p.add(k2p);
                fake = f1p.add(f2p);
              } else {
                const {
                  p,
                  f
                } = this.wNAF(n);
                point = p;
                fake = f;
              } // Normalize `z` for both points, but return only real one


              return Point.normalizeZ([point, fake])[0];
            }
            /**
             * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
             * Not using Strauss-Shamir trick: precomputation tables are faster.
             * The trick could be useful if both P and Q are not G (not in our case).
             * @returns non-zero affine point
             */


            multiplyAndAddUnsafe(Q, a, b) {
              const G = Point.BASE; // No Strauss-Shamir trick: we have 10% faster G precomputes

              const mul = (P, a // Select faster multiply() method
              ) => a === _0n || a === _1n || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a);

              const sum = mul(this, a).add(mul(Q, b));
              return sum.is0() ? undefined : sum;
            } // Converts Projective point to affine (x, y) coordinates.
            // Can accept precomputed Z^-1 - for example, from invertBatch.
            // (x, y, z) ∋ (x=x/z, y=y/z)


            toAffine(iz) {
              const {
                px: x,
                py: y,
                pz: z
              } = this;
              const is0 = this.is0(); // If invZ was 0, we return zero point. However we still want to execute
              // all operations, so we replace invZ with a random number, 1.

              if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(z);
              const ax = Fp.mul(x, iz);
              const ay = Fp.mul(y, iz);
              const zz = Fp.mul(z, iz);
              if (is0) return {
                x: Fp.ZERO,
                y: Fp.ZERO
              };
              if (!Fp.eql(zz, Fp.ONE)) throw new Error('invZ was invalid');
              return {
                x: ax,
                y: ay
              };
            }

            isTorsionFree() {
              const {
                h: cofactor,
                isTorsionFree
              } = CURVE;
              if (cofactor === _1n) return true; // No subgroups, always torsion-free

              if (isTorsionFree) return isTorsionFree(Point, this);
              throw new Error('isTorsionFree() has not been declared for the elliptic curve');
            }

            clearCofactor() {
              const {
                h: cofactor,
                clearCofactor
              } = CURVE;
              if (cofactor === _1n) return this; // Fast-path

              if (clearCofactor) return clearCofactor(Point, this);
              return this.multiplyUnsafe(CURVE.h);
            }

            toRawBytes(isCompressed = true) {
              this.assertValidity();
              return toBytes(Point, this, isCompressed);
            }

            toHex(isCompressed = true) {
              return ut.bytesToHex(this.toRawBytes(isCompressed));
            }

          }

          Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
          Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
          const _bits = CURVE.nBitLength;
          const wnaf = (0, curve_js_1.wNAF)(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits); // Validate if generator point is on curve

          return {
            CURVE,
            ProjectivePoint: Point,
            normPrivateKeyToScalar,
            weierstrassEquation,
            isWithinCurveOrder
          };
        }

        exports.weierstrassPoints = weierstrassPoints;

        function validateOpts(curve) {
          const opts = (0, curve_js_1.validateBasic)(curve);
          ut.validateObject(opts, {
            hash: 'hash',
            hmac: 'function',
            randomBytes: 'function'
          }, {
            bits2int: 'function',
            bits2int_modN: 'function',
            lowS: 'boolean'
          });
          return Object.freeze({
            lowS: true,
            ...opts
          });
        }

        function weierstrass(curveDef) {
          const CURVE = validateOpts(curveDef);
          const {
            Fp,
            n: CURVE_ORDER
          } = CURVE;
          const compressedLen = Fp.BYTES + 1; // e.g. 33 for 32

          const uncompressedLen = 2 * Fp.BYTES + 1; // e.g. 65 for 32

          function isValidFieldElement(num) {
            return _0n < num && num < Fp.ORDER; // 0 is banned since it's not invertible FE
          }

          function modN(a) {
            return mod.mod(a, CURVE_ORDER);
          }

          function invN(a) {
            return mod.invert(a, CURVE_ORDER);
          }

          const {
            ProjectivePoint: Point,
            normPrivateKeyToScalar,
            weierstrassEquation,
            isWithinCurveOrder
          } = weierstrassPoints({ ...CURVE,

            toBytes(c, point, isCompressed) {
              const a = point.toAffine();
              const x = Fp.toBytes(a.x);
              const cat = ut.concatBytes;

              if (isCompressed) {
                return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x);
              } else {
                return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y));
              }
            },

            fromBytes(bytes) {
              const len = bytes.length;
              const head = bytes[0];
              const tail = bytes.subarray(1); // this.assertValidity() is done inside of fromHex

              if (len === compressedLen && (head === 0x02 || head === 0x03)) {
                const x = ut.bytesToNumberBE(tail);
                if (!isValidFieldElement(x)) throw new Error('Point is not on curve');
                const y2 = weierstrassEquation(x); // y² = x³ + ax + b

                let y = Fp.sqrt(y2); // y = y² ^ (p+1)/4

                const isYOdd = (y & _1n) === _1n; // ECDSA

                const isHeadOdd = (head & 1) === 1;
                if (isHeadOdd !== isYOdd) y = Fp.neg(y);
                return {
                  x,
                  y
                };
              } else if (len === uncompressedLen && head === 0x04) {
                const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
                const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
                return {
                  x,
                  y
                };
              } else {
                throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
              }
            }

          });

          const numToNByteStr = num => ut.bytesToHex(ut.numberToBytesBE(num, CURVE.nByteLength));

          function isBiggerThanHalfOrder(number) {
            const HALF = CURVE_ORDER >> _1n;
            return number > HALF;
          }

          function normalizeS(s) {
            return isBiggerThanHalfOrder(s) ? modN(-s) : s;
          } // slice bytes num


          const slcNum = (b, from, to) => ut.bytesToNumberBE(b.slice(from, to));
          /**
           * ECDSA signature with its (r, s) properties. Supports DER & compact representations.
           */


          class Signature {
            constructor(r, s, recovery) {
              this.r = r;
              this.s = s;
              this.recovery = recovery;
              this.assertValidity();
            } // pair (bytes of r, bytes of s)


            static fromCompact(hex) {
              const l = CURVE.nByteLength;
              hex = (0, utils_js_1.ensureBytes)('compactSignature', hex, l * 2);
              return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
            } // DER encoded ECDSA signature
            // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script


            static fromDER(hex) {
              const {
                r,
                s
              } = exports.DER.toSig((0, utils_js_1.ensureBytes)('DER', hex));
              return new Signature(r, s);
            }

            assertValidity() {
              // can use assertGE here
              if (!isWithinCurveOrder(this.r)) throw new Error('r must be 0 < r < CURVE.n');
              if (!isWithinCurveOrder(this.s)) throw new Error('s must be 0 < s < CURVE.n');
            }

            addRecoveryBit(recovery) {
              return new Signature(this.r, this.s, recovery);
            }

            recoverPublicKey(msgHash) {
              const {
                r,
                s,
                recovery: rec
              } = this;
              const h = bits2int_modN((0, utils_js_1.ensureBytes)('msgHash', msgHash)); // Truncate hash

              if (rec == null || ![0, 1, 2, 3].includes(rec)) throw new Error('recovery id invalid');
              const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
              if (radj >= Fp.ORDER) throw new Error('recovery id 2 or 3 invalid');
              const prefix = (rec & 1) === 0 ? '02' : '03';
              const R = Point.fromHex(prefix + numToNByteStr(radj));
              const ir = invN(radj); // r^-1

              const u1 = modN(-h * ir); // -hr^-1

              const u2 = modN(s * ir); // sr^-1

              const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2); // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1)

              if (!Q) throw new Error('point at infinify'); // unsafe is fine: no priv data leaked

              Q.assertValidity();
              return Q;
            } // Signatures should be low-s, to prevent malleability.


            hasHighS() {
              return isBiggerThanHalfOrder(this.s);
            }

            normalizeS() {
              return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
            } // DER-encoded


            toDERRawBytes() {
              return ut.hexToBytes(this.toDERHex());
            }

            toDERHex() {
              return exports.DER.hexFromSig({
                r: this.r,
                s: this.s
              });
            } // padded bytes of r, then padded bytes of s


            toCompactRawBytes() {
              return ut.hexToBytes(this.toCompactHex());
            }

            toCompactHex() {
              return numToNByteStr(this.r) + numToNByteStr(this.s);
            }

          }

          const utils = {
            isValidPrivateKey(privateKey) {
              try {
                normPrivateKeyToScalar(privateKey);
                return true;
              } catch (error) {
                return false;
              }
            },

            normPrivateKeyToScalar: normPrivateKeyToScalar,

            /**
             * Produces cryptographically secure private key from random of size (nBitLength+64)
             * as per FIPS 186 B.4.1 with modulo bias being neglible.
             */
            randomPrivateKey: () => {
              const rand = CURVE.randomBytes(Fp.BYTES + 8);
              const num = mod.hashToPrivateScalar(rand, CURVE_ORDER);
              return ut.numberToBytesBE(num, CURVE.nByteLength);
            },

            /**
             * Creates precompute table for an arbitrary EC point. Makes point "cached".
             * Allows to massively speed-up `point.multiply(scalar)`.
             * @returns cached point
             * @example
             * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
             * fast.multiply(privKey); // much faster ECDH now
             */
            precompute(windowSize = 8, point = Point.BASE) {
              point._setWindowSize(windowSize);

              point.multiply(BigInt(3)); // 3 is arbitrary, just need any number here

              return point;
            }

          };
          /**
           * Computes public key for a private key. Checks for validity of the private key.
           * @param privateKey private key
           * @param isCompressed whether to return compact (default), or full key
           * @returns Public key, full when isCompressed=false; short when isCompressed=true
           */

          function getPublicKey(privateKey, isCompressed = true) {
            return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
          }
          /**
           * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
           */


          function isProbPub(item) {
            const arr = item instanceof Uint8Array;
            const str = typeof item === 'string';
            const len = (arr || str) && item.length;
            if (arr) return len === compressedLen || len === uncompressedLen;
            if (str) return len === 2 * compressedLen || len === 2 * uncompressedLen;
            if (item instanceof Point) return true;
            return false;
          }
          /**
           * ECDH (Elliptic Curve Diffie Hellman).
           * Computes shared public key from private key and public key.
           * Checks: 1) private key validity 2) shared key is on-curve.
           * Does NOT hash the result.
           * @param privateA private key
           * @param publicB different public key
           * @param isCompressed whether to return compact (default), or full key
           * @returns shared public key
           */


          function getSharedSecret(privateA, publicB, isCompressed = true) {
            if (isProbPub(privateA)) throw new Error('first arg must be private key');
            if (!isProbPub(publicB)) throw new Error('second arg must be public key');
            const b = Point.fromHex(publicB); // check for being on-curve

            return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
          } // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
          // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
          // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
          // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors


          const bits2int = CURVE.bits2int || function (bytes) {
            // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
            // for some cases, since bytes.length * 8 is not actual bitLength.
            const num = ut.bytesToNumberBE(bytes); // check for == u8 done here

            const delta = bytes.length * 8 - CURVE.nBitLength; // truncate to nBitLength leftmost bits

            return delta > 0 ? num >> BigInt(delta) : num;
          };

          const bits2int_modN = CURVE.bits2int_modN || function (bytes) {
            return modN(bits2int(bytes)); // can't use bytesToNumberBE here
          }; // NOTE: pads output with zero as per spec


          const ORDER_MASK = ut.bitMask(CURVE.nBitLength);
          /**
           * Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
           */

          function int2octets(num) {
            if (typeof num !== 'bigint') throw new Error('bigint expected');
            if (!(_0n <= num && num < ORDER_MASK)) throw new Error(`bigint expected < 2^${CURVE.nBitLength}`); // works with order, can have different size than numToField!

            return ut.numberToBytesBE(num, CURVE.nByteLength);
          } // Steps A, D of RFC6979 3.2
          // Creates RFC6979 seed; converts msg/privKey to numbers.
          // Used only in sign, not in verify.
          // NOTE: we cannot assume here that msgHash has same amount of bytes as curve order, this will be wrong at least for P521.
          // Also it can be bigger for P224 + SHA256


          function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
            if (['recovered', 'canonical'].some(k => k in opts)) throw new Error('sign() legacy options not supported');
            const {
              hash,
              randomBytes
            } = CURVE;
            let {
              lowS,
              prehash,
              extraEntropy: ent
            } = opts; // generates low-s sigs by default

            if (lowS == null) lowS = true; // RFC6979 3.2: we skip step A, because we already provide hash

            msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
            if (prehash) msgHash = (0, utils_js_1.ensureBytes)('prehashed msgHash', hash(msgHash)); // We can't later call bits2octets, since nested bits2int is broken for curves
            // with nBitLength % 8 !== 0. Because of that, we unwrap it here as int2octets call.
            // const bits2octets = (bits) => int2octets(bits2int_modN(bits))

            const h1int = bits2int_modN(msgHash);
            const d = normPrivateKeyToScalar(privateKey); // validate private key, convert to bigint

            const seedArgs = [int2octets(d), int2octets(h1int)]; // extraEntropy. RFC6979 3.6: additional k' (optional).

            if (ent != null) {
              // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
              const e = ent === true ? randomBytes(Fp.BYTES) : ent; // generate random bytes OR pass as-is

              seedArgs.push((0, utils_js_1.ensureBytes)('extraEntropy', e, Fp.BYTES)); // check for being of size BYTES
            }

            const seed = ut.concatBytes(...seedArgs); // Step D of RFC6979 3.2

            const m = h1int; // NOTE: no need to call bits2int second time here, it is inside truncateHash!
            // Converts signature params into point w r/s, checks result for validity.

            function k2sig(kBytes) {
              // RFC 6979 Section 3.2, step 3: k = bits2int(T)
              const k = bits2int(kBytes); // Cannot use fields methods, since it is group element

              if (!isWithinCurveOrder(k)) return; // Important: all mod() calls here must be done over N

              const ik = invN(k); // k^-1 mod n

              const q = Point.BASE.multiply(k).toAffine(); // q = Gk

              const r = modN(q.x); // r = q.x mod n

              if (r === _0n) return; // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
              // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
              // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT

              const s = modN(ik * modN(m + r * d)); // Not using blinding here

              if (s === _0n) return;
              let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n); // recovery bit (2 or 3, when q.x > n)

              let normS = s;

              if (lowS && isBiggerThanHalfOrder(s)) {
                normS = normalizeS(s); // if lowS was passed, ensure s is always

                recovery ^= 1; // // in the bottom half of N
              }

              return new Signature(r, normS, recovery); // use normS, not s
            }

            return {
              seed,
              k2sig
            };
          }

          const defaultSigOpts = {
            lowS: CURVE.lowS,
            prehash: false
          };
          const defaultVerOpts = {
            lowS: CURVE.lowS,
            prehash: false
          };
          /**
           * Signs message hash (not message: you need to hash it by yourself).
           * ```
           * sign(m, d, k) where
           *   (x, y) = G × k
           *   r = x mod n
           *   s = (m + dr)/k mod n
           * ```
           * @param opts `lowS, extraEntropy, prehash`
           */

          function sign(msgHash, privKey, opts = defaultSigOpts) {
            const {
              seed,
              k2sig
            } = prepSig(msgHash, privKey, opts); // Steps A, D of RFC6979 3.2.

            const drbg = ut.createHmacDrbg(CURVE.hash.outputLen, CURVE.nByteLength, CURVE.hmac);
            return drbg(seed, k2sig); // Steps B, C, D, E, F, G
          } // Enable precomputes. Slows down first publicKey computation by 20ms.


          Point.BASE._setWindowSize(8); // utils.precompute(8, ProjectivePoint.BASE)

          /**
           * Verifies a signature against message hash and public key.
           * Rejects lowS signatures by default: to override,
           * specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
           *
           * ```
           * verify(r, s, h, P) where
           *   U1 = hs^-1 mod n
           *   U2 = rs^-1 mod n
           *   R = U1⋅G - U2⋅P
           *   mod(R.x, n) == r
           * ```
           */


          function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
            const sg = signature;
            msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
            publicKey = (0, utils_js_1.ensureBytes)('publicKey', publicKey);
            if ('strict' in opts) throw new Error('options.strict was renamed to lowS');
            const {
              lowS,
              prehash
            } = opts;
            let _sig = undefined;
            let P;

            try {
              if (typeof sg === 'string' || sg instanceof Uint8Array) {
                // Signature can be represented in 2 ways: compact (2*nByteLength) & DER (variable-length).
                // Since DER can also be 2*nByteLength bytes, we check for it first.
                try {
                  _sig = Signature.fromDER(sg);
                } catch (derError) {
                  if (!(derError instanceof exports.DER.Err)) throw derError;
                  _sig = Signature.fromCompact(sg);
                }
              } else if (typeof sg === 'object' && typeof sg.r === 'bigint' && typeof sg.s === 'bigint') {
                const {
                  r,
                  s
                } = sg;
                _sig = new Signature(r, s);
              } else {
                throw new Error('PARSE');
              }

              P = Point.fromHex(publicKey);
            } catch (error) {
              if (error.message === 'PARSE') throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
              return false;
            }

            if (lowS && _sig.hasHighS()) return false;
            if (prehash) msgHash = CURVE.hash(msgHash);
            const {
              r,
              s
            } = _sig;
            const h = bits2int_modN(msgHash); // Cannot use fields methods, since it is group element

            const is = invN(s); // s^-1

            const u1 = modN(h * is); // u1 = hs^-1 mod n

            const u2 = modN(r * is); // u2 = rs^-1 mod n

            const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine(); // R = u1⋅G + u2⋅P

            if (!R) return false;
            const v = modN(R.x);
            return v === r;
          }

          return {
            CURVE,
            getPublicKey,
            getSharedSecret,
            sign,
            verify,
            ProjectivePoint: Point,
            Signature,
            utils
          };
        }

        exports.weierstrass = weierstrass; // Implementation of the Shallue and van de Woestijne method for any Weierstrass curve
        // TODO: check if there is a way to merge this with uvRatio in Edwards && move to modular?
        // b = True and y = sqrt(u / v) if (u / v) is square in F, and
        // b = False and y = sqrt(Z * (u / v)) otherwise.

        function SWUFpSqrtRatio(Fp, Z) {
          // Generic implementation
          const q = Fp.ORDER;
          let l = _0n;

          for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;

          const c1 = l; // 1. c1, the largest integer such that 2^c1 divides q - 1.

          const c2 = (q - _1n) / _2n ** c1; // 2. c2 = (q - 1) / (2^c1)        # Integer arithmetic

          const c3 = (c2 - _1n) / _2n; // 3. c3 = (c2 - 1) / 2            # Integer arithmetic

          const c4 = _2n ** c1 - _1n; // 4. c4 = 2^c1 - 1                # Integer arithmetic

          const c5 = _2n ** (c1 - _1n); // 5. c5 = 2^(c1 - 1)              # Integer arithmetic

          const c6 = Fp.pow(Z, c2); // 6. c6 = Z^c2

          const c7 = Fp.pow(Z, (c2 + _1n) / _2n); // 7. c7 = Z^((c2 + 1) / 2)

          let sqrtRatio = (u, v) => {
            let tv1 = c6; // 1. tv1 = c6

            let tv2 = Fp.pow(v, c4); // 2. tv2 = v^c4

            let tv3 = Fp.sqr(tv2); // 3. tv3 = tv2^2

            tv3 = Fp.mul(tv3, v); // 4. tv3 = tv3 * v

            let tv5 = Fp.mul(u, tv3); // 5. tv5 = u * tv3

            tv5 = Fp.pow(tv5, c3); // 6. tv5 = tv5^c3

            tv5 = Fp.mul(tv5, tv2); // 7. tv5 = tv5 * tv2

            tv2 = Fp.mul(tv5, v); // 8. tv2 = tv5 * v

            tv3 = Fp.mul(tv5, u); // 9. tv3 = tv5 * u

            let tv4 = Fp.mul(tv3, tv2); // 10. tv4 = tv3 * tv2

            tv5 = Fp.pow(tv4, c5); // 11. tv5 = tv4^c5

            let isQR = Fp.eql(tv5, Fp.ONE); // 12. isQR = tv5 == 1

            tv2 = Fp.mul(tv3, c7); // 13. tv2 = tv3 * c7

            tv5 = Fp.mul(tv4, tv1); // 14. tv5 = tv4 * tv1

            tv3 = Fp.cmov(tv2, tv3, isQR); // 15. tv3 = CMOV(tv2, tv3, isQR)

            tv4 = Fp.cmov(tv5, tv4, isQR); // 16. tv4 = CMOV(tv5, tv4, isQR)
            // 17. for i in (c1, c1 - 1, ..., 2):

            for (let i = c1; i > _1n; i--) {
              let tv5 = _2n ** (i - _2n); // 18.    tv5 = i - 2;    19.    tv5 = 2^tv5

              let tvv5 = Fp.pow(tv4, tv5); // 20.    tv5 = tv4^tv5

              const e1 = Fp.eql(tvv5, Fp.ONE); // 21.    e1 = tv5 == 1

              tv2 = Fp.mul(tv3, tv1); // 22.    tv2 = tv3 * tv1

              tv1 = Fp.mul(tv1, tv1); // 23.    tv1 = tv1 * tv1

              tvv5 = Fp.mul(tv4, tv1); // 24.    tv5 = tv4 * tv1

              tv3 = Fp.cmov(tv2, tv3, e1); // 25.    tv3 = CMOV(tv2, tv3, e1)

              tv4 = Fp.cmov(tvv5, tv4, e1); // 26.    tv4 = CMOV(tv5, tv4, e1)
            }

            return {
              isValid: isQR,
              value: tv3
            };
          };

          if (Fp.ORDER % _4n === _3n) {
            // sqrt_ratio_3mod4(u, v)
            const c1 = (Fp.ORDER - _3n) / _4n; // 1. c1 = (q - 3) / 4     # Integer arithmetic

            const c2 = Fp.sqrt(Fp.neg(Z)); // 2. c2 = sqrt(-Z)

            sqrtRatio = (u, v) => {
              let tv1 = Fp.sqr(v); // 1. tv1 = v^2

              const tv2 = Fp.mul(u, v); // 2. tv2 = u * v

              tv1 = Fp.mul(tv1, tv2); // 3. tv1 = tv1 * tv2

              let y1 = Fp.pow(tv1, c1); // 4. y1 = tv1^c1

              y1 = Fp.mul(y1, tv2); // 5. y1 = y1 * tv2

              const y2 = Fp.mul(y1, c2); // 6. y2 = y1 * c2

              const tv3 = Fp.mul(Fp.sqr(y1), v); // 7. tv3 = y1^2; 8. tv3 = tv3 * v

              const isQR = Fp.eql(tv3, u); // 9. isQR = tv3 == u

              let y = Fp.cmov(y2, y1, isQR); // 10. y = CMOV(y2, y1, isQR)

              return {
                isValid: isQR,
                value: y
              }; // 11. return (isQR, y) isQR ? y : y*c2
            };
          } // No curves uses that
          // if (Fp.ORDER % _8n === _5n) // sqrt_ratio_5mod8


          return sqrtRatio;
        }

        exports.SWUFpSqrtRatio = SWUFpSqrtRatio; // From draft-irtf-cfrg-hash-to-curve-16

        function mapToCurveSimpleSWU(Fp, opts) {
          mod.validateField(Fp);
          if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z)) throw new Error('mapToCurveSimpleSWU: invalid opts');
          const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
          if (!Fp.isOdd) throw new Error('Fp.isOdd is not implemented!'); // Input: u, an element of F.
          // Output: (x, y), a point on E.

          return u => {
            // prettier-ignore
            let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
            tv1 = Fp.sqr(u); // 1.  tv1 = u^2

            tv1 = Fp.mul(tv1, opts.Z); // 2.  tv1 = Z * tv1

            tv2 = Fp.sqr(tv1); // 3.  tv2 = tv1^2

            tv2 = Fp.add(tv2, tv1); // 4.  tv2 = tv2 + tv1

            tv3 = Fp.add(tv2, Fp.ONE); // 5.  tv3 = tv2 + 1

            tv3 = Fp.mul(tv3, opts.B); // 6.  tv3 = B * tv3

            tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO)); // 7.  tv4 = CMOV(Z, -tv2, tv2 != 0)

            tv4 = Fp.mul(tv4, opts.A); // 8.  tv4 = A * tv4

            tv2 = Fp.sqr(tv3); // 9.  tv2 = tv3^2

            tv6 = Fp.sqr(tv4); // 10. tv6 = tv4^2

            tv5 = Fp.mul(tv6, opts.A); // 11. tv5 = A * tv6

            tv2 = Fp.add(tv2, tv5); // 12. tv2 = tv2 + tv5

            tv2 = Fp.mul(tv2, tv3); // 13. tv2 = tv2 * tv3

            tv6 = Fp.mul(tv6, tv4); // 14. tv6 = tv6 * tv4

            tv5 = Fp.mul(tv6, opts.B); // 15. tv5 = B * tv6

            tv2 = Fp.add(tv2, tv5); // 16. tv2 = tv2 + tv5

            x = Fp.mul(tv1, tv3); // 17.   x = tv1 * tv3

            const {
              isValid,
              value
            } = sqrtRatio(tv2, tv6); // 18. (is_gx1_square, y1) = sqrt_ratio(tv2, tv6)

            y = Fp.mul(tv1, u); // 19.   y = tv1 * u  -> Z * u^3 * y1

            y = Fp.mul(y, value); // 20.   y = y * y1

            x = Fp.cmov(x, tv3, isValid); // 21.   x = CMOV(x, tv3, is_gx1_square)

            y = Fp.cmov(y, value, isValid); // 22.   y = CMOV(y, y1, is_gx1_square)

            const e1 = Fp.isOdd(u) === Fp.isOdd(y); // 23.  e1 = sgn0(u) == sgn0(y)

            y = Fp.cmov(Fp.neg(y), y, e1); // 24.   y = CMOV(-y, y, e1)

            x = Fp.div(x, tv4); // 25.   x = x / tv4

            return {
              x,
              y
            };
          };
        }

        exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
      }, {
        "./curve.js": 67,
        "./modular.js": 69,
        "./utils.js": 70
      }],
      72: [function (require, module, exports) {
        "use strict";

        var _a;

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.encodeToCurve = exports.hashToCurve = exports.schnorr = exports.secp256k1 = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        const sha256_1 = require("@noble/hashes/sha256");

        const utils_1 = require("@noble/hashes/utils");

        const modular_js_1 = require("./abstract/modular.js");

        const weierstrass_js_1 = require("./abstract/weierstrass.js");

        const utils_js_1 = require("./abstract/utils.js");

        const htf = require("./abstract/hash-to-curve.js");

        const _shortw_utils_js_1 = require("./_shortw_utils.js");

        const secp256k1P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
        const secp256k1N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');

        const _1n = BigInt(1);

        const _2n = BigInt(2);

        const divNearest = (a, b) => (a + b / _2n) / b;
        /**
         * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
         * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
         */


        function sqrtMod(y) {
          const P = secp256k1P; // prettier-ignore

          const _3n = BigInt(3),
                _6n = BigInt(6),
                _11n = BigInt(11),
                _22n = BigInt(22); // prettier-ignore


          const _23n = BigInt(23),
                _44n = BigInt(44),
                _88n = BigInt(88);

          const b2 = y * y * y % P; // x^3, 11

          const b3 = b2 * b2 * y % P; // x^7

          const b6 = (0, modular_js_1.pow2)(b3, _3n, P) * b3 % P;
          const b9 = (0, modular_js_1.pow2)(b6, _3n, P) * b3 % P;
          const b11 = (0, modular_js_1.pow2)(b9, _2n, P) * b2 % P;
          const b22 = (0, modular_js_1.pow2)(b11, _11n, P) * b11 % P;
          const b44 = (0, modular_js_1.pow2)(b22, _22n, P) * b22 % P;
          const b88 = (0, modular_js_1.pow2)(b44, _44n, P) * b44 % P;
          const b176 = (0, modular_js_1.pow2)(b88, _88n, P) * b88 % P;
          const b220 = (0, modular_js_1.pow2)(b176, _44n, P) * b44 % P;
          const b223 = (0, modular_js_1.pow2)(b220, _3n, P) * b3 % P;
          const t1 = (0, modular_js_1.pow2)(b223, _23n, P) * b22 % P;
          const t2 = (0, modular_js_1.pow2)(t1, _6n, P) * b2 % P;
          const root = (0, modular_js_1.pow2)(t2, _2n, P);
          if (!Fp.eql(Fp.sqr(root), y)) throw new Error('Cannot find square root');
          return root;
        }

        const Fp = (0, modular_js_1.Field)(secp256k1P, undefined, undefined, {
          sqrt: sqrtMod
        });
        exports.secp256k1 = (0, _shortw_utils_js_1.createCurve)({
          a: BigInt(0),
          b: BigInt(7),
          Fp,
          n: secp256k1N,
          // Base point (x, y) aka generator point
          Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
          Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
          h: BigInt(1),
          lowS: true,

          /**
           * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
           * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
           * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
           * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
           */
          endo: {
            beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
            splitScalar: k => {
              const n = secp256k1N;
              const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
              const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
              const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
              const b2 = a1;
              const POW_2_128 = BigInt('0x100000000000000000000000000000000'); // (2n**128n).toString(16)

              const c1 = divNearest(b2 * k, n);
              const c2 = divNearest(-b1 * k, n);
              let k1 = (0, modular_js_1.mod)(k - c1 * a1 - c2 * a2, n);
              let k2 = (0, modular_js_1.mod)(-c1 * b1 - c2 * b2, n);
              const k1neg = k1 > POW_2_128;
              const k2neg = k2 > POW_2_128;
              if (k1neg) k1 = n - k1;
              if (k2neg) k2 = n - k2;

              if (k1 > POW_2_128 || k2 > POW_2_128) {
                throw new Error('splitScalar: Endomorphism failed, k=' + k);
              }

              return {
                k1neg,
                k1,
                k2neg,
                k2
              };
            }
          }
        }, sha256_1.sha256); // Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
        // https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki

        const _0n = BigInt(0);

        const fe = x => typeof x === 'bigint' && _0n < x && x < secp256k1P;

        const ge = x => typeof x === 'bigint' && _0n < x && x < secp256k1N;
        /** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */


        const TAGGED_HASH_PREFIXES = {};

        function taggedHash(tag, ...messages) {
          let tagP = TAGGED_HASH_PREFIXES[tag];

          if (tagP === undefined) {
            const tagH = (0, sha256_1.sha256)(Uint8Array.from(tag, c => c.charCodeAt(0)));
            tagP = (0, utils_js_1.concatBytes)(tagH, tagH);
            TAGGED_HASH_PREFIXES[tag] = tagP;
          }

          return (0, sha256_1.sha256)((0, utils_js_1.concatBytes)(tagP, ...messages));
        } // ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03


        const pointToBytes = point => point.toRawBytes(true).slice(1);

        const numTo32b = n => (0, utils_js_1.numberToBytesBE)(n, 32);

        const modP = x => (0, modular_js_1.mod)(x, secp256k1P);

        const modN = x => (0, modular_js_1.mod)(x, secp256k1N);

        const Point = exports.secp256k1.ProjectivePoint;

        const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b); // Calculate point, scalar and bytes


        function schnorrGetExtPubKey(priv) {
          let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv); // same method executed in fromPrivateKey

          let p = Point.fromPrivateKey(d_); // P = d'⋅G; 0 < d' < n check is done inside

          const scalar = p.hasEvenY() ? d_ : modN(-d_);
          return {
            scalar: scalar,
            bytes: pointToBytes(p)
          };
        }
        /**
         * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
         * @returns valid point checked for being on-curve
         */


        function lift_x(x) {
          if (!fe(x)) throw new Error('bad x: need 0 < x < p'); // Fail if x ≥ p.

          const xx = modP(x * x);
          const c = modP(xx * x + BigInt(7)); // Let c = x³ + 7 mod p.

          let y = sqrtMod(c); // Let y = c^(p+1)/4 mod p.

          if (y % _2n !== _0n) y = modP(-y); // Return the unique point P such that x(P) = x and

          const p = new Point(x, y, _1n); // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.

          p.assertValidity();
          return p;
        }
        /**
         * Create tagged hash, convert it to bigint, reduce modulo-n.
         */


        function challenge(...args) {
          return modN((0, utils_js_1.bytesToNumberBE)(taggedHash('BIP0340/challenge', ...args)));
        }
        /**
         * Schnorr public key is just `x` coordinate of Point as per BIP340.
         */


        function schnorrGetPublicKey(privateKey) {
          return schnorrGetExtPubKey(privateKey).bytes; // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
        }
        /**
         * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
         * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
         */


        function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
          const m = (0, utils_js_1.ensureBytes)('message', message);
          const {
            bytes: px,
            scalar: d
          } = schnorrGetExtPubKey(privateKey); // checks for isWithinCurveOrder

          const a = (0, utils_js_1.ensureBytes)('auxRand', auxRand, 32); // Auxiliary random data a: a 32-byte array

          const t = numTo32b(d ^ (0, utils_js_1.bytesToNumberBE)(taggedHash('BIP0340/aux', a))); // Let t be the byte-wise xor of bytes(d) and hash/aux(a)

          const rand = taggedHash('BIP0340/nonce', t, px, m); // Let rand = hash/nonce(t || bytes(P) || m)

          const k_ = modN((0, utils_js_1.bytesToNumberBE)(rand)); // Let k' = int(rand) mod n

          if (k_ === _0n) throw new Error('sign failed: k is zero'); // Fail if k' = 0.

          const {
            bytes: rx,
            scalar: k
          } = schnorrGetExtPubKey(k_); // Let R = k'⋅G.

          const e = challenge(rx, px, m); // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.

          const sig = new Uint8Array(64); // Let sig = bytes(R) || bytes((k + ed) mod n).

          sig.set(rx, 0);
          sig.set(numTo32b(modN(k + e * d)), 32); // If Verify(bytes(P), m, sig) (see below) returns failure, abort

          if (!schnorrVerify(sig, m, px)) throw new Error('sign: Invalid signature produced');
          return sig;
        }
        /**
         * Verifies Schnorr signature.
         * Will swallow errors & return false except for initial type validation of arguments.
         */


        function schnorrVerify(signature, message, publicKey) {
          const sig = (0, utils_js_1.ensureBytes)('signature', signature, 64);
          const m = (0, utils_js_1.ensureBytes)('message', message);
          const pub = (0, utils_js_1.ensureBytes)('publicKey', publicKey, 32);

          try {
            const P = lift_x((0, utils_js_1.bytesToNumberBE)(pub)); // P = lift_x(int(pk)); fail if that fails

            const r = (0, utils_js_1.bytesToNumberBE)(sig.subarray(0, 32)); // Let r = int(sig[0:32]); fail if r ≥ p.

            if (!fe(r)) return false;
            const s = (0, utils_js_1.bytesToNumberBE)(sig.subarray(32, 64)); // Let s = int(sig[32:64]); fail if s ≥ n.

            if (!ge(s)) return false;
            const e = challenge(numTo32b(r), pointToBytes(P), m); // int(challenge(bytes(r)||bytes(P)||m))%n

            const R = GmulAdd(P, s, modN(-e)); // R = s⋅G - e⋅P

            if (!R || !R.hasEvenY() || R.toAffine().x !== r) return false; // -eP == (n-e)P

            return true; // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
          } catch (error) {
            return false;
          }
        }

        exports.schnorr = {
          getPublicKey: schnorrGetPublicKey,
          sign: schnorrSign,
          verify: schnorrVerify,
          utils: {
            randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
            lift_x,
            pointToBytes,
            numberToBytesBE: utils_js_1.numberToBytesBE,
            bytesToNumberBE: utils_js_1.bytesToNumberBE,
            taggedHash,
            mod: modular_js_1.mod
          }
        };
        const isoMap = htf.isogenyMap(Fp, [// xNum
        ['0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7', '0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581', '0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262', '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c'], // xDen
        ['0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b', '0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14', '0x0000000000000000000000000000000000000000000000000000000000000001' // LAST 1
        ], // yNum
        ['0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c', '0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3', '0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931', '0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84'], // yDen
        ['0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b', '0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573', '0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f', '0x0000000000000000000000000000000000000000000000000000000000000001' // LAST 1
        ]].map(i => i.map(j => BigInt(j))));
        const mapSWU = (0, weierstrass_js_1.mapToCurveSimpleSWU)(Fp, {
          A: BigInt('0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533'),
          B: BigInt('1771'),
          Z: Fp.create(BigInt('-11'))
        });
        _a = htf.createHasher(exports.secp256k1.ProjectivePoint, scalars => {
          const {
            x,
            y
          } = mapSWU(Fp.create(scalars[0]));
          return isoMap(x, y);
        }, {
          DST: 'secp256k1_XMD:SHA-256_SSWU_RO_',
          encodeDST: 'secp256k1_XMD:SHA-256_SSWU_NU_',
          p: Fp.ORDER,
          m: 1,
          k: 128,
          expand: 'xmd',
          hash: sha256_1.sha256
        }), exports.hashToCurve = _a.hashToCurve, exports.encodeToCurve = _a.encodeToCurve;
      }, {
        "./_shortw_utils.js": 66,
        "./abstract/hash-to-curve.js": 68,
        "./abstract/modular.js": 69,
        "./abstract/utils.js": 70,
        "./abstract/weierstrass.js": 71,
        "@noble/hashes/sha256": 85,
        "@noble/hashes/utils": 86
      }],
      73: [function (require, module, exports) {
        arguments[4][66][0].apply(exports, arguments);
      }, {
        "./abstract/weierstrass.js": 78,
        "@noble/hashes/hmac": 93,
        "@noble/hashes/utils": 98,
        "dup": 66
      }],
      74: [function (require, module, exports) {
        arguments[4][67][0].apply(exports, arguments);
      }, {
        "./modular.js": 76,
        "./utils.js": 77,
        "dup": 67
      }],
      75: [function (require, module, exports) {
        arguments[4][68][0].apply(exports, arguments);
      }, {
        "./modular.js": 76,
        "./utils.js": 77,
        "dup": 68
      }],
      76: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hashToPrivateScalar = exports.FpSqrtEven = exports.FpSqrtOdd = exports.Field = exports.nLength = exports.FpIsSquare = exports.FpDiv = exports.FpInvertBatch = exports.FpPow = exports.validateField = exports.isNegativeLE = exports.FpSqrt = exports.tonelliShanks = exports.invert = exports.pow2 = exports.pow = exports.mod = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // Utilities for modular arithmetics and finite fields

        const utils_js_1 = require("./utils.js"); // prettier-ignore


        const _0n = BigInt(0),
              _1n = BigInt(1),
              _2n = BigInt(2),
              _3n = BigInt(3); // prettier-ignore


        const _4n = BigInt(4),
              _5n = BigInt(5),
              _8n = BigInt(8); // prettier-ignore


        const _9n = BigInt(9),
              _16n = BigInt(16); // Calculates a modulo b


        function mod(a, b) {
          const result = a % b;
          return result >= _0n ? result : b + result;
        }

        exports.mod = mod;
        /**
         * Efficiently raise num to power and do modular division.
         * Unsafe in some contexts: uses ladder, so can expose bigint bits.
         * @example
         * pow(2n, 6n, 11n) // 64n % 11n == 9n
         */
        // TODO: use field version && remove

        function pow(num, power, modulo) {
          if (modulo <= _0n || power < _0n) throw new Error('Expected power/modulo > 0');
          if (modulo === _1n) return _0n;
          let res = _1n;

          while (power > _0n) {
            if (power & _1n) res = res * num % modulo;
            num = num * num % modulo;
            power >>= _1n;
          }

          return res;
        }

        exports.pow = pow; // Does x ^ (2 ^ power) mod p. pow2(30, 4) == 30 ^ (2 ^ 4)

        function pow2(x, power, modulo) {
          let res = x;

          while (power-- > _0n) {
            res *= res;
            res %= modulo;
          }

          return res;
        }

        exports.pow2 = pow2; // Inverses number over modulo

        function invert(number, modulo) {
          if (number === _0n || modulo <= _0n) {
            throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
          } // Euclidean GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
          // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.


          let a = mod(number, modulo);
          let b = modulo; // prettier-ignore

          let x = _0n,
              y = _1n,
              u = _1n,
              v = _0n;

          while (a !== _0n) {
            // JIT applies optimization if those two lines follow each other
            const q = b / a;
            const r = b % a;
            const m = x - u * q;
            const n = y - v * q; // prettier-ignore

            b = a, a = r, x = u, y = v, u = m, v = n;
          }

          const gcd = b;
          if (gcd !== _1n) throw new Error('invert: does not exist');
          return mod(x, modulo);
        }

        exports.invert = invert; // Tonelli-Shanks algorithm
        // Paper 1: https://eprint.iacr.org/2012/685.pdf (page 12)
        // Paper 2: Square Roots from 1; 24, 51, 10 to Dan Shanks

        function tonelliShanks(P) {
          // Legendre constant: used to calculate Legendre symbol (a | p),
          // which denotes the value of a^((p-1)/2) (mod p).
          // (a | p) ≡ 1    if a is a square (mod p)
          // (a | p) ≡ -1   if a is not a square (mod p)
          // (a | p) ≡ 0    if a ≡ 0 (mod p)
          const legendreC = (P - _1n) / _2n;
          let Q, S, Z; // Step 1: By factoring out powers of 2 from p - 1,
          // find q and s such that p - 1 = q*(2^s) with q odd

          for (Q = P - _1n, S = 0; Q % _2n === _0n; Q /= _2n, S++); // Step 2: Select a non-square z such that (z | p) ≡ -1 and set c ≡ zq


          for (Z = _2n; Z < P && pow(Z, legendreC, P) !== P - _1n; Z++); // Fast-path


          if (S === 1) {
            const p1div4 = (P + _1n) / _4n;
            return function tonelliFast(Fp, n) {
              const root = Fp.pow(n, p1div4);
              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // Slow-path


          const Q1div2 = (Q + _1n) / _2n;
          return function tonelliSlow(Fp, n) {
            // Step 0: Check that n is indeed a square: (n | p) should not be ≡ -1
            if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE)) throw new Error('Cannot find square root');
            let r = S; // TODO: will fail at Fp2/etc

            let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q); // will update both x and b

            let x = Fp.pow(n, Q1div2); // first guess at the square root

            let b = Fp.pow(n, Q); // first guess at the fudge factor

            while (!Fp.eql(b, Fp.ONE)) {
              if (Fp.eql(b, Fp.ZERO)) return Fp.ZERO; // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm (4. If t = 0, return r = 0)
              // Find m such b^(2^m)==1

              let m = 1;

              for (let t2 = Fp.sqr(b); m < r; m++) {
                if (Fp.eql(t2, Fp.ONE)) break;
                t2 = Fp.sqr(t2); // t2 *= t2
              } // NOTE: r-m-1 can be bigger than 32, need to convert to bigint before shift, otherwise there will be overflow


              const ge = Fp.pow(g, _1n << BigInt(r - m - 1)); // ge = 2^(r-m-1)

              g = Fp.sqr(ge); // g = ge * ge

              x = Fp.mul(x, ge); // x *= ge

              b = Fp.mul(b, g); // b *= g

              r = m;
            }

            return x;
          };
        }

        exports.tonelliShanks = tonelliShanks;

        function FpSqrt(P) {
          // NOTE: different algorithms can give different roots, it is up to user to decide which one they want.
          // For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
          // P ≡ 3 (mod 4)
          // √n = n^((P+1)/4)
          if (P % _4n === _3n) {
            // Not all roots possible!
            // const ORDER =
            //   0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
            // const NUM = 72057594037927816n;
            const p1div4 = (P + _1n) / _4n;
            return function sqrt3mod4(Fp, n) {
              const root = Fp.pow(n, p1div4); // Throw if root**2 != n

              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // Atkin algorithm for q ≡ 5 (mod 8), https://eprint.iacr.org/2012/685.pdf (page 10)


          if (P % _8n === _5n) {
            const c1 = (P - _5n) / _8n;
            return function sqrt5mod8(Fp, n) {
              const n2 = Fp.mul(n, _2n);
              const v = Fp.pow(n2, c1);
              const nv = Fp.mul(n, v);
              const i = Fp.mul(Fp.mul(nv, _2n), v);
              const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
              if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
              return root;
            };
          } // P ≡ 9 (mod 16)


          if (P % _16n === _9n) {// NOTE: tonelli is too slow for bls-Fp2 calculations even on start
            // Means we cannot use sqrt for constants at all!
            //
            // const c1 = Fp.sqrt(Fp.negate(Fp.ONE)); //  1. c1 = sqrt(-1) in F, i.e., (c1^2) == -1 in F
            // const c2 = Fp.sqrt(c1);                //  2. c2 = sqrt(c1) in F, i.e., (c2^2) == c1 in F
            // const c3 = Fp.sqrt(Fp.negate(c1));     //  3. c3 = sqrt(-c1) in F, i.e., (c3^2) == -c1 in F
            // const c4 = (P + _7n) / _16n;           //  4. c4 = (q + 7) / 16        # Integer arithmetic
            // sqrt = (x) => {
            //   let tv1 = Fp.pow(x, c4);             //  1. tv1 = x^c4
            //   let tv2 = Fp.mul(c1, tv1);           //  2. tv2 = c1 * tv1
            //   const tv3 = Fp.mul(c2, tv1);         //  3. tv3 = c2 * tv1
            //   let tv4 = Fp.mul(c3, tv1);           //  4. tv4 = c3 * tv1
            //   const e1 = Fp.equals(Fp.square(tv2), x); //  5.  e1 = (tv2^2) == x
            //   const e2 = Fp.equals(Fp.square(tv3), x); //  6.  e2 = (tv3^2) == x
            //   tv1 = Fp.cmov(tv1, tv2, e1); //  7. tv1 = CMOV(tv1, tv2, e1)  # Select tv2 if (tv2^2) == x
            //   tv2 = Fp.cmov(tv4, tv3, e2); //  8. tv2 = CMOV(tv4, tv3, e2)  # Select tv3 if (tv3^2) == x
            //   const e3 = Fp.equals(Fp.square(tv2), x); //  9.  e3 = (tv2^2) == x
            //   return Fp.cmov(tv1, tv2, e3); //  10.  z = CMOV(tv1, tv2, e3)  # Select the sqrt from tv1 and tv2
            // }
          } // Other cases: Tonelli-Shanks algorithm


          return tonelliShanks(P);
        }

        exports.FpSqrt = FpSqrt; // Little-endian check for first LE bit (last BE bit);

        const isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;

        exports.isNegativeLE = isNegativeLE; // prettier-ignore

        const FIELD_FIELDS = ['create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr', 'eql', 'add', 'sub', 'mul', 'pow', 'div', 'addN', 'subN', 'mulN', 'sqrN'];

        function validateField(field) {
          const initial = {
            ORDER: 'bigint',
            MASK: 'bigint',
            BYTES: 'isSafeInteger',
            BITS: 'isSafeInteger'
          };
          const opts = FIELD_FIELDS.reduce((map, val) => {
            map[val] = 'function';
            return map;
          }, initial);
          return (0, utils_js_1.validateObject)(field, opts);
        }

        exports.validateField = validateField; // Generic field functions

        function FpPow(f, num, power) {
          // Should have same speed as pow for bigints
          // TODO: benchmark!
          if (power < _0n) throw new Error('Expected power > 0');
          if (power === _0n) return f.ONE;
          if (power === _1n) return num;
          let p = f.ONE;
          let d = num;

          while (power > _0n) {
            if (power & _1n) p = f.mul(p, d);
            d = f.sqr(d);
            power >>= _1n;
          }

          return p;
        }

        exports.FpPow = FpPow; // 0 is non-invertible: non-batched version will throw on 0

        function FpInvertBatch(f, nums) {
          const tmp = new Array(nums.length); // Walk from first to last, multiply them by each other MOD p

          const lastMultiplied = nums.reduce((acc, num, i) => {
            if (f.is0(num)) return acc;
            tmp[i] = acc;
            return f.mul(acc, num);
          }, f.ONE); // Invert last element

          const inverted = f.inv(lastMultiplied); // Walk from last to first, multiply them by inverted each other MOD p

          nums.reduceRight((acc, num, i) => {
            if (f.is0(num)) return acc;
            tmp[i] = f.mul(acc, tmp[i]);
            return f.mul(acc, num);
          }, inverted);
          return tmp;
        }

        exports.FpInvertBatch = FpInvertBatch;

        function FpDiv(f, lhs, rhs) {
          return f.mul(lhs, typeof rhs === 'bigint' ? invert(rhs, f.ORDER) : f.inv(rhs));
        }

        exports.FpDiv = FpDiv; // This function returns True whenever the value x is a square in the field F.

        function FpIsSquare(f) {
          const legendreConst = (f.ORDER - _1n) / _2n; // Integer arithmetic

          return x => {
            const p = f.pow(x, legendreConst);
            return f.eql(p, f.ZERO) || f.eql(p, f.ONE);
          };
        }

        exports.FpIsSquare = FpIsSquare; // CURVE.n lengths

        function nLength(n, nBitLength) {
          // Bit size, byte size of CURVE.n
          const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;

          const nByteLength = Math.ceil(_nBitLength / 8);
          return {
            nBitLength: _nBitLength,
            nByteLength
          };
        }

        exports.nLength = nLength;
        /**
         * Initializes a galois field over prime. Non-primes are not supported for now.
         * Do not init in loop: slow. Very fragile: always run a benchmark on change.
         * Major performance gains:
         * a) non-normalized operations like mulN instead of mul
         * b) `Object.freeze`
         * c) Same object shape: never add or remove keys
         * @param ORDER prime positive bigint
         * @param bitLen how many bits the field consumes
         * @param isLE (def: false) if encoding / decoding should be in little-endian
         * @param redef optional faster redefinitions of sqrt and other methods
         */

        function Field(ORDER, bitLen, isLE = false, redef = {}) {
          if (ORDER <= _0n) throw new Error(`Expected Fp ORDER > 0, got ${ORDER}`);
          const {
            nBitLength: BITS,
            nByteLength: BYTES
          } = nLength(ORDER, bitLen);
          if (BYTES > 2048) throw new Error('Field lengths over 2048 bytes are not supported');
          const sqrtP = FpSqrt(ORDER);
          const f = Object.freeze({
            ORDER,
            BITS,
            BYTES,
            MASK: (0, utils_js_1.bitMask)(BITS),
            ZERO: _0n,
            ONE: _1n,
            create: num => mod(num, ORDER),
            isValid: num => {
              if (typeof num !== 'bigint') throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
              return _0n <= num && num < ORDER; // 0 is valid element, but it's not invertible
            },
            is0: num => num === _0n,
            isOdd: num => (num & _1n) === _1n,
            neg: num => mod(-num, ORDER),
            eql: (lhs, rhs) => lhs === rhs,
            sqr: num => mod(num * num, ORDER),
            add: (lhs, rhs) => mod(lhs + rhs, ORDER),
            sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
            mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
            pow: (num, power) => FpPow(f, num, power),
            div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
            // Same as above, but doesn't normalize
            sqrN: num => num * num,
            addN: (lhs, rhs) => lhs + rhs,
            subN: (lhs, rhs) => lhs - rhs,
            mulN: (lhs, rhs) => lhs * rhs,
            inv: num => invert(num, ORDER),
            sqrt: redef.sqrt || (n => sqrtP(f, n)),
            invertBatch: lst => FpInvertBatch(f, lst),
            // TODO: do we really need constant cmov?
            // We don't have const-time bigints anyway, so probably will be not very useful
            cmov: (a, b, c) => c ? b : a,
            toBytes: num => isLE ? (0, utils_js_1.numberToBytesLE)(num, BYTES) : (0, utils_js_1.numberToBytesBE)(num, BYTES),
            fromBytes: bytes => {
              if (bytes.length !== BYTES) throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes.length}`);
              return isLE ? (0, utils_js_1.bytesToNumberLE)(bytes) : (0, utils_js_1.bytesToNumberBE)(bytes);
            }
          });
          return Object.freeze(f);
        }

        exports.Field = Field;

        function FpSqrtOdd(Fp, elm) {
          if (!Fp.isOdd) throw new Error(`Field doesn't have isOdd`);
          const root = Fp.sqrt(elm);
          return Fp.isOdd(root) ? root : Fp.neg(root);
        }

        exports.FpSqrtOdd = FpSqrtOdd;

        function FpSqrtEven(Fp, elm) {
          if (!Fp.isOdd) throw new Error(`Field doesn't have isOdd`);
          const root = Fp.sqrt(elm);
          return Fp.isOdd(root) ? Fp.neg(root) : root;
        }

        exports.FpSqrtEven = FpSqrtEven;
        /**
         * FIPS 186 B.4.1-compliant "constant-time" private key generation utility.
         * Can take (n+8) or more bytes of uniform input e.g. from CSPRNG or KDF
         * and convert them into private scalar, with the modulo bias being negligible.
         * Needs at least 40 bytes of input for 32-byte private key.
         * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
         * @param hash hash output from SHA3 or a similar function
         * @param groupOrder size of subgroup - (e.g. curveFn.CURVE.n)
         * @param isLE interpret hash bytes as LE num
         * @returns valid private scalar
         */

        function hashToPrivateScalar(hash, groupOrder, isLE = false) {
          hash = (0, utils_js_1.ensureBytes)('privateHash', hash);
          const hashLen = hash.length;
          const minLen = nLength(groupOrder).nByteLength + 8;
          if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error(`hashToPrivateScalar: expected ${minLen}-1024 bytes of input, got ${hashLen}`);
          const num = isLE ? (0, utils_js_1.bytesToNumberLE)(hash) : (0, utils_js_1.bytesToNumberBE)(hash);
          return mod(num, groupOrder - _1n) + _1n;
        }

        exports.hashToPrivateScalar = hashToPrivateScalar;
      }, {
        "./utils.js": 77
      }],
      77: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.validateObject = exports.createHmacDrbg = exports.bitMask = exports.bitSet = exports.bitGet = exports.bitLen = exports.utf8ToBytes = exports.equalBytes = exports.concatBytes = exports.ensureBytes = exports.numberToVarBytesBE = exports.numberToBytesLE = exports.numberToBytesBE = exports.bytesToNumberLE = exports.bytesToNumberBE = exports.hexToBytes = exports.hexToNumber = exports.numberToHexUnpadded = exports.bytesToHex = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // 100 lines of code in the file are duplicated from noble-hashes (utils).
        // This is OK: `abstract` directory does not use noble-hashes.
        // User may opt-in into using different hashing library. This way, noble-hashes
        // won't be included into their bundle.

        const _0n = BigInt(0);

        const _1n = BigInt(1);

        const _2n = BigInt(2);

        const u8a = a => a instanceof Uint8Array;

        const hexes = Array.from({
          length: 256
        }, (v, i) => i.toString(16).padStart(2, '0'));
        /**
         * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
         */

        function bytesToHex(bytes) {
          if (!u8a(bytes)) throw new Error('Uint8Array expected'); // pre-caching improves the speed 6x

          let hex = '';

          for (let i = 0; i < bytes.length; i++) {
            hex += hexes[bytes[i]];
          }

          return hex;
        }

        exports.bytesToHex = bytesToHex;

        function numberToHexUnpadded(num) {
          const hex = num.toString(16);
          return hex.length & 1 ? `0${hex}` : hex;
        }

        exports.numberToHexUnpadded = numberToHexUnpadded;

        function hexToNumber(hex) {
          if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex); // Big Endian

          return BigInt(hex === '' ? '0' : `0x${hex}`);
        }

        exports.hexToNumber = hexToNumber;
        /**
         * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
         */

        function hexToBytes(hex) {
          if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
          const len = hex.length;
          if (len % 2) throw new Error('padded hex string expected, got unpadded hex of length ' + len);
          const array = new Uint8Array(len / 2);

          for (let i = 0; i < array.length; i++) {
            const j = i * 2;
            const hexByte = hex.slice(j, j + 2);
            const byte = Number.parseInt(hexByte, 16);
            if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
            array[i] = byte;
          }

          return array;
        }

        exports.hexToBytes = hexToBytes; // BE: Big Endian, LE: Little Endian

        function bytesToNumberBE(bytes) {
          return hexToNumber(bytesToHex(bytes));
        }

        exports.bytesToNumberBE = bytesToNumberBE;

        function bytesToNumberLE(bytes) {
          if (!u8a(bytes)) throw new Error('Uint8Array expected');
          return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
        }

        exports.bytesToNumberLE = bytesToNumberLE;

        function numberToBytesBE(n, len) {
          return hexToBytes(n.toString(16).padStart(len * 2, '0'));
        }

        exports.numberToBytesBE = numberToBytesBE;

        function numberToBytesLE(n, len) {
          return numberToBytesBE(n, len).reverse();
        }

        exports.numberToBytesLE = numberToBytesLE; // Unpadded, rarely used

        function numberToVarBytesBE(n) {
          return hexToBytes(numberToHexUnpadded(n));
        }

        exports.numberToVarBytesBE = numberToVarBytesBE;
        /**
         * Takes hex string or Uint8Array, converts to Uint8Array.
         * Validates output length.
         * Will throw error for other types.
         * @param title descriptive title for an error e.g. 'private key'
         * @param hex hex string or Uint8Array
         * @param expectedLength optional, will compare to result array's length
         * @returns
         */

        function ensureBytes(title, hex, expectedLength) {
          let res;

          if (typeof hex === 'string') {
            try {
              res = hexToBytes(hex);
            } catch (e) {
              throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
            }
          } else if (u8a(hex)) {
            // Uint8Array.from() instead of hash.slice() because node.js Buffer
            // is instance of Uint8Array, and its slice() creates **mutable** copy
            res = Uint8Array.from(hex);
          } else {
            throw new Error(`${title} must be hex string or Uint8Array`);
          }

          const len = res.length;
          if (typeof expectedLength === 'number' && len !== expectedLength) throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
          return res;
        }

        exports.ensureBytes = ensureBytes;
        /**
         * Copies several Uint8Arrays into one.
         */

        function concatBytes(...arrays) {
          const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
          let pad = 0; // walk through each item, ensure they have proper type

          arrays.forEach(a => {
            if (!u8a(a)) throw new Error('Uint8Array expected');
            r.set(a, pad);
            pad += a.length;
          });
          return r;
        }

        exports.concatBytes = concatBytes;

        function equalBytes(b1, b2) {
          // We don't care about timing attacks here
          if (b1.length !== b2.length) return false;

          for (let i = 0; i < b1.length; i++) if (b1[i] !== b2[i]) return false;

          return true;
        }

        exports.equalBytes = equalBytes;
        /**
         * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
         */

        function utf8ToBytes(str) {
          if (typeof str !== 'string') throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
          return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
        }

        exports.utf8ToBytes = utf8ToBytes; // Bit operations

        /**
         * Calculates amount of bits in a bigint.
         * Same as `n.toString(2).length`
         */

        function bitLen(n) {
          let len;

          for (len = 0; n > _0n; n >>= _1n, len += 1);

          return len;
        }

        exports.bitLen = bitLen;
        /**
         * Gets single bit at position.
         * NOTE: first bit position is 0 (same as arrays)
         * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
         */

        function bitGet(n, pos) {
          return n >> BigInt(pos) & _1n;
        }

        exports.bitGet = bitGet;
        /**
         * Sets single bit at position.
         */

        const bitSet = (n, pos, value) => {
          return n | (value ? _1n : _0n) << BigInt(pos);
        };

        exports.bitSet = bitSet;
        /**
         * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
         * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
         */

        const bitMask = n => (_2n << BigInt(n - 1)) - _1n;

        exports.bitMask = bitMask; // DRBG

        const u8n = data => new Uint8Array(data); // creates Uint8Array


        const u8fr = arr => Uint8Array.from(arr); // another shortcut

        /**
         * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
         * @returns function that will call DRBG until 2nd arg returns something meaningful
         * @example
         *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
         *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
         */


        function createHmacDrbg(hashLen, qByteLen, hmacFn) {
          if (typeof hashLen !== 'number' || hashLen < 2) throw new Error('hashLen must be a number');
          if (typeof qByteLen !== 'number' || qByteLen < 2) throw new Error('qByteLen must be a number');
          if (typeof hmacFn !== 'function') throw new Error('hmacFn must be a function'); // Step B, Step C: set hashLen to 8*ceil(hlen/8)

          let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.

          let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same

          let i = 0; // Iterations counter, will throw when over 1000

          const reset = () => {
            v.fill(1);
            k.fill(0);
            i = 0;
          };

          const h = (...b) => hmacFn(k, v, ...b); // hmac(k)(v, ...values)


          const reseed = (seed = u8n()) => {
            // HMAC-DRBG reseed() function. Steps D-G
            k = h(u8fr([0x00]), seed); // k = hmac(k || v || 0x00 || seed)

            v = h(); // v = hmac(k || v)

            if (seed.length === 0) return;
            k = h(u8fr([0x01]), seed); // k = hmac(k || v || 0x01 || seed)

            v = h(); // v = hmac(k || v)
          };

          const gen = () => {
            // HMAC-DRBG generate() function
            if (i++ >= 1000) throw new Error('drbg: tried 1000 values');
            let len = 0;
            const out = [];

            while (len < qByteLen) {
              v = h();
              const sl = v.slice();
              out.push(sl);
              len += v.length;
            }

            return concatBytes(...out);
          };

          const genUntil = (seed, pred) => {
            reset();
            reseed(seed); // Steps D-G

            let res = undefined; // Step H: grind until k is in [1..n-1]

            while (!(res = pred(gen()))) reseed();

            reset();
            return res;
          };

          return genUntil;
        }

        exports.createHmacDrbg = createHmacDrbg; // Validating curves and fields

        const validatorFns = {
          bigint: val => typeof val === 'bigint',
          function: val => typeof val === 'function',
          boolean: val => typeof val === 'boolean',
          string: val => typeof val === 'string',
          isSafeInteger: val => Number.isSafeInteger(val),
          array: val => Array.isArray(val),
          field: (val, object) => object.Fp.isValid(val),
          hash: val => typeof val === 'function' && Number.isSafeInteger(val.outputLen)
        }; // type Record<K extends string | number | symbol, T> = { [P in K]: T; }

        function validateObject(object, validators, optValidators = {}) {
          const checkField = (fieldName, type, isOptional) => {
            const checkVal = validatorFns[type];
            if (typeof checkVal !== 'function') throw new Error(`Invalid validator "${type}", expected function`);
            const val = object[fieldName];
            if (isOptional && val === undefined) return;

            if (!checkVal(val, object)) {
              throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
            }
          };

          for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);

          for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);

          return object;
        }

        exports.validateObject = validateObject; // validate type tests
        // const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
        // const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
        // // Should fail type-check
        // const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
        // const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
        // const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
        // const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
      }, {}],
      78: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.mapToCurveSimpleSWU = exports.SWUFpSqrtRatio = exports.weierstrass = exports.weierstrassPoints = exports.DER = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
        // Short Weierstrass curve. The formula is: y² = x³ + ax + b

        const mod = require("./modular.js");

        const ut = require("./utils.js");

        const utils_js_1 = require("./utils.js");

        const curve_js_1 = require("./curve.js");

        function validatePointOpts(curve) {
          const opts = (0, curve_js_1.validateBasic)(curve);
          ut.validateObject(opts, {
            a: 'field',
            b: 'field'
          }, {
            allowedPrivateKeyLengths: 'array',
            wrapPrivateKey: 'boolean',
            isTorsionFree: 'function',
            clearCofactor: 'function',
            allowInfinityPoint: 'boolean',
            fromBytes: 'function',
            toBytes: 'function'
          });
          const {
            endo,
            Fp,
            a
          } = opts;

          if (endo) {
            if (!Fp.eql(a, Fp.ZERO)) {
              throw new Error('Endomorphism can only be defined for Koblitz curves that have a=0');
            }

            if (typeof endo !== 'object' || typeof endo.beta !== 'bigint' || typeof endo.splitScalar !== 'function') {
              throw new Error('Expected endomorphism with beta: bigint and splitScalar: function');
            }
          }

          return Object.freeze({ ...opts
          });
        } // ASN.1 DER encoding utilities


        const {
          bytesToNumberBE: b2n,
          hexToBytes: h2b
        } = ut;
        exports.DER = {
          // asn.1 DER encoding utils
          Err: class DERErr extends Error {
            constructor(m = '') {
              super(m);
            }

          },

          _parseInt(data) {
            const {
              Err: E
            } = exports.DER;
            if (data.length < 2 || data[0] !== 0x02) throw new E('Invalid signature integer tag');
            const len = data[1];
            const res = data.subarray(2, len + 2);
            if (!len || res.length !== len) throw new E('Invalid signature integer: wrong length'); // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
            // since we always use positive integers here. It must always be empty:
            // - add zero byte if exists
            // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)

            if (res[0] & 0b10000000) throw new E('Invalid signature integer: negative');
            if (res[0] === 0x00 && !(res[1] & 0b10000000)) throw new E('Invalid signature integer: unnecessary leading zero');
            return {
              d: b2n(res),
              l: data.subarray(len + 2)
            }; // d is data, l is left
          },

          toSig(hex) {
            // parse DER signature
            const {
              Err: E
            } = exports.DER;
            const data = typeof hex === 'string' ? h2b(hex) : hex;
            if (!(data instanceof Uint8Array)) throw new Error('ui8a expected');
            let l = data.length;
            if (l < 2 || data[0] != 0x30) throw new E('Invalid signature tag');
            if (data[1] !== l - 2) throw new E('Invalid signature: incorrect length');

            const {
              d: r,
              l: sBytes
            } = exports.DER._parseInt(data.subarray(2));

            const {
              d: s,
              l: rBytesLeft
            } = exports.DER._parseInt(sBytes);

            if (rBytesLeft.length) throw new E('Invalid signature: left bytes after parsing');
            return {
              r,
              s
            };
          },

          hexFromSig(sig) {
            // Add leading zero if first byte has negative bit enabled. More details in '_parseInt'
            const slice = s => Number.parseInt(s[0], 16) & 0b1000 ? '00' + s : s;

            const h = num => {
              const hex = num.toString(16);
              return hex.length & 1 ? `0${hex}` : hex;
            };

            const s = slice(h(sig.s));
            const r = slice(h(sig.r));
            const shl = s.length / 2;
            const rhl = r.length / 2;
            const sl = h(shl);
            const rl = h(rhl);
            return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`;
          }

        }; // Be friendly to bad ECMAScript parsers by not using bigint literals
        // prettier-ignore

        const _0n = BigInt(0),
              _1n = BigInt(1),
              _2n = BigInt(2),
              _3n = BigInt(3),
              _4n = BigInt(4);

        function weierstrassPoints(opts) {
          const CURVE = validatePointOpts(opts);
          const {
            Fp
          } = CURVE; // All curves has same field / group length as for now, but they can differ

          const toBytes = CURVE.toBytes || ((c, point, isCompressed) => {
            const a = point.toAffine();
            return ut.concatBytes(Uint8Array.from([0x04]), Fp.toBytes(a.x), Fp.toBytes(a.y));
          });

          const fromBytes = CURVE.fromBytes || (bytes => {
            // const head = bytes[0];
            const tail = bytes.subarray(1); // if (head !== 0x04) throw new Error('Only non-compressed encoding is supported');

            const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
            const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
            return {
              x,
              y
            };
          });
          /**
           * y² = x³ + ax + b: Short weierstrass curve formula
           * @returns y²
           */


          function weierstrassEquation(x) {
            const {
              a,
              b
            } = CURVE;
            const x2 = Fp.sqr(x); // x * x

            const x3 = Fp.mul(x2, x); // x2 * x

            return Fp.add(Fp.add(x3, Fp.mul(x, a)), b); // x3 + a * x + b
          } // Validate whether the passed curve params are valid.
          // We check if curve equation works for generator point.
          // `assertValidity()` won't work: `isTorsionFree()` is not available at this point in bls12-381.
          // ProjectivePoint class has not been initialized yet.


          if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx))) throw new Error('bad generator point: equation left != right'); // Valid group elements reside in range 1..n-1

          function isWithinCurveOrder(num) {
            return typeof num === 'bigint' && _0n < num && num < CURVE.n;
          }

          function assertGE(num) {
            if (!isWithinCurveOrder(num)) throw new Error('Expected valid bigint: 0 < bigint < curve.n');
          } // Validates if priv key is valid and converts it to bigint.
          // Supports options allowedPrivateKeyLengths and wrapPrivateKey.


          function normPrivateKeyToScalar(key) {
            const {
              allowedPrivateKeyLengths: lengths,
              nByteLength,
              wrapPrivateKey,
              n
            } = CURVE;

            if (lengths && typeof key !== 'bigint') {
              if (key instanceof Uint8Array) key = ut.bytesToHex(key); // Normalize to hex string, pad. E.g. P521 would norm 130-132 char hex to 132-char bytes

              if (typeof key !== 'string' || !lengths.includes(key.length)) throw new Error('Invalid key');
              key = key.padStart(nByteLength * 2, '0');
            }

            let num;

            try {
              num = typeof key === 'bigint' ? key : ut.bytesToNumberBE((0, utils_js_1.ensureBytes)('private key', key, nByteLength));
            } catch (error) {
              throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
            }

            if (wrapPrivateKey) num = mod.mod(num, n); // disabled by default, enabled for BLS

            assertGE(num); // num in range [1..N-1]

            return num;
          }

          const pointPrecomputes = new Map();

          function assertPrjPoint(other) {
            if (!(other instanceof Point)) throw new Error('ProjectivePoint expected');
          }
          /**
           * Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
           * Default Point works in 2d / affine coordinates: (x, y)
           * We're doing calculations in projective, because its operations don't require costly inversion.
           */


          class Point {
            constructor(px, py, pz) {
              this.px = px;
              this.py = py;
              this.pz = pz;
              if (px == null || !Fp.isValid(px)) throw new Error('x required');
              if (py == null || !Fp.isValid(py)) throw new Error('y required');
              if (pz == null || !Fp.isValid(pz)) throw new Error('z required');
            } // Does not validate if the point is on-curve.
            // Use fromHex instead, or call assertValidity() later.


            static fromAffine(p) {
              const {
                x,
                y
              } = p || {};
              if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error('invalid affine point');
              if (p instanceof Point) throw new Error('projective point not allowed');

              const is0 = i => Fp.eql(i, Fp.ZERO); // fromAffine(x:0, y:0) would produce (x:0, y:0, z:1), but we need (x:0, y:1, z:0)


              if (is0(x) && is0(y)) return Point.ZERO;
              return new Point(x, y, Fp.ONE);
            }

            get x() {
              return this.toAffine().x;
            }

            get y() {
              return this.toAffine().y;
            }
            /**
             * Takes a bunch of Projective Points but executes only one
             * inversion on all of them. Inversion is very slow operation,
             * so this improves performance massively.
             * Optimization: converts a list of projective points to a list of identical points with Z=1.
             */


            static normalizeZ(points) {
              const toInv = Fp.invertBatch(points.map(p => p.pz));
              return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
            }
            /**
             * Converts hash string or Uint8Array to Point.
             * @param hex short/long ECDSA hex
             */


            static fromHex(hex) {
              const P = Point.fromAffine(fromBytes((0, utils_js_1.ensureBytes)('pointHex', hex)));
              P.assertValidity();
              return P;
            } // Multiplies generator point by privateKey.


            static fromPrivateKey(privateKey) {
              return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
            } // "Private method", don't use it directly


            _setWindowSize(windowSize) {
              this._WINDOW_SIZE = windowSize;
              pointPrecomputes.delete(this);
            } // A point on curve is valid if it conforms to equation.


            assertValidity() {
              // Zero is valid point too!
              if (this.is0()) {
                if (CURVE.allowInfinityPoint) return;
                throw new Error('bad point: ZERO');
              } // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`


              const {
                x,
                y
              } = this.toAffine(); // Check if x, y are valid field elements

              if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error('bad point: x or y not FE');
              const left = Fp.sqr(y); // y²

              const right = weierstrassEquation(x); // x³ + ax + b

              if (!Fp.eql(left, right)) throw new Error('bad point: equation left != right');
              if (!this.isTorsionFree()) throw new Error('bad point: not in prime-order subgroup');
            }

            hasEvenY() {
              const {
                y
              } = this.toAffine();
              if (Fp.isOdd) return !Fp.isOdd(y);
              throw new Error("Field doesn't support isOdd");
            }
            /**
             * Compare one point to another.
             */


            equals(other) {
              assertPrjPoint(other);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              const {
                px: X2,
                py: Y2,
                pz: Z2
              } = other;
              const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
              const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
              return U1 && U2;
            }
            /**
             * Flips point to one corresponding to (x, -y) in Affine coordinates.
             */


            negate() {
              return new Point(this.px, Fp.neg(this.py), this.pz);
            } // Renes-Costello-Batina exception-free doubling formula.
            // There is 30% faster Jacobian formula, but it is not complete.
            // https://eprint.iacr.org/2015/1060, algorithm 3
            // Cost: 8M + 3S + 3*a + 2*b3 + 15add.


            double() {
              const {
                a,
                b
              } = CURVE;
              const b3 = Fp.mul(b, _3n);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              let X3 = Fp.ZERO,
                  Y3 = Fp.ZERO,
                  Z3 = Fp.ZERO; // prettier-ignore

              let t0 = Fp.mul(X1, X1); // step 1

              let t1 = Fp.mul(Y1, Y1);
              let t2 = Fp.mul(Z1, Z1);
              let t3 = Fp.mul(X1, Y1);
              t3 = Fp.add(t3, t3); // step 5

              Z3 = Fp.mul(X1, Z1);
              Z3 = Fp.add(Z3, Z3);
              X3 = Fp.mul(a, Z3);
              Y3 = Fp.mul(b3, t2);
              Y3 = Fp.add(X3, Y3); // step 10

              X3 = Fp.sub(t1, Y3);
              Y3 = Fp.add(t1, Y3);
              Y3 = Fp.mul(X3, Y3);
              X3 = Fp.mul(t3, X3);
              Z3 = Fp.mul(b3, Z3); // step 15

              t2 = Fp.mul(a, t2);
              t3 = Fp.sub(t0, t2);
              t3 = Fp.mul(a, t3);
              t3 = Fp.add(t3, Z3);
              Z3 = Fp.add(t0, t0); // step 20

              t0 = Fp.add(Z3, t0);
              t0 = Fp.add(t0, t2);
              t0 = Fp.mul(t0, t3);
              Y3 = Fp.add(Y3, t0);
              t2 = Fp.mul(Y1, Z1); // step 25

              t2 = Fp.add(t2, t2);
              t0 = Fp.mul(t2, t3);
              X3 = Fp.sub(X3, t0);
              Z3 = Fp.mul(t2, t1);
              Z3 = Fp.add(Z3, Z3); // step 30

              Z3 = Fp.add(Z3, Z3);
              return new Point(X3, Y3, Z3);
            } // Renes-Costello-Batina exception-free addition formula.
            // There is 30% faster Jacobian formula, but it is not complete.
            // https://eprint.iacr.org/2015/1060, algorithm 1
            // Cost: 12M + 0S + 3*a + 3*b3 + 23add.


            add(other) {
              assertPrjPoint(other);
              const {
                px: X1,
                py: Y1,
                pz: Z1
              } = this;
              const {
                px: X2,
                py: Y2,
                pz: Z2
              } = other;
              let X3 = Fp.ZERO,
                  Y3 = Fp.ZERO,
                  Z3 = Fp.ZERO; // prettier-ignore

              const a = CURVE.a;
              const b3 = Fp.mul(CURVE.b, _3n);
              let t0 = Fp.mul(X1, X2); // step 1

              let t1 = Fp.mul(Y1, Y2);
              let t2 = Fp.mul(Z1, Z2);
              let t3 = Fp.add(X1, Y1);
              let t4 = Fp.add(X2, Y2); // step 5

              t3 = Fp.mul(t3, t4);
              t4 = Fp.add(t0, t1);
              t3 = Fp.sub(t3, t4);
              t4 = Fp.add(X1, Z1);
              let t5 = Fp.add(X2, Z2); // step 10

              t4 = Fp.mul(t4, t5);
              t5 = Fp.add(t0, t2);
              t4 = Fp.sub(t4, t5);
              t5 = Fp.add(Y1, Z1);
              X3 = Fp.add(Y2, Z2); // step 15

              t5 = Fp.mul(t5, X3);
              X3 = Fp.add(t1, t2);
              t5 = Fp.sub(t5, X3);
              Z3 = Fp.mul(a, t4);
              X3 = Fp.mul(b3, t2); // step 20

              Z3 = Fp.add(X3, Z3);
              X3 = Fp.sub(t1, Z3);
              Z3 = Fp.add(t1, Z3);
              Y3 = Fp.mul(X3, Z3);
              t1 = Fp.add(t0, t0); // step 25

              t1 = Fp.add(t1, t0);
              t2 = Fp.mul(a, t2);
              t4 = Fp.mul(b3, t4);
              t1 = Fp.add(t1, t2);
              t2 = Fp.sub(t0, t2); // step 30

              t2 = Fp.mul(a, t2);
              t4 = Fp.add(t4, t2);
              t0 = Fp.mul(t1, t4);
              Y3 = Fp.add(Y3, t0);
              t0 = Fp.mul(t5, t4); // step 35

              X3 = Fp.mul(t3, X3);
              X3 = Fp.sub(X3, t0);
              t0 = Fp.mul(t3, t1);
              Z3 = Fp.mul(t5, Z3);
              Z3 = Fp.add(Z3, t0); // step 40

              return new Point(X3, Y3, Z3);
            }

            subtract(other) {
              return this.add(other.negate());
            }

            is0() {
              return this.equals(Point.ZERO);
            }

            wNAF(n) {
              return wnaf.wNAFCached(this, pointPrecomputes, n, comp => {
                const toInv = Fp.invertBatch(comp.map(p => p.pz));
                return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
              });
            }
            /**
             * Non-constant-time multiplication. Uses double-and-add algorithm.
             * It's faster, but should only be used when you don't care about
             * an exposed private key e.g. sig verification, which works over *public* keys.
             */


            multiplyUnsafe(n) {
              const I = Point.ZERO;
              if (n === _0n) return I;
              assertGE(n); // Will throw on 0

              if (n === _1n) return this;
              const {
                endo
              } = CURVE;
              if (!endo) return wnaf.unsafeLadder(this, n); // Apply endomorphism

              let {
                k1neg,
                k1,
                k2neg,
                k2
              } = endo.splitScalar(n);
              let k1p = I;
              let k2p = I;
              let d = this;

              while (k1 > _0n || k2 > _0n) {
                if (k1 & _1n) k1p = k1p.add(d);
                if (k2 & _1n) k2p = k2p.add(d);
                d = d.double();
                k1 >>= _1n;
                k2 >>= _1n;
              }

              if (k1neg) k1p = k1p.negate();
              if (k2neg) k2p = k2p.negate();
              k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
              return k1p.add(k2p);
            }
            /**
             * Constant time multiplication.
             * Uses wNAF method. Windowed method may be 10% faster,
             * but takes 2x longer to generate and consumes 2x memory.
             * Uses precomputes when available.
             * Uses endomorphism for Koblitz curves.
             * @param scalar by which the point would be multiplied
             * @returns New point
             */


            multiply(scalar) {
              assertGE(scalar);
              let n = scalar;
              let point, fake; // Fake point is used to const-time mult

              const {
                endo
              } = CURVE;

              if (endo) {
                const {
                  k1neg,
                  k1,
                  k2neg,
                  k2
                } = endo.splitScalar(n);
                let {
                  p: k1p,
                  f: f1p
                } = this.wNAF(k1);
                let {
                  p: k2p,
                  f: f2p
                } = this.wNAF(k2);
                k1p = wnaf.constTimeNegate(k1neg, k1p);
                k2p = wnaf.constTimeNegate(k2neg, k2p);
                k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
                point = k1p.add(k2p);
                fake = f1p.add(f2p);
              } else {
                const {
                  p,
                  f
                } = this.wNAF(n);
                point = p;
                fake = f;
              } // Normalize `z` for both points, but return only real one


              return Point.normalizeZ([point, fake])[0];
            }
            /**
             * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
             * Not using Strauss-Shamir trick: precomputation tables are faster.
             * The trick could be useful if both P and Q are not G (not in our case).
             * @returns non-zero affine point
             */


            multiplyAndAddUnsafe(Q, a, b) {
              const G = Point.BASE; // No Strauss-Shamir trick: we have 10% faster G precomputes

              const mul = (P, a // Select faster multiply() method
              ) => a === _0n || a === _1n || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a);

              const sum = mul(this, a).add(mul(Q, b));
              return sum.is0() ? undefined : sum;
            } // Converts Projective point to affine (x, y) coordinates.
            // Can accept precomputed Z^-1 - for example, from invertBatch.
            // (x, y, z) ∋ (x=x/z, y=y/z)


            toAffine(iz) {
              const {
                px: x,
                py: y,
                pz: z
              } = this;
              const is0 = this.is0(); // If invZ was 0, we return zero point. However we still want to execute
              // all operations, so we replace invZ with a random number, 1.

              if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(z);
              const ax = Fp.mul(x, iz);
              const ay = Fp.mul(y, iz);
              const zz = Fp.mul(z, iz);
              if (is0) return {
                x: Fp.ZERO,
                y: Fp.ZERO
              };
              if (!Fp.eql(zz, Fp.ONE)) throw new Error('invZ was invalid');
              return {
                x: ax,
                y: ay
              };
            }

            isTorsionFree() {
              const {
                h: cofactor,
                isTorsionFree
              } = CURVE;
              if (cofactor === _1n) return true; // No subgroups, always torsion-free

              if (isTorsionFree) return isTorsionFree(Point, this);
              throw new Error('isTorsionFree() has not been declared for the elliptic curve');
            }

            clearCofactor() {
              const {
                h: cofactor,
                clearCofactor
              } = CURVE;
              if (cofactor === _1n) return this; // Fast-path

              if (clearCofactor) return clearCofactor(Point, this);
              return this.multiplyUnsafe(CURVE.h);
            }

            toRawBytes(isCompressed = true) {
              this.assertValidity();
              return toBytes(Point, this, isCompressed);
            }

            toHex(isCompressed = true) {
              return ut.bytesToHex(this.toRawBytes(isCompressed));
            }

          }

          Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
          Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
          const _bits = CURVE.nBitLength;
          const wnaf = (0, curve_js_1.wNAF)(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits); // Validate if generator point is on curve

          return {
            CURVE,
            ProjectivePoint: Point,
            normPrivateKeyToScalar,
            weierstrassEquation,
            isWithinCurveOrder
          };
        }

        exports.weierstrassPoints = weierstrassPoints;

        function validateOpts(curve) {
          const opts = (0, curve_js_1.validateBasic)(curve);
          ut.validateObject(opts, {
            hash: 'hash',
            hmac: 'function',
            randomBytes: 'function'
          }, {
            bits2int: 'function',
            bits2int_modN: 'function',
            lowS: 'boolean'
          });
          return Object.freeze({
            lowS: true,
            ...opts
          });
        }

        function weierstrass(curveDef) {
          const CURVE = validateOpts(curveDef);
          const {
            Fp,
            n: CURVE_ORDER
          } = CURVE;
          const compressedLen = Fp.BYTES + 1; // e.g. 33 for 32

          const uncompressedLen = 2 * Fp.BYTES + 1; // e.g. 65 for 32

          function isValidFieldElement(num) {
            return _0n < num && num < Fp.ORDER; // 0 is banned since it's not invertible FE
          }

          function modN(a) {
            return mod.mod(a, CURVE_ORDER);
          }

          function invN(a) {
            return mod.invert(a, CURVE_ORDER);
          }

          const {
            ProjectivePoint: Point,
            normPrivateKeyToScalar,
            weierstrassEquation,
            isWithinCurveOrder
          } = weierstrassPoints({ ...CURVE,

            toBytes(c, point, isCompressed) {
              const a = point.toAffine();
              const x = Fp.toBytes(a.x);
              const cat = ut.concatBytes;

              if (isCompressed) {
                return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x);
              } else {
                return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y));
              }
            },

            fromBytes(bytes) {
              const len = bytes.length;
              const head = bytes[0];
              const tail = bytes.subarray(1); // this.assertValidity() is done inside of fromHex

              if (len === compressedLen && (head === 0x02 || head === 0x03)) {
                const x = ut.bytesToNumberBE(tail);
                if (!isValidFieldElement(x)) throw new Error('Point is not on curve');
                const y2 = weierstrassEquation(x); // y² = x³ + ax + b

                let y = Fp.sqrt(y2); // y = y² ^ (p+1)/4

                const isYOdd = (y & _1n) === _1n; // ECDSA

                const isHeadOdd = (head & 1) === 1;
                if (isHeadOdd !== isYOdd) y = Fp.neg(y);
                return {
                  x,
                  y
                };
              } else if (len === uncompressedLen && head === 0x04) {
                const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
                const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
                return {
                  x,
                  y
                };
              } else {
                throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
              }
            }

          });

          const numToNByteStr = num => ut.bytesToHex(ut.numberToBytesBE(num, CURVE.nByteLength));

          function isBiggerThanHalfOrder(number) {
            const HALF = CURVE_ORDER >> _1n;
            return number > HALF;
          }

          function normalizeS(s) {
            return isBiggerThanHalfOrder(s) ? modN(-s) : s;
          } // slice bytes num


          const slcNum = (b, from, to) => ut.bytesToNumberBE(b.slice(from, to));
          /**
           * ECDSA signature with its (r, s) properties. Supports DER & compact representations.
           */


          class Signature {
            constructor(r, s, recovery) {
              this.r = r;
              this.s = s;
              this.recovery = recovery;
              this.assertValidity();
            } // pair (bytes of r, bytes of s)


            static fromCompact(hex) {
              const l = CURVE.nByteLength;
              hex = (0, utils_js_1.ensureBytes)('compactSignature', hex, l * 2);
              return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
            } // DER encoded ECDSA signature
            // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script


            static fromDER(hex) {
              const {
                r,
                s
              } = exports.DER.toSig((0, utils_js_1.ensureBytes)('DER', hex));
              return new Signature(r, s);
            }

            assertValidity() {
              // can use assertGE here
              if (!isWithinCurveOrder(this.r)) throw new Error('r must be 0 < r < CURVE.n');
              if (!isWithinCurveOrder(this.s)) throw new Error('s must be 0 < s < CURVE.n');
            }

            addRecoveryBit(recovery) {
              return new Signature(this.r, this.s, recovery);
            }

            recoverPublicKey(msgHash) {
              const {
                r,
                s,
                recovery: rec
              } = this;
              const h = bits2int_modN((0, utils_js_1.ensureBytes)('msgHash', msgHash)); // Truncate hash

              if (rec == null || ![0, 1, 2, 3].includes(rec)) throw new Error('recovery id invalid');
              const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
              if (radj >= Fp.ORDER) throw new Error('recovery id 2 or 3 invalid');
              const prefix = (rec & 1) === 0 ? '02' : '03';
              const R = Point.fromHex(prefix + numToNByteStr(radj));
              const ir = invN(radj); // r^-1

              const u1 = modN(-h * ir); // -hr^-1

              const u2 = modN(s * ir); // sr^-1

              const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2); // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1)

              if (!Q) throw new Error('point at infinify'); // unsafe is fine: no priv data leaked

              Q.assertValidity();
              return Q;
            } // Signatures should be low-s, to prevent malleability.


            hasHighS() {
              return isBiggerThanHalfOrder(this.s);
            }

            normalizeS() {
              return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
            } // DER-encoded


            toDERRawBytes() {
              return ut.hexToBytes(this.toDERHex());
            }

            toDERHex() {
              return exports.DER.hexFromSig({
                r: this.r,
                s: this.s
              });
            } // padded bytes of r, then padded bytes of s


            toCompactRawBytes() {
              return ut.hexToBytes(this.toCompactHex());
            }

            toCompactHex() {
              return numToNByteStr(this.r) + numToNByteStr(this.s);
            }

          }

          const utils = {
            isValidPrivateKey(privateKey) {
              try {
                normPrivateKeyToScalar(privateKey);
                return true;
              } catch (error) {
                return false;
              }
            },

            normPrivateKeyToScalar: normPrivateKeyToScalar,

            /**
             * Produces cryptographically secure private key from random of size (nBitLength+64)
             * as per FIPS 186 B.4.1 with modulo bias being neglible.
             */
            randomPrivateKey: () => {
              const rand = CURVE.randomBytes(Fp.BYTES + 8);
              const num = mod.hashToPrivateScalar(rand, CURVE_ORDER);
              return ut.numberToBytesBE(num, CURVE.nByteLength);
            },

            /**
             * Creates precompute table for an arbitrary EC point. Makes point "cached".
             * Allows to massively speed-up `point.multiply(scalar)`.
             * @returns cached point
             * @example
             * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
             * fast.multiply(privKey); // much faster ECDH now
             */
            precompute(windowSize = 8, point = Point.BASE) {
              point._setWindowSize(windowSize);

              point.multiply(BigInt(3)); // 3 is arbitrary, just need any number here

              return point;
            }

          };
          /**
           * Computes public key for a private key. Checks for validity of the private key.
           * @param privateKey private key
           * @param isCompressed whether to return compact (default), or full key
           * @returns Public key, full when isCompressed=false; short when isCompressed=true
           */

          function getPublicKey(privateKey, isCompressed = true) {
            return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
          }
          /**
           * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
           */


          function isProbPub(item) {
            const arr = item instanceof Uint8Array;
            const str = typeof item === 'string';
            const len = (arr || str) && item.length;
            if (arr) return len === compressedLen || len === uncompressedLen;
            if (str) return len === 2 * compressedLen || len === 2 * uncompressedLen;
            if (item instanceof Point) return true;
            return false;
          }
          /**
           * ECDH (Elliptic Curve Diffie Hellman).
           * Computes shared public key from private key and public key.
           * Checks: 1) private key validity 2) shared key is on-curve.
           * Does NOT hash the result.
           * @param privateA private key
           * @param publicB different public key
           * @param isCompressed whether to return compact (default), or full key
           * @returns shared public key
           */


          function getSharedSecret(privateA, publicB, isCompressed = true) {
            if (isProbPub(privateA)) throw new Error('first arg must be private key');
            if (!isProbPub(publicB)) throw new Error('second arg must be public key');
            const b = Point.fromHex(publicB); // check for being on-curve

            return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
          } // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
          // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
          // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
          // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors


          const bits2int = CURVE.bits2int || function (bytes) {
            // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
            // for some cases, since bytes.length * 8 is not actual bitLength.
            const num = ut.bytesToNumberBE(bytes); // check for == u8 done here

            const delta = bytes.length * 8 - CURVE.nBitLength; // truncate to nBitLength leftmost bits

            return delta > 0 ? num >> BigInt(delta) : num;
          };

          const bits2int_modN = CURVE.bits2int_modN || function (bytes) {
            return modN(bits2int(bytes)); // can't use bytesToNumberBE here
          }; // NOTE: pads output with zero as per spec


          const ORDER_MASK = ut.bitMask(CURVE.nBitLength);
          /**
           * Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
           */

          function int2octets(num) {
            if (typeof num !== 'bigint') throw new Error('bigint expected');
            if (!(_0n <= num && num < ORDER_MASK)) throw new Error(`bigint expected < 2^${CURVE.nBitLength}`); // works with order, can have different size than numToField!

            return ut.numberToBytesBE(num, CURVE.nByteLength);
          } // Steps A, D of RFC6979 3.2
          // Creates RFC6979 seed; converts msg/privKey to numbers.
          // Used only in sign, not in verify.
          // NOTE: we cannot assume here that msgHash has same amount of bytes as curve order, this will be wrong at least for P521.
          // Also it can be bigger for P224 + SHA256


          function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
            if (['recovered', 'canonical'].some(k => k in opts)) throw new Error('sign() legacy options not supported');
            const {
              hash,
              randomBytes
            } = CURVE;
            let {
              lowS,
              prehash,
              extraEntropy: ent
            } = opts; // generates low-s sigs by default

            if (lowS == null) lowS = true; // RFC6979 3.2: we skip step A, because we already provide hash

            msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
            if (prehash) msgHash = (0, utils_js_1.ensureBytes)('prehashed msgHash', hash(msgHash)); // We can't later call bits2octets, since nested bits2int is broken for curves
            // with nBitLength % 8 !== 0. Because of that, we unwrap it here as int2octets call.
            // const bits2octets = (bits) => int2octets(bits2int_modN(bits))

            const h1int = bits2int_modN(msgHash);
            const d = normPrivateKeyToScalar(privateKey); // validate private key, convert to bigint

            const seedArgs = [int2octets(d), int2octets(h1int)]; // extraEntropy. RFC6979 3.6: additional k' (optional).

            if (ent != null) {
              // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
              const e = ent === true ? randomBytes(Fp.BYTES) : ent; // generate random bytes OR pass as-is

              seedArgs.push((0, utils_js_1.ensureBytes)('extraEntropy', e, Fp.BYTES)); // check for being of size BYTES
            }

            const seed = ut.concatBytes(...seedArgs); // Step D of RFC6979 3.2

            const m = h1int; // NOTE: no need to call bits2int second time here, it is inside truncateHash!
            // Converts signature params into point w r/s, checks result for validity.

            function k2sig(kBytes) {
              // RFC 6979 Section 3.2, step 3: k = bits2int(T)
              const k = bits2int(kBytes); // Cannot use fields methods, since it is group element

              if (!isWithinCurveOrder(k)) return; // Important: all mod() calls here must be done over N

              const ik = invN(k); // k^-1 mod n

              const q = Point.BASE.multiply(k).toAffine(); // q = Gk

              const r = modN(q.x); // r = q.x mod n

              if (r === _0n) return; // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
              // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
              // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT

              const s = modN(ik * modN(m + r * d)); // Not using blinding here

              if (s === _0n) return;
              let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n); // recovery bit (2 or 3, when q.x > n)

              let normS = s;

              if (lowS && isBiggerThanHalfOrder(s)) {
                normS = normalizeS(s); // if lowS was passed, ensure s is always

                recovery ^= 1; // // in the bottom half of N
              }

              return new Signature(r, normS, recovery); // use normS, not s
            }

            return {
              seed,
              k2sig
            };
          }

          const defaultSigOpts = {
            lowS: CURVE.lowS,
            prehash: false
          };
          const defaultVerOpts = {
            lowS: CURVE.lowS,
            prehash: false
          };
          /**
           * Signs message hash with a private key.
           * ```
           * sign(m, d, k) where
           *   (x, y) = G × k
           *   r = x mod n
           *   s = (m + dr)/k mod n
           * ```
           * @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
           * @param privKey private key
           * @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
           * @returns signature with recovery param
           */

          function sign(msgHash, privKey, opts = defaultSigOpts) {
            const {
              seed,
              k2sig
            } = prepSig(msgHash, privKey, opts); // Steps A, D of RFC6979 3.2.

            const C = CURVE;
            const drbg = ut.createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
            return drbg(seed, k2sig); // Steps B, C, D, E, F, G
          } // Enable precomputes. Slows down first publicKey computation by 20ms.


          Point.BASE._setWindowSize(8); // utils.precompute(8, ProjectivePoint.BASE)

          /**
           * Verifies a signature against message hash and public key.
           * Rejects lowS signatures by default: to override,
           * specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
           *
           * ```
           * verify(r, s, h, P) where
           *   U1 = hs^-1 mod n
           *   U2 = rs^-1 mod n
           *   R = U1⋅G - U2⋅P
           *   mod(R.x, n) == r
           * ```
           */


          function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
            const sg = signature;
            msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
            publicKey = (0, utils_js_1.ensureBytes)('publicKey', publicKey);
            if ('strict' in opts) throw new Error('options.strict was renamed to lowS');
            const {
              lowS,
              prehash
            } = opts;
            let _sig = undefined;
            let P;

            try {
              if (typeof sg === 'string' || sg instanceof Uint8Array) {
                // Signature can be represented in 2 ways: compact (2*nByteLength) & DER (variable-length).
                // Since DER can also be 2*nByteLength bytes, we check for it first.
                try {
                  _sig = Signature.fromDER(sg);
                } catch (derError) {
                  if (!(derError instanceof exports.DER.Err)) throw derError;
                  _sig = Signature.fromCompact(sg);
                }
              } else if (typeof sg === 'object' && typeof sg.r === 'bigint' && typeof sg.s === 'bigint') {
                const {
                  r,
                  s
                } = sg;
                _sig = new Signature(r, s);
              } else {
                throw new Error('PARSE');
              }

              P = Point.fromHex(publicKey);
            } catch (error) {
              if (error.message === 'PARSE') throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
              return false;
            }

            if (lowS && _sig.hasHighS()) return false;
            if (prehash) msgHash = CURVE.hash(msgHash);
            const {
              r,
              s
            } = _sig;
            const h = bits2int_modN(msgHash); // Cannot use fields methods, since it is group element

            const is = invN(s); // s^-1

            const u1 = modN(h * is); // u1 = hs^-1 mod n

            const u2 = modN(r * is); // u2 = rs^-1 mod n

            const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine(); // R = u1⋅G + u2⋅P

            if (!R) return false;
            const v = modN(R.x);
            return v === r;
          }

          return {
            CURVE,
            getPublicKey,
            getSharedSecret,
            sign,
            verify,
            ProjectivePoint: Point,
            Signature,
            utils
          };
        }

        exports.weierstrass = weierstrass;
        /**
         * Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
         * TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
         * b = True and y = sqrt(u / v) if (u / v) is square in F, and
         * b = False and y = sqrt(Z * (u / v)) otherwise.
         * @param Fp
         * @param Z
         * @returns
         */

        function SWUFpSqrtRatio(Fp, Z) {
          // Generic implementation
          const q = Fp.ORDER;
          let l = _0n;

          for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;

          const c1 = l; // 1. c1, the largest integer such that 2^c1 divides q - 1.
          // We need 2n ** c1 and 2n ** (c1-1). We can't use **; but we can use <<.
          // 2n ** c1 == 2n << (c1-1)

          const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;

          const _2n_pow_c1 = _2n_pow_c1_1 * _2n;

          const c2 = (q - _1n) / _2n_pow_c1; // 2. c2 = (q - 1) / (2^c1)  # Integer arithmetic

          const c3 = (c2 - _1n) / _2n; // 3. c3 = (c2 - 1) / 2            # Integer arithmetic

          const c4 = _2n_pow_c1 - _1n; // 4. c4 = 2^c1 - 1                # Integer arithmetic

          const c5 = _2n_pow_c1_1; // 5. c5 = 2^(c1 - 1)                  # Integer arithmetic

          const c6 = Fp.pow(Z, c2); // 6. c6 = Z^c2

          const c7 = Fp.pow(Z, (c2 + _1n) / _2n); // 7. c7 = Z^((c2 + 1) / 2)

          let sqrtRatio = (u, v) => {
            let tv1 = c6; // 1. tv1 = c6

            let tv2 = Fp.pow(v, c4); // 2. tv2 = v^c4

            let tv3 = Fp.sqr(tv2); // 3. tv3 = tv2^2

            tv3 = Fp.mul(tv3, v); // 4. tv3 = tv3 * v

            let tv5 = Fp.mul(u, tv3); // 5. tv5 = u * tv3

            tv5 = Fp.pow(tv5, c3); // 6. tv5 = tv5^c3

            tv5 = Fp.mul(tv5, tv2); // 7. tv5 = tv5 * tv2

            tv2 = Fp.mul(tv5, v); // 8. tv2 = tv5 * v

            tv3 = Fp.mul(tv5, u); // 9. tv3 = tv5 * u

            let tv4 = Fp.mul(tv3, tv2); // 10. tv4 = tv3 * tv2

            tv5 = Fp.pow(tv4, c5); // 11. tv5 = tv4^c5

            let isQR = Fp.eql(tv5, Fp.ONE); // 12. isQR = tv5 == 1

            tv2 = Fp.mul(tv3, c7); // 13. tv2 = tv3 * c7

            tv5 = Fp.mul(tv4, tv1); // 14. tv5 = tv4 * tv1

            tv3 = Fp.cmov(tv2, tv3, isQR); // 15. tv3 = CMOV(tv2, tv3, isQR)

            tv4 = Fp.cmov(tv5, tv4, isQR); // 16. tv4 = CMOV(tv5, tv4, isQR)
            // 17. for i in (c1, c1 - 1, ..., 2):

            for (let i = c1; i > _1n; i--) {
              let tv5 = i - _2n; // 18.    tv5 = i - 2

              tv5 = _2n << tv5 - _1n; // 19.    tv5 = 2^tv5

              let tvv5 = Fp.pow(tv4, tv5); // 20.    tv5 = tv4^tv5

              const e1 = Fp.eql(tvv5, Fp.ONE); // 21.    e1 = tv5 == 1

              tv2 = Fp.mul(tv3, tv1); // 22.    tv2 = tv3 * tv1

              tv1 = Fp.mul(tv1, tv1); // 23.    tv1 = tv1 * tv1

              tvv5 = Fp.mul(tv4, tv1); // 24.    tv5 = tv4 * tv1

              tv3 = Fp.cmov(tv2, tv3, e1); // 25.    tv3 = CMOV(tv2, tv3, e1)

              tv4 = Fp.cmov(tvv5, tv4, e1); // 26.    tv4 = CMOV(tv5, tv4, e1)
            }

            return {
              isValid: isQR,
              value: tv3
            };
          };

          if (Fp.ORDER % _4n === _3n) {
            // sqrt_ratio_3mod4(u, v)
            const c1 = (Fp.ORDER - _3n) / _4n; // 1. c1 = (q - 3) / 4     # Integer arithmetic

            const c2 = Fp.sqrt(Fp.neg(Z)); // 2. c2 = sqrt(-Z)

            sqrtRatio = (u, v) => {
              let tv1 = Fp.sqr(v); // 1. tv1 = v^2

              const tv2 = Fp.mul(u, v); // 2. tv2 = u * v

              tv1 = Fp.mul(tv1, tv2); // 3. tv1 = tv1 * tv2

              let y1 = Fp.pow(tv1, c1); // 4. y1 = tv1^c1

              y1 = Fp.mul(y1, tv2); // 5. y1 = y1 * tv2

              const y2 = Fp.mul(y1, c2); // 6. y2 = y1 * c2

              const tv3 = Fp.mul(Fp.sqr(y1), v); // 7. tv3 = y1^2; 8. tv3 = tv3 * v

              const isQR = Fp.eql(tv3, u); // 9. isQR = tv3 == u

              let y = Fp.cmov(y2, y1, isQR); // 10. y = CMOV(y2, y1, isQR)

              return {
                isValid: isQR,
                value: y
              }; // 11. return (isQR, y) isQR ? y : y*c2
            };
          } // No curves uses that
          // if (Fp.ORDER % _8n === _5n) // sqrt_ratio_5mod8


          return sqrtRatio;
        }

        exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
        /**
         * From draft-irtf-cfrg-hash-to-curve-16
         */

        function mapToCurveSimpleSWU(Fp, opts) {
          mod.validateField(Fp);
          if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z)) throw new Error('mapToCurveSimpleSWU: invalid opts');
          const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
          if (!Fp.isOdd) throw new Error('Fp.isOdd is not implemented!'); // Input: u, an element of F.
          // Output: (x, y), a point on E.

          return u => {
            // prettier-ignore
            let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
            tv1 = Fp.sqr(u); // 1.  tv1 = u^2

            tv1 = Fp.mul(tv1, opts.Z); // 2.  tv1 = Z * tv1

            tv2 = Fp.sqr(tv1); // 3.  tv2 = tv1^2

            tv2 = Fp.add(tv2, tv1); // 4.  tv2 = tv2 + tv1

            tv3 = Fp.add(tv2, Fp.ONE); // 5.  tv3 = tv2 + 1

            tv3 = Fp.mul(tv3, opts.B); // 6.  tv3 = B * tv3

            tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO)); // 7.  tv4 = CMOV(Z, -tv2, tv2 != 0)

            tv4 = Fp.mul(tv4, opts.A); // 8.  tv4 = A * tv4

            tv2 = Fp.sqr(tv3); // 9.  tv2 = tv3^2

            tv6 = Fp.sqr(tv4); // 10. tv6 = tv4^2

            tv5 = Fp.mul(tv6, opts.A); // 11. tv5 = A * tv6

            tv2 = Fp.add(tv2, tv5); // 12. tv2 = tv2 + tv5

            tv2 = Fp.mul(tv2, tv3); // 13. tv2 = tv2 * tv3

            tv6 = Fp.mul(tv6, tv4); // 14. tv6 = tv6 * tv4

            tv5 = Fp.mul(tv6, opts.B); // 15. tv5 = B * tv6

            tv2 = Fp.add(tv2, tv5); // 16. tv2 = tv2 + tv5

            x = Fp.mul(tv1, tv3); // 17.   x = tv1 * tv3

            const {
              isValid,
              value
            } = sqrtRatio(tv2, tv6); // 18. (is_gx1_square, y1) = sqrt_ratio(tv2, tv6)

            y = Fp.mul(tv1, u); // 19.   y = tv1 * u  -> Z * u^3 * y1

            y = Fp.mul(y, value); // 20.   y = y * y1

            x = Fp.cmov(x, tv3, isValid); // 21.   x = CMOV(x, tv3, is_gx1_square)

            y = Fp.cmov(y, value, isValid); // 22.   y = CMOV(y, y1, is_gx1_square)

            const e1 = Fp.isOdd(u) === Fp.isOdd(y); // 23.  e1 = sgn0(u) == sgn0(y)

            y = Fp.cmov(Fp.neg(y), y, e1); // 24.   y = CMOV(-y, y, e1)

            x = Fp.div(x, tv4); // 25.   x = x / tv4

            return {
              x,
              y
            };
          };
        }

        exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
      }, {
        "./curve.js": 74,
        "./modular.js": 76,
        "./utils.js": 77
      }],
      79: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.encodeToCurve = exports.hashToCurve = exports.secp256r1 = exports.p256 = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        const _shortw_utils_js_1 = require("./_shortw_utils.js");

        const sha256_1 = require("@noble/hashes/sha256");

        const modular_js_1 = require("./abstract/modular.js");

        const weierstrass_js_1 = require("./abstract/weierstrass.js");

        const hash_to_curve_js_1 = require("./abstract/hash-to-curve.js"); // NIST secp256r1 aka p256
        // https://www.secg.org/sec2-v2.pdf, https://neuromancer.sk/std/nist/P-256


        const Fp = (0, modular_js_1.Field)(BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'));
        const CURVE_A = Fp.create(BigInt('-3'));
        const CURVE_B = BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'); // prettier-ignore

        exports.p256 = (0, _shortw_utils_js_1.createCurve)({
          a: CURVE_A,
          b: CURVE_B,
          Fp,
          // Curve order, total count of valid points in the field
          n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
          // Base (generator) point (x, y)
          Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
          Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
          h: BigInt(1),
          lowS: false
        }, sha256_1.sha256);
        exports.secp256r1 = exports.p256;

        const mapSWU = /* @__PURE__ */(() => (0, weierstrass_js_1.mapToCurveSimpleSWU)(Fp, {
          A: CURVE_A,
          B: CURVE_B,
          Z: Fp.create(BigInt('-10'))
        }))();

        const htf = /* @__PURE__ */(() => (0, hash_to_curve_js_1.createHasher)(exports.secp256r1.ProjectivePoint, scalars => mapSWU(scalars[0]), {
          DST: 'P256_XMD:SHA-256_SSWU_RO_',
          encodeDST: 'P256_XMD:SHA-256_SSWU_NU_',
          p: Fp.ORDER,
          m: 1,
          k: 128,
          expand: 'xmd',
          hash: sha256_1.sha256
        }))();

        exports.hashToCurve = (() => htf.hashToCurve)();

        exports.encodeToCurve = (() => htf.encodeToCurve)();
      }, {
        "./_shortw_utils.js": 73,
        "./abstract/hash-to-curve.js": 75,
        "./abstract/modular.js": 76,
        "./abstract/weierstrass.js": 78,
        "@noble/hashes/sha256": 96
      }],
      80: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.encodeToCurve = exports.hashToCurve = exports.schnorr = exports.secp256k1 = void 0;
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        const sha256_1 = require("@noble/hashes/sha256");

        const utils_1 = require("@noble/hashes/utils");

        const modular_js_1 = require("./abstract/modular.js");

        const weierstrass_js_1 = require("./abstract/weierstrass.js");

        const utils_js_1 = require("./abstract/utils.js");

        const hash_to_curve_js_1 = require("./abstract/hash-to-curve.js");

        const _shortw_utils_js_1 = require("./_shortw_utils.js");

        const secp256k1P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
        const secp256k1N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');

        const _1n = BigInt(1);

        const _2n = BigInt(2);

        const divNearest = (a, b) => (a + b / _2n) / b;
        /**
         * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
         * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
         */


        function sqrtMod(y) {
          const P = secp256k1P; // prettier-ignore

          const _3n = BigInt(3),
                _6n = BigInt(6),
                _11n = BigInt(11),
                _22n = BigInt(22); // prettier-ignore


          const _23n = BigInt(23),
                _44n = BigInt(44),
                _88n = BigInt(88);

          const b2 = y * y * y % P; // x^3, 11

          const b3 = b2 * b2 * y % P; // x^7

          const b6 = (0, modular_js_1.pow2)(b3, _3n, P) * b3 % P;
          const b9 = (0, modular_js_1.pow2)(b6, _3n, P) * b3 % P;
          const b11 = (0, modular_js_1.pow2)(b9, _2n, P) * b2 % P;
          const b22 = (0, modular_js_1.pow2)(b11, _11n, P) * b11 % P;
          const b44 = (0, modular_js_1.pow2)(b22, _22n, P) * b22 % P;
          const b88 = (0, modular_js_1.pow2)(b44, _44n, P) * b44 % P;
          const b176 = (0, modular_js_1.pow2)(b88, _88n, P) * b88 % P;
          const b220 = (0, modular_js_1.pow2)(b176, _44n, P) * b44 % P;
          const b223 = (0, modular_js_1.pow2)(b220, _3n, P) * b3 % P;
          const t1 = (0, modular_js_1.pow2)(b223, _23n, P) * b22 % P;
          const t2 = (0, modular_js_1.pow2)(t1, _6n, P) * b2 % P;
          const root = (0, modular_js_1.pow2)(t2, _2n, P);
          if (!Fp.eql(Fp.sqr(root), y)) throw new Error('Cannot find square root');
          return root;
        }

        const Fp = (0, modular_js_1.Field)(secp256k1P, undefined, undefined, {
          sqrt: sqrtMod
        });
        exports.secp256k1 = (0, _shortw_utils_js_1.createCurve)({
          a: BigInt(0),
          b: BigInt(7),
          Fp,
          n: secp256k1N,
          // Base point (x, y) aka generator point
          Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
          Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
          h: BigInt(1),
          lowS: true,

          /**
           * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
           * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
           * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
           * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
           */
          endo: {
            beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
            splitScalar: k => {
              const n = secp256k1N;
              const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
              const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
              const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
              const b2 = a1;
              const POW_2_128 = BigInt('0x100000000000000000000000000000000'); // (2n**128n).toString(16)

              const c1 = divNearest(b2 * k, n);
              const c2 = divNearest(-b1 * k, n);
              let k1 = (0, modular_js_1.mod)(k - c1 * a1 - c2 * a2, n);
              let k2 = (0, modular_js_1.mod)(-c1 * b1 - c2 * b2, n);
              const k1neg = k1 > POW_2_128;
              const k2neg = k2 > POW_2_128;
              if (k1neg) k1 = n - k1;
              if (k2neg) k2 = n - k2;

              if (k1 > POW_2_128 || k2 > POW_2_128) {
                throw new Error('splitScalar: Endomorphism failed, k=' + k);
              }

              return {
                k1neg,
                k1,
                k2neg,
                k2
              };
            }
          }
        }, sha256_1.sha256); // Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
        // https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki

        const _0n = BigInt(0);

        const fe = x => typeof x === 'bigint' && _0n < x && x < secp256k1P;

        const ge = x => typeof x === 'bigint' && _0n < x && x < secp256k1N;
        /** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */


        const TAGGED_HASH_PREFIXES = {};

        function taggedHash(tag, ...messages) {
          let tagP = TAGGED_HASH_PREFIXES[tag];

          if (tagP === undefined) {
            const tagH = (0, sha256_1.sha256)(Uint8Array.from(tag, c => c.charCodeAt(0)));
            tagP = (0, utils_js_1.concatBytes)(tagH, tagH);
            TAGGED_HASH_PREFIXES[tag] = tagP;
          }

          return (0, sha256_1.sha256)((0, utils_js_1.concatBytes)(tagP, ...messages));
        } // ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03


        const pointToBytes = point => point.toRawBytes(true).slice(1);

        const numTo32b = n => (0, utils_js_1.numberToBytesBE)(n, 32);

        const modP = x => (0, modular_js_1.mod)(x, secp256k1P);

        const modN = x => (0, modular_js_1.mod)(x, secp256k1N);

        const Point = exports.secp256k1.ProjectivePoint;

        const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b); // Calculate point, scalar and bytes


        function schnorrGetExtPubKey(priv) {
          let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv); // same method executed in fromPrivateKey

          let p = Point.fromPrivateKey(d_); // P = d'⋅G; 0 < d' < n check is done inside

          const scalar = p.hasEvenY() ? d_ : modN(-d_);
          return {
            scalar: scalar,
            bytes: pointToBytes(p)
          };
        }
        /**
         * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
         * @returns valid point checked for being on-curve
         */


        function lift_x(x) {
          if (!fe(x)) throw new Error('bad x: need 0 < x < p'); // Fail if x ≥ p.

          const xx = modP(x * x);
          const c = modP(xx * x + BigInt(7)); // Let c = x³ + 7 mod p.

          let y = sqrtMod(c); // Let y = c^(p+1)/4 mod p.

          if (y % _2n !== _0n) y = modP(-y); // Return the unique point P such that x(P) = x and

          const p = new Point(x, y, _1n); // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.

          p.assertValidity();
          return p;
        }
        /**
         * Create tagged hash, convert it to bigint, reduce modulo-n.
         */


        function challenge(...args) {
          return modN((0, utils_js_1.bytesToNumberBE)(taggedHash('BIP0340/challenge', ...args)));
        }
        /**
         * Schnorr public key is just `x` coordinate of Point as per BIP340.
         */


        function schnorrGetPublicKey(privateKey) {
          return schnorrGetExtPubKey(privateKey).bytes; // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
        }
        /**
         * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
         * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
         */


        function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
          const m = (0, utils_js_1.ensureBytes)('message', message);
          const {
            bytes: px,
            scalar: d
          } = schnorrGetExtPubKey(privateKey); // checks for isWithinCurveOrder

          const a = (0, utils_js_1.ensureBytes)('auxRand', auxRand, 32); // Auxiliary random data a: a 32-byte array

          const t = numTo32b(d ^ (0, utils_js_1.bytesToNumberBE)(taggedHash('BIP0340/aux', a))); // Let t be the byte-wise xor of bytes(d) and hash/aux(a)

          const rand = taggedHash('BIP0340/nonce', t, px, m); // Let rand = hash/nonce(t || bytes(P) || m)

          const k_ = modN((0, utils_js_1.bytesToNumberBE)(rand)); // Let k' = int(rand) mod n

          if (k_ === _0n) throw new Error('sign failed: k is zero'); // Fail if k' = 0.

          const {
            bytes: rx,
            scalar: k
          } = schnorrGetExtPubKey(k_); // Let R = k'⋅G.

          const e = challenge(rx, px, m); // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.

          const sig = new Uint8Array(64); // Let sig = bytes(R) || bytes((k + ed) mod n).

          sig.set(rx, 0);
          sig.set(numTo32b(modN(k + e * d)), 32); // If Verify(bytes(P), m, sig) (see below) returns failure, abort

          if (!schnorrVerify(sig, m, px)) throw new Error('sign: Invalid signature produced');
          return sig;
        }
        /**
         * Verifies Schnorr signature.
         * Will swallow errors & return false except for initial type validation of arguments.
         */


        function schnorrVerify(signature, message, publicKey) {
          const sig = (0, utils_js_1.ensureBytes)('signature', signature, 64);
          const m = (0, utils_js_1.ensureBytes)('message', message);
          const pub = (0, utils_js_1.ensureBytes)('publicKey', publicKey, 32);

          try {
            const P = lift_x((0, utils_js_1.bytesToNumberBE)(pub)); // P = lift_x(int(pk)); fail if that fails

            const r = (0, utils_js_1.bytesToNumberBE)(sig.subarray(0, 32)); // Let r = int(sig[0:32]); fail if r ≥ p.

            if (!fe(r)) return false;
            const s = (0, utils_js_1.bytesToNumberBE)(sig.subarray(32, 64)); // Let s = int(sig[32:64]); fail if s ≥ n.

            if (!ge(s)) return false;
            const e = challenge(numTo32b(r), pointToBytes(P), m); // int(challenge(bytes(r)||bytes(P)||m))%n

            const R = GmulAdd(P, s, modN(-e)); // R = s⋅G - e⋅P

            if (!R || !R.hasEvenY() || R.toAffine().x !== r) return false; // -eP == (n-e)P

            return true; // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
          } catch (error) {
            return false;
          }
        }

        exports.schnorr = (() => ({
          getPublicKey: schnorrGetPublicKey,
          sign: schnorrSign,
          verify: schnorrVerify,
          utils: {
            randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
            lift_x,
            pointToBytes,
            numberToBytesBE: utils_js_1.numberToBytesBE,
            bytesToNumberBE: utils_js_1.bytesToNumberBE,
            taggedHash,
            mod: modular_js_1.mod
          }
        }))();

        const isoMap = /* @__PURE__ */(() => (0, hash_to_curve_js_1.isogenyMap)(Fp, [// xNum
        ['0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7', '0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581', '0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262', '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c'], // xDen
        ['0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b', '0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14', '0x0000000000000000000000000000000000000000000000000000000000000001' // LAST 1
        ], // yNum
        ['0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c', '0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3', '0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931', '0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84'], // yDen
        ['0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b', '0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573', '0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f', '0x0000000000000000000000000000000000000000000000000000000000000001' // LAST 1
        ]].map(i => i.map(j => BigInt(j)))))();

        const mapSWU = /* @__PURE__ */(() => (0, weierstrass_js_1.mapToCurveSimpleSWU)(Fp, {
          A: BigInt('0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533'),
          B: BigInt('1771'),
          Z: Fp.create(BigInt('-11'))
        }))();

        const htf = /* @__PURE__ */(() => (0, hash_to_curve_js_1.createHasher)(exports.secp256k1.ProjectivePoint, scalars => {
          const {
            x,
            y
          } = mapSWU(Fp.create(scalars[0]));
          return isoMap(x, y);
        }, {
          DST: 'secp256k1_XMD:SHA-256_SSWU_RO_',
          encodeDST: 'secp256k1_XMD:SHA-256_SSWU_NU_',
          p: Fp.ORDER,
          m: 1,
          k: 128,
          expand: 'xmd',
          hash: sha256_1.sha256
        }))();

        exports.hashToCurve = (() => htf.hashToCurve)();

        exports.encodeToCurve = (() => htf.encodeToCurve)();
      }, {
        "./_shortw_utils.js": 73,
        "./abstract/hash-to-curve.js": 75,
        "./abstract/modular.js": 76,
        "./abstract/utils.js": 77,
        "./abstract/weierstrass.js": 78,
        "@noble/hashes/sha256": 96,
        "@noble/hashes/utils": 98
      }],
      81: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = void 0;

        function number(n) {
          if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Wrong positive integer: ${n}`);
        }

        exports.number = number;

        function bool(b) {
          if (typeof b !== 'boolean') throw new Error(`Expected boolean, not ${b}`);
        }

        exports.bool = bool;

        function bytes(b, ...lengths) {
          if (!(b instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
          if (lengths.length > 0 && !lengths.includes(b.length)) throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
        }

        exports.bytes = bytes;

        function hash(hash) {
          if (typeof hash !== 'function' || typeof hash.create !== 'function') throw new Error('Hash should be wrapped by utils.wrapConstructor');
          number(hash.outputLen);
          number(hash.blockLen);
        }

        exports.hash = hash;

        function exists(instance, checkFinished = true) {
          if (instance.destroyed) throw new Error('Hash instance has been destroyed');
          if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
        }

        exports.exists = exists;

        function output(out, instance) {
          bytes(out);
          const min = instance.outputLen;

          if (out.length < min) {
            throw new Error(`digestInto() expects output buffer of length at least ${min}`);
          }
        }

        exports.output = output;
        const assert = {
          number,
          bool,
          bytes,
          hash,
          exists,
          output
        };
        exports.default = assert;
      }, {}],
      82: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.SHA2 = void 0;

        const _assert_js_1 = require("./_assert.js");

        const utils_js_1 = require("./utils.js"); // Polyfill for Safari 14


        function setBigUint64(view, byteOffset, value, isLE) {
          if (typeof view.setBigUint64 === 'function') return view.setBigUint64(byteOffset, value, isLE);

          const _32n = BigInt(32);

          const _u32_max = BigInt(0xffffffff);

          const wh = Number(value >> _32n & _u32_max);
          const wl = Number(value & _u32_max);
          const h = isLE ? 4 : 0;
          const l = isLE ? 0 : 4;
          view.setUint32(byteOffset + h, wh, isLE);
          view.setUint32(byteOffset + l, wl, isLE);
        } // Base SHA2 class (RFC 6234)


        class SHA2 extends utils_js_1.Hash {
          constructor(blockLen, outputLen, padOffset, isLE) {
            super();
            this.blockLen = blockLen;
            this.outputLen = outputLen;
            this.padOffset = padOffset;
            this.isLE = isLE;
            this.finished = false;
            this.length = 0;
            this.pos = 0;
            this.destroyed = false;
            this.buffer = new Uint8Array(blockLen);
            this.view = (0, utils_js_1.createView)(this.buffer);
          }

          update(data) {
            _assert_js_1.default.exists(this);

            const {
              view,
              buffer,
              blockLen
            } = this;
            data = (0, utils_js_1.toBytes)(data);
            const len = data.length;

            for (let pos = 0; pos < len;) {
              const take = Math.min(blockLen - this.pos, len - pos); // Fast path: we have at least one block in input, cast it to view and process

              if (take === blockLen) {
                const dataView = (0, utils_js_1.createView)(data);

                for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);

                continue;
              }

              buffer.set(data.subarray(pos, pos + take), this.pos);
              this.pos += take;
              pos += take;

              if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
              }
            }

            this.length += data.length;
            this.roundClean();
            return this;
          }

          digestInto(out) {
            _assert_js_1.default.exists(this);

            _assert_js_1.default.output(out, this);

            this.finished = true; // Padding
            // We can avoid allocation of buffer for padding completely if it
            // was previously not allocated here. But it won't change performance.

            const {
              buffer,
              view,
              blockLen,
              isLE
            } = this;
            let {
              pos
            } = this; // append the bit '1' to the message

            buffer[pos++] = 0b10000000;
            this.buffer.subarray(pos).fill(0); // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again

            if (this.padOffset > blockLen - pos) {
              this.process(view, 0);
              pos = 0;
            } // Pad until full block byte with zeros


            for (let i = pos; i < blockLen; i++) buffer[i] = 0; // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
            // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
            // So we just write lowest 64 bits of that value.


            setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
            this.process(view, 0);
            const oview = (0, utils_js_1.createView)(out);
            const len = this.outputLen; // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT

            if (len % 4) throw new Error('_sha2: outputLen should be aligned to 32bit');
            const outLen = len / 4;
            const state = this.get();
            if (outLen > state.length) throw new Error('_sha2: outputLen bigger than state');

            for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
          }

          digest() {
            const {
              buffer,
              outputLen
            } = this;
            this.digestInto(buffer);
            const res = buffer.slice(0, outputLen);
            this.destroy();
            return res;
          }

          _cloneInto(to) {
            to || (to = new this.constructor());
            to.set(...this.get());
            const {
              blockLen,
              buffer,
              length,
              finished,
              destroyed,
              pos
            } = this;
            to.length = length;
            to.pos = pos;
            to.finished = finished;
            to.destroyed = destroyed;
            if (length % blockLen) to.buffer.set(buffer);
            return to;
          }

        }

        exports.SHA2 = SHA2;
      }, {
        "./_assert.js": 81,
        "./utils.js": 86
      }],
      83: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.crypto = void 0;
        exports.crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;
      }, {}],
      84: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hmac = void 0;

        const _assert_js_1 = require("./_assert.js");

        const utils_js_1 = require("./utils.js"); // HMAC (RFC 2104)


        class HMAC extends utils_js_1.Hash {
          constructor(hash, _key) {
            super();
            this.finished = false;
            this.destroyed = false;

            _assert_js_1.default.hash(hash);

            const key = (0, utils_js_1.toBytes)(_key);
            this.iHash = hash.create();
            if (typeof this.iHash.update !== 'function') throw new TypeError('Expected instance of class which extends utils.Hash');
            this.blockLen = this.iHash.blockLen;
            this.outputLen = this.iHash.outputLen;
            const blockLen = this.blockLen;
            const pad = new Uint8Array(blockLen); // blockLen can be bigger than outputLen

            pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);

            for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36;

            this.iHash.update(pad); // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone

            this.oHash = hash.create(); // Undo internal XOR && apply outer XOR

            for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36 ^ 0x5c;

            this.oHash.update(pad);
            pad.fill(0);
          }

          update(buf) {
            _assert_js_1.default.exists(this);

            this.iHash.update(buf);
            return this;
          }

          digestInto(out) {
            _assert_js_1.default.exists(this);

            _assert_js_1.default.bytes(out, this.outputLen);

            this.finished = true;
            this.iHash.digestInto(out);
            this.oHash.update(out);
            this.oHash.digestInto(out);
            this.destroy();
          }

          digest() {
            const out = new Uint8Array(this.oHash.outputLen);
            this.digestInto(out);
            return out;
          }

          _cloneInto(to) {
            // Create new instance without calling constructor since key already in state and we don't know it.
            to || (to = Object.create(Object.getPrototypeOf(this), {}));
            const {
              oHash,
              iHash,
              finished,
              destroyed,
              blockLen,
              outputLen
            } = this;
            to = to;
            to.finished = finished;
            to.destroyed = destroyed;
            to.blockLen = blockLen;
            to.outputLen = outputLen;
            to.oHash = oHash._cloneInto(to.oHash);
            to.iHash = iHash._cloneInto(to.iHash);
            return to;
          }

          destroy() {
            this.destroyed = true;
            this.oHash.destroy();
            this.iHash.destroy();
          }

        }
        /**
         * HMAC: RFC2104 message authentication code.
         * @param hash - function that would be used e.g. sha256
         * @param key - message key
         * @param message - message data
         */


        const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();

        exports.hmac = hmac;

        exports.hmac.create = (hash, key) => new HMAC(hash, key);
      }, {
        "./_assert.js": 81,
        "./utils.js": 86
      }],
      85: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.sha224 = exports.sha256 = void 0;

        const _sha2_js_1 = require("./_sha2.js");

        const utils_js_1 = require("./utils.js"); // Choice: a ? b : c


        const Chi = (a, b, c) => a & b ^ ~a & c; // Majority function, true if any two inpust is true


        const Maj = (a, b, c) => a & b ^ a & c ^ b & c; // Round constants:
        // first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
        // prettier-ignore


        const SHA256_K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]); // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
        // prettier-ignore

        const IV = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]); // Temporary buffer, not used to store anything between runs
        // Named this way because it matches specification.

        const SHA256_W = new Uint32Array(64);

        class SHA256 extends _sha2_js_1.SHA2 {
          constructor() {
            super(64, 32, 8, false); // We cannot use array here since array allows indexing by variable
            // which means optimizer/compiler cannot use registers.

            this.A = IV[0] | 0;
            this.B = IV[1] | 0;
            this.C = IV[2] | 0;
            this.D = IV[3] | 0;
            this.E = IV[4] | 0;
            this.F = IV[5] | 0;
            this.G = IV[6] | 0;
            this.H = IV[7] | 0;
          }

          get() {
            const {
              A,
              B,
              C,
              D,
              E,
              F,
              G,
              H
            } = this;
            return [A, B, C, D, E, F, G, H];
          } // prettier-ignore


          set(A, B, C, D, E, F, G, H) {
            this.A = A | 0;
            this.B = B | 0;
            this.C = C | 0;
            this.D = D | 0;
            this.E = E | 0;
            this.F = F | 0;
            this.G = G | 0;
            this.H = H | 0;
          }

          process(view, offset) {
            // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
            for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);

            for (let i = 16; i < 64; i++) {
              const W15 = SHA256_W[i - 15];
              const W2 = SHA256_W[i - 2];
              const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ W15 >>> 3;
              const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ W2 >>> 10;
              SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
            } // Compression function main loop, 64 rounds


            let {
              A,
              B,
              C,
              D,
              E,
              F,
              G,
              H
            } = this;

            for (let i = 0; i < 64; i++) {
              const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
              const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
              const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
              const T2 = sigma0 + Maj(A, B, C) | 0;
              H = G;
              G = F;
              F = E;
              E = D + T1 | 0;
              D = C;
              C = B;
              B = A;
              A = T1 + T2 | 0;
            } // Add the compressed chunk to the current hash value


            A = A + this.A | 0;
            B = B + this.B | 0;
            C = C + this.C | 0;
            D = D + this.D | 0;
            E = E + this.E | 0;
            F = F + this.F | 0;
            G = G + this.G | 0;
            H = H + this.H | 0;
            this.set(A, B, C, D, E, F, G, H);
          }

          roundClean() {
            SHA256_W.fill(0);
          }

          destroy() {
            this.set(0, 0, 0, 0, 0, 0, 0, 0);
            this.buffer.fill(0);
          }

        } // Constants from https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf


        class SHA224 extends SHA256 {
          constructor() {
            super();
            this.A = 0xc1059ed8 | 0;
            this.B = 0x367cd507 | 0;
            this.C = 0x3070dd17 | 0;
            this.D = 0xf70e5939 | 0;
            this.E = 0xffc00b31 | 0;
            this.F = 0x68581511 | 0;
            this.G = 0x64f98fa7 | 0;
            this.H = 0xbefa4fa4 | 0;
            this.outputLen = 28;
          }

        }
        /**
         * SHA2-256 hash function
         * @param message - data that would be hashed
         */


        exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA256());
        exports.sha224 = (0, utils_js_1.wrapConstructor)(() => new SHA224());
      }, {
        "./_sha2.js": 82,
        "./utils.js": 86
      }],
      86: [function (require, module, exports) {
        "use strict";
        /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.randomBytes = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.isLE = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0; // We use `globalThis.crypto`, but node.js versions earlier than v19 don't
        // declare it in global scope. For node.js, package.json#exports field mapping
        // rewrites import from `crypto` to `cryptoNode`, which imports native module.
        // Makes the utils un-importable in browsers without a bundler.
        // Once node.js 18 is deprecated, we can just drop the import.

        const crypto_1 = require("@noble/hashes/crypto"); // Cast array to different type


        const u8 = arr => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);

        exports.u8 = u8;

        const u32 = arr => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));

        exports.u32 = u32; // Cast array to view

        const createView = arr => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        exports.createView = createView; // The rotate right (circular right shift) operation for uint32

        const rotr = (word, shift) => word << 32 - shift | word >>> shift;

        exports.rotr = rotr; // big-endian hardware is rare. Just in case someone still decides to run hashes:
        // early-throw an error because we don't support BE yet.

        exports.isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
        if (!exports.isLE) throw new Error('Non little-endian hardware is not supported');
        const hexes = Array.from({
          length: 256
        }, (v, i) => i.toString(16).padStart(2, '0'));
        /**
         * @example bytesToHex(Uint8Array.from([0xde, 0xad, 0xbe, 0xef])) // 'deadbeef'
         */

        function bytesToHex(uint8a) {
          // pre-caching improves the speed 6x
          if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
          let hex = '';

          for (let i = 0; i < uint8a.length; i++) {
            hex += hexes[uint8a[i]];
          }

          return hex;
        }

        exports.bytesToHex = bytesToHex;
        /**
         * @example hexToBytes('deadbeef') // Uint8Array.from([0xde, 0xad, 0xbe, 0xef])
         */

        function hexToBytes(hex) {
          if (typeof hex !== 'string') {
            throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
          }

          if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
          const array = new Uint8Array(hex.length / 2);

          for (let i = 0; i < array.length; i++) {
            const j = i * 2;
            const hexByte = hex.slice(j, j + 2);
            const byte = Number.parseInt(hexByte, 16);
            if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
            array[i] = byte;
          }

          return array;
        }

        exports.hexToBytes = hexToBytes; // There is no setImmediate in browser and setTimeout is slow.
        // call of async fn will return Promise, which will be fullfiled only on
        // next scheduler queue processing step and this is exactly what we need.

        const nextTick = async () => {};

        exports.nextTick = nextTick; // Returns control to thread each 'tick' ms to avoid blocking

        async function asyncLoop(iters, tick, cb) {
          let ts = Date.now();

          for (let i = 0; i < iters; i++) {
            cb(i); // Date.now() is not monotonic, so in case if clock goes backwards we return return control too

            const diff = Date.now() - ts;
            if (diff >= 0 && diff < tick) continue;
            await (0, exports.nextTick)();
            ts += diff;
          }
        }

        exports.asyncLoop = asyncLoop;

        function utf8ToBytes(str) {
          if (typeof str !== 'string') {
            throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
          }

          return new TextEncoder().encode(str);
        }

        exports.utf8ToBytes = utf8ToBytes;

        function toBytes(data) {
          if (typeof data === 'string') data = utf8ToBytes(data);
          if (!(data instanceof Uint8Array)) throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
          return data;
        }

        exports.toBytes = toBytes;
        /**
         * Concats Uint8Array-s into one; like `Buffer.concat([buf1, buf2])`
         * @example concatBytes(buf1, buf2)
         */

        function concatBytes(...arrays) {
          if (!arrays.every(a => a instanceof Uint8Array)) throw new Error('Uint8Array list expected');
          if (arrays.length === 1) return arrays[0];
          const length = arrays.reduce((a, arr) => a + arr.length, 0);
          const result = new Uint8Array(length);

          for (let i = 0, pad = 0; i < arrays.length; i++) {
            const arr = arrays[i];
            result.set(arr, pad);
            pad += arr.length;
          }

          return result;
        }

        exports.concatBytes = concatBytes; // For runtime check if class implements interface

        class Hash {
          // Safe version that clones internal state
          clone() {
            return this._cloneInto();
          }

        }

        exports.Hash = Hash; // Check if object doens't have custom constructor (like Uint8Array/Array)

        const isPlainObject = obj => Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor === Object;

        function checkOpts(defaults, opts) {
          if (opts !== undefined && (typeof opts !== 'object' || !isPlainObject(opts))) throw new TypeError('Options should be object or undefined');
          const merged = Object.assign(defaults, opts);
          return merged;
        }

        exports.checkOpts = checkOpts;

        function wrapConstructor(hashConstructor) {
          const hashC = message => hashConstructor().update(toBytes(message)).digest();

          const tmp = hashConstructor();
          hashC.outputLen = tmp.outputLen;
          hashC.blockLen = tmp.blockLen;

          hashC.create = () => hashConstructor();

          return hashC;
        }

        exports.wrapConstructor = wrapConstructor;

        function wrapConstructorWithOpts(hashCons) {
          const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();

          const tmp = hashCons({});
          hashC.outputLen = tmp.outputLen;
          hashC.blockLen = tmp.blockLen;

          hashC.create = opts => hashCons(opts);

          return hashC;
        }

        exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
        /**
         * Secure PRNG. Uses `globalThis.crypto` or node.js crypto module.
         */

        function randomBytes(bytesLength = 32) {
          if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === 'function') {
            return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
          }

          throw new Error('crypto.getRandomValues must be defined');
        }

        exports.randomBytes = randomBytes;
      }, {
        "@noble/hashes/crypto": 83
      }],
      87: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = void 0;

        function number(n) {
          if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Wrong positive integer: ${n}`);
        }

        exports.number = number;

        function bool(b) {
          if (typeof b !== 'boolean') throw new Error(`Expected boolean, not ${b}`);
        }

        exports.bool = bool;

        function bytes(b, ...lengths) {
          if (!(b instanceof Uint8Array)) throw new Error('Expected Uint8Array');
          if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
        }

        exports.bytes = bytes;

        function hash(hash) {
          if (typeof hash !== 'function' || typeof hash.create !== 'function') throw new Error('Hash should be wrapped by utils.wrapConstructor');
          number(hash.outputLen);
          number(hash.blockLen);
        }

        exports.hash = hash;

        function exists(instance, checkFinished = true) {
          if (instance.destroyed) throw new Error('Hash instance has been destroyed');
          if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
        }

        exports.exists = exists;

        function output(out, instance) {
          bytes(out);
          const min = instance.outputLen;

          if (out.length < min) {
            throw new Error(`digestInto() expects output buffer of length at least ${min}`);
          }
        }

        exports.output = output;
        const assert = {
          number,
          bool,
          bytes,
          hash,
          exists,
          output
        };
        exports.default = assert;
      }, {}],
      88: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.BLAKE2 = exports.SIGMA = void 0;

        const _assert_js_1 = require("./_assert.js");

        const utils_js_1 = require("./utils.js"); // For BLAKE2b, the two extra permutations for rounds 10 and 11 are SIGMA[10..11] = SIGMA[0..1].
        // prettier-ignore


        exports.SIGMA = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3]);

        class BLAKE2 extends utils_js_1.Hash {
          constructor(blockLen, outputLen, opts = {}, keyLen, saltLen, persLen) {
            super();
            this.blockLen = blockLen;
            this.outputLen = outputLen;
            this.length = 0;
            this.pos = 0;
            this.finished = false;
            this.destroyed = false;

            _assert_js_1.default.number(blockLen);

            _assert_js_1.default.number(outputLen);

            _assert_js_1.default.number(keyLen);

            if (outputLen < 0 || outputLen > keyLen) throw new Error('outputLen bigger than keyLen');
            if (opts.key !== undefined && (opts.key.length < 1 || opts.key.length > keyLen)) throw new Error(`key must be up 1..${keyLen} byte long or undefined`);
            if (opts.salt !== undefined && opts.salt.length !== saltLen) throw new Error(`salt must be ${saltLen} byte long or undefined`);
            if (opts.personalization !== undefined && opts.personalization.length !== persLen) throw new Error(`personalization must be ${persLen} byte long or undefined`);
            this.buffer32 = (0, utils_js_1.u32)(this.buffer = new Uint8Array(blockLen));
          }

          update(data) {
            _assert_js_1.default.exists(this); // Main difference with other hashes: there is flag for last block,
            // so we cannot process current block before we know that there
            // is the next one. This significantly complicates logic and reduces ability
            // to do zero-copy processing


            const {
              blockLen,
              buffer,
              buffer32
            } = this;
            data = (0, utils_js_1.toBytes)(data);
            const len = data.length;
            const offset = data.byteOffset;
            const buf = data.buffer;

            for (let pos = 0; pos < len;) {
              // If buffer is full and we still have input (don't process last block, same as blake2s)
              if (this.pos === blockLen) {
                this.compress(buffer32, 0, false);
                this.pos = 0;
              }

              const take = Math.min(blockLen - this.pos, len - pos);
              const dataOffset = offset + pos; // full block && aligned to 4 bytes && not last in input

              if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
                const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));

                for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
                  this.length += blockLen;
                  this.compress(data32, pos32, false);
                }

                continue;
              }

              buffer.set(data.subarray(pos, pos + take), this.pos);
              this.pos += take;
              this.length += take;
              pos += take;
            }

            return this;
          }

          digestInto(out) {
            _assert_js_1.default.exists(this);

            _assert_js_1.default.output(out, this);

            const {
              pos,
              buffer32
            } = this;
            this.finished = true; // Padding

            this.buffer.subarray(pos).fill(0);
            this.compress(buffer32, 0, true);
            const out32 = (0, utils_js_1.u32)(out);
            this.get().forEach((v, i) => out32[i] = v);
          }

          digest() {
            const {
              buffer,
              outputLen
            } = this;
            this.digestInto(buffer);
            const res = buffer.slice(0, outputLen);
            this.destroy();
            return res;
          }

          _cloneInto(to) {
            const {
              buffer,
              length,
              finished,
              destroyed,
              outputLen,
              pos
            } = this;
            to || (to = new this.constructor({
              dkLen: outputLen
            }));
            to.set(...this.get());
            to.length = length;
            to.finished = finished;
            to.destroyed = destroyed;
            to.outputLen = outputLen;
            to.buffer.set(buffer);
            to.pos = pos;
            return to;
          }

        }

        exports.BLAKE2 = BLAKE2;
      }, {
        "./_assert.js": 87,
        "./utils.js": 98
      }],
      89: [function (require, module, exports) {
        arguments[4][82][0].apply(exports, arguments);
      }, {
        "./_assert.js": 87,
        "./utils.js": 98,
        "dup": 82
      }],
      90: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.add = exports.toBig = exports.split = exports.fromBig = void 0;
        const U32_MASK64 = BigInt(2 ** 32 - 1);

        const _32n = BigInt(32); // We are not using BigUint64Array, because they are extremely slow as per 2022


        function fromBig(n, le = false) {
          if (le) return {
            h: Number(n & U32_MASK64),
            l: Number(n >> _32n & U32_MASK64)
          };
          return {
            h: Number(n >> _32n & U32_MASK64) | 0,
            l: Number(n & U32_MASK64) | 0
          };
        }

        exports.fromBig = fromBig;

        function split(lst, le = false) {
          let Ah = new Uint32Array(lst.length);
          let Al = new Uint32Array(lst.length);

          for (let i = 0; i < lst.length; i++) {
            const {
              h,
              l
            } = fromBig(lst[i], le);
            [Ah[i], Al[i]] = [h, l];
          }

          return [Ah, Al];
        }

        exports.split = split;

        const toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);

        exports.toBig = toBig; // for Shift in [0, 32)

        const shrSH = (h, l, s) => h >>> s;

        const shrSL = (h, l, s) => h << 32 - s | l >>> s; // Right rotate for Shift in [1, 32)


        const rotrSH = (h, l, s) => h >>> s | l << 32 - s;

        const rotrSL = (h, l, s) => h << 32 - s | l >>> s; // Right rotate for Shift in (32, 64), NOTE: 32 is special case.


        const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;

        const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s; // Right rotate for shift===32 (just swaps l&h)


        const rotr32H = (h, l) => l;

        const rotr32L = (h, l) => h; // Left rotate for Shift in [1, 32)


        const rotlSH = (h, l, s) => h << s | l >>> 32 - s;

        const rotlSL = (h, l, s) => l << s | h >>> 32 - s; // Left rotate for Shift in (32, 64), NOTE: 32 is special case.


        const rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;

        const rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s; // JS uses 32-bit signed integers for bitwise operations which means we cannot
        // simple take carry out of low bit sum by shift, we need to use division.
        // Removing "export" has 5% perf penalty -_-


        function add(Ah, Al, Bh, Bl) {
          const l = (Al >>> 0) + (Bl >>> 0);
          return {
            h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
            l: l | 0
          };
        }

        exports.add = add; // Addition with more than 2 elements

        const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);

        const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;

        const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);

        const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;

        const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);

        const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0; // prettier-ignore


        const u64 = {
          fromBig,
          split,
          toBig: exports.toBig,
          shrSH,
          shrSL,
          rotrSH,
          rotrSL,
          rotrBH,
          rotrBL,
          rotr32H,
          rotr32L,
          rotlSH,
          rotlSL,
          rotlBH,
          rotlBL,
          add,
          add3L,
          add3H,
          add4L,
          add4H,
          add5H,
          add5L
        };
        exports.default = u64;
      }, {}],
      91: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.blake2b = void 0;

        const _blake2_js_1 = require("./_blake2.js");

        const _u64_js_1 = require("./_u64.js");

        const utils_js_1 = require("./utils.js"); // Same as SHA-512 but LE
        // prettier-ignore


        const IV = new Uint32Array([0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a, 0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c, 0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19]); // Temporary buffer

        const BUF = new Uint32Array(32); // Mixing function G splitted in two halfs

        function G1(a, b, c, d, msg, x) {
          // NOTE: V is LE here
          const Xl = msg[x],
                Xh = msg[x + 1]; // prettier-ignore

          let Al = BUF[2 * a],
              Ah = BUF[2 * a + 1]; // prettier-ignore

          let Bl = BUF[2 * b],
              Bh = BUF[2 * b + 1]; // prettier-ignore

          let Cl = BUF[2 * c],
              Ch = BUF[2 * c + 1]; // prettier-ignore

          let Dl = BUF[2 * d],
              Dh = BUF[2 * d + 1]; // prettier-ignore
          // v[a] = (v[a] + v[b] + x) | 0;

          let ll = _u64_js_1.default.add3L(Al, Bl, Xl);

          Ah = _u64_js_1.default.add3H(ll, Ah, Bh, Xh);
          Al = ll | 0; // v[d] = rotr(v[d] ^ v[a], 32)

          ({
            Dh,
            Dl
          } = {
            Dh: Dh ^ Ah,
            Dl: Dl ^ Al
          });
          ({
            Dh,
            Dl
          } = {
            Dh: _u64_js_1.default.rotr32H(Dh, Dl),
            Dl: _u64_js_1.default.rotr32L(Dh, Dl)
          }); // v[c] = (v[c] + v[d]) | 0;

          ({
            h: Ch,
            l: Cl
          } = _u64_js_1.default.add(Ch, Cl, Dh, Dl)); // v[b] = rotr(v[b] ^ v[c], 24)

          ({
            Bh,
            Bl
          } = {
            Bh: Bh ^ Ch,
            Bl: Bl ^ Cl
          });
          ({
            Bh,
            Bl
          } = {
            Bh: _u64_js_1.default.rotrSH(Bh, Bl, 24),
            Bl: _u64_js_1.default.rotrSL(Bh, Bl, 24)
          });
          BUF[2 * a] = Al, BUF[2 * a + 1] = Ah;
          BUF[2 * b] = Bl, BUF[2 * b + 1] = Bh;
          BUF[2 * c] = Cl, BUF[2 * c + 1] = Ch;
          BUF[2 * d] = Dl, BUF[2 * d + 1] = Dh;
        }

        function G2(a, b, c, d, msg, x) {
          // NOTE: V is LE here
          const Xl = msg[x],
                Xh = msg[x + 1]; // prettier-ignore

          let Al = BUF[2 * a],
              Ah = BUF[2 * a + 1]; // prettier-ignore

          let Bl = BUF[2 * b],
              Bh = BUF[2 * b + 1]; // prettier-ignore

          let Cl = BUF[2 * c],
              Ch = BUF[2 * c + 1]; // prettier-ignore

          let Dl = BUF[2 * d],
              Dh = BUF[2 * d + 1]; // prettier-ignore
          // v[a] = (v[a] + v[b] + x) | 0;

          let ll = _u64_js_1.default.add3L(Al, Bl, Xl);

          Ah = _u64_js_1.default.add3H(ll, Ah, Bh, Xh);
          Al = ll | 0; // v[d] = rotr(v[d] ^ v[a], 16)

          ({
            Dh,
            Dl
          } = {
            Dh: Dh ^ Ah,
            Dl: Dl ^ Al
          });
          ({
            Dh,
            Dl
          } = {
            Dh: _u64_js_1.default.rotrSH(Dh, Dl, 16),
            Dl: _u64_js_1.default.rotrSL(Dh, Dl, 16)
          }); // v[c] = (v[c] + v[d]) | 0;

          ({
            h: Ch,
            l: Cl
          } = _u64_js_1.default.add(Ch, Cl, Dh, Dl)); // v[b] = rotr(v[b] ^ v[c], 63)

          ({
            Bh,
            Bl
          } = {
            Bh: Bh ^ Ch,
            Bl: Bl ^ Cl
          });
          ({
            Bh,
            Bl
          } = {
            Bh: _u64_js_1.default.rotrBH(Bh, Bl, 63),
            Bl: _u64_js_1.default.rotrBL(Bh, Bl, 63)
          });
          BUF[2 * a] = Al, BUF[2 * a + 1] = Ah;
          BUF[2 * b] = Bl, BUF[2 * b + 1] = Bh;
          BUF[2 * c] = Cl, BUF[2 * c + 1] = Ch;
          BUF[2 * d] = Dl, BUF[2 * d + 1] = Dh;
        }

        class BLAKE2b extends _blake2_js_1.BLAKE2 {
          constructor(opts = {}) {
            super(128, opts.dkLen === undefined ? 64 : opts.dkLen, opts, 64, 16, 16); // Same as SHA-512, but LE

            this.v0l = IV[0] | 0;
            this.v0h = IV[1] | 0;
            this.v1l = IV[2] | 0;
            this.v1h = IV[3] | 0;
            this.v2l = IV[4] | 0;
            this.v2h = IV[5] | 0;
            this.v3l = IV[6] | 0;
            this.v3h = IV[7] | 0;
            this.v4l = IV[8] | 0;
            this.v4h = IV[9] | 0;
            this.v5l = IV[10] | 0;
            this.v5h = IV[11] | 0;
            this.v6l = IV[12] | 0;
            this.v6h = IV[13] | 0;
            this.v7l = IV[14] | 0;
            this.v7h = IV[15] | 0;
            const keyLength = opts.key ? opts.key.length : 0;
            this.v0l ^= this.outputLen | keyLength << 8 | 0x01 << 16 | 0x01 << 24;

            if (opts.salt) {
              const salt = (0, utils_js_1.u32)((0, utils_js_1.toBytes)(opts.salt));
              this.v4l ^= salt[0];
              this.v4h ^= salt[1];
              this.v5l ^= salt[2];
              this.v5h ^= salt[3];
            }

            if (opts.personalization) {
              const pers = (0, utils_js_1.u32)((0, utils_js_1.toBytes)(opts.personalization));
              this.v6l ^= pers[0];
              this.v6h ^= pers[1];
              this.v7l ^= pers[2];
              this.v7h ^= pers[3];
            }

            if (opts.key) {
              // Pad to blockLen and update
              const tmp = new Uint8Array(this.blockLen);
              tmp.set((0, utils_js_1.toBytes)(opts.key));
              this.update(tmp);
            }
          } // prettier-ignore


          get() {
            let {
              v0l,
              v0h,
              v1l,
              v1h,
              v2l,
              v2h,
              v3l,
              v3h,
              v4l,
              v4h,
              v5l,
              v5h,
              v6l,
              v6h,
              v7l,
              v7h
            } = this;
            return [v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h];
          } // prettier-ignore


          set(v0l, v0h, v1l, v1h, v2l, v2h, v3l, v3h, v4l, v4h, v5l, v5h, v6l, v6h, v7l, v7h) {
            this.v0l = v0l | 0;
            this.v0h = v0h | 0;
            this.v1l = v1l | 0;
            this.v1h = v1h | 0;
            this.v2l = v2l | 0;
            this.v2h = v2h | 0;
            this.v3l = v3l | 0;
            this.v3h = v3h | 0;
            this.v4l = v4l | 0;
            this.v4h = v4h | 0;
            this.v5l = v5l | 0;
            this.v5h = v5h | 0;
            this.v6l = v6l | 0;
            this.v6h = v6h | 0;
            this.v7l = v7l | 0;
            this.v7h = v7h | 0;
          }

          compress(msg, offset, isLast) {
            this.get().forEach((v, i) => BUF[i] = v); // First half from state.

            BUF.set(IV, 16); // Second half from IV.

            let {
              h,
              l
            } = _u64_js_1.default.fromBig(BigInt(this.length));

            BUF[24] = IV[8] ^ l; // Low word of the offset.

            BUF[25] = IV[9] ^ h; // High word.
            // Invert all bits for last block

            if (isLast) {
              BUF[28] = ~BUF[28];
              BUF[29] = ~BUF[29];
            }

            let j = 0;
            const s = _blake2_js_1.SIGMA;

            for (let i = 0; i < 12; i++) {
              G1(0, 4, 8, 12, msg, offset + 2 * s[j++]);
              G2(0, 4, 8, 12, msg, offset + 2 * s[j++]);
              G1(1, 5, 9, 13, msg, offset + 2 * s[j++]);
              G2(1, 5, 9, 13, msg, offset + 2 * s[j++]);
              G1(2, 6, 10, 14, msg, offset + 2 * s[j++]);
              G2(2, 6, 10, 14, msg, offset + 2 * s[j++]);
              G1(3, 7, 11, 15, msg, offset + 2 * s[j++]);
              G2(3, 7, 11, 15, msg, offset + 2 * s[j++]);
              G1(0, 5, 10, 15, msg, offset + 2 * s[j++]);
              G2(0, 5, 10, 15, msg, offset + 2 * s[j++]);
              G1(1, 6, 11, 12, msg, offset + 2 * s[j++]);
              G2(1, 6, 11, 12, msg, offset + 2 * s[j++]);
              G1(2, 7, 8, 13, msg, offset + 2 * s[j++]);
              G2(2, 7, 8, 13, msg, offset + 2 * s[j++]);
              G1(3, 4, 9, 14, msg, offset + 2 * s[j++]);
              G2(3, 4, 9, 14, msg, offset + 2 * s[j++]);
            }

            this.v0l ^= BUF[0] ^ BUF[16];
            this.v0h ^= BUF[1] ^ BUF[17];
            this.v1l ^= BUF[2] ^ BUF[18];
            this.v1h ^= BUF[3] ^ BUF[19];
            this.v2l ^= BUF[4] ^ BUF[20];
            this.v2h ^= BUF[5] ^ BUF[21];
            this.v3l ^= BUF[6] ^ BUF[22];
            this.v3h ^= BUF[7] ^ BUF[23];
            this.v4l ^= BUF[8] ^ BUF[24];
            this.v4h ^= BUF[9] ^ BUF[25];
            this.v5l ^= BUF[10] ^ BUF[26];
            this.v5h ^= BUF[11] ^ BUF[27];
            this.v6l ^= BUF[12] ^ BUF[28];
            this.v6h ^= BUF[13] ^ BUF[29];
            this.v7l ^= BUF[14] ^ BUF[30];
            this.v7h ^= BUF[15] ^ BUF[31];
            BUF.fill(0);
          }

          destroy() {
            this.destroyed = true;
            this.buffer32.fill(0);
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          }

        }
        /**
         * BLAKE2b - optimized for 64-bit platforms. JS doesn't have uint64, so it's slower than BLAKE2s.
         * @param msg - message that would be hashed
         * @param opts - dkLen, key, salt, personalization
         */


        exports.blake2b = (0, utils_js_1.wrapConstructorWithOpts)(opts => new BLAKE2b(opts));
      }, {
        "./_blake2.js": 88,
        "./_u64.js": 90,
        "./utils.js": 98
      }],
      92: [function (require, module, exports) {
        arguments[4][83][0].apply(exports, arguments);
      }, {
        "dup": 83
      }],
      93: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hmac = exports.HMAC = void 0;

        const _assert_js_1 = require("./_assert.js");

        const utils_js_1 = require("./utils.js"); // HMAC (RFC 2104)


        class HMAC extends utils_js_1.Hash {
          constructor(hash, _key) {
            super();
            this.finished = false;
            this.destroyed = false;

            _assert_js_1.default.hash(hash);

            const key = (0, utils_js_1.toBytes)(_key);
            this.iHash = hash.create();
            if (typeof this.iHash.update !== 'function') throw new Error('Expected instance of class which extends utils.Hash');
            this.blockLen = this.iHash.blockLen;
            this.outputLen = this.iHash.outputLen;
            const blockLen = this.blockLen;
            const pad = new Uint8Array(blockLen); // blockLen can be bigger than outputLen

            pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);

            for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36;

            this.iHash.update(pad); // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone

            this.oHash = hash.create(); // Undo internal XOR && apply outer XOR

            for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36 ^ 0x5c;

            this.oHash.update(pad);
            pad.fill(0);
          }

          update(buf) {
            _assert_js_1.default.exists(this);

            this.iHash.update(buf);
            return this;
          }

          digestInto(out) {
            _assert_js_1.default.exists(this);

            _assert_js_1.default.bytes(out, this.outputLen);

            this.finished = true;
            this.iHash.digestInto(out);
            this.oHash.update(out);
            this.oHash.digestInto(out);
            this.destroy();
          }

          digest() {
            const out = new Uint8Array(this.oHash.outputLen);
            this.digestInto(out);
            return out;
          }

          _cloneInto(to) {
            // Create new instance without calling constructor since key already in state and we don't know it.
            to || (to = Object.create(Object.getPrototypeOf(this), {}));
            const {
              oHash,
              iHash,
              finished,
              destroyed,
              blockLen,
              outputLen
            } = this;
            to = to;
            to.finished = finished;
            to.destroyed = destroyed;
            to.blockLen = blockLen;
            to.outputLen = outputLen;
            to.oHash = oHash._cloneInto(to.oHash);
            to.iHash = iHash._cloneInto(to.iHash);
            return to;
          }

          destroy() {
            this.destroyed = true;
            this.oHash.destroy();
            this.iHash.destroy();
          }

        }

        exports.HMAC = HMAC;
        /**
         * HMAC: RFC2104 message authentication code.
         * @param hash - function that would be used e.g. sha256
         * @param key - message key
         * @param message - message data
         */

        const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();

        exports.hmac = hmac;

        exports.hmac.create = (hash, key) => new HMAC(hash, key);
      }, {
        "./_assert.js": 87,
        "./utils.js": 98
      }],
      94: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.pbkdf2Async = exports.pbkdf2 = void 0;

        const _assert_js_1 = require("./_assert.js");

        const hmac_js_1 = require("./hmac.js");

        const utils_js_1 = require("./utils.js"); // Common prologue and epilogue for sync/async functions


        function pbkdf2Init(hash, _password, _salt, _opts) {
          _assert_js_1.default.hash(hash);

          const opts = (0, utils_js_1.checkOpts)({
            dkLen: 32,
            asyncTick: 10
          }, _opts);
          const {
            c,
            dkLen,
            asyncTick
          } = opts;

          _assert_js_1.default.number(c);

          _assert_js_1.default.number(dkLen);

          _assert_js_1.default.number(asyncTick);

          if (c < 1) throw new Error('PBKDF2: iterations (c) should be >= 1');
          const password = (0, utils_js_1.toBytes)(_password);
          const salt = (0, utils_js_1.toBytes)(_salt); // DK = PBKDF2(PRF, Password, Salt, c, dkLen);

          const DK = new Uint8Array(dkLen); // U1 = PRF(Password, Salt + INT_32_BE(i))

          const PRF = hmac_js_1.hmac.create(hash, password);

          const PRFSalt = PRF._cloneInto().update(salt);

          return {
            c,
            dkLen,
            asyncTick,
            DK,
            PRF,
            PRFSalt
          };
        }

        function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
          PRF.destroy();
          PRFSalt.destroy();
          if (prfW) prfW.destroy();
          u.fill(0);
          return DK;
        }
        /**
         * PBKDF2-HMAC: RFC 2898 key derivation function
         * @param hash - hash function that would be used e.g. sha256
         * @param password - password from which a derived key is generated
         * @param salt - cryptographic salt
         * @param opts - {c, dkLen} where c is work factor and dkLen is output message size
         */


        function pbkdf2(hash, password, salt, opts) {
          const {
            c,
            dkLen,
            DK,
            PRF,
            PRFSalt
          } = pbkdf2Init(hash, password, salt, opts);
          let prfW; // Working copy

          const arr = new Uint8Array(4);
          const view = (0, utils_js_1.createView)(arr);
          const u = new Uint8Array(PRF.outputLen); // DK = T1 + T2 + ⋯ + Tdklen/hlen

          for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
            // Ti = F(Password, Salt, c, i)
            const Ti = DK.subarray(pos, pos + PRF.outputLen);
            view.setInt32(0, ti, false); // F(Password, Salt, c, i) = U1 ^ U2 ^ ⋯ ^ Uc
            // U1 = PRF(Password, Salt + INT_32_BE(i))

            (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);

            Ti.set(u.subarray(0, Ti.length));

            for (let ui = 1; ui < c; ui++) {
              // Uc = PRF(Password, Uc−1)
              PRF._cloneInto(prfW).update(u).digestInto(u);

              for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
            }
          }

          return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
        }

        exports.pbkdf2 = pbkdf2;

        async function pbkdf2Async(hash, password, salt, opts) {
          const {
            c,
            dkLen,
            asyncTick,
            DK,
            PRF,
            PRFSalt
          } = pbkdf2Init(hash, password, salt, opts);
          let prfW; // Working copy

          const arr = new Uint8Array(4);
          const view = (0, utils_js_1.createView)(arr);
          const u = new Uint8Array(PRF.outputLen); // DK = T1 + T2 + ⋯ + Tdklen/hlen

          for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
            // Ti = F(Password, Salt, c, i)
            const Ti = DK.subarray(pos, pos + PRF.outputLen);
            view.setInt32(0, ti, false); // F(Password, Salt, c, i) = U1 ^ U2 ^ ⋯ ^ Uc
            // U1 = PRF(Password, Salt + INT_32_BE(i))

            (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);

            Ti.set(u.subarray(0, Ti.length));
            await (0, utils_js_1.asyncLoop)(c - 1, asyncTick, i => {
              // Uc = PRF(Password, Uc−1)
              PRF._cloneInto(prfW).update(u).digestInto(u);

              for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
            });
          }

          return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
        }

        exports.pbkdf2Async = pbkdf2Async;
      }, {
        "./_assert.js": 87,
        "./hmac.js": 93,
        "./utils.js": 98
      }],
      95: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.ripemd160 = exports.RIPEMD160 = void 0;

        const _sha2_js_1 = require("./_sha2.js");

        const utils_js_1 = require("./utils.js"); // https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
        // https://homes.esat.kuleuven.be/~bosselae/ripemd160/pdf/AB-9601/AB-9601.pdf


        const Rho = new Uint8Array([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]);
        const Id = Uint8Array.from({
          length: 16
        }, (_, i) => i);
        const Pi = Id.map(i => (9 * i + 5) % 16);
        let idxL = [Id];
        let idxR = [Pi];

        for (let i = 0; i < 4; i++) for (let j of [idxL, idxR]) j.push(j[i].map(k => Rho[k]));

        const shifts = [[11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8], [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7], [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9], [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6], [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]].map(i => new Uint8Array(i));
        const shiftsL = idxL.map((idx, i) => idx.map(j => shifts[i][j]));
        const shiftsR = idxR.map((idx, i) => idx.map(j => shifts[i][j]));
        const Kl = new Uint32Array([0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]);
        const Kr = new Uint32Array([0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]); // The rotate left (circular left shift) operation for uint32

        const rotl = (word, shift) => word << shift | word >>> 32 - shift; // It's called f() in spec.


        function f(group, x, y, z) {
          if (group === 0) return x ^ y ^ z;else if (group === 1) return x & y | ~x & z;else if (group === 2) return (x | ~y) ^ z;else if (group === 3) return x & z | y & ~z;else return x ^ (y | ~z);
        } // Temporary buffer, not used to store anything between runs


        const BUF = new Uint32Array(16);

        class RIPEMD160 extends _sha2_js_1.SHA2 {
          constructor() {
            super(64, 20, 8, true);
            this.h0 = 0x67452301 | 0;
            this.h1 = 0xefcdab89 | 0;
            this.h2 = 0x98badcfe | 0;
            this.h3 = 0x10325476 | 0;
            this.h4 = 0xc3d2e1f0 | 0;
          }

          get() {
            const {
              h0,
              h1,
              h2,
              h3,
              h4
            } = this;
            return [h0, h1, h2, h3, h4];
          }

          set(h0, h1, h2, h3, h4) {
            this.h0 = h0 | 0;
            this.h1 = h1 | 0;
            this.h2 = h2 | 0;
            this.h3 = h3 | 0;
            this.h4 = h4 | 0;
          }

          process(view, offset) {
            for (let i = 0; i < 16; i++, offset += 4) BUF[i] = view.getUint32(offset, true); // prettier-ignore


            let al = this.h0 | 0,
                ar = al,
                bl = this.h1 | 0,
                br = bl,
                cl = this.h2 | 0,
                cr = cl,
                dl = this.h3 | 0,
                dr = dl,
                el = this.h4 | 0,
                er = el; // Instead of iterating 0 to 80, we split it into 5 groups
            // And use the groups in constants, functions, etc. Much simpler

            for (let group = 0; group < 5; group++) {
              const rGroup = 4 - group;
              const hbl = Kl[group],
                    hbr = Kr[group]; // prettier-ignore

              const rl = idxL[group],
                    rr = idxR[group]; // prettier-ignore

              const sl = shiftsL[group],
                    sr = shiftsR[group]; // prettier-ignore

              for (let i = 0; i < 16; i++) {
                const tl = rotl(al + f(group, bl, cl, dl) + BUF[rl[i]] + hbl, sl[i]) + el | 0;
                al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl; // prettier-ignore
              } // 2 loops are 10% faster


              for (let i = 0; i < 16; i++) {
                const tr = rotl(ar + f(rGroup, br, cr, dr) + BUF[rr[i]] + hbr, sr[i]) + er | 0;
                ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr; // prettier-ignore
              }
            } // Add the compressed chunk to the current hash value


            this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
          }

          roundClean() {
            BUF.fill(0);
          }

          destroy() {
            this.destroyed = true;
            this.buffer.fill(0);
            this.set(0, 0, 0, 0, 0);
          }

        }

        exports.RIPEMD160 = RIPEMD160;
        /**
         * RIPEMD-160 - a hash function from 1990s.
         * @param message - msg that would be hashed
         */

        exports.ripemd160 = (0, utils_js_1.wrapConstructor)(() => new RIPEMD160());
      }, {
        "./_sha2.js": 89,
        "./utils.js": 98
      }],
      96: [function (require, module, exports) {
        arguments[4][85][0].apply(exports, arguments);
      }, {
        "./_sha2.js": 89,
        "./utils.js": 98,
        "dup": 85
      }],
      97: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.sha384 = exports.sha512_256 = exports.sha512_224 = exports.sha512 = exports.SHA512 = void 0;

        const _sha2_js_1 = require("./_sha2.js");

        const _u64_js_1 = require("./_u64.js");

        const utils_js_1 = require("./utils.js"); // Round contants (first 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409):
        // prettier-ignore


        const [SHA512_Kh, SHA512_Kl] = _u64_js_1.default.split(['0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc', '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118', '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2', '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694', '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65', '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5', '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4', '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70', '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df', '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b', '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30', '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8', '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8', '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3', '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec', '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b', '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178', '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b', '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c', '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'].map(n => BigInt(n))); // Temporary buffer, not used to store anything between runs


        const SHA512_W_H = new Uint32Array(80);
        const SHA512_W_L = new Uint32Array(80);

        class SHA512 extends _sha2_js_1.SHA2 {
          constructor() {
            super(128, 64, 16, false); // We cannot use array here since array allows indexing by variable which means optimizer/compiler cannot use registers.
            // Also looks cleaner and easier to verify with spec.
            // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
            // h -- high 32 bits, l -- low 32 bits

            this.Ah = 0x6a09e667 | 0;
            this.Al = 0xf3bcc908 | 0;
            this.Bh = 0xbb67ae85 | 0;
            this.Bl = 0x84caa73b | 0;
            this.Ch = 0x3c6ef372 | 0;
            this.Cl = 0xfe94f82b | 0;
            this.Dh = 0xa54ff53a | 0;
            this.Dl = 0x5f1d36f1 | 0;
            this.Eh = 0x510e527f | 0;
            this.El = 0xade682d1 | 0;
            this.Fh = 0x9b05688c | 0;
            this.Fl = 0x2b3e6c1f | 0;
            this.Gh = 0x1f83d9ab | 0;
            this.Gl = 0xfb41bd6b | 0;
            this.Hh = 0x5be0cd19 | 0;
            this.Hl = 0x137e2179 | 0;
          } // prettier-ignore


          get() {
            const {
              Ah,
              Al,
              Bh,
              Bl,
              Ch,
              Cl,
              Dh,
              Dl,
              Eh,
              El,
              Fh,
              Fl,
              Gh,
              Gl,
              Hh,
              Hl
            } = this;
            return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
          } // prettier-ignore


          set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
            this.Ah = Ah | 0;
            this.Al = Al | 0;
            this.Bh = Bh | 0;
            this.Bl = Bl | 0;
            this.Ch = Ch | 0;
            this.Cl = Cl | 0;
            this.Dh = Dh | 0;
            this.Dl = Dl | 0;
            this.Eh = Eh | 0;
            this.El = El | 0;
            this.Fh = Fh | 0;
            this.Fl = Fl | 0;
            this.Gh = Gh | 0;
            this.Gl = Gl | 0;
            this.Hh = Hh | 0;
            this.Hl = Hl | 0;
          }

          process(view, offset) {
            // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
            for (let i = 0; i < 16; i++, offset += 4) {
              SHA512_W_H[i] = view.getUint32(offset);
              SHA512_W_L[i] = view.getUint32(offset += 4);
            }

            for (let i = 16; i < 80; i++) {
              // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
              const W15h = SHA512_W_H[i - 15] | 0;
              const W15l = SHA512_W_L[i - 15] | 0;

              const s0h = _u64_js_1.default.rotrSH(W15h, W15l, 1) ^ _u64_js_1.default.rotrSH(W15h, W15l, 8) ^ _u64_js_1.default.shrSH(W15h, W15l, 7);

              const s0l = _u64_js_1.default.rotrSL(W15h, W15l, 1) ^ _u64_js_1.default.rotrSL(W15h, W15l, 8) ^ _u64_js_1.default.shrSL(W15h, W15l, 7); // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)


              const W2h = SHA512_W_H[i - 2] | 0;
              const W2l = SHA512_W_L[i - 2] | 0;

              const s1h = _u64_js_1.default.rotrSH(W2h, W2l, 19) ^ _u64_js_1.default.rotrBH(W2h, W2l, 61) ^ _u64_js_1.default.shrSH(W2h, W2l, 6);

              const s1l = _u64_js_1.default.rotrSL(W2h, W2l, 19) ^ _u64_js_1.default.rotrBL(W2h, W2l, 61) ^ _u64_js_1.default.shrSL(W2h, W2l, 6); // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];


              const SUMl = _u64_js_1.default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);

              const SUMh = _u64_js_1.default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);

              SHA512_W_H[i] = SUMh | 0;
              SHA512_W_L[i] = SUMl | 0;
            }

            let {
              Ah,
              Al,
              Bh,
              Bl,
              Ch,
              Cl,
              Dh,
              Dl,
              Eh,
              El,
              Fh,
              Fl,
              Gh,
              Gl,
              Hh,
              Hl
            } = this; // Compression function main loop, 80 rounds

            for (let i = 0; i < 80; i++) {
              // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
              const sigma1h = _u64_js_1.default.rotrSH(Eh, El, 14) ^ _u64_js_1.default.rotrSH(Eh, El, 18) ^ _u64_js_1.default.rotrBH(Eh, El, 41);

              const sigma1l = _u64_js_1.default.rotrSL(Eh, El, 14) ^ _u64_js_1.default.rotrSL(Eh, El, 18) ^ _u64_js_1.default.rotrBL(Eh, El, 41); //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;


              const CHIh = Eh & Fh ^ ~Eh & Gh;
              const CHIl = El & Fl ^ ~El & Gl; // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
              // prettier-ignore

              const T1ll = _u64_js_1.default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);

              const T1h = _u64_js_1.default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);

              const T1l = T1ll | 0; // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)

              const sigma0h = _u64_js_1.default.rotrSH(Ah, Al, 28) ^ _u64_js_1.default.rotrBH(Ah, Al, 34) ^ _u64_js_1.default.rotrBH(Ah, Al, 39);

              const sigma0l = _u64_js_1.default.rotrSL(Ah, Al, 28) ^ _u64_js_1.default.rotrBL(Ah, Al, 34) ^ _u64_js_1.default.rotrBL(Ah, Al, 39);

              const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
              const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
              Hh = Gh | 0;
              Hl = Gl | 0;
              Gh = Fh | 0;
              Gl = Fl | 0;
              Fh = Eh | 0;
              Fl = El | 0;
              ({
                h: Eh,
                l: El
              } = _u64_js_1.default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
              Dh = Ch | 0;
              Dl = Cl | 0;
              Ch = Bh | 0;
              Cl = Bl | 0;
              Bh = Ah | 0;
              Bl = Al | 0;

              const All = _u64_js_1.default.add3L(T1l, sigma0l, MAJl);

              Ah = _u64_js_1.default.add3H(All, T1h, sigma0h, MAJh);
              Al = All | 0;
            } // Add the compressed chunk to the current hash value


            ({
              h: Ah,
              l: Al
            } = _u64_js_1.default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
            ({
              h: Bh,
              l: Bl
            } = _u64_js_1.default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
            ({
              h: Ch,
              l: Cl
            } = _u64_js_1.default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
            ({
              h: Dh,
              l: Dl
            } = _u64_js_1.default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
            ({
              h: Eh,
              l: El
            } = _u64_js_1.default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
            ({
              h: Fh,
              l: Fl
            } = _u64_js_1.default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
            ({
              h: Gh,
              l: Gl
            } = _u64_js_1.default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
            ({
              h: Hh,
              l: Hl
            } = _u64_js_1.default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
            this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
          }

          roundClean() {
            SHA512_W_H.fill(0);
            SHA512_W_L.fill(0);
          }

          destroy() {
            this.buffer.fill(0);
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          }

        }

        exports.SHA512 = SHA512;

        class SHA512_224 extends SHA512 {
          constructor() {
            super(); // h -- high 32 bits, l -- low 32 bits

            this.Ah = 0x8c3d37c8 | 0;
            this.Al = 0x19544da2 | 0;
            this.Bh = 0x73e19966 | 0;
            this.Bl = 0x89dcd4d6 | 0;
            this.Ch = 0x1dfab7ae | 0;
            this.Cl = 0x32ff9c82 | 0;
            this.Dh = 0x679dd514 | 0;
            this.Dl = 0x582f9fcf | 0;
            this.Eh = 0x0f6d2b69 | 0;
            this.El = 0x7bd44da8 | 0;
            this.Fh = 0x77e36f73 | 0;
            this.Fl = 0x04c48942 | 0;
            this.Gh = 0x3f9d85a8 | 0;
            this.Gl = 0x6a1d36c8 | 0;
            this.Hh = 0x1112e6ad | 0;
            this.Hl = 0x91d692a1 | 0;
            this.outputLen = 28;
          }

        }

        class SHA512_256 extends SHA512 {
          constructor() {
            super(); // h -- high 32 bits, l -- low 32 bits

            this.Ah = 0x22312194 | 0;
            this.Al = 0xfc2bf72c | 0;
            this.Bh = 0x9f555fa3 | 0;
            this.Bl = 0xc84c64c2 | 0;
            this.Ch = 0x2393b86b | 0;
            this.Cl = 0x6f53b151 | 0;
            this.Dh = 0x96387719 | 0;
            this.Dl = 0x5940eabd | 0;
            this.Eh = 0x96283ee2 | 0;
            this.El = 0xa88effe3 | 0;
            this.Fh = 0xbe5e1e25 | 0;
            this.Fl = 0x53863992 | 0;
            this.Gh = 0x2b0199fc | 0;
            this.Gl = 0x2c85b8aa | 0;
            this.Hh = 0x0eb72ddc | 0;
            this.Hl = 0x81c52ca2 | 0;
            this.outputLen = 32;
          }

        }

        class SHA384 extends SHA512 {
          constructor() {
            super(); // h -- high 32 bits, l -- low 32 bits

            this.Ah = 0xcbbb9d5d | 0;
            this.Al = 0xc1059ed8 | 0;
            this.Bh = 0x629a292a | 0;
            this.Bl = 0x367cd507 | 0;
            this.Ch = 0x9159015a | 0;
            this.Cl = 0x3070dd17 | 0;
            this.Dh = 0x152fecd8 | 0;
            this.Dl = 0xf70e5939 | 0;
            this.Eh = 0x67332667 | 0;
            this.El = 0xffc00b31 | 0;
            this.Fh = 0x8eb44a87 | 0;
            this.Fl = 0x68581511 | 0;
            this.Gh = 0xdb0c2e0d | 0;
            this.Gl = 0x64f98fa7 | 0;
            this.Hh = 0x47b5481d | 0;
            this.Hl = 0xbefa4fa4 | 0;
            this.outputLen = 48;
          }

        }

        exports.sha512 = (0, utils_js_1.wrapConstructor)(() => new SHA512());
        exports.sha512_224 = (0, utils_js_1.wrapConstructor)(() => new SHA512_224());
        exports.sha512_256 = (0, utils_js_1.wrapConstructor)(() => new SHA512_256());
        exports.sha384 = (0, utils_js_1.wrapConstructor)(() => new SHA384());
      }, {
        "./_sha2.js": 89,
        "./_u64.js": 90,
        "./utils.js": 98
      }],
      98: [function (require, module, exports) {
        "use strict";
        /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.randomBytes = exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.isLE = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0; // We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
        // node.js versions earlier than v19 don't declare it in global scope.
        // For node.js, package.json#exports field mapping rewrites import
        // from `crypto` to `cryptoNode`, which imports native module.
        // Makes the utils un-importable in browsers without a bundler.
        // Once node.js 18 is deprecated, we can just drop the import.

        const crypto_1 = require("@noble/hashes/crypto");

        const u8a = a => a instanceof Uint8Array; // Cast array to different type


        const u8 = arr => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);

        exports.u8 = u8;

        const u32 = arr => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));

        exports.u32 = u32; // Cast array to view

        const createView = arr => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

        exports.createView = createView; // The rotate right (circular right shift) operation for uint32

        const rotr = (word, shift) => word << 32 - shift | word >>> shift;

        exports.rotr = rotr; // big-endian hardware is rare. Just in case someone still decides to run hashes:
        // early-throw an error because we don't support BE yet.

        exports.isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
        if (!exports.isLE) throw new Error('Non little-endian hardware is not supported');
        const hexes = Array.from({
          length: 256
        }, (v, i) => i.toString(16).padStart(2, '0'));
        /**
         * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
         */

        function bytesToHex(bytes) {
          if (!u8a(bytes)) throw new Error('Uint8Array expected'); // pre-caching improves the speed 6x

          let hex = '';

          for (let i = 0; i < bytes.length; i++) {
            hex += hexes[bytes[i]];
          }

          return hex;
        }

        exports.bytesToHex = bytesToHex;
        /**
         * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
         */

        function hexToBytes(hex) {
          if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
          const len = hex.length;
          if (len % 2) throw new Error('padded hex string expected, got unpadded hex of length ' + len);
          const array = new Uint8Array(len / 2);

          for (let i = 0; i < array.length; i++) {
            const j = i * 2;
            const hexByte = hex.slice(j, j + 2);
            const byte = Number.parseInt(hexByte, 16);
            if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
            array[i] = byte;
          }

          return array;
        }

        exports.hexToBytes = hexToBytes; // There is no setImmediate in browser and setTimeout is slow.
        // call of async fn will return Promise, which will be fullfiled only on
        // next scheduler queue processing step and this is exactly what we need.

        const nextTick = async () => {};

        exports.nextTick = nextTick; // Returns control to thread each 'tick' ms to avoid blocking

        async function asyncLoop(iters, tick, cb) {
          let ts = Date.now();

          for (let i = 0; i < iters; i++) {
            cb(i); // Date.now() is not monotonic, so in case if clock goes backwards we return return control too

            const diff = Date.now() - ts;
            if (diff >= 0 && diff < tick) continue;
            await (0, exports.nextTick)();
            ts += diff;
          }
        }

        exports.asyncLoop = asyncLoop;
        /**
         * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
         */

        function utf8ToBytes(str) {
          if (typeof str !== 'string') throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
          return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
        }

        exports.utf8ToBytes = utf8ToBytes;
        /**
         * Normalizes (non-hex) string or Uint8Array to Uint8Array.
         * Warning: when Uint8Array is passed, it would NOT get copied.
         * Keep in mind for future mutable operations.
         */

        function toBytes(data) {
          if (typeof data === 'string') data = utf8ToBytes(data);
          if (!u8a(data)) throw new Error(`expected Uint8Array, got ${typeof data}`);
          return data;
        }

        exports.toBytes = toBytes;
        /**
         * Copies several Uint8Arrays into one.
         */

        function concatBytes(...arrays) {
          const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
          let pad = 0; // walk through each item, ensure they have proper type

          arrays.forEach(a => {
            if (!u8a(a)) throw new Error('Uint8Array expected');
            r.set(a, pad);
            pad += a.length;
          });
          return r;
        }

        exports.concatBytes = concatBytes; // For runtime check if class implements interface

        class Hash {
          // Safe version that clones internal state
          clone() {
            return this._cloneInto();
          }

        }

        exports.Hash = Hash; // Check if object doens't have custom constructor (like Uint8Array/Array)

        const isPlainObject = obj => Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor === Object;

        function checkOpts(defaults, opts) {
          if (opts !== undefined && (typeof opts !== 'object' || !isPlainObject(opts))) throw new Error('Options should be object or undefined');
          const merged = Object.assign(defaults, opts);
          return merged;
        }

        exports.checkOpts = checkOpts;

        function wrapConstructor(hashCons) {
          const hashC = msg => hashCons().update(toBytes(msg)).digest();

          const tmp = hashCons();
          hashC.outputLen = tmp.outputLen;
          hashC.blockLen = tmp.blockLen;

          hashC.create = () => hashCons();

          return hashC;
        }

        exports.wrapConstructor = wrapConstructor;

        function wrapConstructorWithOpts(hashCons) {
          const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();

          const tmp = hashCons({});
          hashC.outputLen = tmp.outputLen;
          hashC.blockLen = tmp.blockLen;

          hashC.create = opts => hashCons(opts);

          return hashC;
        }

        exports.wrapConstructorWithOpts = wrapConstructorWithOpts;

        function wrapXOFConstructorWithOpts(hashCons) {
          const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();

          const tmp = hashCons({});
          hashC.outputLen = tmp.outputLen;
          hashC.blockLen = tmp.blockLen;

          hashC.create = opts => hashCons(opts);

          return hashC;
        }

        exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
        /**
         * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
         */

        function randomBytes(bytesLength = 32) {
          if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === 'function') {
            return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
          }

          throw new Error('crypto.getRandomValues must be defined');
        }

        exports.randomBytes = randomBytes;
      }, {
        "@noble/hashes/crypto": 92
      }],
      99: [function (require, module, exports) {
        "use strict";

        var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        /**
         * OpenRPC Client JS is a browser-compatible JSON-RPC client with multiple transports and
         * multiple request managers to enable features like round-robin or fallback-by-position.
         *
         * @example
         * ```typescript
         * import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
         * const transport = new HTTPTransport('http://localhost:3333');
         * const client = new Client(new RequestManager([transport]));
         * const result = await client.request({method: 'addition', params: [2, 2]});
         * // => { jsonrpc: '2.0', id: 1, result: 4 }
         * ```
         *
         */

        var Client =
        /** @class */
        function () {
          function Client(requestManager) {
            this.requestManager = requestManager;
          }
          /**
           * Initiates [[RequestManager.startBatch]] in order to build a batch call.
           *
           * Subsequent calls to [[Client.request]] will be added to the batch. Once [[Client.stopBatch]] is called, the
           * promises for the [[Client.request]] will then be resolved.  If the [[RequestManager]] already has a batch in
           * progress, this method is a noop.
           *
           * @example
           * myClient.startBatch();
           * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
           * myClient.request({method: "foo", params: ["baz"]}).then(() => console.log('foobaz'));
           * myClient.stopBatch();
           */


          Client.prototype.startBatch = function () {
            return this.requestManager.startBatch();
          };
          /**
           * Initiates [[RequestManager.stopBatch]] in order to finalize and send the batch to the underlying transport.
           *
           * [[Client.stopBatch]] will send the [[Client.request]] calls made since the last [[Client.startBatch]] call. For
           * that reason, [[Client.startBatch]] MUST be called before [[Client.stopBatch]].
           *
           * @example
           * myClient.startBatch();
           * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
           * myClient.request({method: "foo", params: ["baz"]}).then(() => console.log('foobaz'));
           * myClient.stopBatch();
           */


          Client.prototype.stopBatch = function () {
            return this.requestManager.stopBatch();
          };
          /**
           * A JSON-RPC call is represented by sending a Request object to a Server.
           *
           * @param requestObject.method A String containing the name of the method to be invoked. Method names that begin with the word rpc
           * followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and
           * MUST NOT be used for anything else.
           * @param requestObject.params A Structured value that holds the parameter values to be used during the invocation of the method.
           *
           * @example
           * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
           */


          Client.prototype.request = function (requestObject, timeout) {
            return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    if (!this.requestManager.connectPromise) return [3
                    /*break*/
                    , 2];
                    return [4
                    /*yield*/
                    , this.requestManager.connectPromise];

                  case 1:
                    _a.sent();

                    _a.label = 2;

                  case 2:
                    return [2
                    /*return*/
                    , this.requestManager.request(requestObject, false, timeout)];
                }
              });
            });
          };

          Client.prototype.notify = function (requestObject) {
            return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    if (!this.requestManager.connectPromise) return [3
                    /*break*/
                    , 2];
                    return [4
                    /*yield*/
                    , this.requestManager.connectPromise];

                  case 1:
                    _a.sent();

                    _a.label = 2;

                  case 2:
                    return [2
                    /*return*/
                    , this.requestManager.request(requestObject, true, null)];
                }
              });
            });
          };

          Client.prototype.onNotification = function (callback) {
            this.requestManager.requestChannel.addListener("notification", callback);
          };

          Client.prototype.onError = function (callback) {
            this.requestManager.requestChannel.addListener("error", callback);
          };
          /**
           * Close connection
           */


          Client.prototype.close = function () {
            this.requestManager.close();
          };

          return Client;
        }();

        exports.default = Client;
      }, {}],
      100: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.convertJSONToRPCError = exports.JSONRPCError = exports.ERR_UNKNOWN = exports.ERR_MISSIING_ID = exports.ERR_TIMEOUT = void 0;
        exports.ERR_TIMEOUT = 7777;
        exports.ERR_MISSIING_ID = 7878;
        exports.ERR_UNKNOWN = 7979;

        var JSONRPCError =
        /** @class */
        function (_super) {
          __extends(JSONRPCError, _super);

          function JSONRPCError(message, code, data) {
            var _newTarget = this.constructor;

            var _this = _super.call(this, message) || this;

            _this.message = message;
            _this.code = code;
            _this.data = data;
            Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain: see https://github.com/open-rpc/client-js/issues/209

            return _this;
          }

          return JSONRPCError;
        }(Error);

        exports.JSONRPCError = JSONRPCError;

        exports.convertJSONToRPCError = function (payload) {
          if (payload.error) {
            var _a = payload.error,
                message = _a.message,
                code = _a.code,
                data = _a.data;
            return new JSONRPCError(message, code, data);
          }

          return new JSONRPCError("Unknown error", exports.ERR_UNKNOWN, payload);
        };
      }, {}],
      101: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.getNotifications = exports.getBatchRequests = exports.isNotification = void 0;

        exports.isNotification = function (data) {
          return data.request.id === undefined || data.request.id === null;
        };

        exports.getBatchRequests = function (data) {
          if (data instanceof Array) {
            return data.filter(function (datum) {
              var id = datum.request.request.id;
              return id !== null && id !== undefined;
            }).map(function (batchRequest) {
              return batchRequest.request;
            });
          }

          return [];
        };

        exports.getNotifications = function (data) {
          if (data instanceof Array) {
            return data.filter(function (datum) {
              return exports.isNotification(datum.request);
            }).map(function (batchRequest) {
              return batchRequest.request;
            });
          }

          if (exports.isNotification(data)) {
            return [data];
          }

          return [];
        };
      }, {}],
      102: [function (require, module, exports) {
        "use strict";

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.defaultNextRequest = void 0;

        var events_1 = require("events");

        exports.defaultNextRequest = function () {
          var lastId = -1;
          return function () {
            return ++lastId;
          };
        };
        /*
        ** Naive Request Manager, only use 1st transport.
         * A more complex request manager could try each transport.
         * If a transport fails, or times out, move on to the next.
         */


        var RequestManager =
        /** @class */
        function () {
          function RequestManager(transports, nextID) {
            if (nextID === void 0) {
              nextID = exports.defaultNextRequest();
            }

            this.batch = [];
            this.batchStarted = false;
            this.lastId = -1;
            this.transports = transports;
            this.requests = {};
            this.connectPromise = this.connect();
            this.requestChannel = new events_1.EventEmitter();
            this.nextID = nextID;
          }

          RequestManager.prototype.connect = function () {
            var _this = this;

            return Promise.all(this.transports.map(function (transport) {
              return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      transport.subscribe("error", this.handleError.bind(this));
                      transport.subscribe("notification", this.handleNotification.bind(this));
                      return [4
                      /*yield*/
                      , transport.connect()];

                    case 1:
                      _a.sent();

                      return [2
                      /*return*/
                      ];
                  }
                });
              });
            }));
          };

          RequestManager.prototype.getPrimaryTransport = function () {
            return this.transports[0];
          };

          RequestManager.prototype.request = function (requestObject, notification, timeout) {
            if (notification === void 0) {
              notification = false;
            }

            return __awaiter(this, void 0, void 0, function () {
              var internalID, id, payload, result;

              var _this = this;

              return __generator(this, function (_a) {
                internalID = this.nextID().toString();
                id = notification ? null : internalID;
                payload = {
                  request: this.makeRequest(requestObject.method, requestObject.params || [], id),
                  internalID: internalID
                };

                if (this.batchStarted) {
                  result = new Promise(function (resolve, reject) {
                    _this.batch.push({
                      resolve: resolve,
                      reject: reject,
                      request: payload
                    });
                  });
                  return [2
                  /*return*/
                  , result];
                }

                return [2
                /*return*/
                , this.getPrimaryTransport().sendData(payload, timeout)];
              });
            });
          };

          RequestManager.prototype.close = function () {
            this.requestChannel.removeAllListeners();
            this.transports.forEach(function (transport) {
              transport.unsubscribe();
              transport.close();
            });
          };
          /**
           * Begins a batch call by setting the [[RequestManager.batchStarted]] flag to `true`.
           *
           * [[RequestManager.batch]] is a singleton - only one batch can exist at a given time, per [[RequestManager]].
           *
           */


          RequestManager.prototype.startBatch = function () {
            this.batchStarted = true;
          };

          RequestManager.prototype.stopBatch = function () {
            if (this.batchStarted === false) {
              throw new Error("cannot end that which has never started");
            }

            if (this.batch.length === 0) {
              this.batchStarted = false;
              return;
            }

            this.getPrimaryTransport().sendData(this.batch);
            this.batch = [];
            this.batchStarted = false;
          };

          RequestManager.prototype.makeRequest = function (method, params, id) {
            if (id) {
              return {
                jsonrpc: "2.0",
                id: id,
                method: method,
                params: params
              };
            }

            return {
              jsonrpc: "2.0",
              method: method,
              params: params
            };
          };

          RequestManager.prototype.handleError = function (data) {
            this.requestChannel.emit("error", data);
          };

          RequestManager.prototype.handleNotification = function (data) {
            this.requestChannel.emit("notification", data);
          };

          return RequestManager;
        }();

        exports.default = RequestManager;
      }, {
        "events": 1
      }],
      103: [function (require, module, exports) {
        "use strict";

        var __importDefault = this && this.__importDefault || function (mod) {
          return mod && mod.__esModule ? mod : {
            "default": mod
          };
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.PostMessageIframeTransport = exports.PostMessageWindowTransport = exports.JSONRPCError = exports.WebSocketTransport = exports.EventEmitterTransport = exports.HTTPTransport = exports.RequestManager = exports.Client = void 0;

        var RequestManager_1 = __importDefault(require("./RequestManager"));

        exports.RequestManager = RequestManager_1.default;

        var EventEmitterTransport_1 = __importDefault(require("./transports/EventEmitterTransport"));

        exports.EventEmitterTransport = EventEmitterTransport_1.default;

        var HTTPTransport_1 = __importDefault(require("./transports/HTTPTransport"));

        exports.HTTPTransport = HTTPTransport_1.default;

        var WebSocketTransport_1 = __importDefault(require("./transports/WebSocketTransport"));

        exports.WebSocketTransport = WebSocketTransport_1.default;

        var PostMessageWindowTransport_1 = __importDefault(require("./transports/PostMessageWindowTransport"));

        exports.PostMessageWindowTransport = PostMessageWindowTransport_1.default;

        var PostMessageIframeTransport_1 = __importDefault(require("./transports/PostMessageIframeTransport"));

        exports.PostMessageIframeTransport = PostMessageIframeTransport_1.default;

        var Error_1 = require("./Error");

        Object.defineProperty(exports, "JSONRPCError", {
          enumerable: true,
          get: function () {
            return Error_1.JSONRPCError;
          }
        });

        var Client_1 = __importDefault(require("./Client"));

        exports.Client = Client_1.default;
        exports.default = Client_1.default;
      }, {
        "./Client": 99,
        "./Error": 100,
        "./RequestManager": 102,
        "./transports/EventEmitterTransport": 104,
        "./transports/HTTPTransport": 105,
        "./transports/PostMessageIframeTransport": 106,
        "./transports/PostMessageWindowTransport": 107,
        "./transports/WebSocketTransport": 110
      }],
      104: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var Transport_1 = require("./Transport");

        var Request_1 = require("../Request");

        var Error_1 = require("../Error");

        var EventEmitterTransport =
        /** @class */
        function (_super) {
          __extends(EventEmitterTransport, _super);

          function EventEmitterTransport(destEmitter, reqUri, resUri) {
            var _this = _super.call(this) || this;

            _this.connection = destEmitter;
            _this.reqUri = reqUri;
            _this.resUri = resUri;
            return _this;
          }

          EventEmitterTransport.prototype.connect = function () {
            var _this = this;

            this.connection.on(this.resUri, function (data) {
              _this.transportRequestManager.resolveResponse(data);
            });
            return Promise.resolve();
          };

          EventEmitterTransport.prototype.sendData = function (data, timeout) {
            if (timeout === void 0) {
              timeout = null;
            }

            var prom = this.transportRequestManager.addRequest(data, timeout);
            var notifications = Request_1.getNotifications(data);
            var parsedData = this.parseData(data);

            try {
              this.connection.emit(this.reqUri, parsedData);
              this.transportRequestManager.settlePendingRequest(notifications);
              return prom;
            } catch (e) {
              var responseErr = new Error_1.JSONRPCError(e.message, Error_1.ERR_UNKNOWN, e);
              this.transportRequestManager.settlePendingRequest(notifications, responseErr);
              return Promise.reject(responseErr);
            }
          };

          EventEmitterTransport.prototype.close = function () {
            this.connection.removeAllListeners();
          };

          return EventEmitterTransport;
        }(Transport_1.Transport);

        exports.default = EventEmitterTransport;
      }, {
        "../Error": 100,
        "../Request": 101,
        "./Transport": 108
      }],
      105: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        var __importDefault = this && this.__importDefault || function (mod) {
          return mod && mod.__esModule ? mod : {
            "default": mod
          };
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.HTTPTransport = void 0;

        var isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));

        var Transport_1 = require("./Transport");

        var Request_1 = require("../Request");

        var Error_1 = require("../Error");

        var HTTPTransport =
        /** @class */
        function (_super) {
          __extends(HTTPTransport, _super);

          function HTTPTransport(uri, options) {
            var _this = _super.call(this) || this;

            _this.onlyNotifications = function (data) {
              if (data instanceof Array) {
                return data.every(function (datum) {
                  return datum.request.request.id === null || datum.request.request.id === undefined;
                });
              }

              return data.request.id === null || data.request.id === undefined;
            };

            _this.uri = uri;
            _this.credentials = options && options.credentials;
            _this.headers = HTTPTransport.setupHeaders(options && options.headers);
            _this.injectedFetcher = options === null || options === void 0 ? void 0 : options.fetcher;
            return _this;
          }

          HTTPTransport.prototype.connect = function () {
            return Promise.resolve();
          };

          HTTPTransport.prototype.sendData = function (data, timeout) {
            if (timeout === void 0) {
              timeout = null;
            }

            return __awaiter(this, void 0, void 0, function () {
              var prom, notifications, batch, fetcher, result, body, responseErr, e_1, responseErr;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    prom = this.transportRequestManager.addRequest(data, timeout);
                    notifications = Request_1.getNotifications(data);
                    batch = Request_1.getBatchRequests(data);
                    fetcher = this.injectedFetcher || isomorphic_fetch_1.default;
                    _a.label = 1;

                  case 1:
                    _a.trys.push([1, 4,, 5]);

                    return [4
                    /*yield*/
                    , fetcher(this.uri, {
                      method: "POST",
                      headers: this.headers,
                      body: JSON.stringify(this.parseData(data)),
                      credentials: this.credentials
                    })];

                  case 2:
                    result = _a.sent(); // requirements are that notifications are successfully sent

                    this.transportRequestManager.settlePendingRequest(notifications);

                    if (this.onlyNotifications(data)) {
                      return [2
                      /*return*/
                      , Promise.resolve()];
                    }

                    return [4
                    /*yield*/
                    , result.text()];

                  case 3:
                    body = _a.sent();
                    responseErr = this.transportRequestManager.resolveResponse(body);

                    if (responseErr) {
                      // requirements are that batch requuests are successfully resolved
                      // this ensures that individual requests within the batch request are settled
                      this.transportRequestManager.settlePendingRequest(batch, responseErr);
                      return [2
                      /*return*/
                      , Promise.reject(responseErr)];
                    }

                    return [3
                    /*break*/
                    , 5];

                  case 4:
                    e_1 = _a.sent();
                    responseErr = new Error_1.JSONRPCError(e_1.message, Error_1.ERR_UNKNOWN, e_1);
                    this.transportRequestManager.settlePendingRequest(notifications, responseErr);
                    this.transportRequestManager.settlePendingRequest(Request_1.getBatchRequests(data), responseErr);
                    return [2
                    /*return*/
                    , Promise.reject(responseErr)];

                  case 5:
                    return [2
                    /*return*/
                    , prom];
                }
              });
            });
          }; // tslint:disable-next-line:no-empty


          HTTPTransport.prototype.close = function () {};

          HTTPTransport.setupHeaders = function (headerOptions) {
            var headers = new Headers(headerOptions); // Overwrite header options to ensure correct content type.

            headers.set("Content-Type", "application/json");
            return headers;
          };

          return HTTPTransport;
        }(Transport_1.Transport);

        exports.HTTPTransport = HTTPTransport;
        exports.default = HTTPTransport;
      }, {
        "../Error": 100,
        "../Request": 101,
        "./Transport": 108,
        "isomorphic-fetch": 118
      }],
      106: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var Transport_1 = require("./Transport");

        var Request_1 = require("../Request");

        var PostMessageIframeTransport =
        /** @class */
        function (_super) {
          __extends(PostMessageIframeTransport, _super);

          function PostMessageIframeTransport(uri) {
            var _this = _super.call(this) || this;

            _this.messageHandler = function (ev) {
              _this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
            };

            _this.uri = uri;
            _this.postMessageID = "post-message-transport-" + Math.random();
            return _this;
          }

          PostMessageIframeTransport.prototype.createWindow = function (uri) {
            var _this = this;

            return new Promise(function (resolve, reject) {
              var frame;
              var iframe = document.createElement("iframe");
              iframe.setAttribute("id", _this.postMessageID);
              iframe.setAttribute("width", "0px");
              iframe.setAttribute("height", "0px");
              iframe.setAttribute("style", "visiblity:hidden;border:none;outline:none;");
              iframe.addEventListener("load", function () {
                resolve(frame);
              });
              iframe.setAttribute("src", uri);
              window.document.body.appendChild(iframe);
              frame = iframe.contentWindow;
            });
          };

          PostMessageIframeTransport.prototype.connect = function () {
            var _this = this;

            var urlRegex = /^(http|https):\/\/.*$/;
            return new Promise(function (resolve, reject) {
              return __awaiter(_this, void 0, void 0, function () {
                var _a;

                return __generator(this, function (_b) {
                  switch (_b.label) {
                    case 0:
                      if (!urlRegex.test(this.uri)) {
                        reject(new Error("Bad URI"));
                      }

                      _a = this;
                      return [4
                      /*yield*/
                      , this.createWindow(this.uri)];

                    case 1:
                      _a.frame = _b.sent();
                      window.addEventListener("message", this.messageHandler);
                      resolve();
                      return [2
                      /*return*/
                      ];
                  }
                });
              });
            });
          };

          PostMessageIframeTransport.prototype.sendData = function (data, timeout) {
            if (timeout === void 0) {
              timeout = 5000;
            }

            return __awaiter(this, void 0, void 0, function () {
              var prom, notifications;
              return __generator(this, function (_a) {
                prom = this.transportRequestManager.addRequest(data, null);
                notifications = Request_1.getNotifications(data);

                if (this.frame) {
                  this.frame.postMessage(data.request, "*");
                  this.transportRequestManager.settlePendingRequest(notifications);
                }

                return [2
                /*return*/
                , prom];
              });
            });
          };

          PostMessageIframeTransport.prototype.close = function () {
            var el = document.getElementById(this.postMessageID);
            el === null || el === void 0 ? void 0 : el.remove();
            window.removeEventListener("message", this.messageHandler);
          };

          return PostMessageIframeTransport;
        }(Transport_1.Transport);

        exports.default = PostMessageIframeTransport;
      }, {
        "../Request": 101,
        "./Transport": 108
      }],
      107: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var Transport_1 = require("./Transport");

        var Request_1 = require("../Request");

        var openPopup = function (url) {
          var width = 400;
          var height = window.screen.height;
          var left = 0;
          var top = 0;
          return window.open(url, "inspector:popup", "left=" + left + ",top=" + top + ",width=" + width + ",height=" + height + ",resizable,scrollbars=yes,status=1");
        };

        var PostMessageTransport =
        /** @class */
        function (_super) {
          __extends(PostMessageTransport, _super);

          function PostMessageTransport(uri) {
            var _this = _super.call(this) || this;

            _this.messageHandler = function (ev) {
              _this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
            };

            _this.uri = uri;
            _this.postMessageID = "post-message-transport-" + Math.random();
            return _this;
          }

          PostMessageTransport.prototype.createWindow = function (uri) {
            return new Promise(function (resolve, reject) {
              var frame;
              frame = openPopup(uri);
              setTimeout(function () {
                resolve(frame);
              }, 3000);
            });
          };

          PostMessageTransport.prototype.connect = function () {
            var _this = this;

            var urlRegex = /^(http|https):\/\/.*$/;
            return new Promise(function (resolve, reject) {
              return __awaiter(_this, void 0, void 0, function () {
                var _a;

                return __generator(this, function (_b) {
                  switch (_b.label) {
                    case 0:
                      if (!urlRegex.test(this.uri)) {
                        reject(new Error("Bad URI"));
                      }

                      _a = this;
                      return [4
                      /*yield*/
                      , this.createWindow(this.uri)];

                    case 1:
                      _a.frame = _b.sent();
                      window.addEventListener("message", this.messageHandler);
                      resolve();
                      return [2
                      /*return*/
                      ];
                  }
                });
              });
            });
          };

          PostMessageTransport.prototype.sendData = function (data, timeout) {
            if (timeout === void 0) {
              timeout = 5000;
            }

            return __awaiter(this, void 0, void 0, function () {
              var prom, notifications;
              return __generator(this, function (_a) {
                prom = this.transportRequestManager.addRequest(data, null);
                notifications = Request_1.getNotifications(data);

                if (this.frame) {
                  this.frame.postMessage(data.request, this.uri);
                  this.transportRequestManager.settlePendingRequest(notifications);
                }

                return [2
                /*return*/
                , prom];
              });
            });
          };

          PostMessageTransport.prototype.close = function () {
            if (this.frame) {
              window.removeEventListener("message", this.messageHandler);
              this.frame.close();
            }
          };

          return PostMessageTransport;
        }(Transport_1.Transport);

        exports.default = PostMessageTransport;
      }, {
        "../Request": 101,
        "./Transport": 108
      }],
      108: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.Transport = void 0;

        var TransportRequestManager_1 = require("./TransportRequestManager");

        var Transport =
        /** @class */
        function () {
          function Transport() {
            this.transportRequestManager = new TransportRequestManager_1.TransportRequestManager(); // add a noop for the error event to not require handling the error event
            // tslint:disable-next-line:no-empty

            this.transportRequestManager.transportEventChannel.on("error", function () {});
          }

          Transport.prototype.subscribe = function (event, handler) {
            this.transportRequestManager.transportEventChannel.addListener(event, handler);
          };

          Transport.prototype.unsubscribe = function (event, handler) {
            if (!event) {
              return this.transportRequestManager.transportEventChannel.removeAllListeners();
            }

            if (event && handler) {
              this.transportRequestManager.transportEventChannel.removeListener(event, handler);
            }
          };

          Transport.prototype.parseData = function (data) {
            if (data instanceof Array) {
              return data.map(function (batch) {
                return batch.request.request;
              });
            }

            return data.request;
          };

          return Transport;
        }();

        exports.Transport = Transport;
      }, {
        "./TransportRequestManager": 109
      }],
      109: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.TransportRequestManager = void 0;

        var events_1 = require("events");

        var Error_1 = require("../Error");

        var TransportRequestManager =
        /** @class */
        function () {
          function TransportRequestManager() {
            this.pendingRequest = {};
            this.pendingBatchRequest = {};
            this.transportEventChannel = new events_1.EventEmitter();
          }

          TransportRequestManager.prototype.addRequest = function (data, timeout) {
            this.transportEventChannel.emit("pending", data);

            if (data instanceof Array) {
              this.addBatchReq(data, timeout);
              return Promise.resolve();
            }

            return this.addReq(data.internalID, timeout);
          };

          TransportRequestManager.prototype.settlePendingRequest = function (request, error) {
            var _this = this;

            request.forEach(function (req) {
              var resolver = _this.pendingRequest[req.internalID];
              delete _this.pendingBatchRequest[req.internalID];

              if (resolver === undefined) {
                return;
              }

              if (error) {
                resolver.reject(error);
                return;
              }

              resolver.resolve(); // Notifications have no response and should clear their own pending requests

              if (req.request.id === null || req.request.id === undefined) {
                delete _this.pendingRequest[req.internalID];
              }
            });
          };

          TransportRequestManager.prototype.isPendingRequest = function (id) {
            return this.pendingRequest.hasOwnProperty(id);
          };

          TransportRequestManager.prototype.resolveResponse = function (payload, emitError) {
            if (emitError === void 0) {
              emitError = true;
            }

            var data = payload;

            try {
              data = JSON.parse(payload);

              if (this.checkJSONRPC(data) === false) {
                return; // ignore messages that are not conforming to JSON-RPC
              }

              if (data instanceof Array) {
                return this.resolveBatch(data, emitError);
              }

              return this.resolveRes(data, emitError);
            } catch (e) {
              var err = new Error_1.JSONRPCError("Bad response format", Error_1.ERR_UNKNOWN, payload);

              if (emitError) {
                this.transportEventChannel.emit("error", err);
              }

              return err;
            }
          };

          TransportRequestManager.prototype.addBatchReq = function (batches, timeout) {
            var _this = this;

            batches.forEach(function (batch) {
              var resolve = batch.resolve,
                  reject = batch.reject;
              var internalID = batch.request.internalID;
              _this.pendingBatchRequest[internalID] = true;
              _this.pendingRequest[internalID] = {
                resolve: resolve,
                reject: reject
              };
            });
            return Promise.resolve();
          };

          TransportRequestManager.prototype.addReq = function (id, timeout) {
            var _this = this;

            return new Promise(function (resolve, reject) {
              if (timeout !== null && timeout) {
                _this.setRequestTimeout(id, timeout, reject);
              }

              _this.pendingRequest[id] = {
                resolve: resolve,
                reject: reject
              };
            });
          };

          TransportRequestManager.prototype.checkJSONRPC = function (data) {
            var payload = [data];

            if (data instanceof Array) {
              payload = data;
            }

            return payload.every(function (datum) {
              return datum.result !== undefined || datum.error !== undefined || datum.method !== undefined;
            });
          };

          TransportRequestManager.prototype.processResult = function (payload, prom) {
            if (payload.error) {
              var err = Error_1.convertJSONToRPCError(payload);
              prom.reject(err);
              return;
            }

            prom.resolve(payload.result);
          };

          TransportRequestManager.prototype.resolveBatch = function (payload, emitError) {
            var _this = this;

            var results = payload.map(function (datum) {
              return _this.resolveRes(datum, emitError);
            });
            var errors = results.filter(function (result) {
              return result;
            });

            if (errors.length > 0) {
              return errors[0];
            }

            return undefined;
          };

          TransportRequestManager.prototype.resolveRes = function (data, emitError) {
            var id = data.id,
                error = data.error;
            var status = this.pendingRequest[id];

            if (status) {
              delete this.pendingRequest[id];
              this.processResult(data, status);
              this.transportEventChannel.emit("response", data);
              return;
            }

            if (id === undefined && error === undefined) {
              this.transportEventChannel.emit("notification", data);
              return;
            }

            var err;

            if (error) {
              err = Error_1.convertJSONToRPCError(data);
            }

            if (emitError && error && err) {
              this.transportEventChannel.emit("error", err);
            }

            return err;
          };

          TransportRequestManager.prototype.setRequestTimeout = function (id, timeout, reject) {
            var _this = this;

            setTimeout(function () {
              delete _this.pendingRequest[id];
              reject(new Error_1.JSONRPCError("Request timeout request took longer than " + timeout + " ms to resolve", Error_1.ERR_TIMEOUT));
            }, timeout);
          };

          return TransportRequestManager;
        }();

        exports.TransportRequestManager = TransportRequestManager;
      }, {
        "../Error": 100,
        "events": 1
      }],
      110: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        var __importDefault = this && this.__importDefault || function (mod) {
          return mod && mod.__esModule ? mod : {
            "default": mod
          };
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));

        var Transport_1 = require("./Transport");

        var Request_1 = require("../Request");

        var Error_1 = require("../Error");

        var WebSocketTransport =
        /** @class */
        function (_super) {
          __extends(WebSocketTransport, _super);

          function WebSocketTransport(uri) {
            var _this = _super.call(this) || this;

            _this.uri = uri;
            _this.connection = new isomorphic_ws_1.default(uri);
            return _this;
          }

          WebSocketTransport.prototype.connect = function () {
            var _this = this;

            return new Promise(function (resolve, reject) {
              var cb = function () {
                _this.connection.removeEventListener("open", cb);

                resolve();
              };

              _this.connection.addEventListener("open", cb);

              _this.connection.addEventListener("message", function (message) {
                var data = message.data;

                _this.transportRequestManager.resolveResponse(data);
              });
            });
          };

          WebSocketTransport.prototype.sendData = function (data, timeout) {
            if (timeout === void 0) {
              timeout = 5000;
            }

            return __awaiter(this, void 0, void 0, function () {
              var prom, notifications, jsonError;
              return __generator(this, function (_a) {
                prom = this.transportRequestManager.addRequest(data, timeout);
                notifications = Request_1.getNotifications(data);

                try {
                  this.connection.send(JSON.stringify(this.parseData(data)));
                  this.transportRequestManager.settlePendingRequest(notifications);
                } catch (err) {
                  jsonError = new Error_1.JSONRPCError(err.message, Error_1.ERR_UNKNOWN, err);
                  this.transportRequestManager.settlePendingRequest(notifications, jsonError);
                  this.transportRequestManager.settlePendingRequest(Request_1.getBatchRequests(data), jsonError);
                  prom = Promise.reject(jsonError);
                }

                return [2
                /*return*/
                , prom];
              });
            });
          };

          WebSocketTransport.prototype.close = function () {
            this.connection.close();
          };

          return WebSocketTransport;
        }(Transport_1.Transport);

        exports.default = WebSocketTransport;
      }, {
        "../Error": 100,
        "../Request": 101,
        "./Transport": 108,
        "isomorphic-ws": 119
      }],
      111: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.assertNumber = assertNumber;
        exports.utils = exports.utf8 = exports.stringToBytes = exports.str = exports.hex = exports.bytesToString = exports.bytes = exports.bech32m = exports.bech32 = exports.base64url = exports.base64 = exports.base58xrp = exports.base58xmr = exports.base58flickr = exports.base58check = exports.base58 = exports.base32hex = exports.base32crockford = exports.base32 = exports.base16 = void 0;
        /*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */

        function assertNumber(n) {
          if (!Number.isSafeInteger(n)) throw new Error(`Wrong integer: ${n}`);
        }

        function chain(...args) {
          const wrap = (a, b) => c => a(b(c));

          const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
          const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
          return {
            encode,
            decode
          };
        }

        function alphabet(alphabet) {
          return {
            encode: digits => {
              if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('alphabet.encode input should be an array of numbers');
              return digits.map(i => {
                assertNumber(i);
                if (i < 0 || i >= alphabet.length) throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`);
                return alphabet[i];
              });
            },
            decode: input => {
              if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('alphabet.decode input should be array of strings');
              return input.map(letter => {
                if (typeof letter !== 'string') throw new Error(`alphabet.decode: not string element=${letter}`);
                const index = alphabet.indexOf(letter);
                if (index === -1) throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`);
                return index;
              });
            }
          };
        }

        function join(separator = '') {
          if (typeof separator !== 'string') throw new Error('join separator should be string');
          return {
            encode: from => {
              if (!Array.isArray(from) || from.length && typeof from[0] !== 'string') throw new Error('join.encode input should be array of strings');

              for (let i of from) if (typeof i !== 'string') throw new Error(`join.encode: non-string input=${i}`);

              return from.join(separator);
            },
            decode: to => {
              if (typeof to !== 'string') throw new Error('join.decode input should be string');
              return to.split(separator);
            }
          };
        }

        function padding(bits, chr = '=') {
          assertNumber(bits);
          if (typeof chr !== 'string') throw new Error('padding chr should be string');
          return {
            encode(data) {
              if (!Array.isArray(data) || data.length && typeof data[0] !== 'string') throw new Error('padding.encode input should be array of strings');

              for (let i of data) if (typeof i !== 'string') throw new Error(`padding.encode: non-string input=${i}`);

              while (data.length * bits % 8) data.push(chr);

              return data;
            },

            decode(input) {
              if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('padding.encode input should be array of strings');

              for (let i of input) if (typeof i !== 'string') throw new Error(`padding.decode: non-string input=${i}`);

              let end = input.length;
              if (end * bits % 8) throw new Error('Invalid padding: string should have whole number of bytes');

              for (; end > 0 && input[end - 1] === chr; end--) {
                if (!((end - 1) * bits % 8)) throw new Error('Invalid padding: string has too much padding');
              }

              return input.slice(0, end);
            }

          };
        }

        function normalize(fn) {
          if (typeof fn !== 'function') throw new Error('normalize fn should be function');
          return {
            encode: from => from,
            decode: to => fn(to)
          };
        }

        function convertRadix(data, from, to) {
          if (from < 2) throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
          if (to < 2) throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
          if (!Array.isArray(data)) throw new Error('convertRadix: data should be array');
          if (!data.length) return [];
          let pos = 0;
          const res = [];
          const digits = Array.from(data);
          digits.forEach(d => {
            assertNumber(d);
            if (d < 0 || d >= from) throw new Error(`Wrong integer: ${d}`);
          });

          while (true) {
            let carry = 0;
            let done = true;

            for (let i = pos; i < digits.length; i++) {
              const digit = digits[i];
              const digitBase = from * carry + digit;

              if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
                throw new Error('convertRadix: carry overflow');
              }

              carry = digitBase % to;
              digits[i] = Math.floor(digitBase / to);
              if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase) throw new Error('convertRadix: carry overflow');
              if (!done) continue;else if (!digits[i]) pos = i;else done = false;
            }

            res.push(carry);
            if (done) break;
          }

          for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);

          return res.reverse();
        }

        const gcd = (a, b) => !b ? a : gcd(b, a % b);

        const radix2carry = (from, to) => from + (to - gcd(from, to));

        function convertRadix2(data, from, to, padding) {
          if (!Array.isArray(data)) throw new Error('convertRadix2: data should be array');
          if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`);
          if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`);

          if (radix2carry(from, to) > 32) {
            throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
          }

          let carry = 0;
          let pos = 0;
          const mask = 2 ** to - 1;
          const res = [];

          for (const n of data) {
            assertNumber(n);
            if (n >= 2 ** from) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
            carry = carry << from | n;
            if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
            pos += from;

            for (; pos >= to; pos -= to) res.push((carry >> pos - to & mask) >>> 0);

            carry &= 2 ** pos - 1;
          }

          carry = carry << to - pos & mask;
          if (!padding && pos >= from) throw new Error('Excess padding');
          if (!padding && carry) throw new Error(`Non-zero padding: ${carry}`);
          if (padding && pos > 0) res.push(carry >>> 0);
          return res;
        }

        function radix(num) {
          assertNumber(num);
          return {
            encode: bytes => {
              if (!(bytes instanceof Uint8Array)) throw new Error('radix.encode input should be Uint8Array');
              return convertRadix(Array.from(bytes), 2 ** 8, num);
            },
            decode: digits => {
              if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix.decode input should be array of strings');
              return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
            }
          };
        }

        function radix2(bits, revPadding = false) {
          assertNumber(bits);
          if (bits <= 0 || bits > 32) throw new Error('radix2: bits should be in (0..32]');
          if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32) throw new Error('radix2: carry overflow');
          return {
            encode: bytes => {
              if (!(bytes instanceof Uint8Array)) throw new Error('radix2.encode input should be Uint8Array');
              return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
            },
            decode: digits => {
              if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix2.decode input should be array of strings');
              return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
            }
          };
        }

        function unsafeWrapper(fn) {
          if (typeof fn !== 'function') throw new Error('unsafeWrapper fn should be function');
          return function (...args) {
            try {
              return fn.apply(null, args);
            } catch (e) {}
          };
        }

        function checksum(len, fn) {
          assertNumber(len);
          if (typeof fn !== 'function') throw new Error('checksum fn should be function');
          return {
            encode(data) {
              if (!(data instanceof Uint8Array)) throw new Error('checksum.encode: input should be Uint8Array');
              const checksum = fn(data).slice(0, len);
              const res = new Uint8Array(data.length + len);
              res.set(data);
              res.set(checksum, data.length);
              return res;
            },

            decode(data) {
              if (!(data instanceof Uint8Array)) throw new Error('checksum.decode: input should be Uint8Array');
              const payload = data.slice(0, -len);
              const newChecksum = fn(payload).slice(0, len);
              const oldChecksum = data.slice(-len);

              for (let i = 0; i < len; i++) if (newChecksum[i] !== oldChecksum[i]) throw new Error('Invalid checksum');

              return payload;
            }

          };
        }

        const utils = {
          alphabet,
          chain,
          checksum,
          radix,
          radix2,
          join,
          padding
        };
        exports.utils = utils;
        const base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''));
        exports.base16 = base16;
        const base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''));
        exports.base32 = base32;
        const base32hex = chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''));
        exports.base32hex = base32hex;
        const base32crockford = chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize(s => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')));
        exports.base32crockford = base32crockford;
        const base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''));
        exports.base64 = base64;
        const base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''));
        exports.base64url = base64url;

        const genBase58 = abc => chain(radix(58), alphabet(abc), join(''));

        const base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
        exports.base58 = base58;
        const base58flickr = genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');
        exports.base58flickr = base58flickr;
        const base58xrp = genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');
        exports.base58xrp = base58xrp;
        const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
        const base58xmr = {
          encode(data) {
            let res = '';

            for (let i = 0; i < data.length; i += 8) {
              const block = data.subarray(i, i + 8);
              res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1');
            }

            return res;
          },

          decode(str) {
            let res = [];

            for (let i = 0; i < str.length; i += 11) {
              const slice = str.slice(i, i + 11);
              const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
              const block = base58.decode(slice);

              for (let j = 0; j < block.length - blockLen; j++) {
                if (block[j] !== 0) throw new Error('base58xmr: wrong padding');
              }

              res = res.concat(Array.from(block.slice(block.length - blockLen)));
            }

            return Uint8Array.from(res);
          }

        };
        exports.base58xmr = base58xmr;

        const base58check = sha256 => chain(checksum(4, data => sha256(sha256(data))), base58);

        exports.base58check = base58check;
        const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''));
        const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

        function bech32Polymod(pre) {
          const b = pre >> 25;
          let chk = (pre & 0x1ffffff) << 5;

          for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
            if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
          }

          return chk;
        }

        function bechChecksum(prefix, words, encodingConst = 1) {
          const len = prefix.length;
          let chk = 1;

          for (let i = 0; i < len; i++) {
            const c = prefix.charCodeAt(i);
            if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
            chk = bech32Polymod(chk) ^ c >> 5;
          }

          chk = bech32Polymod(chk);

          for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 0x1f;

          for (let v of words) chk = bech32Polymod(chk) ^ v;

          for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);

          chk ^= encodingConst;
          return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
        }

        function genBech32(encoding) {
          const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;

          const _words = radix2(5);

          const fromWords = _words.decode;
          const toWords = _words.encode;
          const fromWordsUnsafe = unsafeWrapper(fromWords);

          function encode(prefix, words, limit = 90) {
            if (typeof prefix !== 'string') throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
            if (!Array.isArray(words) || words.length && typeof words[0] !== 'number') throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
            const actualLength = prefix.length + 7 + words.length;
            if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
            prefix = prefix.toLowerCase();
            return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
          }

          function decode(str, limit = 90) {
            if (typeof str !== 'string') throw new Error(`bech32.decode input should be string, not ${typeof str}`);
            if (str.length < 8 || limit !== false && str.length > limit) throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
            const lowered = str.toLowerCase();
            if (str !== lowered && str !== str.toUpperCase()) throw new Error(`String must be lowercase or uppercase`);
            str = lowered;
            const sepIndex = str.lastIndexOf('1');
            if (sepIndex === 0 || sepIndex === -1) throw new Error(`Letter "1" must be present between prefix and data only`);
            const prefix = str.slice(0, sepIndex);

            const _words = str.slice(sepIndex + 1);

            if (_words.length < 6) throw new Error('Data must be at least 6 characters long');
            const words = BECH_ALPHABET.decode(_words).slice(0, -6);
            const sum = bechChecksum(prefix, words, ENCODING_CONST);
            if (!_words.endsWith(sum)) throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
            return {
              prefix,
              words
            };
          }

          const decodeUnsafe = unsafeWrapper(decode);

          function decodeToBytes(str) {
            const {
              prefix,
              words
            } = decode(str, false);
            return {
              prefix,
              words,
              bytes: fromWords(words)
            };
          }

          return {
            encode,
            decode,
            decodeToBytes,
            decodeUnsafe,
            fromWords,
            fromWordsUnsafe,
            toWords
          };
        }

        const bech32 = genBech32('bech32');
        exports.bech32 = bech32;
        const bech32m = genBech32('bech32m');
        exports.bech32m = bech32m;
        const utf8 = {
          encode: data => new TextDecoder().decode(data),
          decode: str => new TextEncoder().encode(str)
        };
        exports.utf8 = utf8;
        const hex = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize(s => {
          if (typeof s !== 'string' || s.length % 2) throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
          return s.toLowerCase();
        }));
        exports.hex = hex;
        const CODERS = {
          utf8,
          hex,
          base16,
          base32,
          base64,
          base64url,
          base58,
          base58xmr
        };
        const coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(', ')}`;

        const bytesToString = (type, bytes) => {
          if (typeof type !== 'string' || !CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
          if (!(bytes instanceof Uint8Array)) throw new TypeError('bytesToString() expects Uint8Array');
          return CODERS[type].encode(bytes);
        };

        exports.bytesToString = bytesToString;
        const str = bytesToString;
        exports.str = str;

        const stringToBytes = (type, str) => {
          if (!CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
          if (typeof str !== 'string') throw new TypeError('stringToBytes() expects string');
          return CODERS[type].decode(str);
        };

        exports.stringToBytes = stringToBytes;
        const bytes = stringToBytes;
        exports.bytes = bytes;
      }, {}],
      112: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.HDKey = exports.HARDENED_OFFSET = void 0;

        var _hmac = require("@noble/hashes/hmac");

        var _ripemd = require("@noble/hashes/ripemd160");

        var _sha = require("@noble/hashes/sha256");

        var _sha2 = require("@noble/hashes/sha512");

        var _assert = require("@noble/hashes/_assert");

        var _utils = require("@noble/hashes/utils");

        var _secp256k = require("@noble/curves/secp256k1");

        var _modular = require("@noble/curves/abstract/modular");

        var _base = require("@scure/base");

        const Point = _secp256k.secp256k1.ProjectivePoint;
        const base58check = (0, _base.base58check)(_sha.sha256);

        function bytesToNumber(bytes) {
          return BigInt(`0x${(0, _utils.bytesToHex)(bytes)}`);
        }

        function numberToBytes(num) {
          return (0, _utils.hexToBytes)(num.toString(16).padStart(64, '0'));
        }

        const MASTER_SECRET = (0, _utils.utf8ToBytes)('Bitcoin seed');
        const BITCOIN_VERSIONS = {
          private: 0x0488ade4,
          public: 0x0488b21e
        };
        const HARDENED_OFFSET = 0x80000000;
        exports.HARDENED_OFFSET = HARDENED_OFFSET;

        const hash160 = data => (0, _ripemd.ripemd160)((0, _sha.sha256)(data));

        const fromU32 = data => (0, _utils.createView)(data).getUint32(0, false);

        const toU32 = n => {
          if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1) {
            throw new Error(`Invalid number=${n}. Should be from 0 to 2 ** 32 - 1`);
          }

          const buf = new Uint8Array(4);
          (0, _utils.createView)(buf).setUint32(0, n, false);
          return buf;
        };

        class HDKey {
          get fingerprint() {
            if (!this.pubHash) {
              throw new Error('No publicKey set!');
            }

            return fromU32(this.pubHash);
          }

          get identifier() {
            return this.pubHash;
          }

          get pubKeyHash() {
            return this.pubHash;
          }

          get privateKey() {
            return this.privKeyBytes || null;
          }

          get publicKey() {
            return this.pubKey || null;
          }

          get privateExtendedKey() {
            const priv = this.privateKey;

            if (!priv) {
              throw new Error('No private key');
            }

            return base58check.encode(this.serialize(this.versions.private, (0, _utils.concatBytes)(new Uint8Array([0]), priv)));
          }

          get publicExtendedKey() {
            if (!this.pubKey) {
              throw new Error('No public key');
            }

            return base58check.encode(this.serialize(this.versions.public, this.pubKey));
          }

          static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
            (0, _assert.bytes)(seed);

            if (8 * seed.length < 128 || 8 * seed.length > 512) {
              throw new Error(`HDKey: wrong seed length=${seed.length}. Should be between 128 and 512 bits; 256 bits is advised)`);
            }

            const I = (0, _hmac.hmac)(_sha2.sha512, MASTER_SECRET, seed);
            return new HDKey({
              versions,
              chainCode: I.slice(32),
              privateKey: I.slice(0, 32)
            });
          }

          static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
            const keyBuffer = base58check.decode(base58key);
            const keyView = (0, _utils.createView)(keyBuffer);
            const version = keyView.getUint32(0, false);
            const opt = {
              versions,
              depth: keyBuffer[4],
              parentFingerprint: keyView.getUint32(5, false),
              index: keyView.getUint32(9, false),
              chainCode: keyBuffer.slice(13, 45)
            };
            const key = keyBuffer.slice(45);
            const isPriv = key[0] === 0;

            if (version !== versions[isPriv ? 'private' : 'public']) {
              throw new Error('Version mismatch');
            }

            if (isPriv) {
              return new HDKey({ ...opt,
                privateKey: key.slice(1)
              });
            } else {
              return new HDKey({ ...opt,
                publicKey: key
              });
            }
          }

          static fromJSON(json) {
            return HDKey.fromExtendedKey(json.xpriv);
          }

          constructor(opt) {
            this.depth = 0;
            this.index = 0;
            this.chainCode = null;
            this.parentFingerprint = 0;

            if (!opt || typeof opt !== 'object') {
              throw new Error('HDKey.constructor must not be called directly');
            }

            this.versions = opt.versions || BITCOIN_VERSIONS;
            this.depth = opt.depth || 0;
            this.chainCode = opt.chainCode;
            this.index = opt.index || 0;
            this.parentFingerprint = opt.parentFingerprint || 0;

            if (!this.depth) {
              if (this.parentFingerprint || this.index) {
                throw new Error('HDKey: zero depth with non-zero index/parent fingerprint');
              }
            }

            if (opt.publicKey && opt.privateKey) {
              throw new Error('HDKey: publicKey and privateKey at same time.');
            }

            if (opt.privateKey) {
              if (!_secp256k.secp256k1.utils.isValidPrivateKey(opt.privateKey)) {
                throw new Error('Invalid private key');
              }

              this.privKey = typeof opt.privateKey === 'bigint' ? opt.privateKey : bytesToNumber(opt.privateKey);
              this.privKeyBytes = numberToBytes(this.privKey);
              this.pubKey = _secp256k.secp256k1.getPublicKey(opt.privateKey, true);
            } else if (opt.publicKey) {
              this.pubKey = Point.fromHex(opt.publicKey).toRawBytes(true);
            } else {
              throw new Error('HDKey: no public or private key provided');
            }

            this.pubHash = hash160(this.pubKey);
          }

          derive(path) {
            if (!/^[mM]'?/.test(path)) {
              throw new Error('Path must start with "m" or "M"');
            }

            if (/^[mM]'?$/.test(path)) {
              return this;
            }

            const parts = path.replace(/^[mM]'?\//, '').split('/');
            let child = this;

            for (const c of parts) {
              const m = /^(\d+)('?)$/.exec(c);

              if (!m || m.length !== 3) {
                throw new Error(`Invalid child index: ${c}`);
              }

              let idx = +m[1];

              if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
                throw new Error('Invalid index');
              }

              if (m[2] === "'") {
                idx += HARDENED_OFFSET;
              }

              child = child.deriveChild(idx);
            }

            return child;
          }

          deriveChild(index) {
            if (!this.pubKey || !this.chainCode) {
              throw new Error('No publicKey or chainCode set');
            }

            let data = toU32(index);

            if (index >= HARDENED_OFFSET) {
              const priv = this.privateKey;

              if (!priv) {
                throw new Error('Could not derive hardened child key');
              }

              data = (0, _utils.concatBytes)(new Uint8Array([0]), priv, data);
            } else {
              data = (0, _utils.concatBytes)(this.pubKey, data);
            }

            const I = (0, _hmac.hmac)(_sha2.sha512, this.chainCode, data);
            const childTweak = bytesToNumber(I.slice(0, 32));
            const chainCode = I.slice(32);

            if (!_secp256k.secp256k1.utils.isValidPrivateKey(childTweak)) {
              throw new Error('Tweak bigger than curve order');
            }

            const opt = {
              versions: this.versions,
              chainCode,
              depth: this.depth + 1,
              parentFingerprint: this.fingerprint,
              index
            };

            try {
              if (this.privateKey) {
                const added = (0, _modular.mod)(this.privKey + childTweak, _secp256k.secp256k1.CURVE.n);

                if (!_secp256k.secp256k1.utils.isValidPrivateKey(added)) {
                  throw new Error('The tweak was out of range or the resulted private key is invalid');
                }

                opt.privateKey = added;
              } else {
                const added = Point.fromHex(this.pubKey).add(Point.fromPrivateKey(childTweak));

                if (added.equals(Point.ZERO)) {
                  throw new Error('The tweak was equal to negative P, which made the result key invalid');
                }

                opt.publicKey = added.toRawBytes(true);
              }

              return new HDKey(opt);
            } catch (err) {
              return this.deriveChild(index + 1);
            }
          }

          sign(hash) {
            if (!this.privateKey) {
              throw new Error('No privateKey set!');
            }

            (0, _assert.bytes)(hash, 32);
            return _secp256k.secp256k1.sign(hash, this.privKey).toCompactRawBytes();
          }

          verify(hash, signature) {
            (0, _assert.bytes)(hash, 32);
            (0, _assert.bytes)(signature, 64);

            if (!this.publicKey) {
              throw new Error('No publicKey set!');
            }

            let sig;

            try {
              sig = _secp256k.secp256k1.Signature.fromCompact(signature);
            } catch (error) {
              return false;
            }

            return _secp256k.secp256k1.verify(sig, hash, this.publicKey);
          }

          wipePrivateData() {
            this.privKey = undefined;

            if (this.privKeyBytes) {
              this.privKeyBytes.fill(0);
              this.privKeyBytes = undefined;
            }

            return this;
          }

          toJSON() {
            return {
              xpriv: this.privateExtendedKey,
              xpub: this.publicExtendedKey
            };
          }

          serialize(version, key) {
            if (!this.chainCode) {
              throw new Error('No chainCode set');
            }

            (0, _assert.bytes)(key, 33);
            return (0, _utils.concatBytes)(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
          }

        }

        exports.HDKey = HDKey;
      }, {
        "@noble/curves/abstract/modular": 69,
        "@noble/curves/secp256k1": 72,
        "@noble/hashes/_assert": 87,
        "@noble/hashes/hmac": 93,
        "@noble/hashes/ripemd160": 95,
        "@noble/hashes/sha256": 96,
        "@noble/hashes/sha512": 97,
        "@noble/hashes/utils": 98,
        "@scure/base": 111
      }],
      113: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.mnemonicToSeedSync = exports.mnemonicToSeed = exports.validateMnemonic = exports.entropyToMnemonic = exports.mnemonicToEntropy = exports.generateMnemonic = void 0;
        /*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */

        const _assert_1 = require("@noble/hashes/_assert");

        const pbkdf2_1 = require("@noble/hashes/pbkdf2");

        const sha256_1 = require("@noble/hashes/sha256");

        const sha512_1 = require("@noble/hashes/sha512");

        const utils_1 = require("@noble/hashes/utils");

        const base_1 = require("@scure/base"); // Japanese wordlist


        const isJapanese = wordlist => wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093'; // Normalization replaces equivalent sequences of characters
        // so that any two texts that are equivalent will be reduced
        // to the same sequence of code points, called the normal form of the original text.


        function nfkd(str) {
          if (typeof str !== 'string') throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
          return str.normalize('NFKD');
        }

        function normalize(str) {
          const norm = nfkd(str);
          const words = norm.split(' ');
          if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('Invalid mnemonic');
          return {
            nfkd: norm,
            words
          };
        }

        function assertEntropy(entropy) {
          _assert_1.default.bytes(entropy, 16, 20, 24, 28, 32);
        }
        /**
         * Generate x random words. Uses Cryptographically-Secure Random Number Generator.
         * @param wordlist imported wordlist for specific language
         * @param strength mnemonic strength 128-256 bits
         * @example
         * generateMnemonic(wordlist, 128)
         * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
         */


        function generateMnemonic(wordlist, strength = 128) {
          _assert_1.default.number(strength);

          if (strength % 32 !== 0 || strength > 256) throw new TypeError('Invalid entropy');
          return entropyToMnemonic((0, utils_1.randomBytes)(strength / 8), wordlist);
        }

        exports.generateMnemonic = generateMnemonic;

        const calcChecksum = entropy => {
          // Checksum is ent.length/4 bits long
          const bitsLeft = 8 - entropy.length / 4; // Zero rightmost "bitsLeft" bits in byte
          // For example: bitsLeft=4 val=10111101 -> 10110000

          return new Uint8Array([(0, sha256_1.sha256)(entropy)[0] >> bitsLeft << bitsLeft]);
        };

        function getCoder(wordlist) {
          if (!Array.isArray(wordlist) || wordlist.length !== 2048 || typeof wordlist[0] !== 'string') throw new Error('Worlist: expected array of 2048 strings');
          wordlist.forEach(i => {
            if (typeof i !== 'string') throw new Error(`Wordlist: non-string element: ${i}`);
          });
          return base_1.utils.chain(base_1.utils.checksum(1, calcChecksum), base_1.utils.radix2(11, true), base_1.utils.alphabet(wordlist));
        }
        /**
         * Reversible: Converts mnemonic string to raw entropy in form of byte array.
         * @param mnemonic 12-24 words
         * @param wordlist imported wordlist for specific language
         * @example
         * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
         * mnemonicToEntropy(mnem, wordlist)
         * // Produces
         * new Uint8Array([
         *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
         *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
         * ])
         */


        function mnemonicToEntropy(mnemonic, wordlist) {
          const {
            words
          } = normalize(mnemonic);
          const entropy = getCoder(wordlist).decode(words);
          assertEntropy(entropy);
          return entropy;
        }

        exports.mnemonicToEntropy = mnemonicToEntropy;
        /**
         * Reversible: Converts raw entropy in form of byte array to mnemonic string.
         * @param entropy byte array
         * @param wordlist imported wordlist for specific language
         * @returns 12-24 words
         * @example
         * const ent = new Uint8Array([
         *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
         *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
         * ]);
         * entropyToMnemonic(ent, wordlist);
         * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
         */

        function entropyToMnemonic(entropy, wordlist) {
          assertEntropy(entropy);
          const words = getCoder(wordlist).encode(entropy);
          return words.join(isJapanese(wordlist) ? '\u3000' : ' ');
        }

        exports.entropyToMnemonic = entropyToMnemonic;
        /**
         * Validates mnemonic for being 12-24 words contained in `wordlist`.
         */

        function validateMnemonic(mnemonic, wordlist) {
          try {
            mnemonicToEntropy(mnemonic, wordlist);
          } catch (e) {
            return false;
          }

          return true;
        }

        exports.validateMnemonic = validateMnemonic;

        const salt = passphrase => nfkd(`mnemonic${passphrase}`);
        /**
         * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
         * @param mnemonic 12-24 words
         * @param passphrase string that will additionally protect the key
         * @returns 64 bytes of key data
         * @example
         * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
         * await mnemonicToSeed(mnem, 'password');
         * // new Uint8Array([...64 bytes])
         */


        function mnemonicToSeed(mnemonic, passphrase = '') {
          return (0, pbkdf2_1.pbkdf2Async)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), {
            c: 2048,
            dkLen: 64
          });
        }

        exports.mnemonicToSeed = mnemonicToSeed;
        /**
         * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
         * @param mnemonic 12-24 words
         * @param passphrase string that will additionally protect the key
         * @returns 64 bytes of key data
         * @example
         * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
         * mnemonicToSeedSync(mnem, 'password');
         * // new Uint8Array([...64 bytes])
         */

        function mnemonicToSeedSync(mnemonic, passphrase = '') {
          return (0, pbkdf2_1.pbkdf2)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), {
            c: 2048,
            dkLen: 64
          });
        }

        exports.mnemonicToSeedSync = mnemonicToSeedSync;
      }, {
        "@noble/hashes/_assert": 87,
        "@noble/hashes/pbkdf2": 94,
        "@noble/hashes/sha256": 96,
        "@noble/hashes/sha512": 97,
        "@noble/hashes/utils": 98,
        "@scure/base": 111
      }],
      114: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.wordlist = void 0;
        exports.wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split('\n');
      }, {}],
      115: [function (require, module, exports) {
        'use strict'; // base-x encoding / decoding
        // Copyright (c) 2018 base-x contributors
        // Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
        // Distributed under the MIT software license, see the accompanying
        // file LICENSE or http://www.opensource.org/licenses/mit-license.php.

        function base(ALPHABET) {
          if (ALPHABET.length >= 255) {
            throw new TypeError('Alphabet too long');
          }

          var BASE_MAP = new Uint8Array(256);

          for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255;
          }

          for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);

            if (BASE_MAP[xc] !== 255) {
              throw new TypeError(x + ' is ambiguous');
            }

            BASE_MAP[xc] = i;
          }

          var BASE = ALPHABET.length;
          var LEADER = ALPHABET.charAt(0);
          var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up

          var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up

          function encode(source) {
            if (source instanceof Uint8Array) {} else if (ArrayBuffer.isView(source)) {
              source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
            } else if (Array.isArray(source)) {
              source = Uint8Array.from(source);
            }

            if (!(source instanceof Uint8Array)) {
              throw new TypeError('Expected Uint8Array');
            }

            if (source.length === 0) {
              return '';
            } // Skip & count leading zeroes.


            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;

            while (pbegin !== pend && source[pbegin] === 0) {
              pbegin++;
              zeroes++;
            } // Allocate enough space in big-endian base58 representation.


            var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
            var b58 = new Uint8Array(size); // Process the bytes.

            while (pbegin !== pend) {
              var carry = source[pbegin]; // Apply "b58 = b58 * 256 + ch".

              var i = 0;

              for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
                carry += 256 * b58[it1] >>> 0;
                b58[it1] = carry % BASE >>> 0;
                carry = carry / BASE >>> 0;
              }

              if (carry !== 0) {
                throw new Error('Non-zero carry');
              }

              length = i;
              pbegin++;
            } // Skip leading zeroes in base58 result.


            var it2 = size - length;

            while (it2 !== size && b58[it2] === 0) {
              it2++;
            } // Translate the result into a string.


            var str = LEADER.repeat(zeroes);

            for (; it2 < size; ++it2) {
              str += ALPHABET.charAt(b58[it2]);
            }

            return str;
          }

          function decodeUnsafe(source) {
            if (typeof source !== 'string') {
              throw new TypeError('Expected String');
            }

            if (source.length === 0) {
              return new Uint8Array();
            }

            var psz = 0; // Skip and count leading '1's.

            var zeroes = 0;
            var length = 0;

            while (source[psz] === LEADER) {
              zeroes++;
              psz++;
            } // Allocate enough space in big-endian base256 representation.


            var size = (source.length - psz) * FACTOR + 1 >>> 0; // log(58) / log(256), rounded up.

            var b256 = new Uint8Array(size); // Process the characters.

            while (source[psz]) {
              // Decode character
              var carry = BASE_MAP[source.charCodeAt(psz)]; // Invalid character

              if (carry === 255) {
                return;
              }

              var i = 0;

              for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
                carry += BASE * b256[it3] >>> 0;
                b256[it3] = carry % 256 >>> 0;
                carry = carry / 256 >>> 0;
              }

              if (carry !== 0) {
                throw new Error('Non-zero carry');
              }

              length = i;
              psz++;
            } // Skip leading zeroes in b256.


            var it4 = size - length;

            while (it4 !== size && b256[it4] === 0) {
              it4++;
            }

            var vch = new Uint8Array(zeroes + (size - it4));
            var j = zeroes;

            while (it4 !== size) {
              vch[j++] = b256[it4++];
            }

            return vch;
          }

          function decode(string) {
            var buffer = decodeUnsafe(string);

            if (buffer) {
              return buffer;
            }

            throw new Error('Non-base' + BASE + ' character');
          }

          return {
            encode: encode,
            decodeUnsafe: decodeUnsafe,
            decode: decode
          };
        }

        module.exports = base;
      }, {}],
      116: [function (require, module, exports) {}, {}],
      117: [function (require, module, exports) {
        const basex = require('base-x');

        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        module.exports = basex(ALPHABET);
      }, {
        "base-x": 115
      }],
      118: [function (require, module, exports) {
        "use strict"; // the whatwg-fetch polyfill installs the fetch() function
        // on the global object (window or self)
        //
        // Return that as the export for use in Webpack, Browserify etc.

        require('whatwg-fetch');

        module.exports = self.fetch.bind(self);
      }, {
        "whatwg-fetch": 124
      }],
      119: [function (require, module, exports) {
        (function (global) {
          (function () {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = void 0; // https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

            var ws = null;

            if (typeof WebSocket !== 'undefined') {
              ws = WebSocket;
            } else if (typeof MozWebSocket !== 'undefined') {
              ws = MozWebSocket;
            } else if (typeof global !== 'undefined') {
              ws = global.WebSocket || global.MozWebSocket;
            } else if (typeof window !== 'undefined') {
              ws = window.WebSocket || window.MozWebSocket;
            } else if (typeof self !== 'undefined') {
              ws = self.WebSocket || self.MozWebSocket;
            }

            var _default = ws;
            exports.default = _default;
          }).call(this);
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, {}],
      120: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.StructError = exports.Struct = void 0;
        exports.any = any;
        exports.array = array;
        exports.assert = assert;
        exports.assign = assign;
        exports.bigint = bigint;
        exports.boolean = boolean;
        exports.coerce = coerce;
        exports.create = create;
        exports.date = date;
        exports.defaulted = defaulted;
        exports.define = define;
        exports.deprecated = deprecated;
        exports.dynamic = dynamic;
        exports.empty = empty;
        exports.enums = enums;
        exports.func = func;
        exports.instance = instance;
        exports.integer = integer;
        exports.intersection = intersection;
        exports.is = is;
        exports.lazy = lazy;
        exports.literal = literal;
        exports.map = map;
        exports.mask = mask;
        exports.max = max;
        exports.min = min;
        exports.never = never;
        exports.nonempty = nonempty;
        exports.nullable = nullable;
        exports.number = number;
        exports.object = object;
        exports.omit = omit;
        exports.optional = optional;
        exports.partial = partial;
        exports.pattern = pattern;
        exports.pick = pick;
        exports.record = record;
        exports.refine = refine;
        exports.regexp = regexp;
        exports.set = set;
        exports.size = size;
        exports.string = string;
        exports.struct = struct;
        exports.trimmed = trimmed;
        exports.tuple = tuple;
        exports.type = type;
        exports.union = union;
        exports.unknown = unknown;
        exports.validate = validate;
        /**
         * A `StructFailure` represents a single specific failure in validation.
         */

        /**
         * `StructError` objects are thrown (or returned) when validation fails.
         *
         * Validation logic is design to exit early for maximum performance. The error
         * represents the first error encountered during validation. For more detail,
         * the `error.failures` property is a generator function that can be run to
         * continue validation and receive all the failures in the data.
         */

        class StructError extends TypeError {
          constructor(failure, failures) {
            let cached;
            const {
              message,
              explanation,
              ...rest
            } = failure;
            const {
              path
            } = failure;
            const msg = path.length === 0 ? message : `At path: ${path.join('.')} -- ${message}`;
            super(explanation ?? msg);
            if (explanation != null) this.cause = msg;
            Object.assign(this, rest);
            this.name = this.constructor.name;

            this.failures = () => {
              return cached ?? (cached = [failure, ...failures()]);
            };
          }

        }
        /**
         * Check if a value is an iterator.
         */


        exports.StructError = StructError;

        function isIterable(x) {
          return isObject(x) && typeof x[Symbol.iterator] === 'function';
        }
        /**
         * Check if a value is a plain object.
         */


        function isObject(x) {
          return typeof x === 'object' && x != null;
        }
        /**
         * Check if a value is a plain object.
         */


        function isPlainObject(x) {
          if (Object.prototype.toString.call(x) !== '[object Object]') {
            return false;
          }

          const prototype = Object.getPrototypeOf(x);
          return prototype === null || prototype === Object.prototype;
        }
        /**
         * Return a value as a printable string.
         */


        function print(value) {
          if (typeof value === 'symbol') {
            return value.toString();
          }

          return typeof value === 'string' ? JSON.stringify(value) : `${value}`;
        }
        /**
         * Shifts (removes and returns) the first value from the `input` iterator.
         * Like `Array.prototype.shift()` but for an `Iterator`.
         */


        function shiftIterator(input) {
          const {
            done,
            value
          } = input.next();
          return done ? undefined : value;
        }
        /**
         * Convert a single validation result to a failure.
         */


        function toFailure(result, context, struct, value) {
          if (result === true) {
            return;
          } else if (result === false) {
            result = {};
          } else if (typeof result === 'string') {
            result = {
              message: result
            };
          }

          const {
            path,
            branch
          } = context;
          const {
            type
          } = struct;
          const {
            refinement,
            message = `Expected a value of type \`${type}\`${refinement ? ` with refinement \`${refinement}\`` : ''}, but received: \`${print(value)}\``
          } = result;
          return {
            value,
            type,
            refinement,
            key: path[path.length - 1],
            path,
            branch,
            ...result,
            message
          };
        }
        /**
         * Convert a validation result to an iterable of failures.
         */


        function* toFailures(result, context, struct, value) {
          if (!isIterable(result)) {
            result = [result];
          }

          for (const r of result) {
            const failure = toFailure(r, context, struct, value);

            if (failure) {
              yield failure;
            }
          }
        }
        /**
         * Check a value against a struct, traversing deeply into nested values, and
         * returning an iterator of failures or success.
         */


        function* run(value, struct, options = {}) {
          const {
            path = [],
            branch = [value],
            coerce = false,
            mask = false
          } = options;
          const ctx = {
            path,
            branch
          };

          if (coerce) {
            value = struct.coercer(value, ctx);

            if (mask && struct.type !== 'type' && isObject(struct.schema) && isObject(value) && !Array.isArray(value)) {
              for (const key in value) {
                if (struct.schema[key] === undefined) {
                  delete value[key];
                }
              }
            }
          }

          let status = 'valid';

          for (const failure of struct.validator(value, ctx)) {
            failure.explanation = options.message;
            status = 'not_valid';
            yield [failure, undefined];
          }

          for (let [k, v, s] of struct.entries(value, ctx)) {
            const ts = run(v, s, {
              path: k === undefined ? path : [...path, k],
              branch: k === undefined ? branch : [...branch, v],
              coerce,
              mask,
              message: options.message
            });

            for (const t of ts) {
              if (t[0]) {
                status = t[0].refinement != null ? 'not_refined' : 'not_valid';
                yield [t[0], undefined];
              } else if (coerce) {
                v = t[1];

                if (k === undefined) {
                  value = v;
                } else if (value instanceof Map) {
                  value.set(k, v);
                } else if (value instanceof Set) {
                  value.add(v);
                } else if (isObject(value)) {
                  if (v !== undefined || k in value) value[k] = v;
                }
              }
            }
          }

          if (status !== 'not_valid') {
            for (const failure of struct.refiner(value, ctx)) {
              failure.explanation = options.message;
              status = 'not_refined';
              yield [failure, undefined];
            }
          }

          if (status === 'valid') {
            yield [undefined, value];
          }
        }
        /**
         * `Struct` objects encapsulate the validation logic for a specific type of
         * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
         * validate unknown input data against the struct.
         */


        class Struct {
          constructor(props) {
            const {
              type,
              schema,
              validator,
              refiner,
              coercer = value => value,
              entries = function* () {}
            } = props;
            this.type = type;
            this.schema = schema;
            this.entries = entries;
            this.coercer = coercer;

            if (validator) {
              this.validator = (value, context) => {
                const result = validator(value, context);
                return toFailures(result, context, this, value);
              };
            } else {
              this.validator = () => [];
            }

            if (refiner) {
              this.refiner = (value, context) => {
                const result = refiner(value, context);
                return toFailures(result, context, this, value);
              };
            } else {
              this.refiner = () => [];
            }
          }
          /**
           * Assert that a value passes the struct's validation, throwing if it doesn't.
           */


          assert(value, message) {
            return assert(value, this, message);
          }
          /**
           * Create a value with the struct's coercion logic, then validate it.
           */


          create(value, message) {
            return create(value, this, message);
          }
          /**
           * Check if a value passes the struct's validation.
           */


          is(value) {
            return is(value, this);
          }
          /**
           * Mask a value, coercing and validating it, but returning only the subset of
           * properties defined by the struct's schema.
           */


          mask(value, message) {
            return mask(value, this, message);
          }
          /**
           * Validate a value with the struct's validation logic, returning a tuple
           * representing the result.
           *
           * You may optionally pass `true` for the `withCoercion` argument to coerce
           * the value before attempting to validate it. If you do, the result will
           * contain the coerced result when successful.
           */


          validate(value, options = {}) {
            return validate(value, this, options);
          }

        }
        /**
         * Assert that a value passes a struct, throwing if it doesn't.
         */


        exports.Struct = Struct;

        function assert(value, struct, message) {
          const result = validate(value, struct, {
            message
          });

          if (result[0]) {
            throw result[0];
          }
        }
        /**
         * Create a value with the coercion logic of struct and validate it.
         */


        function create(value, struct, message) {
          const result = validate(value, struct, {
            coerce: true,
            message
          });

          if (result[0]) {
            throw result[0];
          } else {
            return result[1];
          }
        }
        /**
         * Mask a value, returning only the subset of properties defined by a struct.
         */


        function mask(value, struct, message) {
          const result = validate(value, struct, {
            coerce: true,
            mask: true,
            message
          });

          if (result[0]) {
            throw result[0];
          } else {
            return result[1];
          }
        }
        /**
         * Check if a value passes a struct.
         */


        function is(value, struct) {
          const result = validate(value, struct);
          return !result[0];
        }
        /**
         * Validate a value against a struct, returning an error if invalid, or the
         * value (with potential coercion) if valid.
         */


        function validate(value, struct, options = {}) {
          const tuples = run(value, struct, options);
          const tuple = shiftIterator(tuples);

          if (tuple[0]) {
            const error = new StructError(tuple[0], function* () {
              for (const t of tuples) {
                if (t[0]) {
                  yield t[0];
                }
              }
            });
            return [error, undefined];
          } else {
            const v = tuple[1];
            return [undefined, v];
          }
        }

        function assign(...Structs) {
          const isType = Structs[0].type === 'type';
          const schemas = Structs.map(s => s.schema);
          const schema = Object.assign({}, ...schemas);
          return isType ? type(schema) : object(schema);
        }
        /**
         * Define a new struct type with a custom validation function.
         */


        function define(name, validator) {
          return new Struct({
            type: name,
            schema: null,
            validator
          });
        }
        /**
         * Create a new struct based on an existing struct, but the value is allowed to
         * be `undefined`. `log` will be called if the value is not `undefined`.
         */


        function deprecated(struct, log) {
          return new Struct({ ...struct,
            refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),

            validator(value, ctx) {
              if (value === undefined) {
                return true;
              } else {
                log(value, ctx);
                return struct.validator(value, ctx);
              }
            }

          });
        }
        /**
         * Create a struct with dynamic validation logic.
         *
         * The callback will receive the value currently being validated, and must
         * return a struct object to validate it with. This can be useful to model
         * validation logic that changes based on its input.
         */


        function dynamic(fn) {
          return new Struct({
            type: 'dynamic',
            schema: null,

            *entries(value, ctx) {
              const struct = fn(value, ctx);
              yield* struct.entries(value, ctx);
            },

            validator(value, ctx) {
              const struct = fn(value, ctx);
              return struct.validator(value, ctx);
            },

            coercer(value, ctx) {
              const struct = fn(value, ctx);
              return struct.coercer(value, ctx);
            },

            refiner(value, ctx) {
              const struct = fn(value, ctx);
              return struct.refiner(value, ctx);
            }

          });
        }
        /**
         * Create a struct with lazily evaluated validation logic.
         *
         * The first time validation is run with the struct, the callback will be called
         * and must return a struct object to use. This is useful for cases where you
         * want to have self-referential structs for nested data structures to avoid a
         * circular definition problem.
         */


        function lazy(fn) {
          let struct;
          return new Struct({
            type: 'lazy',
            schema: null,

            *entries(value, ctx) {
              struct ?? (struct = fn());
              yield* struct.entries(value, ctx);
            },

            validator(value, ctx) {
              struct ?? (struct = fn());
              return struct.validator(value, ctx);
            },

            coercer(value, ctx) {
              struct ?? (struct = fn());
              return struct.coercer(value, ctx);
            },

            refiner(value, ctx) {
              struct ?? (struct = fn());
              return struct.refiner(value, ctx);
            }

          });
        }
        /**
         * Create a new struct based on an existing object struct, but excluding
         * specific properties.
         *
         * Like TypeScript's `Omit` utility.
         */


        function omit(struct, keys) {
          const {
            schema
          } = struct;
          const subschema = { ...schema
          };

          for (const key of keys) {
            delete subschema[key];
          }

          switch (struct.type) {
            case 'type':
              return type(subschema);

            default:
              return object(subschema);
          }
        }
        /**
         * Create a new struct based on an existing object struct, but with all of its
         * properties allowed to be `undefined`.
         *
         * Like TypeScript's `Partial` utility.
         */


        function partial(struct) {
          const schema = struct instanceof Struct ? { ...struct.schema
          } : { ...struct
          };

          for (const key in schema) {
            schema[key] = optional(schema[key]);
          }

          return object(schema);
        }
        /**
         * Create a new struct based on an existing object struct, but only including
         * specific properties.
         *
         * Like TypeScript's `Pick` utility.
         */


        function pick(struct, keys) {
          const {
            schema
          } = struct;
          const subschema = {};

          for (const key of keys) {
            subschema[key] = schema[key];
          }

          return object(subschema);
        }
        /**
         * Define a new struct type with a custom validation function.
         *
         * @deprecated This function has been renamed to `define`.
         */


        function struct(name, validator) {
          console.warn('superstruct@0.11 - The `struct` helper has been renamed to `define`.');
          return define(name, validator);
        }
        /**
         * Ensure that any value passes validation.
         */


        function any() {
          return define('any', () => true);
        }

        function array(Element) {
          return new Struct({
            type: 'array',
            schema: Element,

            *entries(value) {
              if (Element && Array.isArray(value)) {
                for (const [i, v] of value.entries()) {
                  yield [i, v, Element];
                }
              }
            },

            coercer(value) {
              return Array.isArray(value) ? value.slice() : value;
            },

            validator(value) {
              return Array.isArray(value) || `Expected an array value, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that a value is a bigint.
         */


        function bigint() {
          return define('bigint', value => {
            return typeof value === 'bigint';
          });
        }
        /**
         * Ensure that a value is a boolean.
         */


        function boolean() {
          return define('boolean', value => {
            return typeof value === 'boolean';
          });
        }
        /**
         * Ensure that a value is a valid `Date`.
         *
         * Note: this also ensures that the value is *not* an invalid `Date` object,
         * which can occur when parsing a date fails but still returns a `Date`.
         */


        function date() {
          return define('date', value => {
            return value instanceof Date && !isNaN(value.getTime()) || `Expected a valid \`Date\` object, but received: ${print(value)}`;
          });
        }

        function enums(values) {
          const schema = {};
          const description = values.map(v => print(v)).join();

          for (const key of values) {
            schema[key] = key;
          }

          return new Struct({
            type: 'enums',
            schema,

            validator(value) {
              return values.includes(value) || `Expected one of \`${description}\`, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that a value is a function.
         */


        function func() {
          return define('func', value => {
            return typeof value === 'function' || `Expected a function, but received: ${print(value)}`;
          });
        }
        /**
         * Ensure that a value is an instance of a specific class.
         */


        function instance(Class) {
          return define('instance', value => {
            return value instanceof Class || `Expected a \`${Class.name}\` instance, but received: ${print(value)}`;
          });
        }
        /**
         * Ensure that a value is an integer.
         */


        function integer() {
          return define('integer', value => {
            return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) || `Expected an integer, but received: ${print(value)}`;
          });
        }
        /**
         * Ensure that a value matches all of a set of types.
         */


        function intersection(Structs) {
          return new Struct({
            type: 'intersection',
            schema: null,

            *entries(value, ctx) {
              for (const S of Structs) {
                yield* S.entries(value, ctx);
              }
            },

            *validator(value, ctx) {
              for (const S of Structs) {
                yield* S.validator(value, ctx);
              }
            },

            *refiner(value, ctx) {
              for (const S of Structs) {
                yield* S.refiner(value, ctx);
              }
            }

          });
        }

        function literal(constant) {
          const description = print(constant);
          const t = typeof constant;
          return new Struct({
            type: 'literal',
            schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,

            validator(value) {
              return value === constant || `Expected the literal \`${description}\`, but received: ${print(value)}`;
            }

          });
        }

        function map(Key, Value) {
          return new Struct({
            type: 'map',
            schema: null,

            *entries(value) {
              if (Key && Value && value instanceof Map) {
                for (const [k, v] of value.entries()) {
                  yield [k, k, Key];
                  yield [k, v, Value];
                }
              }
            },

            coercer(value) {
              return value instanceof Map ? new Map(value) : value;
            },

            validator(value) {
              return value instanceof Map || `Expected a \`Map\` object, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that no value ever passes validation.
         */


        function never() {
          return define('never', () => false);
        }
        /**
         * Augment an existing struct to allow `null` values.
         */


        function nullable(struct) {
          return new Struct({ ...struct,
            validator: (value, ctx) => value === null || struct.validator(value, ctx),
            refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
          });
        }
        /**
         * Ensure that a value is a number.
         */


        function number() {
          return define('number', value => {
            return typeof value === 'number' && !isNaN(value) || `Expected a number, but received: ${print(value)}`;
          });
        }

        function object(schema) {
          const knowns = schema ? Object.keys(schema) : [];
          const Never = never();
          return new Struct({
            type: 'object',
            schema: schema ? schema : null,

            *entries(value) {
              if (schema && isObject(value)) {
                const unknowns = new Set(Object.keys(value));

                for (const key of knowns) {
                  unknowns.delete(key);
                  yield [key, value[key], schema[key]];
                }

                for (const key of unknowns) {
                  yield [key, value[key], Never];
                }
              }
            },

            validator(value) {
              return isObject(value) || `Expected an object, but received: ${print(value)}`;
            },

            coercer(value) {
              return isObject(value) ? { ...value
              } : value;
            }

          });
        }
        /**
         * Augment a struct to allow `undefined` values.
         */


        function optional(struct) {
          return new Struct({ ...struct,
            validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
            refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
          });
        }
        /**
         * Ensure that a value is an object with keys and values of specific types, but
         * without ensuring any specific shape of properties.
         *
         * Like TypeScript's `Record` utility.
         */


        function record(Key, Value) {
          return new Struct({
            type: 'record',
            schema: null,

            *entries(value) {
              if (isObject(value)) {
                for (const k in value) {
                  const v = value[k];
                  yield [k, k, Key];
                  yield [k, v, Value];
                }
              }
            },

            validator(value) {
              return isObject(value) || `Expected an object, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that a value is a `RegExp`.
         *
         * Note: this does not test the value against the regular expression! For that
         * you need to use the `pattern()` refinement.
         */


        function regexp() {
          return define('regexp', value => {
            return value instanceof RegExp;
          });
        }

        function set(Element) {
          return new Struct({
            type: 'set',
            schema: null,

            *entries(value) {
              if (Element && value instanceof Set) {
                for (const v of value) {
                  yield [v, v, Element];
                }
              }
            },

            coercer(value) {
              return value instanceof Set ? new Set(value) : value;
            },

            validator(value) {
              return value instanceof Set || `Expected a \`Set\` object, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that a value is a string.
         */


        function string() {
          return define('string', value => {
            return typeof value === 'string' || `Expected a string, but received: ${print(value)}`;
          });
        }
        /**
         * Ensure that a value is a tuple of a specific length, and that each of its
         * elements is of a specific type.
         */


        function tuple(Structs) {
          const Never = never();
          return new Struct({
            type: 'tuple',
            schema: null,

            *entries(value) {
              if (Array.isArray(value)) {
                const length = Math.max(Structs.length, value.length);

                for (let i = 0; i < length; i++) {
                  yield [i, value[i], Structs[i] || Never];
                }
              }
            },

            validator(value) {
              return Array.isArray(value) || `Expected an array, but received: ${print(value)}`;
            }

          });
        }
        /**
         * Ensure that a value has a set of known properties of specific types.
         *
         * Note: Unrecognized properties are allowed and untouched. This is similar to
         * how TypeScript's structural typing works.
         */


        function type(schema) {
          const keys = Object.keys(schema);
          return new Struct({
            type: 'type',
            schema,

            *entries(value) {
              if (isObject(value)) {
                for (const k of keys) {
                  yield [k, value[k], schema[k]];
                }
              }
            },

            validator(value) {
              return isObject(value) || `Expected an object, but received: ${print(value)}`;
            },

            coercer(value) {
              return isObject(value) ? { ...value
              } : value;
            }

          });
        }
        /**
         * Ensure that a value matches one of a set of types.
         */


        function union(Structs) {
          const description = Structs.map(s => s.type).join(' | ');
          return new Struct({
            type: 'union',
            schema: null,

            coercer(value) {
              for (const S of Structs) {
                const [error, coerced] = S.validate(value, {
                  coerce: true
                });

                if (!error) {
                  return coerced;
                }
              }

              return value;
            },

            validator(value, ctx) {
              const failures = [];

              for (const S of Structs) {
                const [...tuples] = run(value, S, ctx);
                const [first] = tuples;

                if (!first[0]) {
                  return [];
                } else {
                  for (const [failure] of tuples) {
                    if (failure) {
                      failures.push(failure);
                    }
                  }
                }
              }

              return [`Expected the value to satisfy a union of \`${description}\`, but received: ${print(value)}`, ...failures];
            }

          });
        }
        /**
         * Ensure that any value passes validation, without widening its type to `any`.
         */


        function unknown() {
          return define('unknown', () => true);
        }
        /**
         * Augment a `Struct` to add an additional coercion step to its input.
         *
         * This allows you to transform input data before validating it, to increase the
         * likelihood that it passes validation—for example for default values, parsing
         * different formats, etc.
         *
         * Note: You must use `create(value, Struct)` on the value to have the coercion
         * take effect! Using simply `assert()` or `is()` will not use coercion.
         */


        function coerce(struct, condition, coercer) {
          return new Struct({ ...struct,
            coercer: (value, ctx) => {
              return is(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
            }
          });
        }
        /**
         * Augment a struct to replace `undefined` values with a default.
         *
         * Note: You must use `create(value, Struct)` on the value to have the coercion
         * take effect! Using simply `assert()` or `is()` will not use coercion.
         */


        function defaulted(struct, fallback, options = {}) {
          return coerce(struct, unknown(), x => {
            const f = typeof fallback === 'function' ? fallback() : fallback;

            if (x === undefined) {
              return f;
            }

            if (!options.strict && isPlainObject(x) && isPlainObject(f)) {
              const ret = { ...x
              };
              let changed = false;

              for (const key in f) {
                if (ret[key] === undefined) {
                  ret[key] = f[key];
                  changed = true;
                }
              }

              if (changed) {
                return ret;
              }
            }

            return x;
          });
        }
        /**
         * Augment a struct to trim string inputs.
         *
         * Note: You must use `create(value, Struct)` on the value to have the coercion
         * take effect! Using simply `assert()` or `is()` will not use coercion.
         */


        function trimmed(struct) {
          return coerce(struct, string(), x => x.trim());
        }
        /**
         * Ensure that a string, array, map, or set is empty.
         */


        function empty(struct) {
          return refine(struct, 'empty', value => {
            const size = getSize(value);
            return size === 0 || `Expected an empty ${struct.type} but received one with a size of \`${size}\``;
          });
        }

        function getSize(value) {
          if (value instanceof Map || value instanceof Set) {
            return value.size;
          } else {
            return value.length;
          }
        }
        /**
         * Ensure that a number or date is below a threshold.
         */


        function max(struct, threshold, options = {}) {
          const {
            exclusive
          } = options;
          return refine(struct, 'max', value => {
            return exclusive ? value < threshold : value <= threshold || `Expected a ${struct.type} less than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
          });
        }
        /**
         * Ensure that a number or date is above a threshold.
         */


        function min(struct, threshold, options = {}) {
          const {
            exclusive
          } = options;
          return refine(struct, 'min', value => {
            return exclusive ? value > threshold : value >= threshold || `Expected a ${struct.type} greater than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
          });
        }
        /**
         * Ensure that a string, array, map or set is not empty.
         */


        function nonempty(struct) {
          return refine(struct, 'nonempty', value => {
            const size = getSize(value);
            return size > 0 || `Expected a nonempty ${struct.type} but received an empty one`;
          });
        }
        /**
         * Ensure that a string matches a regular expression.
         */


        function pattern(struct, regexp) {
          return refine(struct, 'pattern', value => {
            return regexp.test(value) || `Expected a ${struct.type} matching \`/${regexp.source}/\` but received "${value}"`;
          });
        }
        /**
         * Ensure that a string, array, number, date, map, or set has a size (or length, or time) between `min` and `max`.
         */


        function size(struct, min, max = min) {
          const expected = `Expected a ${struct.type}`;
          const of = min === max ? `of \`${min}\`` : `between \`${min}\` and \`${max}\``;
          return refine(struct, 'size', value => {
            if (typeof value === 'number' || value instanceof Date) {
              return min <= value && value <= max || `${expected} ${of} but received \`${value}\``;
            } else if (value instanceof Map || value instanceof Set) {
              const {
                size
              } = value;
              return min <= size && size <= max || `${expected} with a size ${of} but received one with a size of \`${size}\``;
            } else {
              const {
                length
              } = value;
              return min <= length && length <= max || `${expected} with a length ${of} but received one with a length of \`${length}\``;
            }
          });
        }
        /**
         * Augment a `Struct` to add an additional refinement to the validation.
         *
         * The refiner function is guaranteed to receive a value of the struct's type,
         * because the struct's existing validation will already have passed. This
         * allows you to layer additional validation on top of existing structs.
         */


        function refine(struct, name, refiner) {
          return new Struct({ ...struct,

            *refiner(value, ctx) {
              yield* struct.refiner(value, ctx);
              const result = refiner(value, ctx);
              const failures = toFailures(result, ctx, struct, value);

              for (const failure of failures) {
                yield { ...failure,
                  refinement: name
                };
              }
            }

          });
        }
      }, {}],
      121: [function (require, module, exports) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };

            return extendStatics(d, b);
          };

          return function (d, b) {
            extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
              f,
              y,
              t,
              g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];

              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;

                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false
                  };

                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;

                case 7:
                  op = _.ops.pop();

                  _.trys.pop();

                  continue;

                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }

                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }

                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }

                  if (t && _.label < t[2]) {
                    _.label = t[2];

                    _.ops.push(op);

                    break;
                  }

                  if (t[2]) _.ops.pop();

                  _.trys.pop();

                  continue;
              }

              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.NotRetryableError = exports.RetryError = exports.notEmpty = exports.customizeRetry = exports.customizeDecorator = exports.retryDecorator = exports.retry = exports.wait = exports.defaultRetryConfig = void 0;

        var timeout_1 = require("./timeout");

        var fixedBackoff = function (attempt, delay) {
          return delay;
        };

        var linearBackoff = function (attempt, delay) {
          return attempt * delay;
        };

        var exponentialBackoff = function (attempt, delay) {
          return Math.pow(delay, attempt);
        };

        exports.defaultRetryConfig = {
          backoff: "FIXED",
          delay: 100,
          logger: function () {
            return undefined;
          },
          maxBackOff: 5 * 60 * 1000,
          retries: 10,
          timeout: 60 * 1000,
          until: function () {
            return true;
          },
          retryIf: function () {
            return true;
          }
        };

        function wait(ms) {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              return [2
              /*return*/
              , new Promise(function (resolve) {
                return setTimeout(resolve, ms);
              })];
            });
          });
        }

        exports.wait = wait;

        function retry(f, config) {
          return __awaiter(this, void 0, void 0, function () {
            var effectiveConfig;
            return __generator(this, function (_a) {
              effectiveConfig = Object.assign({}, exports.defaultRetryConfig, config);
              return [2
              /*return*/
              , timeout_1.timeout(effectiveConfig.timeout, function (done) {
                return _retry(f, effectiveConfig, done);
              })];
            });
          });
        }

        exports.retry = retry;

        function retryDecorator(func, config) {
          return function () {
            var args = [];

            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }

            return retry(function () {
              return func.apply(void 0, args);
            }, config);
          };
        }

        exports.retryDecorator = retryDecorator;

        function customizeDecorator(customConfig) {
          return function (args, config) {
            return retryDecorator(args, Object.assign({}, customConfig, config));
          };
        }

        exports.customizeDecorator = customizeDecorator; // tslint:disable-next-line

        function customizeRetry(customConfig) {
          return function (f, c) {
            var customized = Object.assign({}, customConfig, c);
            return retry(f, customized);
          };
        }

        exports.customizeRetry = customizeRetry;

        function _retry(f, config, done) {
          return __awaiter(this, void 0, void 0, function () {
            var lastError, delay, retries, i, result, error_1, millisToWait;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  switch (config.backoff) {
                    case "EXPONENTIAL":
                      delay = exponentialBackoff;
                      break;

                    case "FIXED":
                      delay = fixedBackoff;
                      break;

                    case "LINEAR":
                      delay = linearBackoff;
                      break;

                    default:
                      delay = config.backoff;
                  }

                  if (config.retries === "INFINITELY") {
                    retries = Number.MAX_SAFE_INTEGER;
                  } else {
                    retries = config.retries;
                  }

                  i = 0;
                  _a.label = 1;

                case 1:
                  if (!(i <= retries)) return [3
                  /*break*/
                  , 8];
                  _a.label = 2;

                case 2:
                  _a.trys.push([2, 4,, 5]);

                  return [4
                  /*yield*/
                  , f()];

                case 3:
                  result = _a.sent();

                  if (config.until(result)) {
                    return [2
                    /*return*/
                    , result];
                  }

                  config.logger("Until condition not met by " + result);
                  return [3
                  /*break*/
                  , 5];

                case 4:
                  error_1 = _a.sent();

                  if (!config.retryIf(error_1)) {
                    throw error_1;
                  }

                  if (error_1.name === NotRetryableError.name) {
                    throw new RetryError("Met not retryable error. Last error: " + error_1, error_1);
                  }

                  lastError = error_1;
                  config.logger("Retry failed: " + error_1.message);
                  return [3
                  /*break*/
                  , 5];

                case 5:
                  millisToWait = delay(i + 1, config.delay);
                  return [4
                  /*yield*/
                  , wait(millisToWait > config.maxBackOff ? config.maxBackOff : millisToWait)];

                case 6:
                  _a.sent();

                  if (done()) {
                    return [3
                    /*break*/
                    , 8];
                  }

                  _a.label = 7;

                case 7:
                  i++;
                  return [3
                  /*break*/
                  , 1];

                case 8:
                  throw new RetryError("All retries failed. Last error: " + lastError, lastError);
              }
            });
          });
        }

        exports.notEmpty = function (result) {
          if (Array.isArray(result)) {
            return result.length > 0;
          }

          return result !== null && result !== undefined;
        };

        var RetryError =
        /** @class */
        function (_super) {
          __extends(RetryError, _super);
          /*  istanbul ignore next  */


          function RetryError(message, lastError) {
            var _this = _super.call(this, message) || this;

            _this.lastError = lastError;
            return _this;
          }

          return RetryError;
        }(Error);

        exports.RetryError = RetryError; // tslint:disable-next-line:max-classes-per-file

        var BaseError =
        /** @class */
        function () {
          function BaseError() {
            var args = [];

            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }

            Error.apply(this, args);
          }

          return BaseError;
        }();

        BaseError.prototype = new Error(); // tslint:disable-next-line:max-classes-per-file

        var NotRetryableError =
        /** @class */
        function (_super) {
          __extends(NotRetryableError, _super);

          function NotRetryableError(message) {
            var _this = _super.call(this, message) || this;

            Object.defineProperty(_this, 'name', {
              value: _this.constructor.name
            });
            return _this;
          }

          return NotRetryableError;
        }(BaseError);

        exports.NotRetryableError = NotRetryableError;
      }, {
        "./timeout": 122
      }],
      122: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.timeout = void 0;

        exports.timeout = function (millies, f) {
          if (millies === "INFINITELY") {
            return f(function () {
              return false;
            });
          }

          var done = false;

          var doneF = function () {
            return done;
          };

          return new Promise(function (resolve, reject) {
            var timeoutRef = setTimeout(function () {
              done = true;
              reject(new Error("Timeout after " + millies + "ms"));
            }, millies);
            var result = f(doneF); // result.finally(() => clearTimeout(timeoutRef));

            result.then(function (r) {
              resolve(r);
              clearTimeout(timeoutRef);
            }, function (e) {
              reject(e);
              clearTimeout(timeoutRef);
            });
          });
        };
      }, {}],
      123: [function (require, module, exports) {
        (function (nacl) {
          'use strict'; // Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
          // Public domain.
          //
          // Implementation derived from TweetNaCl version 20140427.
          // See for details: http://tweetnacl.cr.yp.to/

          var gf = function (init) {
            var i,
                r = new Float64Array(16);
            if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
            return r;
          }; //  Pluggable, initialized in high-level API below.


          var randombytes = function ()
          /* x, n */
          {
            throw new Error('no PRNG');
          };

          var _0 = new Uint8Array(16);

          var _9 = new Uint8Array(32);

          _9[0] = 9;

          var gf0 = gf(),
              gf1 = gf([1]),
              _121665 = gf([0xdb41, 1]),
              D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
              D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
              X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
              Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
              I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

          function ts64(x, i, h, l) {
            x[i] = h >> 24 & 0xff;
            x[i + 1] = h >> 16 & 0xff;
            x[i + 2] = h >> 8 & 0xff;
            x[i + 3] = h & 0xff;
            x[i + 4] = l >> 24 & 0xff;
            x[i + 5] = l >> 16 & 0xff;
            x[i + 6] = l >> 8 & 0xff;
            x[i + 7] = l & 0xff;
          }

          function vn(x, xi, y, yi, n) {
            var i,
                d = 0;

            for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];

            return (1 & d - 1 >>> 8) - 1;
          }

          function crypto_verify_16(x, xi, y, yi) {
            return vn(x, xi, y, yi, 16);
          }

          function crypto_verify_32(x, xi, y, yi) {
            return vn(x, xi, y, yi, 32);
          }

          function core_salsa20(o, p, k, c) {
            var j0 = c[0] & 0xff | (c[1] & 0xff) << 8 | (c[2] & 0xff) << 16 | (c[3] & 0xff) << 24,
                j1 = k[0] & 0xff | (k[1] & 0xff) << 8 | (k[2] & 0xff) << 16 | (k[3] & 0xff) << 24,
                j2 = k[4] & 0xff | (k[5] & 0xff) << 8 | (k[6] & 0xff) << 16 | (k[7] & 0xff) << 24,
                j3 = k[8] & 0xff | (k[9] & 0xff) << 8 | (k[10] & 0xff) << 16 | (k[11] & 0xff) << 24,
                j4 = k[12] & 0xff | (k[13] & 0xff) << 8 | (k[14] & 0xff) << 16 | (k[15] & 0xff) << 24,
                j5 = c[4] & 0xff | (c[5] & 0xff) << 8 | (c[6] & 0xff) << 16 | (c[7] & 0xff) << 24,
                j6 = p[0] & 0xff | (p[1] & 0xff) << 8 | (p[2] & 0xff) << 16 | (p[3] & 0xff) << 24,
                j7 = p[4] & 0xff | (p[5] & 0xff) << 8 | (p[6] & 0xff) << 16 | (p[7] & 0xff) << 24,
                j8 = p[8] & 0xff | (p[9] & 0xff) << 8 | (p[10] & 0xff) << 16 | (p[11] & 0xff) << 24,
                j9 = p[12] & 0xff | (p[13] & 0xff) << 8 | (p[14] & 0xff) << 16 | (p[15] & 0xff) << 24,
                j10 = c[8] & 0xff | (c[9] & 0xff) << 8 | (c[10] & 0xff) << 16 | (c[11] & 0xff) << 24,
                j11 = k[16] & 0xff | (k[17] & 0xff) << 8 | (k[18] & 0xff) << 16 | (k[19] & 0xff) << 24,
                j12 = k[20] & 0xff | (k[21] & 0xff) << 8 | (k[22] & 0xff) << 16 | (k[23] & 0xff) << 24,
                j13 = k[24] & 0xff | (k[25] & 0xff) << 8 | (k[26] & 0xff) << 16 | (k[27] & 0xff) << 24,
                j14 = k[28] & 0xff | (k[29] & 0xff) << 8 | (k[30] & 0xff) << 16 | (k[31] & 0xff) << 24,
                j15 = c[12] & 0xff | (c[13] & 0xff) << 8 | (c[14] & 0xff) << 16 | (c[15] & 0xff) << 24;
            var x0 = j0,
                x1 = j1,
                x2 = j2,
                x3 = j3,
                x4 = j4,
                x5 = j5,
                x6 = j6,
                x7 = j7,
                x8 = j8,
                x9 = j9,
                x10 = j10,
                x11 = j11,
                x12 = j12,
                x13 = j13,
                x14 = j14,
                x15 = j15,
                u;

            for (var i = 0; i < 20; i += 2) {
              u = x0 + x12 | 0;
              x4 ^= u << 7 | u >>> 32 - 7;
              u = x4 + x0 | 0;
              x8 ^= u << 9 | u >>> 32 - 9;
              u = x8 + x4 | 0;
              x12 ^= u << 13 | u >>> 32 - 13;
              u = x12 + x8 | 0;
              x0 ^= u << 18 | u >>> 32 - 18;
              u = x5 + x1 | 0;
              x9 ^= u << 7 | u >>> 32 - 7;
              u = x9 + x5 | 0;
              x13 ^= u << 9 | u >>> 32 - 9;
              u = x13 + x9 | 0;
              x1 ^= u << 13 | u >>> 32 - 13;
              u = x1 + x13 | 0;
              x5 ^= u << 18 | u >>> 32 - 18;
              u = x10 + x6 | 0;
              x14 ^= u << 7 | u >>> 32 - 7;
              u = x14 + x10 | 0;
              x2 ^= u << 9 | u >>> 32 - 9;
              u = x2 + x14 | 0;
              x6 ^= u << 13 | u >>> 32 - 13;
              u = x6 + x2 | 0;
              x10 ^= u << 18 | u >>> 32 - 18;
              u = x15 + x11 | 0;
              x3 ^= u << 7 | u >>> 32 - 7;
              u = x3 + x15 | 0;
              x7 ^= u << 9 | u >>> 32 - 9;
              u = x7 + x3 | 0;
              x11 ^= u << 13 | u >>> 32 - 13;
              u = x11 + x7 | 0;
              x15 ^= u << 18 | u >>> 32 - 18;
              u = x0 + x3 | 0;
              x1 ^= u << 7 | u >>> 32 - 7;
              u = x1 + x0 | 0;
              x2 ^= u << 9 | u >>> 32 - 9;
              u = x2 + x1 | 0;
              x3 ^= u << 13 | u >>> 32 - 13;
              u = x3 + x2 | 0;
              x0 ^= u << 18 | u >>> 32 - 18;
              u = x5 + x4 | 0;
              x6 ^= u << 7 | u >>> 32 - 7;
              u = x6 + x5 | 0;
              x7 ^= u << 9 | u >>> 32 - 9;
              u = x7 + x6 | 0;
              x4 ^= u << 13 | u >>> 32 - 13;
              u = x4 + x7 | 0;
              x5 ^= u << 18 | u >>> 32 - 18;
              u = x10 + x9 | 0;
              x11 ^= u << 7 | u >>> 32 - 7;
              u = x11 + x10 | 0;
              x8 ^= u << 9 | u >>> 32 - 9;
              u = x8 + x11 | 0;
              x9 ^= u << 13 | u >>> 32 - 13;
              u = x9 + x8 | 0;
              x10 ^= u << 18 | u >>> 32 - 18;
              u = x15 + x14 | 0;
              x12 ^= u << 7 | u >>> 32 - 7;
              u = x12 + x15 | 0;
              x13 ^= u << 9 | u >>> 32 - 9;
              u = x13 + x12 | 0;
              x14 ^= u << 13 | u >>> 32 - 13;
              u = x14 + x13 | 0;
              x15 ^= u << 18 | u >>> 32 - 18;
            }

            x0 = x0 + j0 | 0;
            x1 = x1 + j1 | 0;
            x2 = x2 + j2 | 0;
            x3 = x3 + j3 | 0;
            x4 = x4 + j4 | 0;
            x5 = x5 + j5 | 0;
            x6 = x6 + j6 | 0;
            x7 = x7 + j7 | 0;
            x8 = x8 + j8 | 0;
            x9 = x9 + j9 | 0;
            x10 = x10 + j10 | 0;
            x11 = x11 + j11 | 0;
            x12 = x12 + j12 | 0;
            x13 = x13 + j13 | 0;
            x14 = x14 + j14 | 0;
            x15 = x15 + j15 | 0;
            o[0] = x0 >>> 0 & 0xff;
            o[1] = x0 >>> 8 & 0xff;
            o[2] = x0 >>> 16 & 0xff;
            o[3] = x0 >>> 24 & 0xff;
            o[4] = x1 >>> 0 & 0xff;
            o[5] = x1 >>> 8 & 0xff;
            o[6] = x1 >>> 16 & 0xff;
            o[7] = x1 >>> 24 & 0xff;
            o[8] = x2 >>> 0 & 0xff;
            o[9] = x2 >>> 8 & 0xff;
            o[10] = x2 >>> 16 & 0xff;
            o[11] = x2 >>> 24 & 0xff;
            o[12] = x3 >>> 0 & 0xff;
            o[13] = x3 >>> 8 & 0xff;
            o[14] = x3 >>> 16 & 0xff;
            o[15] = x3 >>> 24 & 0xff;
            o[16] = x4 >>> 0 & 0xff;
            o[17] = x4 >>> 8 & 0xff;
            o[18] = x4 >>> 16 & 0xff;
            o[19] = x4 >>> 24 & 0xff;
            o[20] = x5 >>> 0 & 0xff;
            o[21] = x5 >>> 8 & 0xff;
            o[22] = x5 >>> 16 & 0xff;
            o[23] = x5 >>> 24 & 0xff;
            o[24] = x6 >>> 0 & 0xff;
            o[25] = x6 >>> 8 & 0xff;
            o[26] = x6 >>> 16 & 0xff;
            o[27] = x6 >>> 24 & 0xff;
            o[28] = x7 >>> 0 & 0xff;
            o[29] = x7 >>> 8 & 0xff;
            o[30] = x7 >>> 16 & 0xff;
            o[31] = x7 >>> 24 & 0xff;
            o[32] = x8 >>> 0 & 0xff;
            o[33] = x8 >>> 8 & 0xff;
            o[34] = x8 >>> 16 & 0xff;
            o[35] = x8 >>> 24 & 0xff;
            o[36] = x9 >>> 0 & 0xff;
            o[37] = x9 >>> 8 & 0xff;
            o[38] = x9 >>> 16 & 0xff;
            o[39] = x9 >>> 24 & 0xff;
            o[40] = x10 >>> 0 & 0xff;
            o[41] = x10 >>> 8 & 0xff;
            o[42] = x10 >>> 16 & 0xff;
            o[43] = x10 >>> 24 & 0xff;
            o[44] = x11 >>> 0 & 0xff;
            o[45] = x11 >>> 8 & 0xff;
            o[46] = x11 >>> 16 & 0xff;
            o[47] = x11 >>> 24 & 0xff;
            o[48] = x12 >>> 0 & 0xff;
            o[49] = x12 >>> 8 & 0xff;
            o[50] = x12 >>> 16 & 0xff;
            o[51] = x12 >>> 24 & 0xff;
            o[52] = x13 >>> 0 & 0xff;
            o[53] = x13 >>> 8 & 0xff;
            o[54] = x13 >>> 16 & 0xff;
            o[55] = x13 >>> 24 & 0xff;
            o[56] = x14 >>> 0 & 0xff;
            o[57] = x14 >>> 8 & 0xff;
            o[58] = x14 >>> 16 & 0xff;
            o[59] = x14 >>> 24 & 0xff;
            o[60] = x15 >>> 0 & 0xff;
            o[61] = x15 >>> 8 & 0xff;
            o[62] = x15 >>> 16 & 0xff;
            o[63] = x15 >>> 24 & 0xff;
          }

          function core_hsalsa20(o, p, k, c) {
            var j0 = c[0] & 0xff | (c[1] & 0xff) << 8 | (c[2] & 0xff) << 16 | (c[3] & 0xff) << 24,
                j1 = k[0] & 0xff | (k[1] & 0xff) << 8 | (k[2] & 0xff) << 16 | (k[3] & 0xff) << 24,
                j2 = k[4] & 0xff | (k[5] & 0xff) << 8 | (k[6] & 0xff) << 16 | (k[7] & 0xff) << 24,
                j3 = k[8] & 0xff | (k[9] & 0xff) << 8 | (k[10] & 0xff) << 16 | (k[11] & 0xff) << 24,
                j4 = k[12] & 0xff | (k[13] & 0xff) << 8 | (k[14] & 0xff) << 16 | (k[15] & 0xff) << 24,
                j5 = c[4] & 0xff | (c[5] & 0xff) << 8 | (c[6] & 0xff) << 16 | (c[7] & 0xff) << 24,
                j6 = p[0] & 0xff | (p[1] & 0xff) << 8 | (p[2] & 0xff) << 16 | (p[3] & 0xff) << 24,
                j7 = p[4] & 0xff | (p[5] & 0xff) << 8 | (p[6] & 0xff) << 16 | (p[7] & 0xff) << 24,
                j8 = p[8] & 0xff | (p[9] & 0xff) << 8 | (p[10] & 0xff) << 16 | (p[11] & 0xff) << 24,
                j9 = p[12] & 0xff | (p[13] & 0xff) << 8 | (p[14] & 0xff) << 16 | (p[15] & 0xff) << 24,
                j10 = c[8] & 0xff | (c[9] & 0xff) << 8 | (c[10] & 0xff) << 16 | (c[11] & 0xff) << 24,
                j11 = k[16] & 0xff | (k[17] & 0xff) << 8 | (k[18] & 0xff) << 16 | (k[19] & 0xff) << 24,
                j12 = k[20] & 0xff | (k[21] & 0xff) << 8 | (k[22] & 0xff) << 16 | (k[23] & 0xff) << 24,
                j13 = k[24] & 0xff | (k[25] & 0xff) << 8 | (k[26] & 0xff) << 16 | (k[27] & 0xff) << 24,
                j14 = k[28] & 0xff | (k[29] & 0xff) << 8 | (k[30] & 0xff) << 16 | (k[31] & 0xff) << 24,
                j15 = c[12] & 0xff | (c[13] & 0xff) << 8 | (c[14] & 0xff) << 16 | (c[15] & 0xff) << 24;
            var x0 = j0,
                x1 = j1,
                x2 = j2,
                x3 = j3,
                x4 = j4,
                x5 = j5,
                x6 = j6,
                x7 = j7,
                x8 = j8,
                x9 = j9,
                x10 = j10,
                x11 = j11,
                x12 = j12,
                x13 = j13,
                x14 = j14,
                x15 = j15,
                u;

            for (var i = 0; i < 20; i += 2) {
              u = x0 + x12 | 0;
              x4 ^= u << 7 | u >>> 32 - 7;
              u = x4 + x0 | 0;
              x8 ^= u << 9 | u >>> 32 - 9;
              u = x8 + x4 | 0;
              x12 ^= u << 13 | u >>> 32 - 13;
              u = x12 + x8 | 0;
              x0 ^= u << 18 | u >>> 32 - 18;
              u = x5 + x1 | 0;
              x9 ^= u << 7 | u >>> 32 - 7;
              u = x9 + x5 | 0;
              x13 ^= u << 9 | u >>> 32 - 9;
              u = x13 + x9 | 0;
              x1 ^= u << 13 | u >>> 32 - 13;
              u = x1 + x13 | 0;
              x5 ^= u << 18 | u >>> 32 - 18;
              u = x10 + x6 | 0;
              x14 ^= u << 7 | u >>> 32 - 7;
              u = x14 + x10 | 0;
              x2 ^= u << 9 | u >>> 32 - 9;
              u = x2 + x14 | 0;
              x6 ^= u << 13 | u >>> 32 - 13;
              u = x6 + x2 | 0;
              x10 ^= u << 18 | u >>> 32 - 18;
              u = x15 + x11 | 0;
              x3 ^= u << 7 | u >>> 32 - 7;
              u = x3 + x15 | 0;
              x7 ^= u << 9 | u >>> 32 - 9;
              u = x7 + x3 | 0;
              x11 ^= u << 13 | u >>> 32 - 13;
              u = x11 + x7 | 0;
              x15 ^= u << 18 | u >>> 32 - 18;
              u = x0 + x3 | 0;
              x1 ^= u << 7 | u >>> 32 - 7;
              u = x1 + x0 | 0;
              x2 ^= u << 9 | u >>> 32 - 9;
              u = x2 + x1 | 0;
              x3 ^= u << 13 | u >>> 32 - 13;
              u = x3 + x2 | 0;
              x0 ^= u << 18 | u >>> 32 - 18;
              u = x5 + x4 | 0;
              x6 ^= u << 7 | u >>> 32 - 7;
              u = x6 + x5 | 0;
              x7 ^= u << 9 | u >>> 32 - 9;
              u = x7 + x6 | 0;
              x4 ^= u << 13 | u >>> 32 - 13;
              u = x4 + x7 | 0;
              x5 ^= u << 18 | u >>> 32 - 18;
              u = x10 + x9 | 0;
              x11 ^= u << 7 | u >>> 32 - 7;
              u = x11 + x10 | 0;
              x8 ^= u << 9 | u >>> 32 - 9;
              u = x8 + x11 | 0;
              x9 ^= u << 13 | u >>> 32 - 13;
              u = x9 + x8 | 0;
              x10 ^= u << 18 | u >>> 32 - 18;
              u = x15 + x14 | 0;
              x12 ^= u << 7 | u >>> 32 - 7;
              u = x12 + x15 | 0;
              x13 ^= u << 9 | u >>> 32 - 9;
              u = x13 + x12 | 0;
              x14 ^= u << 13 | u >>> 32 - 13;
              u = x14 + x13 | 0;
              x15 ^= u << 18 | u >>> 32 - 18;
            }

            o[0] = x0 >>> 0 & 0xff;
            o[1] = x0 >>> 8 & 0xff;
            o[2] = x0 >>> 16 & 0xff;
            o[3] = x0 >>> 24 & 0xff;
            o[4] = x5 >>> 0 & 0xff;
            o[5] = x5 >>> 8 & 0xff;
            o[6] = x5 >>> 16 & 0xff;
            o[7] = x5 >>> 24 & 0xff;
            o[8] = x10 >>> 0 & 0xff;
            o[9] = x10 >>> 8 & 0xff;
            o[10] = x10 >>> 16 & 0xff;
            o[11] = x10 >>> 24 & 0xff;
            o[12] = x15 >>> 0 & 0xff;
            o[13] = x15 >>> 8 & 0xff;
            o[14] = x15 >>> 16 & 0xff;
            o[15] = x15 >>> 24 & 0xff;
            o[16] = x6 >>> 0 & 0xff;
            o[17] = x6 >>> 8 & 0xff;
            o[18] = x6 >>> 16 & 0xff;
            o[19] = x6 >>> 24 & 0xff;
            o[20] = x7 >>> 0 & 0xff;
            o[21] = x7 >>> 8 & 0xff;
            o[22] = x7 >>> 16 & 0xff;
            o[23] = x7 >>> 24 & 0xff;
            o[24] = x8 >>> 0 & 0xff;
            o[25] = x8 >>> 8 & 0xff;
            o[26] = x8 >>> 16 & 0xff;
            o[27] = x8 >>> 24 & 0xff;
            o[28] = x9 >>> 0 & 0xff;
            o[29] = x9 >>> 8 & 0xff;
            o[30] = x9 >>> 16 & 0xff;
            o[31] = x9 >>> 24 & 0xff;
          }

          function crypto_core_salsa20(out, inp, k, c) {
            core_salsa20(out, inp, k, c);
          }

          function crypto_core_hsalsa20(out, inp, k, c) {
            core_hsalsa20(out, inp, k, c);
          }

          var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]); // "expand 32-byte k"

          function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
            var z = new Uint8Array(16),
                x = new Uint8Array(64);
            var u, i;

            for (i = 0; i < 16; i++) z[i] = 0;

            for (i = 0; i < 8; i++) z[i] = n[i];

            while (b >= 64) {
              crypto_core_salsa20(x, z, k, sigma);

              for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];

              u = 1;

              for (i = 8; i < 16; i++) {
                u = u + (z[i] & 0xff) | 0;
                z[i] = u & 0xff;
                u >>>= 8;
              }

              b -= 64;
              cpos += 64;
              mpos += 64;
            }

            if (b > 0) {
              crypto_core_salsa20(x, z, k, sigma);

              for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
            }

            return 0;
          }

          function crypto_stream_salsa20(c, cpos, b, n, k) {
            var z = new Uint8Array(16),
                x = new Uint8Array(64);
            var u, i;

            for (i = 0; i < 16; i++) z[i] = 0;

            for (i = 0; i < 8; i++) z[i] = n[i];

            while (b >= 64) {
              crypto_core_salsa20(x, z, k, sigma);

              for (i = 0; i < 64; i++) c[cpos + i] = x[i];

              u = 1;

              for (i = 8; i < 16; i++) {
                u = u + (z[i] & 0xff) | 0;
                z[i] = u & 0xff;
                u >>>= 8;
              }

              b -= 64;
              cpos += 64;
            }

            if (b > 0) {
              crypto_core_salsa20(x, z, k, sigma);

              for (i = 0; i < b; i++) c[cpos + i] = x[i];
            }

            return 0;
          }

          function crypto_stream(c, cpos, d, n, k) {
            var s = new Uint8Array(32);
            crypto_core_hsalsa20(s, n, k, sigma);
            var sn = new Uint8Array(8);

            for (var i = 0; i < 8; i++) sn[i] = n[i + 16];

            return crypto_stream_salsa20(c, cpos, d, sn, s);
          }

          function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
            var s = new Uint8Array(32);
            crypto_core_hsalsa20(s, n, k, sigma);
            var sn = new Uint8Array(8);

            for (var i = 0; i < 8; i++) sn[i] = n[i + 16];

            return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
          }
          /*
          * Port of Andrew Moon's Poly1305-donna-16. Public domain.
          * https://github.com/floodyberry/poly1305-donna
          */


          var poly1305 = function (key) {
            this.buffer = new Uint8Array(16);
            this.r = new Uint16Array(10);
            this.h = new Uint16Array(10);
            this.pad = new Uint16Array(8);
            this.leftover = 0;
            this.fin = 0;
            var t0, t1, t2, t3, t4, t5, t6, t7;
            t0 = key[0] & 0xff | (key[1] & 0xff) << 8;
            this.r[0] = t0 & 0x1fff;
            t1 = key[2] & 0xff | (key[3] & 0xff) << 8;
            this.r[1] = (t0 >>> 13 | t1 << 3) & 0x1fff;
            t2 = key[4] & 0xff | (key[5] & 0xff) << 8;
            this.r[2] = (t1 >>> 10 | t2 << 6) & 0x1f03;
            t3 = key[6] & 0xff | (key[7] & 0xff) << 8;
            this.r[3] = (t2 >>> 7 | t3 << 9) & 0x1fff;
            t4 = key[8] & 0xff | (key[9] & 0xff) << 8;
            this.r[4] = (t3 >>> 4 | t4 << 12) & 0x00ff;
            this.r[5] = t4 >>> 1 & 0x1ffe;
            t5 = key[10] & 0xff | (key[11] & 0xff) << 8;
            this.r[6] = (t4 >>> 14 | t5 << 2) & 0x1fff;
            t6 = key[12] & 0xff | (key[13] & 0xff) << 8;
            this.r[7] = (t5 >>> 11 | t6 << 5) & 0x1f81;
            t7 = key[14] & 0xff | (key[15] & 0xff) << 8;
            this.r[8] = (t6 >>> 8 | t7 << 8) & 0x1fff;
            this.r[9] = t7 >>> 5 & 0x007f;
            this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
            this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
            this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
            this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
            this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
            this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
            this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
            this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
          };

          poly1305.prototype.blocks = function (m, mpos, bytes) {
            var hibit = this.fin ? 0 : 1 << 11;
            var t0, t1, t2, t3, t4, t5, t6, t7, c;
            var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
            var h0 = this.h[0],
                h1 = this.h[1],
                h2 = this.h[2],
                h3 = this.h[3],
                h4 = this.h[4],
                h5 = this.h[5],
                h6 = this.h[6],
                h7 = this.h[7],
                h8 = this.h[8],
                h9 = this.h[9];
            var r0 = this.r[0],
                r1 = this.r[1],
                r2 = this.r[2],
                r3 = this.r[3],
                r4 = this.r[4],
                r5 = this.r[5],
                r6 = this.r[6],
                r7 = this.r[7],
                r8 = this.r[8],
                r9 = this.r[9];

            while (bytes >= 16) {
              t0 = m[mpos + 0] & 0xff | (m[mpos + 1] & 0xff) << 8;
              h0 += t0 & 0x1fff;
              t1 = m[mpos + 2] & 0xff | (m[mpos + 3] & 0xff) << 8;
              h1 += (t0 >>> 13 | t1 << 3) & 0x1fff;
              t2 = m[mpos + 4] & 0xff | (m[mpos + 5] & 0xff) << 8;
              h2 += (t1 >>> 10 | t2 << 6) & 0x1fff;
              t3 = m[mpos + 6] & 0xff | (m[mpos + 7] & 0xff) << 8;
              h3 += (t2 >>> 7 | t3 << 9) & 0x1fff;
              t4 = m[mpos + 8] & 0xff | (m[mpos + 9] & 0xff) << 8;
              h4 += (t3 >>> 4 | t4 << 12) & 0x1fff;
              h5 += t4 >>> 1 & 0x1fff;
              t5 = m[mpos + 10] & 0xff | (m[mpos + 11] & 0xff) << 8;
              h6 += (t4 >>> 14 | t5 << 2) & 0x1fff;
              t6 = m[mpos + 12] & 0xff | (m[mpos + 13] & 0xff) << 8;
              h7 += (t5 >>> 11 | t6 << 5) & 0x1fff;
              t7 = m[mpos + 14] & 0xff | (m[mpos + 15] & 0xff) << 8;
              h8 += (t6 >>> 8 | t7 << 8) & 0x1fff;
              h9 += t7 >>> 5 | hibit;
              c = 0;
              d0 = c;
              d0 += h0 * r0;
              d0 += h1 * (5 * r9);
              d0 += h2 * (5 * r8);
              d0 += h3 * (5 * r7);
              d0 += h4 * (5 * r6);
              c = d0 >>> 13;
              d0 &= 0x1fff;
              d0 += h5 * (5 * r5);
              d0 += h6 * (5 * r4);
              d0 += h7 * (5 * r3);
              d0 += h8 * (5 * r2);
              d0 += h9 * (5 * r1);
              c += d0 >>> 13;
              d0 &= 0x1fff;
              d1 = c;
              d1 += h0 * r1;
              d1 += h1 * r0;
              d1 += h2 * (5 * r9);
              d1 += h3 * (5 * r8);
              d1 += h4 * (5 * r7);
              c = d1 >>> 13;
              d1 &= 0x1fff;
              d1 += h5 * (5 * r6);
              d1 += h6 * (5 * r5);
              d1 += h7 * (5 * r4);
              d1 += h8 * (5 * r3);
              d1 += h9 * (5 * r2);
              c += d1 >>> 13;
              d1 &= 0x1fff;
              d2 = c;
              d2 += h0 * r2;
              d2 += h1 * r1;
              d2 += h2 * r0;
              d2 += h3 * (5 * r9);
              d2 += h4 * (5 * r8);
              c = d2 >>> 13;
              d2 &= 0x1fff;
              d2 += h5 * (5 * r7);
              d2 += h6 * (5 * r6);
              d2 += h7 * (5 * r5);
              d2 += h8 * (5 * r4);
              d2 += h9 * (5 * r3);
              c += d2 >>> 13;
              d2 &= 0x1fff;
              d3 = c;
              d3 += h0 * r3;
              d3 += h1 * r2;
              d3 += h2 * r1;
              d3 += h3 * r0;
              d3 += h4 * (5 * r9);
              c = d3 >>> 13;
              d3 &= 0x1fff;
              d3 += h5 * (5 * r8);
              d3 += h6 * (5 * r7);
              d3 += h7 * (5 * r6);
              d3 += h8 * (5 * r5);
              d3 += h9 * (5 * r4);
              c += d3 >>> 13;
              d3 &= 0x1fff;
              d4 = c;
              d4 += h0 * r4;
              d4 += h1 * r3;
              d4 += h2 * r2;
              d4 += h3 * r1;
              d4 += h4 * r0;
              c = d4 >>> 13;
              d4 &= 0x1fff;
              d4 += h5 * (5 * r9);
              d4 += h6 * (5 * r8);
              d4 += h7 * (5 * r7);
              d4 += h8 * (5 * r6);
              d4 += h9 * (5 * r5);
              c += d4 >>> 13;
              d4 &= 0x1fff;
              d5 = c;
              d5 += h0 * r5;
              d5 += h1 * r4;
              d5 += h2 * r3;
              d5 += h3 * r2;
              d5 += h4 * r1;
              c = d5 >>> 13;
              d5 &= 0x1fff;
              d5 += h5 * r0;
              d5 += h6 * (5 * r9);
              d5 += h7 * (5 * r8);
              d5 += h8 * (5 * r7);
              d5 += h9 * (5 * r6);
              c += d5 >>> 13;
              d5 &= 0x1fff;
              d6 = c;
              d6 += h0 * r6;
              d6 += h1 * r5;
              d6 += h2 * r4;
              d6 += h3 * r3;
              d6 += h4 * r2;
              c = d6 >>> 13;
              d6 &= 0x1fff;
              d6 += h5 * r1;
              d6 += h6 * r0;
              d6 += h7 * (5 * r9);
              d6 += h8 * (5 * r8);
              d6 += h9 * (5 * r7);
              c += d6 >>> 13;
              d6 &= 0x1fff;
              d7 = c;
              d7 += h0 * r7;
              d7 += h1 * r6;
              d7 += h2 * r5;
              d7 += h3 * r4;
              d7 += h4 * r3;
              c = d7 >>> 13;
              d7 &= 0x1fff;
              d7 += h5 * r2;
              d7 += h6 * r1;
              d7 += h7 * r0;
              d7 += h8 * (5 * r9);
              d7 += h9 * (5 * r8);
              c += d7 >>> 13;
              d7 &= 0x1fff;
              d8 = c;
              d8 += h0 * r8;
              d8 += h1 * r7;
              d8 += h2 * r6;
              d8 += h3 * r5;
              d8 += h4 * r4;
              c = d8 >>> 13;
              d8 &= 0x1fff;
              d8 += h5 * r3;
              d8 += h6 * r2;
              d8 += h7 * r1;
              d8 += h8 * r0;
              d8 += h9 * (5 * r9);
              c += d8 >>> 13;
              d8 &= 0x1fff;
              d9 = c;
              d9 += h0 * r9;
              d9 += h1 * r8;
              d9 += h2 * r7;
              d9 += h3 * r6;
              d9 += h4 * r5;
              c = d9 >>> 13;
              d9 &= 0x1fff;
              d9 += h5 * r4;
              d9 += h6 * r3;
              d9 += h7 * r2;
              d9 += h8 * r1;
              d9 += h9 * r0;
              c += d9 >>> 13;
              d9 &= 0x1fff;
              c = (c << 2) + c | 0;
              c = c + d0 | 0;
              d0 = c & 0x1fff;
              c = c >>> 13;
              d1 += c;
              h0 = d0;
              h1 = d1;
              h2 = d2;
              h3 = d3;
              h4 = d4;
              h5 = d5;
              h6 = d6;
              h7 = d7;
              h8 = d8;
              h9 = d9;
              mpos += 16;
              bytes -= 16;
            }

            this.h[0] = h0;
            this.h[1] = h1;
            this.h[2] = h2;
            this.h[3] = h3;
            this.h[4] = h4;
            this.h[5] = h5;
            this.h[6] = h6;
            this.h[7] = h7;
            this.h[8] = h8;
            this.h[9] = h9;
          };

          poly1305.prototype.finish = function (mac, macpos) {
            var g = new Uint16Array(10);
            var c, mask, f, i;

            if (this.leftover) {
              i = this.leftover;
              this.buffer[i++] = 1;

              for (; i < 16; i++) this.buffer[i] = 0;

              this.fin = 1;
              this.blocks(this.buffer, 0, 16);
            }

            c = this.h[1] >>> 13;
            this.h[1] &= 0x1fff;

            for (i = 2; i < 10; i++) {
              this.h[i] += c;
              c = this.h[i] >>> 13;
              this.h[i] &= 0x1fff;
            }

            this.h[0] += c * 5;
            c = this.h[0] >>> 13;
            this.h[0] &= 0x1fff;
            this.h[1] += c;
            c = this.h[1] >>> 13;
            this.h[1] &= 0x1fff;
            this.h[2] += c;
            g[0] = this.h[0] + 5;
            c = g[0] >>> 13;
            g[0] &= 0x1fff;

            for (i = 1; i < 10; i++) {
              g[i] = this.h[i] + c;
              c = g[i] >>> 13;
              g[i] &= 0x1fff;
            }

            g[9] -= 1 << 13;
            mask = (c ^ 1) - 1;

            for (i = 0; i < 10; i++) g[i] &= mask;

            mask = ~mask;

            for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];

            this.h[0] = (this.h[0] | this.h[1] << 13) & 0xffff;
            this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 0xffff;
            this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 0xffff;
            this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 0xffff;
            this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 0xffff;
            this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 0xffff;
            this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 0xffff;
            this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 0xffff;
            f = this.h[0] + this.pad[0];
            this.h[0] = f & 0xffff;

            for (i = 1; i < 8; i++) {
              f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
              this.h[i] = f & 0xffff;
            }

            mac[macpos + 0] = this.h[0] >>> 0 & 0xff;
            mac[macpos + 1] = this.h[0] >>> 8 & 0xff;
            mac[macpos + 2] = this.h[1] >>> 0 & 0xff;
            mac[macpos + 3] = this.h[1] >>> 8 & 0xff;
            mac[macpos + 4] = this.h[2] >>> 0 & 0xff;
            mac[macpos + 5] = this.h[2] >>> 8 & 0xff;
            mac[macpos + 6] = this.h[3] >>> 0 & 0xff;
            mac[macpos + 7] = this.h[3] >>> 8 & 0xff;
            mac[macpos + 8] = this.h[4] >>> 0 & 0xff;
            mac[macpos + 9] = this.h[4] >>> 8 & 0xff;
            mac[macpos + 10] = this.h[5] >>> 0 & 0xff;
            mac[macpos + 11] = this.h[5] >>> 8 & 0xff;
            mac[macpos + 12] = this.h[6] >>> 0 & 0xff;
            mac[macpos + 13] = this.h[6] >>> 8 & 0xff;
            mac[macpos + 14] = this.h[7] >>> 0 & 0xff;
            mac[macpos + 15] = this.h[7] >>> 8 & 0xff;
          };

          poly1305.prototype.update = function (m, mpos, bytes) {
            var i, want;

            if (this.leftover) {
              want = 16 - this.leftover;
              if (want > bytes) want = bytes;

              for (i = 0; i < want; i++) this.buffer[this.leftover + i] = m[mpos + i];

              bytes -= want;
              mpos += want;
              this.leftover += want;
              if (this.leftover < 16) return;
              this.blocks(this.buffer, 0, 16);
              this.leftover = 0;
            }

            if (bytes >= 16) {
              want = bytes - bytes % 16;
              this.blocks(m, mpos, want);
              mpos += want;
              bytes -= want;
            }

            if (bytes) {
              for (i = 0; i < bytes; i++) this.buffer[this.leftover + i] = m[mpos + i];

              this.leftover += bytes;
            }
          };

          function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
            var s = new poly1305(k);
            s.update(m, mpos, n);
            s.finish(out, outpos);
            return 0;
          }

          function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
            var x = new Uint8Array(16);
            crypto_onetimeauth(x, 0, m, mpos, n, k);
            return crypto_verify_16(h, hpos, x, 0);
          }

          function crypto_secretbox(c, m, d, n, k) {
            var i;
            if (d < 32) return -1;
            crypto_stream_xor(c, 0, m, 0, d, n, k);
            crypto_onetimeauth(c, 16, c, 32, d - 32, c);

            for (i = 0; i < 16; i++) c[i] = 0;

            return 0;
          }

          function crypto_secretbox_open(m, c, d, n, k) {
            var i;
            var x = new Uint8Array(32);
            if (d < 32) return -1;
            crypto_stream(x, 0, 32, n, k);
            if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
            crypto_stream_xor(m, 0, c, 0, d, n, k);

            for (i = 0; i < 32; i++) m[i] = 0;

            return 0;
          }

          function set25519(r, a) {
            var i;

            for (i = 0; i < 16; i++) r[i] = a[i] | 0;
          }

          function car25519(o) {
            var i,
                v,
                c = 1;

            for (i = 0; i < 16; i++) {
              v = o[i] + c + 65535;
              c = Math.floor(v / 65536);
              o[i] = v - c * 65536;
            }

            o[0] += c - 1 + 37 * (c - 1);
          }

          function sel25519(p, q, b) {
            var t,
                c = ~(b - 1);

            for (var i = 0; i < 16; i++) {
              t = c & (p[i] ^ q[i]);
              p[i] ^= t;
              q[i] ^= t;
            }
          }

          function pack25519(o, n) {
            var i, j, b;
            var m = gf(),
                t = gf();

            for (i = 0; i < 16; i++) t[i] = n[i];

            car25519(t);
            car25519(t);
            car25519(t);

            for (j = 0; j < 2; j++) {
              m[0] = t[0] - 0xffed;

              for (i = 1; i < 15; i++) {
                m[i] = t[i] - 0xffff - (m[i - 1] >> 16 & 1);
                m[i - 1] &= 0xffff;
              }

              m[15] = t[15] - 0x7fff - (m[14] >> 16 & 1);
              b = m[15] >> 16 & 1;
              m[14] &= 0xffff;
              sel25519(t, m, 1 - b);
            }

            for (i = 0; i < 16; i++) {
              o[2 * i] = t[i] & 0xff;
              o[2 * i + 1] = t[i] >> 8;
            }
          }

          function neq25519(a, b) {
            var c = new Uint8Array(32),
                d = new Uint8Array(32);
            pack25519(c, a);
            pack25519(d, b);
            return crypto_verify_32(c, 0, d, 0);
          }

          function par25519(a) {
            var d = new Uint8Array(32);
            pack25519(d, a);
            return d[0] & 1;
          }

          function unpack25519(o, n) {
            var i;

            for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);

            o[15] &= 0x7fff;
          }

          function A(o, a, b) {
            for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
          }

          function Z(o, a, b) {
            for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
          }

          function M(o, a, b) {
            var v,
                c,
                t0 = 0,
                t1 = 0,
                t2 = 0,
                t3 = 0,
                t4 = 0,
                t5 = 0,
                t6 = 0,
                t7 = 0,
                t8 = 0,
                t9 = 0,
                t10 = 0,
                t11 = 0,
                t12 = 0,
                t13 = 0,
                t14 = 0,
                t15 = 0,
                t16 = 0,
                t17 = 0,
                t18 = 0,
                t19 = 0,
                t20 = 0,
                t21 = 0,
                t22 = 0,
                t23 = 0,
                t24 = 0,
                t25 = 0,
                t26 = 0,
                t27 = 0,
                t28 = 0,
                t29 = 0,
                t30 = 0,
                b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5],
                b6 = b[6],
                b7 = b[7],
                b8 = b[8],
                b9 = b[9],
                b10 = b[10],
                b11 = b[11],
                b12 = b[12],
                b13 = b[13],
                b14 = b[14],
                b15 = b[15];
            v = a[0];
            t0 += v * b0;
            t1 += v * b1;
            t2 += v * b2;
            t3 += v * b3;
            t4 += v * b4;
            t5 += v * b5;
            t6 += v * b6;
            t7 += v * b7;
            t8 += v * b8;
            t9 += v * b9;
            t10 += v * b10;
            t11 += v * b11;
            t12 += v * b12;
            t13 += v * b13;
            t14 += v * b14;
            t15 += v * b15;
            v = a[1];
            t1 += v * b0;
            t2 += v * b1;
            t3 += v * b2;
            t4 += v * b3;
            t5 += v * b4;
            t6 += v * b5;
            t7 += v * b6;
            t8 += v * b7;
            t9 += v * b8;
            t10 += v * b9;
            t11 += v * b10;
            t12 += v * b11;
            t13 += v * b12;
            t14 += v * b13;
            t15 += v * b14;
            t16 += v * b15;
            v = a[2];
            t2 += v * b0;
            t3 += v * b1;
            t4 += v * b2;
            t5 += v * b3;
            t6 += v * b4;
            t7 += v * b5;
            t8 += v * b6;
            t9 += v * b7;
            t10 += v * b8;
            t11 += v * b9;
            t12 += v * b10;
            t13 += v * b11;
            t14 += v * b12;
            t15 += v * b13;
            t16 += v * b14;
            t17 += v * b15;
            v = a[3];
            t3 += v * b0;
            t4 += v * b1;
            t5 += v * b2;
            t6 += v * b3;
            t7 += v * b4;
            t8 += v * b5;
            t9 += v * b6;
            t10 += v * b7;
            t11 += v * b8;
            t12 += v * b9;
            t13 += v * b10;
            t14 += v * b11;
            t15 += v * b12;
            t16 += v * b13;
            t17 += v * b14;
            t18 += v * b15;
            v = a[4];
            t4 += v * b0;
            t5 += v * b1;
            t6 += v * b2;
            t7 += v * b3;
            t8 += v * b4;
            t9 += v * b5;
            t10 += v * b6;
            t11 += v * b7;
            t12 += v * b8;
            t13 += v * b9;
            t14 += v * b10;
            t15 += v * b11;
            t16 += v * b12;
            t17 += v * b13;
            t18 += v * b14;
            t19 += v * b15;
            v = a[5];
            t5 += v * b0;
            t6 += v * b1;
            t7 += v * b2;
            t8 += v * b3;
            t9 += v * b4;
            t10 += v * b5;
            t11 += v * b6;
            t12 += v * b7;
            t13 += v * b8;
            t14 += v * b9;
            t15 += v * b10;
            t16 += v * b11;
            t17 += v * b12;
            t18 += v * b13;
            t19 += v * b14;
            t20 += v * b15;
            v = a[6];
            t6 += v * b0;
            t7 += v * b1;
            t8 += v * b2;
            t9 += v * b3;
            t10 += v * b4;
            t11 += v * b5;
            t12 += v * b6;
            t13 += v * b7;
            t14 += v * b8;
            t15 += v * b9;
            t16 += v * b10;
            t17 += v * b11;
            t18 += v * b12;
            t19 += v * b13;
            t20 += v * b14;
            t21 += v * b15;
            v = a[7];
            t7 += v * b0;
            t8 += v * b1;
            t9 += v * b2;
            t10 += v * b3;
            t11 += v * b4;
            t12 += v * b5;
            t13 += v * b6;
            t14 += v * b7;
            t15 += v * b8;
            t16 += v * b9;
            t17 += v * b10;
            t18 += v * b11;
            t19 += v * b12;
            t20 += v * b13;
            t21 += v * b14;
            t22 += v * b15;
            v = a[8];
            t8 += v * b0;
            t9 += v * b1;
            t10 += v * b2;
            t11 += v * b3;
            t12 += v * b4;
            t13 += v * b5;
            t14 += v * b6;
            t15 += v * b7;
            t16 += v * b8;
            t17 += v * b9;
            t18 += v * b10;
            t19 += v * b11;
            t20 += v * b12;
            t21 += v * b13;
            t22 += v * b14;
            t23 += v * b15;
            v = a[9];
            t9 += v * b0;
            t10 += v * b1;
            t11 += v * b2;
            t12 += v * b3;
            t13 += v * b4;
            t14 += v * b5;
            t15 += v * b6;
            t16 += v * b7;
            t17 += v * b8;
            t18 += v * b9;
            t19 += v * b10;
            t20 += v * b11;
            t21 += v * b12;
            t22 += v * b13;
            t23 += v * b14;
            t24 += v * b15;
            v = a[10];
            t10 += v * b0;
            t11 += v * b1;
            t12 += v * b2;
            t13 += v * b3;
            t14 += v * b4;
            t15 += v * b5;
            t16 += v * b6;
            t17 += v * b7;
            t18 += v * b8;
            t19 += v * b9;
            t20 += v * b10;
            t21 += v * b11;
            t22 += v * b12;
            t23 += v * b13;
            t24 += v * b14;
            t25 += v * b15;
            v = a[11];
            t11 += v * b0;
            t12 += v * b1;
            t13 += v * b2;
            t14 += v * b3;
            t15 += v * b4;
            t16 += v * b5;
            t17 += v * b6;
            t18 += v * b7;
            t19 += v * b8;
            t20 += v * b9;
            t21 += v * b10;
            t22 += v * b11;
            t23 += v * b12;
            t24 += v * b13;
            t25 += v * b14;
            t26 += v * b15;
            v = a[12];
            t12 += v * b0;
            t13 += v * b1;
            t14 += v * b2;
            t15 += v * b3;
            t16 += v * b4;
            t17 += v * b5;
            t18 += v * b6;
            t19 += v * b7;
            t20 += v * b8;
            t21 += v * b9;
            t22 += v * b10;
            t23 += v * b11;
            t24 += v * b12;
            t25 += v * b13;
            t26 += v * b14;
            t27 += v * b15;
            v = a[13];
            t13 += v * b0;
            t14 += v * b1;
            t15 += v * b2;
            t16 += v * b3;
            t17 += v * b4;
            t18 += v * b5;
            t19 += v * b6;
            t20 += v * b7;
            t21 += v * b8;
            t22 += v * b9;
            t23 += v * b10;
            t24 += v * b11;
            t25 += v * b12;
            t26 += v * b13;
            t27 += v * b14;
            t28 += v * b15;
            v = a[14];
            t14 += v * b0;
            t15 += v * b1;
            t16 += v * b2;
            t17 += v * b3;
            t18 += v * b4;
            t19 += v * b5;
            t20 += v * b6;
            t21 += v * b7;
            t22 += v * b8;
            t23 += v * b9;
            t24 += v * b10;
            t25 += v * b11;
            t26 += v * b12;
            t27 += v * b13;
            t28 += v * b14;
            t29 += v * b15;
            v = a[15];
            t15 += v * b0;
            t16 += v * b1;
            t17 += v * b2;
            t18 += v * b3;
            t19 += v * b4;
            t20 += v * b5;
            t21 += v * b6;
            t22 += v * b7;
            t23 += v * b8;
            t24 += v * b9;
            t25 += v * b10;
            t26 += v * b11;
            t27 += v * b12;
            t28 += v * b13;
            t29 += v * b14;
            t30 += v * b15;
            t0 += 38 * t16;
            t1 += 38 * t17;
            t2 += 38 * t18;
            t3 += 38 * t19;
            t4 += 38 * t20;
            t5 += 38 * t21;
            t6 += 38 * t22;
            t7 += 38 * t23;
            t8 += 38 * t24;
            t9 += 38 * t25;
            t10 += 38 * t26;
            t11 += 38 * t27;
            t12 += 38 * t28;
            t13 += 38 * t29;
            t14 += 38 * t30; // t15 left as is
            // first car

            c = 1;
            v = t0 + c + 65535;
            c = Math.floor(v / 65536);
            t0 = v - c * 65536;
            v = t1 + c + 65535;
            c = Math.floor(v / 65536);
            t1 = v - c * 65536;
            v = t2 + c + 65535;
            c = Math.floor(v / 65536);
            t2 = v - c * 65536;
            v = t3 + c + 65535;
            c = Math.floor(v / 65536);
            t3 = v - c * 65536;
            v = t4 + c + 65535;
            c = Math.floor(v / 65536);
            t4 = v - c * 65536;
            v = t5 + c + 65535;
            c = Math.floor(v / 65536);
            t5 = v - c * 65536;
            v = t6 + c + 65535;
            c = Math.floor(v / 65536);
            t6 = v - c * 65536;
            v = t7 + c + 65535;
            c = Math.floor(v / 65536);
            t7 = v - c * 65536;
            v = t8 + c + 65535;
            c = Math.floor(v / 65536);
            t8 = v - c * 65536;
            v = t9 + c + 65535;
            c = Math.floor(v / 65536);
            t9 = v - c * 65536;
            v = t10 + c + 65535;
            c = Math.floor(v / 65536);
            t10 = v - c * 65536;
            v = t11 + c + 65535;
            c = Math.floor(v / 65536);
            t11 = v - c * 65536;
            v = t12 + c + 65535;
            c = Math.floor(v / 65536);
            t12 = v - c * 65536;
            v = t13 + c + 65535;
            c = Math.floor(v / 65536);
            t13 = v - c * 65536;
            v = t14 + c + 65535;
            c = Math.floor(v / 65536);
            t14 = v - c * 65536;
            v = t15 + c + 65535;
            c = Math.floor(v / 65536);
            t15 = v - c * 65536;
            t0 += c - 1 + 37 * (c - 1); // second car

            c = 1;
            v = t0 + c + 65535;
            c = Math.floor(v / 65536);
            t0 = v - c * 65536;
            v = t1 + c + 65535;
            c = Math.floor(v / 65536);
            t1 = v - c * 65536;
            v = t2 + c + 65535;
            c = Math.floor(v / 65536);
            t2 = v - c * 65536;
            v = t3 + c + 65535;
            c = Math.floor(v / 65536);
            t3 = v - c * 65536;
            v = t4 + c + 65535;
            c = Math.floor(v / 65536);
            t4 = v - c * 65536;
            v = t5 + c + 65535;
            c = Math.floor(v / 65536);
            t5 = v - c * 65536;
            v = t6 + c + 65535;
            c = Math.floor(v / 65536);
            t6 = v - c * 65536;
            v = t7 + c + 65535;
            c = Math.floor(v / 65536);
            t7 = v - c * 65536;
            v = t8 + c + 65535;
            c = Math.floor(v / 65536);
            t8 = v - c * 65536;
            v = t9 + c + 65535;
            c = Math.floor(v / 65536);
            t9 = v - c * 65536;
            v = t10 + c + 65535;
            c = Math.floor(v / 65536);
            t10 = v - c * 65536;
            v = t11 + c + 65535;
            c = Math.floor(v / 65536);
            t11 = v - c * 65536;
            v = t12 + c + 65535;
            c = Math.floor(v / 65536);
            t12 = v - c * 65536;
            v = t13 + c + 65535;
            c = Math.floor(v / 65536);
            t13 = v - c * 65536;
            v = t14 + c + 65535;
            c = Math.floor(v / 65536);
            t14 = v - c * 65536;
            v = t15 + c + 65535;
            c = Math.floor(v / 65536);
            t15 = v - c * 65536;
            t0 += c - 1 + 37 * (c - 1);
            o[0] = t0;
            o[1] = t1;
            o[2] = t2;
            o[3] = t3;
            o[4] = t4;
            o[5] = t5;
            o[6] = t6;
            o[7] = t7;
            o[8] = t8;
            o[9] = t9;
            o[10] = t10;
            o[11] = t11;
            o[12] = t12;
            o[13] = t13;
            o[14] = t14;
            o[15] = t15;
          }

          function S(o, a) {
            M(o, a, a);
          }

          function inv25519(o, i) {
            var c = gf();
            var a;

            for (a = 0; a < 16; a++) c[a] = i[a];

            for (a = 253; a >= 0; a--) {
              S(c, c);
              if (a !== 2 && a !== 4) M(c, c, i);
            }

            for (a = 0; a < 16; a++) o[a] = c[a];
          }

          function pow2523(o, i) {
            var c = gf();
            var a;

            for (a = 0; a < 16; a++) c[a] = i[a];

            for (a = 250; a >= 0; a--) {
              S(c, c);
              if (a !== 1) M(c, c, i);
            }

            for (a = 0; a < 16; a++) o[a] = c[a];
          }

          function crypto_scalarmult(q, n, p) {
            var z = new Uint8Array(32);
            var x = new Float64Array(80),
                r,
                i;
            var a = gf(),
                b = gf(),
                c = gf(),
                d = gf(),
                e = gf(),
                f = gf();

            for (i = 0; i < 31; i++) z[i] = n[i];

            z[31] = n[31] & 127 | 64;
            z[0] &= 248;
            unpack25519(x, p);

            for (i = 0; i < 16; i++) {
              b[i] = x[i];
              d[i] = a[i] = c[i] = 0;
            }

            a[0] = d[0] = 1;

            for (i = 254; i >= 0; --i) {
              r = z[i >>> 3] >>> (i & 7) & 1;
              sel25519(a, b, r);
              sel25519(c, d, r);
              A(e, a, c);
              Z(a, a, c);
              A(c, b, d);
              Z(b, b, d);
              S(d, e);
              S(f, a);
              M(a, c, a);
              M(c, b, e);
              A(e, a, c);
              Z(a, a, c);
              S(b, a);
              Z(c, d, f);
              M(a, c, _121665);
              A(a, a, d);
              M(c, c, a);
              M(a, d, f);
              M(d, b, x);
              S(b, e);
              sel25519(a, b, r);
              sel25519(c, d, r);
            }

            for (i = 0; i < 16; i++) {
              x[i + 16] = a[i];
              x[i + 32] = c[i];
              x[i + 48] = b[i];
              x[i + 64] = d[i];
            }

            var x32 = x.subarray(32);
            var x16 = x.subarray(16);
            inv25519(x32, x32);
            M(x16, x16, x32);
            pack25519(q, x16);
            return 0;
          }

          function crypto_scalarmult_base(q, n) {
            return crypto_scalarmult(q, n, _9);
          }

          function crypto_box_keypair(y, x) {
            randombytes(x, 32);
            return crypto_scalarmult_base(y, x);
          }

          function crypto_box_beforenm(k, y, x) {
            var s = new Uint8Array(32);
            crypto_scalarmult(s, x, y);
            return crypto_core_hsalsa20(k, _0, s, sigma);
          }

          var crypto_box_afternm = crypto_secretbox;
          var crypto_box_open_afternm = crypto_secretbox_open;

          function crypto_box(c, m, d, n, y, x) {
            var k = new Uint8Array(32);
            crypto_box_beforenm(k, y, x);
            return crypto_box_afternm(c, m, d, n, k);
          }

          function crypto_box_open(m, c, d, n, y, x) {
            var k = new Uint8Array(32);
            crypto_box_beforenm(k, y, x);
            return crypto_box_open_afternm(m, c, d, n, k);
          }

          var K = [0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc, 0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118, 0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2, 0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694, 0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3, 0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65, 0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5, 0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4, 0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70, 0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df, 0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b, 0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30, 0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8, 0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8, 0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb, 0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3, 0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec, 0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b, 0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178, 0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b, 0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c, 0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817];

          function crypto_hashblocks_hl(hh, hl, m, n) {
            var wh = new Int32Array(16),
                wl = new Int32Array(16),
                bh0,
                bh1,
                bh2,
                bh3,
                bh4,
                bh5,
                bh6,
                bh7,
                bl0,
                bl1,
                bl2,
                bl3,
                bl4,
                bl5,
                bl6,
                bl7,
                th,
                tl,
                i,
                j,
                h,
                l,
                a,
                b,
                c,
                d;
            var ah0 = hh[0],
                ah1 = hh[1],
                ah2 = hh[2],
                ah3 = hh[3],
                ah4 = hh[4],
                ah5 = hh[5],
                ah6 = hh[6],
                ah7 = hh[7],
                al0 = hl[0],
                al1 = hl[1],
                al2 = hl[2],
                al3 = hl[3],
                al4 = hl[4],
                al5 = hl[5],
                al6 = hl[6],
                al7 = hl[7];
            var pos = 0;

            while (n >= 128) {
              for (i = 0; i < 16; i++) {
                j = 8 * i + pos;
                wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
                wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
              }

              for (i = 0; i < 80; i++) {
                bh0 = ah0;
                bh1 = ah1;
                bh2 = ah2;
                bh3 = ah3;
                bh4 = ah4;
                bh5 = ah5;
                bh6 = ah6;
                bh7 = ah7;
                bl0 = al0;
                bl1 = al1;
                bl2 = al2;
                bl3 = al3;
                bl4 = al4;
                bl5 = al5;
                bl6 = al6;
                bl7 = al7; // add

                h = ah7;
                l = al7;
                a = l & 0xffff;
                b = l >>> 16;
                c = h & 0xffff;
                d = h >>> 16; // Sigma1

                h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
                l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16; // Ch

                h = ah4 & ah5 ^ ~ah4 & ah6;
                l = al4 & al5 ^ ~al4 & al6;
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16; // K

                h = K[i * 2];
                l = K[i * 2 + 1];
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16; // w

                h = wh[i % 16];
                l = wl[i % 16];
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                th = c & 0xffff | d << 16;
                tl = a & 0xffff | b << 16; // add

                h = th;
                l = tl;
                a = l & 0xffff;
                b = l >>> 16;
                c = h & 0xffff;
                d = h >>> 16; // Sigma0

                h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
                l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16; // Maj

                h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
                l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                bh7 = c & 0xffff | d << 16;
                bl7 = a & 0xffff | b << 16; // add

                h = bh3;
                l = bl3;
                a = l & 0xffff;
                b = l >>> 16;
                c = h & 0xffff;
                d = h >>> 16;
                h = th;
                l = tl;
                a += l & 0xffff;
                b += l >>> 16;
                c += h & 0xffff;
                d += h >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                bh3 = c & 0xffff | d << 16;
                bl3 = a & 0xffff | b << 16;
                ah1 = bh0;
                ah2 = bh1;
                ah3 = bh2;
                ah4 = bh3;
                ah5 = bh4;
                ah6 = bh5;
                ah7 = bh6;
                ah0 = bh7;
                al1 = bl0;
                al2 = bl1;
                al3 = bl2;
                al4 = bl3;
                al5 = bl4;
                al6 = bl5;
                al7 = bl6;
                al0 = bl7;

                if (i % 16 === 15) {
                  for (j = 0; j < 16; j++) {
                    // add
                    h = wh[j];
                    l = wl[j];
                    a = l & 0xffff;
                    b = l >>> 16;
                    c = h & 0xffff;
                    d = h >>> 16;
                    h = wh[(j + 9) % 16];
                    l = wl[(j + 9) % 16];
                    a += l & 0xffff;
                    b += l >>> 16;
                    c += h & 0xffff;
                    d += h >>> 16; // sigma0

                    th = wh[(j + 1) % 16];
                    tl = wl[(j + 1) % 16];
                    h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                    l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                    a += l & 0xffff;
                    b += l >>> 16;
                    c += h & 0xffff;
                    d += h >>> 16; // sigma1

                    th = wh[(j + 14) % 16];
                    tl = wl[(j + 14) % 16];
                    h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                    l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                    a += l & 0xffff;
                    b += l >>> 16;
                    c += h & 0xffff;
                    d += h >>> 16;
                    b += a >>> 16;
                    c += b >>> 16;
                    d += c >>> 16;
                    wh[j] = c & 0xffff | d << 16;
                    wl[j] = a & 0xffff | b << 16;
                  }
                }
              } // add


              h = ah0;
              l = al0;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[0];
              l = hl[0];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[0] = ah0 = c & 0xffff | d << 16;
              hl[0] = al0 = a & 0xffff | b << 16;
              h = ah1;
              l = al1;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[1];
              l = hl[1];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[1] = ah1 = c & 0xffff | d << 16;
              hl[1] = al1 = a & 0xffff | b << 16;
              h = ah2;
              l = al2;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[2];
              l = hl[2];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[2] = ah2 = c & 0xffff | d << 16;
              hl[2] = al2 = a & 0xffff | b << 16;
              h = ah3;
              l = al3;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[3];
              l = hl[3];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[3] = ah3 = c & 0xffff | d << 16;
              hl[3] = al3 = a & 0xffff | b << 16;
              h = ah4;
              l = al4;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[4];
              l = hl[4];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[4] = ah4 = c & 0xffff | d << 16;
              hl[4] = al4 = a & 0xffff | b << 16;
              h = ah5;
              l = al5;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[5];
              l = hl[5];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[5] = ah5 = c & 0xffff | d << 16;
              hl[5] = al5 = a & 0xffff | b << 16;
              h = ah6;
              l = al6;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[6];
              l = hl[6];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[6] = ah6 = c & 0xffff | d << 16;
              hl[6] = al6 = a & 0xffff | b << 16;
              h = ah7;
              l = al7;
              a = l & 0xffff;
              b = l >>> 16;
              c = h & 0xffff;
              d = h >>> 16;
              h = hh[7];
              l = hl[7];
              a += l & 0xffff;
              b += l >>> 16;
              c += h & 0xffff;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              hh[7] = ah7 = c & 0xffff | d << 16;
              hl[7] = al7 = a & 0xffff | b << 16;
              pos += 128;
              n -= 128;
            }

            return n;
          }

          function crypto_hash(out, m, n) {
            var hh = new Int32Array(8),
                hl = new Int32Array(8),
                x = new Uint8Array(256),
                i,
                b = n;
            hh[0] = 0x6a09e667;
            hh[1] = 0xbb67ae85;
            hh[2] = 0x3c6ef372;
            hh[3] = 0xa54ff53a;
            hh[4] = 0x510e527f;
            hh[5] = 0x9b05688c;
            hh[6] = 0x1f83d9ab;
            hh[7] = 0x5be0cd19;
            hl[0] = 0xf3bcc908;
            hl[1] = 0x84caa73b;
            hl[2] = 0xfe94f82b;
            hl[3] = 0x5f1d36f1;
            hl[4] = 0xade682d1;
            hl[5] = 0x2b3e6c1f;
            hl[6] = 0xfb41bd6b;
            hl[7] = 0x137e2179;
            crypto_hashblocks_hl(hh, hl, m, n);
            n %= 128;

            for (i = 0; i < n; i++) x[i] = m[b - n + i];

            x[n] = 128;
            n = 256 - 128 * (n < 112 ? 1 : 0);
            x[n - 9] = 0;
            ts64(x, n - 8, b / 0x20000000 | 0, b << 3);
            crypto_hashblocks_hl(hh, hl, x, n);

            for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);

            return 0;
          }

          function add(p, q) {
            var a = gf(),
                b = gf(),
                c = gf(),
                d = gf(),
                e = gf(),
                f = gf(),
                g = gf(),
                h = gf(),
                t = gf();
            Z(a, p[1], p[0]);
            Z(t, q[1], q[0]);
            M(a, a, t);
            A(b, p[0], p[1]);
            A(t, q[0], q[1]);
            M(b, b, t);
            M(c, p[3], q[3]);
            M(c, c, D2);
            M(d, p[2], q[2]);
            A(d, d, d);
            Z(e, b, a);
            Z(f, d, c);
            A(g, d, c);
            A(h, b, a);
            M(p[0], e, f);
            M(p[1], h, g);
            M(p[2], g, f);
            M(p[3], e, h);
          }

          function cswap(p, q, b) {
            var i;

            for (i = 0; i < 4; i++) {
              sel25519(p[i], q[i], b);
            }
          }

          function pack(r, p) {
            var tx = gf(),
                ty = gf(),
                zi = gf();
            inv25519(zi, p[2]);
            M(tx, p[0], zi);
            M(ty, p[1], zi);
            pack25519(r, ty);
            r[31] ^= par25519(tx) << 7;
          }

          function scalarmult(p, q, s) {
            var b, i;
            set25519(p[0], gf0);
            set25519(p[1], gf1);
            set25519(p[2], gf1);
            set25519(p[3], gf0);

            for (i = 255; i >= 0; --i) {
              b = s[i / 8 | 0] >> (i & 7) & 1;
              cswap(p, q, b);
              add(q, p);
              add(p, p);
              cswap(p, q, b);
            }
          }

          function scalarbase(p, s) {
            var q = [gf(), gf(), gf(), gf()];
            set25519(q[0], X);
            set25519(q[1], Y);
            set25519(q[2], gf1);
            M(q[3], X, Y);
            scalarmult(p, q, s);
          }

          function crypto_sign_keypair(pk, sk, seeded) {
            var d = new Uint8Array(64);
            var p = [gf(), gf(), gf(), gf()];
            var i;
            if (!seeded) randombytes(sk, 32);
            crypto_hash(d, sk, 32);
            d[0] &= 248;
            d[31] &= 127;
            d[31] |= 64;
            scalarbase(p, d);
            pack(pk, p);

            for (i = 0; i < 32; i++) sk[i + 32] = pk[i];

            return 0;
          }

          var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

          function modL(r, x) {
            var carry, i, j, k;

            for (i = 63; i >= 32; --i) {
              carry = 0;

              for (j = i - 32, k = i - 12; j < k; ++j) {
                x[j] += carry - 16 * x[i] * L[j - (i - 32)];
                carry = Math.floor((x[j] + 128) / 256);
                x[j] -= carry * 256;
              }

              x[j] += carry;
              x[i] = 0;
            }

            carry = 0;

            for (j = 0; j < 32; j++) {
              x[j] += carry - (x[31] >> 4) * L[j];
              carry = x[j] >> 8;
              x[j] &= 255;
            }

            for (j = 0; j < 32; j++) x[j] -= carry * L[j];

            for (i = 0; i < 32; i++) {
              x[i + 1] += x[i] >> 8;
              r[i] = x[i] & 255;
            }
          }

          function reduce(r) {
            var x = new Float64Array(64),
                i;

            for (i = 0; i < 64; i++) x[i] = r[i];

            for (i = 0; i < 64; i++) r[i] = 0;

            modL(r, x);
          } // Note: difference from C - smlen returned, not passed as argument.


          function crypto_sign(sm, m, n, sk) {
            var d = new Uint8Array(64),
                h = new Uint8Array(64),
                r = new Uint8Array(64);
            var i,
                j,
                x = new Float64Array(64);
            var p = [gf(), gf(), gf(), gf()];
            crypto_hash(d, sk, 32);
            d[0] &= 248;
            d[31] &= 127;
            d[31] |= 64;
            var smlen = n + 64;

            for (i = 0; i < n; i++) sm[64 + i] = m[i];

            for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

            crypto_hash(r, sm.subarray(32), n + 32);
            reduce(r);
            scalarbase(p, r);
            pack(sm, p);

            for (i = 32; i < 64; i++) sm[i] = sk[i];

            crypto_hash(h, sm, n + 64);
            reduce(h);

            for (i = 0; i < 64; i++) x[i] = 0;

            for (i = 0; i < 32; i++) x[i] = r[i];

            for (i = 0; i < 32; i++) {
              for (j = 0; j < 32; j++) {
                x[i + j] += h[i] * d[j];
              }
            }

            modL(sm.subarray(32), x);
            return smlen;
          }

          function unpackneg(r, p) {
            var t = gf(),
                chk = gf(),
                num = gf(),
                den = gf(),
                den2 = gf(),
                den4 = gf(),
                den6 = gf();
            set25519(r[2], gf1);
            unpack25519(r[1], p);
            S(num, r[1]);
            M(den, num, D);
            Z(num, num, r[2]);
            A(den, r[2], den);
            S(den2, den);
            S(den4, den2);
            M(den6, den4, den2);
            M(t, den6, num);
            M(t, t, den);
            pow2523(t, t);
            M(t, t, num);
            M(t, t, den);
            M(t, t, den);
            M(r[0], t, den);
            S(chk, r[0]);
            M(chk, chk, den);
            if (neq25519(chk, num)) M(r[0], r[0], I);
            S(chk, r[0]);
            M(chk, chk, den);
            if (neq25519(chk, num)) return -1;
            if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
            M(r[3], r[0], r[1]);
            return 0;
          }

          function crypto_sign_open(m, sm, n, pk) {
            var i;
            var t = new Uint8Array(32),
                h = new Uint8Array(64);
            var p = [gf(), gf(), gf(), gf()],
                q = [gf(), gf(), gf(), gf()];
            if (n < 64) return -1;
            if (unpackneg(q, pk)) return -1;

            for (i = 0; i < n; i++) m[i] = sm[i];

            for (i = 0; i < 32; i++) m[i + 32] = pk[i];

            crypto_hash(h, m, n);
            reduce(h);
            scalarmult(p, q, h);
            scalarbase(q, sm.subarray(32));
            add(p, q);
            pack(t, p);
            n -= 64;

            if (crypto_verify_32(sm, 0, t, 0)) {
              for (i = 0; i < n; i++) m[i] = 0;

              return -1;
            }

            for (i = 0; i < n; i++) m[i] = sm[i + 64];

            return n;
          }

          var crypto_secretbox_KEYBYTES = 32,
              crypto_secretbox_NONCEBYTES = 24,
              crypto_secretbox_ZEROBYTES = 32,
              crypto_secretbox_BOXZEROBYTES = 16,
              crypto_scalarmult_BYTES = 32,
              crypto_scalarmult_SCALARBYTES = 32,
              crypto_box_PUBLICKEYBYTES = 32,
              crypto_box_SECRETKEYBYTES = 32,
              crypto_box_BEFORENMBYTES = 32,
              crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
              crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
              crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
              crypto_sign_BYTES = 64,
              crypto_sign_PUBLICKEYBYTES = 32,
              crypto_sign_SECRETKEYBYTES = 64,
              crypto_sign_SEEDBYTES = 32,
              crypto_hash_BYTES = 64;
          nacl.lowlevel = {
            crypto_core_hsalsa20: crypto_core_hsalsa20,
            crypto_stream_xor: crypto_stream_xor,
            crypto_stream: crypto_stream,
            crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
            crypto_stream_salsa20: crypto_stream_salsa20,
            crypto_onetimeauth: crypto_onetimeauth,
            crypto_onetimeauth_verify: crypto_onetimeauth_verify,
            crypto_verify_16: crypto_verify_16,
            crypto_verify_32: crypto_verify_32,
            crypto_secretbox: crypto_secretbox,
            crypto_secretbox_open: crypto_secretbox_open,
            crypto_scalarmult: crypto_scalarmult,
            crypto_scalarmult_base: crypto_scalarmult_base,
            crypto_box_beforenm: crypto_box_beforenm,
            crypto_box_afternm: crypto_box_afternm,
            crypto_box: crypto_box,
            crypto_box_open: crypto_box_open,
            crypto_box_keypair: crypto_box_keypair,
            crypto_hash: crypto_hash,
            crypto_sign: crypto_sign,
            crypto_sign_keypair: crypto_sign_keypair,
            crypto_sign_open: crypto_sign_open,
            crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
            crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
            crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
            crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
            crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
            crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
            crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
            crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
            crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
            crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
            crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
            crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
            crypto_sign_BYTES: crypto_sign_BYTES,
            crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
            crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
            crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
            crypto_hash_BYTES: crypto_hash_BYTES,
            gf: gf,
            D: D,
            L: L,
            pack25519: pack25519,
            unpack25519: unpack25519,
            M: M,
            A: A,
            S: S,
            Z: Z,
            pow2523: pow2523,
            add: add,
            set25519: set25519,
            modL: modL,
            scalarmult: scalarmult,
            scalarbase: scalarbase
          };
          /* High-level API */

          function checkLengths(k, n) {
            if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
            if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
          }

          function checkBoxLengths(pk, sk) {
            if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
            if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
          }

          function checkArrayTypes() {
            for (var i = 0; i < arguments.length; i++) {
              if (!(arguments[i] instanceof Uint8Array)) throw new TypeError('unexpected type, use Uint8Array');
            }
          }

          function cleanup(arr) {
            for (var i = 0; i < arr.length; i++) arr[i] = 0;
          }

          nacl.randomBytes = function (n) {
            var b = new Uint8Array(n);
            randombytes(b, n);
            return b;
          };

          nacl.secretbox = function (msg, nonce, key) {
            checkArrayTypes(msg, nonce, key);
            checkLengths(key, nonce);
            var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
            var c = new Uint8Array(m.length);

            for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];

            crypto_secretbox(c, m, m.length, nonce, key);
            return c.subarray(crypto_secretbox_BOXZEROBYTES);
          };

          nacl.secretbox.open = function (box, nonce, key) {
            checkArrayTypes(box, nonce, key);
            checkLengths(key, nonce);
            var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
            var m = new Uint8Array(c.length);

            for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];

            if (c.length < 32) return null;
            if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
            return m.subarray(crypto_secretbox_ZEROBYTES);
          };

          nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
          nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
          nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

          nacl.scalarMult = function (n, p) {
            checkArrayTypes(n, p);
            if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
            if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
            var q = new Uint8Array(crypto_scalarmult_BYTES);
            crypto_scalarmult(q, n, p);
            return q;
          };

          nacl.scalarMult.base = function (n) {
            checkArrayTypes(n);
            if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
            var q = new Uint8Array(crypto_scalarmult_BYTES);
            crypto_scalarmult_base(q, n);
            return q;
          };

          nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
          nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

          nacl.box = function (msg, nonce, publicKey, secretKey) {
            var k = nacl.box.before(publicKey, secretKey);
            return nacl.secretbox(msg, nonce, k);
          };

          nacl.box.before = function (publicKey, secretKey) {
            checkArrayTypes(publicKey, secretKey);
            checkBoxLengths(publicKey, secretKey);
            var k = new Uint8Array(crypto_box_BEFORENMBYTES);
            crypto_box_beforenm(k, publicKey, secretKey);
            return k;
          };

          nacl.box.after = nacl.secretbox;

          nacl.box.open = function (msg, nonce, publicKey, secretKey) {
            var k = nacl.box.before(publicKey, secretKey);
            return nacl.secretbox.open(msg, nonce, k);
          };

          nacl.box.open.after = nacl.secretbox.open;

          nacl.box.keyPair = function () {
            var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
            var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
            crypto_box_keypair(pk, sk);
            return {
              publicKey: pk,
              secretKey: sk
            };
          };

          nacl.box.keyPair.fromSecretKey = function (secretKey) {
            checkArrayTypes(secretKey);
            if (secretKey.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
            var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
            crypto_scalarmult_base(pk, secretKey);
            return {
              publicKey: pk,
              secretKey: new Uint8Array(secretKey)
            };
          };

          nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
          nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
          nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
          nacl.box.nonceLength = crypto_box_NONCEBYTES;
          nacl.box.overheadLength = nacl.secretbox.overheadLength;

          nacl.sign = function (msg, secretKey) {
            checkArrayTypes(msg, secretKey);
            if (secretKey.length !== crypto_sign_SECRETKEYBYTES) throw new Error('bad secret key size');
            var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
            crypto_sign(signedMsg, msg, msg.length, secretKey);
            return signedMsg;
          };

          nacl.sign.open = function (signedMsg, publicKey) {
            checkArrayTypes(signedMsg, publicKey);
            if (publicKey.length !== crypto_sign_PUBLICKEYBYTES) throw new Error('bad public key size');
            var tmp = new Uint8Array(signedMsg.length);
            var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
            if (mlen < 0) return null;
            var m = new Uint8Array(mlen);

            for (var i = 0; i < m.length; i++) m[i] = tmp[i];

            return m;
          };

          nacl.sign.detached = function (msg, secretKey) {
            var signedMsg = nacl.sign(msg, secretKey);
            var sig = new Uint8Array(crypto_sign_BYTES);

            for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];

            return sig;
          };

          nacl.sign.detached.verify = function (msg, sig, publicKey) {
            checkArrayTypes(msg, sig, publicKey);
            if (sig.length !== crypto_sign_BYTES) throw new Error('bad signature size');
            if (publicKey.length !== crypto_sign_PUBLICKEYBYTES) throw new Error('bad public key size');
            var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
            var m = new Uint8Array(crypto_sign_BYTES + msg.length);
            var i;

            for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];

            for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];

            return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
          };

          nacl.sign.keyPair = function () {
            var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
            var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
            crypto_sign_keypair(pk, sk);
            return {
              publicKey: pk,
              secretKey: sk
            };
          };

          nacl.sign.keyPair.fromSecretKey = function (secretKey) {
            checkArrayTypes(secretKey);
            if (secretKey.length !== crypto_sign_SECRETKEYBYTES) throw new Error('bad secret key size');
            var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);

            for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];

            return {
              publicKey: pk,
              secretKey: new Uint8Array(secretKey)
            };
          };

          nacl.sign.keyPair.fromSeed = function (seed) {
            checkArrayTypes(seed);
            if (seed.length !== crypto_sign_SEEDBYTES) throw new Error('bad seed size');
            var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
            var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);

            for (var i = 0; i < 32; i++) sk[i] = seed[i];

            crypto_sign_keypair(pk, sk, true);
            return {
              publicKey: pk,
              secretKey: sk
            };
          };

          nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
          nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
          nacl.sign.seedLength = crypto_sign_SEEDBYTES;
          nacl.sign.signatureLength = crypto_sign_BYTES;

          nacl.hash = function (msg) {
            checkArrayTypes(msg);
            var h = new Uint8Array(crypto_hash_BYTES);
            crypto_hash(h, msg, msg.length);
            return h;
          };

          nacl.hash.hashLength = crypto_hash_BYTES;

          nacl.verify = function (x, y) {
            checkArrayTypes(x, y); // Zero length arguments are considered not equal.

            if (x.length === 0 || y.length === 0) return false;
            if (x.length !== y.length) return false;
            return vn(x, 0, y, 0, x.length) === 0 ? true : false;
          };

          nacl.setPRNG = function (fn) {
            randombytes = fn;
          };

          (function () {
            // Initialize PRNG if environment provides CSPRNG.
            // If not, methods calling randombytes will throw.
            var crypto = typeof self !== 'undefined' ? self.crypto || self.msCrypto : null;

            if (crypto && crypto.getRandomValues) {
              // Browsers.
              var QUOTA = 65536;
              nacl.setPRNG(function (x, n) {
                var i,
                    v = new Uint8Array(n);

                for (i = 0; i < n; i += QUOTA) {
                  crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
                }

                for (i = 0; i < n; i++) x[i] = v[i];

                cleanup(v);
              });
            } else if (typeof require !== 'undefined') {
              // Node.js.
              crypto = require('crypto');

              if (crypto && crypto.randomBytes) {
                nacl.setPRNG(function (x, n) {
                  var i,
                      v = crypto.randomBytes(n);

                  for (i = 0; i < n; i++) x[i] = v[i];

                  cleanup(v);
                });
              }
            }
          })();
        })(typeof module !== 'undefined' && module.exports ? module.exports : self.nacl = self.nacl || {});
      }, {
        "crypto": 116
      }],
      124: [function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.DOMException = void 0;
        exports.Headers = Headers;
        exports.Request = Request;
        exports.Response = Response;
        exports.fetch = fetch;
        var global = typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof global !== 'undefined' && global;
        var support = {
          searchParams: 'URLSearchParams' in global,
          iterable: 'Symbol' in global && 'iterator' in Symbol,
          blob: 'FileReader' in global && 'Blob' in global && function () {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          }(),
          formData: 'FormData' in global,
          arrayBuffer: 'ArrayBuffer' in global
        };

        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }

        if (support.arrayBuffer) {
          var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];

          var isArrayBufferView = ArrayBuffer.isView || function (obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }

        function normalizeName(name) {
          if (typeof name !== 'string') {
            name = String(name);
          }

          if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
            throw new TypeError('Invalid character in header field name: "' + name + '"');
          }

          return name.toLowerCase();
        }

        function normalizeValue(value) {
          if (typeof value !== 'string') {
            value = String(value);
          }

          return value;
        } // Build a destructive iterator for the value list


        function iteratorFor(items) {
          var iterator = {
            next: function () {
              var value = items.shift();
              return {
                done: value === undefined,
                value: value
              };
            }
          };

          if (support.iterable) {
            iterator[Symbol.iterator] = function () {
              return iterator;
            };
          }

          return iterator;
        }

        function Headers(headers) {
          this.map = {};

          if (headers instanceof Headers) {
            headers.forEach(function (value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function (header) {
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function (name) {
              this.append(name, headers[name]);
            }, this);
          }
        }

        Headers.prototype.append = function (name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ', ' + value : value;
        };

        Headers.prototype['delete'] = function (name) {
          delete this.map[normalizeName(name)];
        };

        Headers.prototype.get = function (name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };

        Headers.prototype.has = function (name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };

        Headers.prototype.set = function (name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };

        Headers.prototype.forEach = function (callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };

        Headers.prototype.keys = function () {
          var items = [];
          this.forEach(function (value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };

        Headers.prototype.values = function () {
          var items = [];
          this.forEach(function (value) {
            items.push(value);
          });
          return iteratorFor(items);
        };

        Headers.prototype.entries = function () {
          var items = [];
          this.forEach(function (value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };

        if (support.iterable) {
          Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
        }

        function consumed(body) {
          if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'));
          }

          body.bodyUsed = true;
        }

        function fileReaderReady(reader) {
          return new Promise(function (resolve, reject) {
            reader.onload = function () {
              resolve(reader.result);
            };

            reader.onerror = function () {
              reject(reader.error);
            };
          });
        }

        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }

        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsText(blob);
          return promise;
        }

        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);

          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
          }

          return chars.join('');
        }

        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }

        function Body() {
          this.bodyUsed = false;

          this._initBody = function (body) {
            /*
              fetch-mock wraps the Response object in an ES6 Proxy to
              provide useful test harness features such as flush. However, on
              ES5 browsers without fetch or Proxy support pollyfills must be used;
              the proxy-pollyfill is unable to proxy an attribute unless it exists
              on the object before the Proxy is created. This change ensures
              Response.bodyUsed exists on the instance, while maintaining the
              semantic of setting Request.bodyUsed in the constructor before
              _initBody is called.
            */
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;

            if (!body) {
              this._bodyText = '';
            } else if (typeof body === 'string') {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.

              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }

            if (!this.headers.get('content-type')) {
              if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8');
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set('content-type', this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
              }
            }
          };

          if (support.blob) {
            this.blob = function () {
              var rejected = consumed(this);

              if (rejected) {
                return rejected;
              }

              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as blob');
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };

            this.arrayBuffer = function () {
              if (this._bodyArrayBuffer) {
                var isConsumed = consumed(this);

                if (isConsumed) {
                  return isConsumed;
                }

                if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                  return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
                } else {
                  return Promise.resolve(this._bodyArrayBuffer);
                }
              } else {
                return this.blob().then(readBlobAsArrayBuffer);
              }
            };
          }

          this.text = function () {
            var rejected = consumed(this);

            if (rejected) {
              return rejected;
            }

            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as text');
            } else {
              return Promise.resolve(this._bodyText);
            }
          };

          if (support.formData) {
            this.formData = function () {
              return this.text().then(decode);
            };
          }

          this.json = function () {
            return this.text().then(JSON.parse);
          };

          return this;
        } // HTTP methods whose capitalization should be normalized


        var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }

        function Request(input, options) {
          if (!(this instanceof Request)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }

          options = options || {};
          var body = options.body;

          if (input instanceof Request) {
            if (input.bodyUsed) {
              throw new TypeError('Already read');
            }

            this.url = input.url;
            this.credentials = input.credentials;

            if (!options.headers) {
              this.headers = new Headers(input.headers);
            }

            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;

            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }

          this.credentials = options.credentials || this.credentials || 'same-origin';

          if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
          }

          this.method = normalizeMethod(options.method || this.method || 'GET');
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal;
          this.referrer = null;

          if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
          }

          this._initBody(body);

          if (this.method === 'GET' || this.method === 'HEAD') {
            if (options.cache === 'no-store' || options.cache === 'no-cache') {
              // Search for a '_' parameter in the query string
              var reParamSearch = /([?&])_=[^&]*/;

              if (reParamSearch.test(this.url)) {
                // If it already exists then set the value with the current time
                this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
              } else {
                // Otherwise add a new '_' parameter to the end with the current time
                var reQueryString = /\?/;
                this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
              }
            }
          }
        }

        Request.prototype.clone = function () {
          return new Request(this, {
            body: this._bodyInit
          });
        };

        function decode(body) {
          var form = new FormData();
          body.trim().split('&').forEach(function (bytes) {
            if (bytes) {
              var split = bytes.split('=');
              var name = split.shift().replace(/\+/g, ' ');
              var value = split.join('=').replace(/\+/g, ' ');
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }

        function parseHeaders(rawHeaders) {
          var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
          // https://tools.ietf.org/html/rfc7230#section-3.2

          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' '); // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
          // https://github.com/github/fetch/issues/748
          // https://github.com/zloirock/core-js/issues/751

          preProcessedHeaders.split('\r').map(function (header) {
            return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header;
          }).forEach(function (line) {
            var parts = line.split(':');
            var key = parts.shift().trim();

            if (key) {
              var value = parts.join(':').trim();
              headers.append(key, value);
            }
          });
          return headers;
        }

        Body.call(Request.prototype);

        function Response(bodyInit, options) {
          if (!(this instanceof Response)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }

          if (!options) {
            options = {};
          }

          this.type = 'default';
          this.status = options.status === undefined ? 200 : options.status;
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
          this.headers = new Headers(options.headers);
          this.url = options.url || '';

          this._initBody(bodyInit);
        }

        Body.call(Response.prototype);

        Response.prototype.clone = function () {
          return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
          });
        };

        Response.error = function () {
          var response = new Response(null, {
            status: 0,
            statusText: ''
          });
          response.type = 'error';
          return response;
        };

        var redirectStatuses = [301, 302, 303, 307, 308];

        Response.redirect = function (url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code');
          }

          return new Response(null, {
            status: status,
            headers: {
              location: url
            }
          });
        };

        var DOMException = global.DOMException;
        exports.DOMException = DOMException;

        try {
          new DOMException();
        } catch (err) {
          exports.DOMException = DOMException = function (message, name) {
            this.message = message;
            this.name = name;
            var error = Error(message);
            this.stack = error.stack;
          };

          DOMException.prototype = Object.create(Error.prototype);
          DOMException.prototype.constructor = DOMException;
        }

        function fetch(input, init) {
          return new Promise(function (resolve, reject) {
            var request = new Request(input, init);

            if (request.signal && request.signal.aborted) {
              return reject(new DOMException('Aborted', 'AbortError'));
            }

            var xhr = new XMLHttpRequest();

            function abortXhr() {
              xhr.abort();
            }

            xhr.onload = function () {
              var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || '')
              };
              options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
              var body = 'response' in xhr ? xhr.response : xhr.responseText;
              setTimeout(function () {
                resolve(new Response(body, options));
              }, 0);
            };

            xhr.onerror = function () {
              setTimeout(function () {
                reject(new TypeError('Network request failed'));
              }, 0);
            };

            xhr.ontimeout = function () {
              setTimeout(function () {
                reject(new TypeError('Network request failed'));
              }, 0);
            };

            xhr.onabort = function () {
              setTimeout(function () {
                reject(new DOMException('Aborted', 'AbortError'));
              }, 0);
            };

            function fixUrl(url) {
              try {
                return url === '' && global.location.href ? global.location.href : url;
              } catch (e) {
                return url;
              }
            }

            xhr.open(request.method, fixUrl(request.url), true);

            if (request.credentials === 'include') {
              xhr.withCredentials = true;
            } else if (request.credentials === 'omit') {
              xhr.withCredentials = false;
            }

            if ('responseType' in xhr) {
              if (support.blob) {
                xhr.responseType = 'blob';
              } else if (support.arrayBuffer && request.headers.get('Content-Type') && request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
                xhr.responseType = 'arraybuffer';
              }
            }

            if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
              Object.getOwnPropertyNames(init.headers).forEach(function (name) {
                xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
              });
            } else {
              request.headers.forEach(function (value, name) {
                xhr.setRequestHeader(name, value);
              });
            }

            if (request.signal) {
              request.signal.addEventListener('abort', abortXhr);

              xhr.onreadystatechange = function () {
                // DONE (success or failure)
                if (xhr.readyState === 4) {
                  request.signal.removeEventListener('abort', abortXhr);
                }
              };
            }

            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
          });
        }

        fetch.polyfill = true;

        if (!global.fetch) {
          global.fetch = fetch;
          global.Headers = Headers;
          global.Request = Request;
          global.Response = Response;
        }
      }, {}]
    }, {}, [2]);
  }).call(root);
})( // The environment-specific global.
function () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof this !== 'undefined') return this;
  return {};
}.call(this));