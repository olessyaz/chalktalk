;(function() {
var core, DLtest_01, objects_testObject, objects_testSubObject, basicMath, app;
core = function (require) {
  /**
  * Chalktalk core 
  * @constructor
  */
  var CT = function () {
    this._version = 'v.001';
    this._hello = 'hello';
    this._whatisup = 'whatisup';
    this._isThing = 'thing';
  };
  return CT;
}({});
DLtest_01 = function (require) {
  
  var CT = core;
  /**
  * square a number
  * @param  {number} b thing
  * @return {number}   thing
  */
  CT.prototype.thing = function (b) {
    var a = b * b;
    document.write(a);
  };
  return CT;
}({});
objects_testObject = function (require) {
  var CT = core;
  /**
   * Chalktalk basic object
   * @constructor
   * @return {obj} chalktalk base object
   */
  CT.obj = function () {
    /**public variables go here under 'this'*/
    this.publicVar = Math.PI;
  };
  /**
   * [prototype description]
   * @type {Object}
   */
  CT.obj.prototype = {
    /** a test private variable*/
    _privateVar: 36,
    constructor: CT.obj,
    /**returns the private variable*/
    get privateVar() {
      return this._privateVar;
    },
    /**
     * sets a private variable to a number
     * @type {number} a set a number
     */
    set privateVar(a) {
      if (typeof a == 'number')
        this._privateVar = a;
      else
        console.log('NaN');
    }
  };
  return CT;
}({});
objects_testSubObject = function () {
  // var CT = require('core');
  var CT = objects_testObject;
  /**
   *  @class a CT sub object
   *
   *	@constructor
   *	@extends {CT}
   *	@param {number=} [num=36] private variable value
   */
  CT.subObj = function (num) {
    CT.obj.call(this);
    // private variables can go here
    var _subVar = num || 36;
    // set getters and setters here
    Object.defineProperty(this, 'sub', {
      get: function () {
        return _subVar;
      },
      set: function (y) {
        if (y > 12)
          _subVar = y;
      }
    });
  };
  CT.subObj.prototype = Object.create(CT.obj.prototype);
  /**
   * logs input
   * @param  {string=} s any string
   * @param  {array=}  arr array of strings		 * 
   */
  CT.subObj.prototype.sayHi = function (s, arr) {
    if (s)
      console.log(s);
    else
      console.log('I haven\'t the foggiest');
    if (arr) {
      for (var i = 0; i < arr.length; i++) {
        console.log(arr[i]);
      }
    }
  };
  return CT;
}();
basicMath = function () {
  var CT = core;
  CT.prototype.Math = {
    square: function (b) {
      var a = b * b;
      return a;
    },
    multiply: function (a, b) {
      return a * b;
    }
  };
  return CT.Math;
}();
app = function (require) {
  
  // Load any app-specific modules
  // with a relative require call,
  // like:
  // 
  var CT = core;
  DLtest_01;
  objects_testObject;
  objects_testSubObject;
  basicMath;
  window.CT = CT;
  return CT;
}({});
}());