# amp-derivedify
Simple util for making derived property helpers. This is fairly meta, so we'll start simple. If you just want to dive into examples, the tests are a good place to start.

[ampersand-state](https://github.com/AmpersandJS/ampersand-state) allows you to define derived properties like so:

```js
var Person = AmpersandState.extend({
  props: {
      active: 'boolean',
  },
  derived: {
    inActive: {
      deps: ['active'],
      fn: function () {
        return !this.active;
      }
    }
  }
});
```
You probably wouldn't define a separate property just for `!active`, especially when it's so verbose, but just humour me for a moment. This is pretty nice and expressive, but imagine I'm feeling especially functional, so I define a `not` function, like this:

```js
var not = function(bool){ return !bool; };
// ...
  derived: {
    inActive: {
      deps: ['active'],
      fn: function () {
        return not(this.active);
      }
    }
  }
```

I have attempted to find a similarly defined function on npm without success, which is strange. At any rate, this doesn't seem much better. However, what about if I write a new `derivedNot` function, one designed for derived properties instead of boolean literals?

```js
var derivedNot = function(propName){
  return {
    deps: [propName],
    fn: function(){
        return not(this[propName]);
    }
  };
}
// ...
    derived: {
      inActive: derivedNot('active')
    }
```

Now my derived property section has started to look quite nice and we can save `derivedNot` in a helper file and use it anywhere we need it. In my opinion this is terse, but readable. As it happens the logic involved in creating `derivedNot` from `not` is totally abstractable, and it can work the same way for all pure functions. This is what `derivedify` does.

```js
var not = function(bool){ return !bool; };
var derivedNot = derivedify(not);

var Person = AmpersandState.extend({
    props: {
        active: 'boolean',
    },
    derived: {
        inActive: derivedNot('active')
    }
});
```

Another example:
```js
  derived: {
    activeUsers: {
      deps: ['users'],
      fn: function(){
        return _.filter(this.users, 'active');
      }
    }
  }
```

```js
var derivedFilter = derivedify(_.filter);
  ...
  derived: {
    activeUsers: derivedFilter('users', derivedify.l('active'))
  }
```
The important thing to note is how the arguments to `derivedFilter` relate to the arguments to `_.filter` - `derivedFilter` accepts property names and other derived properties as arguments instead of array and string literals which `_.filter` accepts. You'll notice that when we want to pass a string literal (such as `'active'`), instead of a property name, we need to wrap it in in `derivedify.l` (`l` stands for literal) so that `derivedify` doesn't search for a property named `active`, which doesn't exist.

## derivedify(func)

 - `func` {function} A pure function - it should deal only with inputs and outputs and have no side effects.

Pass in any pure function which accepts some inputs. Returns a function `derivedFunc` which accepts property names or other derived property definitions and returns a derived property definition. This derived property definition will depend on any passed property names and it will invoke `func` with those properties as inputs.

## derivedify.l(literal)

 - `literal` any javascript literal - strings, numbers, objects, arrays and booleans are all fine

When defining derived properties that should depend on literal strings, as opposed to strings as property names, use `derivedify.l` to wrap the literal in its own derived property.

## Composition

Because functions created using `derivedify` can accept either property names or other derived property definitions as inputs, they are totally composable. If you find yourself making intermediate properties, just remember you do have the option to chain them:

```js
  derived: {
    filteredUsers: derivedFilter('users', derivedify.l('active')),
    filteredUserNames: derivedMap('filteredUsers', derivedify.l('name')),
    firstFilteredUserName: derivedFirst('filteredUserNames')
  }
```

```js
  derived: {
    firstFilteredUserName: derivedFirst(
            derivedMap(
              derivedFilter('users', derivedify.l('active')),
            derivedify.l('name')))
  }
```

Granted, this is ugly as hell. `derivedify` just gives you power, keeping things readable is your problem, one solution is to use lodash's function utilities:

```js
  derived: {
    firstFilteredUserName: _.chain(derivedFilter('users', derivedify.l('active')))
                            .thru(_.partialRight(derivedMap, derivedify.l('name')))
                            .thru(derivedFirst)
                            .value()
  }
```
Of course, this is still quite awkward to read, at least initially. Caveat emptor, Your mileage may vary, etc.
