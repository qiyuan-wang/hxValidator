var defaults = {
  messages: {
    required: "此项为必填项",
    minLength: "此项要求最少%s个字符长度",
    maxLength: "此项要求最多%s个字符长度",
    phone: "手机格式错误",
    email: "邮件格式错误",
    number: "此项只能输入数字",
    notAllNumber: "此项不能全为数字",
    match: "与%s输入不一致"
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
  var elementId = id || 'hxValidator';
  var options = options || {};
  
  // configuration
  this.form = document.getElementById(elementId);
  this.fields = {};
  this.errorsClass = options['errorsClass'] || 'errors';
  this.hintsClass = options['hintsClass'] || 'hints';
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
      
      field.element.addEventListener("blur", this._validateField.call(this, field));
      field.element.addEventListener("focus", this._focusField.call(this, field));
    }
  }
  
  this.form.addEventListener("submit",this._validateForm.call(this));
  
  
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
    errors: elem.parentNode.getElementsByClassName(this.errorsClass)[0],
    hints: elem.parentNode.getElementsByClassName(this.hintsClass)[0],
    wrapper: elem.parentNode,
    value: null,
    passed: null
  }
}

hxValidator.prototype._validateField = function(field) {
  var rules = field.rules,
      remoteRuleName = null
      that = this;      
  
  return function() {
    field.value = field.element.value; 
    if (rules['required'] && !that._checkMethods['required'].apply(that, [field, rules['required']])) {
      field.passed = false;
      that._addError.apply(that, [field, "required"]);
      return;
    }
    
    for(var ruleName in rules) {
      if(rules.hasOwnProperty(ruleName) && ruleName !== 'required') {
        if(ruleName.match(/Remote$/)) {
          remoteRuleName = ruleName;
        } else {
          var rule = rules[ruleName];
          field.passed = that._checkMethods[ruleName].apply(that, [field, rule]);
          if(!field.passed) {
            that._addError(field, ruleName, rule);
            return;
          }
        }
      }
    }
    //   make the remote check last called
    if(remoteRuleName) {
      var rule = rules[remoteRuleName];
      field.passed = this._checkMethods[remoteRuleName].apply(that, [field, rule]);
      if(!field.passed) {
        that._addError(field, remoteRuleName, rule);
        return;
      }
    }
    field.passed = true;
    
    that._addSuccess(field);
  }
}

hxValidator.prototype._validateForm = function() {
  var that = this;
  return function(evt) {
    var flag = true;
    for (var fieldName in that.fields) {
      if(that.fields.hasOwnProperty(fieldName)) {
        var field = that.fields[fieldName];
        if(field.passed === null) {(that._validateField(field))();}
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
    console.log(field);
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
    console.log(this.form[value]);
    var el = this.form[value];
    if (el) {
      return field.value === el.value;
    }
    return true;
  }
}

hxValidator.prototype._focusField = function(field) {
  var that = this;
  return function() {
    if(field.wrapper.className.indexOf('success') > 0) {return}
    removeClasses(field.wrapper, 'error');
    field.hints.style.display = "none";
    field.errors.innerHTML = '';
  
    // if there is a callback, call it.
    if(that.focusCallback) {that.focusCallback(field)};
  }
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