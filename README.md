# amp-derivedify
Simple util for making derived property helpers

At its simplest, `derivedify` is a handy shorthand for making derived properties. If you've use Ember's computed property macros it should feel a little bit familiar. It's probably easiest to understand with a few examples:
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

```js
var not = function(bool){
  return !bool;
};
var derivedNot = derivedify(combineNames);

var Person = AmpersandState.extend({
    props: {
        active: 'boolean',
    },
    derived: {
        inActive: derivedNot('active')
    }
});
```

```js
var Person = AmpersandState.extend({
    props: {
        firstName: 'string',
        lastName: 'string'
    },
    derived: {
        fullName: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.firstName + ' ' + this.lastName;
            }
        }
    }
});
```

```js
var combineNames = function(firstName, lastName){
  return firstName + lastName;
};
var derivedCombineNames = derivedify(combineNames);

var Person = AmpersandState.extend({
    props: {
        firstName: 'string',
        lastName: 'string'
    },
    derived: {
        fullName: derivedCombineNames('firstName', 'lastName')
    }
});
```
OK, so the syntax is weird but the benefits aren't really clear yet. Let's try one more example:

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
The important thing to note is how the arguments to `derivedFilter` relate to the arguments to `_.filter` - `derivedFilter` accepts property names and other derived properties as arguments instead of array and string literals which `_.filter` accepts.

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

Granted, this is ugly as hell. `derivedify` just gives you power, keeping things readable is your problem.
