# KoCtorBindings

**KoCtorBindings version 1.0.0-beta**  
Nan.Common.Scripts-JavaScript/KoExtensions/KoCtorBindings  
**Support for constructor bindings in Knockout.js version 3.x**  

Copyright (C) 2019 Julio P. Di Egidio (<http://julio.diegidio.name>)  
KoCtorBindings is part of the
[Nan.Common.Scripts-JavaScript](https://github.com/jp-diegidio/Nan.Common.Scripts-JavaScript) library.  
KoCtorBindings is released under the terms of the
[GNU-GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) license.  
As usual, NO WARRANTY OF ANY KIND is implied.  

This is an **Open Project**: suggestions, bug reports, pull requests,
etc. all very welcome.

## Introduction

> *We have unleashed the power of JS constructors in KO: now the sky is the limit...*

KoCtorBindings is a JS script that extends
[Knockout.js](https://knockoutjs.com) version 3.x (henceforth, KO) with
support for **constructors in bindings**.

KoCtorBindings is **100% transparent over KO**, and [as of 2019-10-24]
works in all recent versions of the major desktop and mobile browsers,
as well as in Node.js and in any environment where KO is supported.

[KoCtorBindings is a wrapper around KO's binding system.  Of course,
the ideal scenario would be to have this functionality directly
integrated into KO: but we will wait for KO 4, which is presently well
under way, before attempting changes to KO itself and a pull request.]

## Description

KoCtorBindings augments KO's binding system with support for
**constructor functions in bindings**.

These functions are executed at init binding time and are expected to:

1) instantiate/access some data-or-accessor to be used for the actual
   binding at runtime; and,
2) return that data-or-accessor wrapped into a `KoConstructed` object.

Arguably, there are at least two main advantages with constructors in
bindings:

- Support for the *constructor pattern*, which is natural to
  functional programming and the essential source of genuine
  code-level modularity in any language...

- Actual *separation of concerns* between interface development (in
  HTML/CSS) and scripts development (in JS): in particular, we can pass
  context data or some initial state to the constructors directly from
  declarative syntax (as opposed to KO's plain observables, which can
  only be instantiated in scripts before binding time)...

Moreover, KoCtorBindings enables
**full control over the scope of KO's dependency tracking**:
no code in the constructor function will generate dependencies, only
the data-or-accessor wrapped into the returned `KoConstructed` object
will be subject to dependency tracking (as in an "ignore dependencies"
in reverse, and on steroids, because, as said, in this direction we
unleash the power of modular construction...).

## Usage

KoCtorBindings hooks directly into KO's namespace, so it does not
depend on any specific module system, but (for inclusion in a web page)
it requires that, at script inclusion time, KO be already available in
the global scope.

Upon inclusion of the script, KoCtorBindings exposes **two constructors**:

- **`ko.Constructed(dataOrAccessor: KoDataOrAccessor): KoConstructed`**  
  Returns a `KoConstructed` object that wraps the given `dataOrAccessor`.  
  This is meant to be used in a constructor function as described above.  

- **`ko.CtorBindingHandler(name: String[, Handler: Function]): KoCtorBindingHandler`**  
  Returns a `KoCtorBindingHandler` object that wraps and augments with
  support for constructor bindings an existing or a new binding handler
  with the given `name`.  
  If `Handler` is a function, a new binding handler is created by
  calling `new Handler(name)`, which is expected to return an instance
  of some (KO-standard, i.e. not augmented) custom binding handler.  

**NOTE**: KoCtorBindings
**automatically wraps all existing binding handlers** at script
inclusion time!  As a consequence, there is no need to call
`ko.CtorBindingHandler` in user code unless for augmenting the
functionality of a custom binding handler defined after inclusion of the
KoCtorBindings script.

## Examples

### Example 1: Button titles

This is our main motivating example: here the goal is to allow the
interface coder to specify button titles in the most *natural* as well
as most *effective* way.  Without KoCtorBindings, the only possible
approach in these cases is either maintain some external configuration
in scripts, or pollute both interface and scripts code with ad hoc
custom bindings in every place such constructions are needed...

```html
<button disabled data-bind="
    enable: canTrigger,
    click: trigger,
    html: TriggerTitle({
        disconnect: 'DISCONNECT',
        connect: 'CONNECT',
        reconnect: 'RECONNECT',
        booting: 'Booting',
        connecting: 'Connecting',
        disconnecting: 'Disconnecting'
    })">
    &nbsp;
</button>
```

```js
this.TriggerTitle = function (titles) {
    return ko.Constructed(function () {
        switch (_state()) {
            // enabled
            case CLIENT_STATE.CONNECTED: return titles.disconnect;
            case CLIENT_STATE.DISCONNECTED: return titles.connect;
            case CLIENT_STATE.ERRORED: return titles.reconnect;
            // disabled
            case CLIENT_STATE.BOOTING: return titles.booting;
            case CLIENT_STATE.CONNECTING: return titles.connecting;
            case CLIENT_STATE.DISCONNECTING: return titles.disconnecting;
        }
    });
};
```

### Example 2: Miscellanea

In fact, we can pass any data-or-accessor to `ko.Constructed`, as in the
following example where we are wrapping primitive and (writeable!)
observable data, as well as "accessor" functions (which is just not
possible with plain KO).  Templated bindings also work, but this is not
shown here.

```html
<input type="text" data-bind="textInput: TestValue()">
<button data-bind="click: function () { testValue(''); }">Clear</button>
<span data-bind="text: testValue"></span>
<span data-bind="text: ko.Constructed(' -- 0')"></span>
<span data-bind="text: ko.Constructed(function () { return ' -- 1'; })"></span>
```

```js
var _testValue = this.testValue = new ko.observable("TEST");

this.TestValue = function () { return ko.Constructed(_testValue); };
```

A slightly expanded example can be found in the file [example.html](./example.html).
