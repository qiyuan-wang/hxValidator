/*! hxValidator 
* v0.1.4 
* 2014-09-23
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
    field.element.siblings('.icon').removeClass('icon-success').addClass('icon-error icon-inset');
  },
  successCallback: function(field) {
    field.element.siblings('.icon').removeClass('icon-error').addClass('icon-success icon-inset');
  },
  focusCallback: function(field) {
    field.element.siblings('.icon').removeClass('icon-error icon-success icon-inset');
  }
};

var phoneRegex = /^1[3-8]\d{9}$/,
    numberRegex = /^[0-9]+$/,
    emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]{2,})+$/;

var hxValidator = function(formElement, options) {
  var options = options || {};
  this.form = (formElement instanceof $) ? formElement : $(formElement);
  this.fields = {};
  this.errorsClass = options['errorsClass'] || '.errors';
  this.hintsClass = options['hintsClass'] || '.hints';
  this.wrapperClass = options['wrapperClass'] || '.hxValidator-field';
  this.messages = $.extend({}, defaults['messages'], options['messages']);
  this.errorCallback = options['errorCallback'] || defaults['errorCallback'];
  this.successCallback = options['successCallback'] || defaults['successCallback'];
  this.focusCallback =  options['focusCallback'] || defaults['focusCallback'];
  this._checkMethods = $.extend({}, this._checkMethods, options['customCheckMethods']);
  
  var inputs = this.form.find('input[type!=hidden][type!=submit]');
  for (var i = 0; i < inputs.length; i++) {
     this._addField(inputs[i]);
  }

  for (var fieldName in this.fields) {
    if(this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName];
      field.element.on("blur", $.proxy(this._validateField, this, field));
      field.element.on("focus", $.proxy(this._focusField, this, field));
    }
  }
  
  this.form.submit($.proxy(this._validateForm, this));
  this._hideAllHints();
};

hxValidator.prototype._validateForm = function(evt) {
  var flag = false;
  for (var fieldName in this.fields) {
    if(this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName];
      if(field.failed === null) {this._validateField(field)}
      flag = flag || field.failed;
    }
  }
  if(flag) {
    return false;
  } else {
    return true;
  }
}

hxValidator.prototype._addField = function(elem) {
  var $elem = $(elem);
  this.fields[$elem.attr('name')] = {
    rules: $elem.data(),
    type: $elem.attr('type'),
    element: $elem,
    errors: $elem.siblings(this.errorsClass),
    hints: $elem.siblings(this.hintsClass),
    wrapper: $elem.parent(this.wrapperClass),
    value: null,
    failed: null
  }
}

hxValidator.prototype._validateField = function(field) {
  var rules = field.rules,
      remoteRuleName = null;
  field.value = field.element.val();

  if (rules['required'] && this._checkMethods['required'].apply(this, [field, true])) {
    
    field.failed = true;
    this._addError(field, "required");
    return;
  }
  
  for(var ruleName in rules) {
    if(rules.hasOwnProperty(ruleName) && ruleName !== 'required') {
      if(ruleName.match(/Remote$/)) {
        remoteRuleName = ruleName;
      } else {
        var rule = rules[ruleName];
        field.failed = this._checkMethods[ruleName].apply(this, [field, rule]);
        if(field.failed) {
          this._addError(field, ruleName, rule);
          return;
        }
      }
    }
  }
  
  // make the remote check last called
  if(remoteRuleName) {
    var rule = rules[remoteRuleName];
    field.failed = this._checkMethods[remoteRuleName].apply(this, [field, rule]);
    if(field.failed) {
      this._addError(field, remoteRuleName, rule);
      return;
    }
  }
  
  field.failed = false;
  this._addSuccess(field);
}

hxValidator.prototype._focusField = function(field) {
  if(field.wrapper.hasClass('success')) {return}
  field.wrapper.removeClass('error');
  field.hints.show();
  field.errors.text('');
  this.focusCallback(field);
}

hxValidator.prototype._addSuccess = function(field) {
  field.wrapper.removeClass('error').addClass('success');
  field.hints.hide();
  field.errors.text();
  this.successCallback(field);
}

hxValidator.prototype._addError = function(field, ruleName, rule) {
  var errorMsg = this.messages[ruleName];
  
  // insert rules to error message if needed.
  if(errorMsg.indexOf("%s") > 0) {
    var info = (typeof rule === 'string' && rule.indexOf("|") > 0) ? rule.split('|')[1] : rule;
    errorMsg = errorMsg.replace("%s", info)
  }
  
  // default error added and hide hints.
  field.wrapper.removeClass('success').addClass('error');
  field.hints.hide();
  field.errors.text(errorMsg);
  
  // if there is callback, call it.
  this.errorCallback(field);
}

hxValidator.prototype._hideAllHints = function() {
  $('.hints').hide();
}

hxValidator.prototype._checkMethods = {
  required: function(field, needed) {
    if(needed) { return (!field.value || field.value === '' || field.value === undefined) }
  },
  minLength: function(field, length) {
    // if contains Chinese characters, count 1 as 3.
    var input_value = field.value.replace(/[^\x00-\xff]/g,"***");
    return (input_value.length < length);
  },
  maxLength: function(field, length) {
    // if contains Chinese characters, count 1 as 3.
    var input_value = field.value.replace(/[^\x00-\xff]/g,"***");
    return (input_value.length > length);
  },
  phone: function(field, needed) {
    if(needed) { return !phoneRegex.test(field.value) }
  },
  email: function(field, needed) {
    if(needed && field.value.length !== 0) { return !emailRegex.test(field.value) }
  },
  number: function(field, needed) {
    if(needed && field.value.length !== 0) { return !numberRegex.test(field.value) }
  },
  notAllNumber: function(field, needed) {
    if(needed && field.value.length !== 0) { return numberRegex.test(field.value) }
  },
  match: function(field, condition) {
    var value = (typeof condition === 'string' && condition.indexOf("|") > 0) ? condition.split('|')[0] : condition;
    var el = this.form[0][value];
    if (el) {
      return field.value !== el.value;
    }
    return true;
  }
}