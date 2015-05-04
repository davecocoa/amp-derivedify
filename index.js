var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');

module.exports = function(func){
  return function(){
    var derivedObj = { deps: [] };
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function(arg){
      // string name, literal or other derived obj
      if(isString(arg)) { derivedObj.deps.push(arg); }
      if(isObject(arg)) { derivedObj.deps = derivedObj.deps.concat(arg.deps); }
    });

    derivedObj.fn = function(){
      var realArgs = args.map(function(arg){
        // string name, literal or other derived obj
        if(isString(arg)) { return this[arg]; }
        if(isObject(arg)) { return arg.fn.apply(this); }
        return arg;
      }.bind(this));

      return func.apply(this, realArgs);
    }
    return derivedObj;
  };
};

module.exports.l = function(literal){
  return { deps: [], fn: function(){ return literal; } };
};
