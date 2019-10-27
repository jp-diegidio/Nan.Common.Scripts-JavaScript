/*
KoCtorBindings version 1.0.0-beta
Nan.Common.Scripts-JavaScript/KoExtensions/KoCtorBindings
Support for constructor bindings in Knockout.js version 3.x

Copyright (C) 2019 Julio P. Di Egidio (http://julio.diegidio.name)
KoCtorBindings is part of the Nan.Common.Scripts-JavaScript library
(see https://github.com/jp-diegidio/Nan.Common.Scripts-JavaScript).
KoCtorBindings is released under the terms of the GNU-GPLv3 license.
As usual, NO WARRANTY OF ANY KIND is implied.
*/

(function ($global, $factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(["knockout"], $factory);
	}
	else if (typeof exports === "object" && exports) {
		module.exports = $factory(require("knockout"));
	}
	else {
		$factory($global.ko);
	}
})(this, function ($ko) {
	"use strict";

	function KoConstructed(dataOrAccessor) {
		return {
			dataOrAccessor: dataOrAccessor,
			__KoConstructed__: true
		};
	}

	function KoCtorBindingHandler(name, Handler) {
		function ISOBJ(x) {
			return typeof x === "object" && x !== null;
		}

		function ISFUNC(x) {
			return typeof x === "function" && !$ko.isObservable(x);
		}

		function ValueAccessor(dataOrAccessor) {
			if (ISFUNC(dataOrAccessor)) {
				return dataOrAccessor;  // accessor
			}

			return function () { return dataOrAccessor; };  // data
		}

		function NewBindings(dataOrAccessor, allBindings) {
			var bindings = allBindings();

			bindings[name] = dataOrAccessor;

			function newBindings() { return bindings; };
			newBindings.get = function (name) { return bindings[name]; };
			newBindings.has = function (name) { return !!bindings[name]; };

			return newBindings;
		}

		function BindingInfo(dataOrAccessor, allBindings) {
			return {
				valueAccessor: ValueAccessor(dataOrAccessor),
				allBindings: NewBindings(dataOrAccessor, allBindings)
			};
		}

		BindingInfo.CtorElement = function (element, bindingInfo) {
			if (!element.__KoCtorBindingInfos__) {
				element.__KoCtorBindingInfos__ = {};
			}

			element.__KoCtorBindingInfos__[name] = bindingInfo;
		};

		BindingInfo.CtorInfo = function (value, allBindings) {
			if (ISOBJ(value) && value.__KoConstructed__) {
				return BindingInfo(value.dataOrAccessor, allBindings);
			}
		};

		BindingInfo.ctorInfo = function (element) {
			if (element.__KoCtorBindingInfos__) {
				return element.__KoCtorBindingInfos__[name];
			}
		};

		var _inner = ISFUNC(Handler) ? new Handler(name) : $ko.bindingHandlers[name];

		var _wrapper = Object.create(_inner);

		_wrapper.init = function (element, valueAccessor, allBindings, viewModel, bindingCtx) {
			var ctorBindingInfo = BindingInfo.CtorInfo(valueAccessor(), allBindings);

			if (ctorBindingInfo) {
				// NOTE: Marking the element in any case:
				BindingInfo.CtorElement(element, ctorBindingInfo);

				if (_inner.init) {
					valueAccessor = ctorBindingInfo.valueAccessor;  // overwrite
					allBindings = ctorBindingInfo.allBindings;      // overwrite
				}
			}

			if (_inner.init) {
				return _inner.init(element, valueAccessor, allBindings, viewModel, bindingCtx);
			}
		};

		if (_inner.update) {
			_wrapper.update = function (element, valueAccessor, allBindings, viewModel, bindingCtx) {
				var ctorBindingInfo = BindingInfo.ctorInfo(element);

				if (ctorBindingInfo) {
					valueAccessor = ctorBindingInfo.valueAccessor;  // overwrite
					allBindings = ctorBindingInfo.allBindings;      // overwrite
				}

				_inner.update(element, valueAccessor, allBindings, viewModel, bindingCtx);
			};
		}

		return $ko.bindingHandlers[name] = _wrapper;  // overwrite
	}

	// NOTE: Overwriting (only) existing handlers:
	Object.keys($ko.bindingHandlers).forEach(KoCtorBindingHandler);

	$ko.Constructed = KoConstructed;
	$ko.CtorBindingHandler = KoCtorBindingHandler;
});
