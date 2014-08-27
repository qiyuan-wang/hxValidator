  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        hxValidator: hxValidator
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.hxValidator = hxValidator;

  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.hxValidator = hxValidator;
  }

})();