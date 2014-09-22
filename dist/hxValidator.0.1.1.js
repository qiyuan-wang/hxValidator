/*! hxValidator 
* v0.1.1 
* 2014-09-22
*  http://www.huxiu.com
* Copyright (c) 2014 zisasign; Licensed MIT */


var defaults = {
  messages: {
    required: "This field is required",
    minLength: "This field needs %s characters at least",
    maxLength: "This field needs %s characters at most",
    phone: "Not a valid phone number",
    email: "Not a valid Email address",
    number: "Number only",
    notAllNumber: "Can't be all numbers",
    match: "Does not match the %s field"
  },
  errorCallback: function(field) {
    var iconElement = field.hints.parentNode.getElementsByClassName("icon")[0];
    removeClasses(iconElement, 'icon-success');
    addClasses(iconElement, 'icon-error icon-inset');
  },
  successCallback: function(field) {
    var iconElement = field.hints.parentNode.getElementsByClassName("icon")[0];
    removeClasses(iconElement, 'icon-error');
    addClasses(iconElement, 'icon-success icon-inset');
  },
  focusCallback: function(field) {
    var iconElement = field.hints.parentNode.getElementsByClassName("icon")[0];
    removeClasses(iconElement, 'icon-error icon-success icon-inset');
  }
};

var dataAttrRegex = /^data(?:-[a-z]+)+$/gi,
    phoneRegex = /^1[3-8]\d{9}$/,
    numberRegex = /^[0-9]+$/,
    emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]{2,})+$/;


// constructor
var hxValidator = function(id, options) {
  
  // deal with parameters
  var elementId = id || '#hxValidator';
  var options = options || {};
  
  // configuration
  this.form = document.querySelector(elementId);
  this.fields = {};
  this.errorsClass = options['errorsClass'] || '.errors';
  this.hintsClass = options['hintsClass'] || '.hints';
  this.wrapperClass = options['wrapperClass'] || 'hxValidator-field';
  this.messages = objectsMerge({}, defaults['messages'], options['messages']);
  this.errorCallback = options['errorCallback'] || defaults['errorCallback'];
  this.successCallback = options['successCallback'] || defaults['successCallback'];
  this.focusCallback =  options['focusCallback'] || defaults['focusCallback'];
  this._checkMethods = objectsMerge({}, this._checkMethods, options['customCheckMethods']);
  
  var inputs = getValidInputs.apply(this);
  
  for (var i = 0; i < inputs.length; i++) {
     this._addField(inputs[i]);
  }
  
  for (var fieldName in this.fields) {
    if(this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName];
      field.element.addEventListener("blur", this._validateField.bind(this, field));
      field.element.addEventListener("focus", this._focusField.bind(this, field));
    }
  }
  
  this.form.addEventListener("submit",this._validateForm.bind(this));
  
  this._hideAllHints();
  
  
  // helper methods
  // get all inputs without type of submit or button
  function getValidInputs() {
    var allInputs = this.form.querySelectorAll("input"),
        validTargets = [],
        i = 0;
    for(i; i < allInputs.length; i++) {
      if(allInputs[i].type !== "submit" && allInputs[i].type !== "button") {
        validTargets.push(allInputs[i]);
      }
    }
    return validTargets;
  }
  
  // merge objects
  // base on: http://stackoverflow.com/a/8625261
  function objectsMerge() {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
      for (key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  }
  
}

// small-Camelize text
function smallCamelUpperCase(text) {
  return text.replace(/^data-/, '').replace(/-\w+/g, function(s) { return s.charAt(1).toUpperCase() + s.substring(2).toLowerCase();})
}

function removeClasses(elem, removedClasses) {
  var targetClasses = removedClasses.split(" "),
      i = 0;
  for(; i < targetClasses.length; i++) {
    elem.className = elem.className.replace(targetClasses[i], '');
  }
  
  // eliminate redundant white spqce
  elem.className = elem.className.replace(/^\s+|\s+$/, '');
}

function addClasses(elem, addedClasses) {
  var targetClasses = addedClasses.split(" "),
      i = 0;
  for(; i < targetClasses.length; i++) {
    if(!elem.className.match(targetClasses[i])) {
      elem.className += " " + targetClasses[i];
    }
  }
}

hxValidator.prototype._hideAllHints = function() {
  var hints = document.querySelectorAll(this.hintsClass);
  [].slice.apply(hints).forEach(function(ele) {
    ele.style.display = "none";
  })
}

hxValidator.prototype._addField = function(elem) {
  // find all data-* attributes
  var rules = {},
  elementAttributes = elem.attributes,
  attrIndex = 0;
  for(; attrIndex < elementAttributes.length; attrIndex++){
    var attr = elementAttributes[attrIndex];
    if (attr.name.match(dataAttrRegex)) {
      var formattedName = smallCamelUpperCase(attr.name);
      rules[formattedName] = attr.value;
    }
  }

  this.fields[elem.attributes['name'].value] = {
    type: elem.attributes['type'].value,
    rules: rules,
    element: elem,
    errors: elem.parentNode.querySelector(this.errorsClass),
    hints: elem.parentNode.querySelector(this.hintsClass),
    wrapper: elem.parentNode,
    value: null,
    passed: null
  }
}

hxValidator.prototype._validateField = function(field) {
  var rules = field.rules,
      remoteRuleName = null;
      
  field.value = field.element.value; 
  if (rules['required'] && !this._checkMethods['required'].apply(this, [field, rules['required']])) {
    field.passed = false;
    this._addError.apply(this, [field, "required"]);
    return;
  }
  
  for(var ruleName in rules) {
    if(rules.hasOwnProperty(ruleName) && ruleName !== 'required') {
      if(ruleName.match(/Remote$/)) {
        remoteRuleName = ruleName;
      } else {
        var rule = rules[ruleName];
        field.passed = this._checkMethods[ruleName].apply(this, [field, rule]);
        if(!field.passed) {
          this._addError(field, ruleName, rule);
          return;
        }
      }
    }
  }
  //   make the remote check last called
  if(remoteRuleName) {
    var rule = rules[remoteRuleName];
    field.passed = this._checkMethods[remoteRuleName].apply(this, [field, rule]);
    if(!field.passed) {
      this._addError(field, remoteRuleName, rule);
      return;
    }
  }
  field.passed = true;
  
  this._addSuccess(field);
}

hxValidator.prototype._validateForm = function(evt) {
  var flag = true;
  for (var fieldName in this.fields) {
    if(this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName];
      if(field.passed === null) {this._validateField(field);}
      flag = flag && field.passed;
    }
  }
  if(flag) {
    return true;
  } else {
    evt.preventDefault();
    return false;
  }
}

hxValidator.prototype._checkMethods = {
  required: function(field, needed) {
    if(!!needed) { return (field.value && field.value !== '' && field.value !== undefined) }
  },
  minLength: function(field, length) {
    // if contains Chinese characters, count 1 as 3.
    var input_value = field.value.replace(/[^\x00-\xff]/g,"***");
    return (input_value.length >= length);
  },
  maxLength: function(field, length) {
    // if contains Chinese characters, count 1 as 3.
    var input_value = field.value.replace(/[^\x00-\xff]/g,"***");
    return (input_value.length <= length);
  },
  phone: function(field, needed) {
    if(!!needed) { return phoneRegex.test(field.value) }
  },
  email: function(field, needed) {
    if(!!needed && field.value.length !== 0 && field.value !== undefined) { return emailRegex.test(field.value) }
  },
  number: function(field, needed) {
    if(!!needed && field.value.length !== 0 && field.value !== undefined) { return numberRegex.test(field.value) }
  },
  notAllNumber: function(field, needed) {
    if(!!needed && field.value.length !== 0 && field.value !== undefined) { return !numberRegex.test(field.value) }
  },
  match: function(field, condition) {
    var value = (typeof condition === 'string' && condition.indexOf("|") > 0) ? condition.split('|')[0] : condition;
    var el = this.form[value];
    if (el) {
      return field.value === el.value;
    }
    return true;
  }
}

hxValidator.prototype._focusField = function(field) {
  if(field.wrapper.className.indexOf('success') > 0) {return}
  removeClasses(field.wrapper, 'error');
  field.hints.style.display = "block";
  field.errors.innerHTML = '';

  // if there is a callback, call it.
  if(this.focusCallback) {this.focusCallback(field)};
}

hxValidator.prototype._addError = function(field, ruleName, rule) {
  var errorMsg = this.messages[ruleName];
  
  // insert rules to error message if needed.
  if(errorMsg.indexOf("%s") > 0) {
    var info = (typeof rule === 'string' && rule.indexOf("|") > 0) ? rule.split('|')[1] : rule;
    errorMsg = errorMsg.replace("%s", info)
  }
  
  // default error added and hide hints.
  removeClasses(field.wrapper, 'success');
  addClasses(field.wrapper, 'error');
  field.hints.style.display = "none";
  field.errors.innerHTML = errorMsg;

  // if there is a callback, call it.
  if(this.errorCallback) {this.errorCallback(field)};
}

hxValidator.prototype._addSuccess = function(field) {
  removeClasses(field.wrapper, 'error');
  addClasses(field.wrapper, 'success');
  field.hints.style.display = "none";
  field.errors.innerHTML = '';
  
  // if there is a callback, call it.
  if(this.successCallback) {this.successCallback(field)};
}