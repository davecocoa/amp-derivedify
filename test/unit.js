var tape = require('tape');
var derivedify = require('../');

tape("single dep", function(t){
  var identity = function(a){ return a; };
  var dIdentity = derivedify(identity);
  var derivedProp = dIdentity('propName');

  t.deepEqual(derivedProp.deps, ['propName']);

  t.equal(derivedProp.fn.apply({ propName: 'working' }), 'working');

  t.end();
});

tape("dep on another object", function(t){
  var identity = function(a){ return a; };
  var dIdentity = derivedify(identity);
  var derivedProp = dIdentity('otherObj.niceProp');

  t.deepEqual(derivedProp.deps, ['otherObj.niceProp']);

  t.equal(derivedProp.fn.apply({ otherObj: { niceProp: 'exciting' } }), 'exciting');

  t.end();
});

tape("string literals", function(t){
  var contains = function(str, searchstr){ return str.indexOf(searchstr) !== -1; };
  var dContains = derivedify(contains);
  var derivedContainsFun = dContains('someProp', derivedify.l('fun'));

  t.deepEqual(derivedContainsFun.deps, ['someProp']);

  t.ok(derivedContainsFun.fn.apply({someProp: 'I am having fun!'}));

  t.notOk(derivedContainsFun.fn.apply({someProp: 'I am having a terrible time!'}));

  t.end()
});

tape("nested deps", function(t){
  var boolAnd = function(a,b){ return a && b };
  var boolOr = function(a,b){ return a || b };
  var dAnd = derivedify(boolAnd);
  var dOr = derivedify(boolOr);

  var derivedApplesAndOrangesOrPears = dAnd('apples', dOr('oranges', 'pears'));

  t.deepEqual(derivedApplesAndOrangesOrPears.deps.sort(), ['apples', 'oranges', 'pears'].sort());

  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: false, oranges: false, pears: false }), false);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: false, oranges: false, pears: true }), false);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: false, oranges: true, pears: false }), false);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: false, oranges: true, pears: true }), false);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: true, oranges: false, pears: false }), false);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: true, oranges: false, pears: true }), true);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: true, oranges: true, pears: false }), true);
  t.equal(derivedApplesAndOrangesOrPears.fn.apply({ apples: true, oranges: true, pears: true }), true);

  t.end()
});
