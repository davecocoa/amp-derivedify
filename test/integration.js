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

  t.end();
});

