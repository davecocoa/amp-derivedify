var tape = require('tape');
var derivedify = require('../');
var AmpersandState = require('ampersand-state');

tape("single dep", function(t){
  var identity = function(a){ return a; };
  var dIdentity = derivedify(identity);
  var testClass = AmpersandState.extend({
    props: {
      someProp: 'string',
    },
    derived: {
      propAlias: dIdentity('someProp')
    }
  });

  var testObj = new testClass({ someProp: 'working' });

  t.equal(testObj.propAlias, 'working');

  testObj.someProp = 'a new string';

  t.equal(testObj.propAlias, 'a new string');

  t.end();
});


tape("dep on another object", function(t){
  var identity = function(a){ return a; };
  var dIdentity = derivedify(identity);
  var testClass = AmpersandState.extend({
    props: {
      otherObj: 'object',
    },
    derived: {
      propAlias: dIdentity('otherObj.niceProp')
    }
  });

  var testObj = new testClass({ otherObj: { niceProp: 'exciting' } });

  t.equal(testObj.propAlias, 'exciting');

  testObj.otherObj.niceProp = 'invigorating';

  t.equal(testObj.propAlias, 'invigorating');

  t.end();
});

tape("string literals", function(t){
  var contains = function(str, searchstr){ return str.indexOf(searchstr) !== -1; };
  var dContains = derivedify(contains);
  
  var testClass = AmpersandState.extend({
    props: {
      lastMessage: 'string',
    },
    derived: {
      havingFun: dContains('lastMessage', derivedify.l('fun'))
    }
  });

  var testObj = new testClass({ lastMessage: 'Lots of fun in the park today!' });

  t.ok(testObj.havingFun);

  testObj.lastMessage = "Ugh! I can't do anything right today!";

  t.notOk(testObj.havingFun);

  t.end()
});

tape("nested deps", function(t){
  var boolAnd = function(a,b){ return a && b };
  var boolOr = function(a,b){ return a || b };
  var dAnd = derivedify(boolAnd);
  var dOr = derivedify(boolOr);

  var testClass = AmpersandState.extend({
    props: {
      apples: 'boolean',
      oranges: 'boolean',
      pears: 'boolean'
    },
    derived: {
      delicious: dAnd('apples', dOr('oranges', 'pears'))
    }
  });

  var testObj = new testClass({ apples: false, oranges: false, pears: false });

  t.equal(testObj.delicious, false);
  testObj.pears = true;
  t.equal(testObj.delicious, false);
  testObj.pears = false; testObj.oranges = true;
  t.equal(testObj.delicious, false);
  testObj.pears = true;
  t.equal(testObj.delicious, false);
  testObj.pears = false; testObj.oranges = false; testObj.apples = true;
  t.equal(testObj.delicious, false);
  testObj.pears = true;
  t.equal(testObj.delicious, true);
  testObj.pears = false;testObj.oranges = true;
  t.equal(testObj.delicious, true);
  testObj.pears = true;
  t.equal(testObj.delicious, true);

  t.end()
});
