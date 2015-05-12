var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');
var toArray = require('lodash.toarray');
var constant = require('lodash.constant');

function get(obj, str){
  return str.split('.').reduce(function(obj, prop){ return obj && obj[prop]; }, obj);
}

module.exports = function(func){
  return function(){
    var derivedObj = { deps: [] };
    var args = toArray(arguments);
    args.forEach(function(arg){
      // string property name, literal or other derived obj
      if(isString(arg)) { derivedObj.deps.push(arg); }
      if(isObject(arg)) { derivedObj.deps = derivedObj.deps.concat(arg.deps); }
    });

    derivedObj.fn = function(){
      var realArgs = args.map(function(arg){
        // string property name, literal or other derived obj
        if(isString(arg)) { return get(this, arg); }
        if(isObject(arg)) { return arg.fn.apply(this); }
        return arg;
      }.bind(this));

      return func.apply(this, realArgs);
    }
    return derivedObj;
  };
};

module.exports.l = function(literal){
  return { deps: [], fn: constant(literal) };
};
