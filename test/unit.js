var tape = require('tape');
var derivedify = require('../');

tape("single dep", function(t){
  var identity = function(a){ return a; };
  var dIdentity = derivedify(identity);
  var derivedProp = dIdentity('propName');

  t.deepEqual(derivedProp.deps, ['propName']);

  t.equal(derivedProp.fn.apply({propName: 'working'}), 'working');

  t.end();
});

