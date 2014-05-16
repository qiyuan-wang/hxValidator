/*
 * hx-validator
 * http://www.huxiu.com
 *
 * Copyright (c) 2014 zisasign
 * Licensed under the MIT license.
 */

var defaults = {
  messages: {
    required: "此项为必填项",
    minLength: "此项要求最少%s个字符长度",
    maxLength: "此项要求最多%s个字符长度",
    phone: "手机格式错误",
    email: "邮件格式错误",
    match: "与%s输入不一致"
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
    emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/;

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
  this.failed = false;
  
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
  
  for (var fieldName in this.fields) {
    if(this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName];
      this._validateField.call(this, field);
    }
  }
  
  if(this.failed) {
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
    value: null
  }
}

hxValidator.prototype._validateField = function(field) {
  var rules = field.rules,
      failed = false;
      field.value = field.element.val();
  
  if (rules['required'] && this._checkMethods['required'].apply(this, [field, true])) {
    this.failed = true;
    this._addError(field, "required");
    return;
  }
  
  for(var ruleName in rules) {
    if(rules.hasOwnProperty(ruleName) && ruleName !== 'required') {
      var rule = rules[ruleName];
      this.failed = failed = this._checkMethods[ruleName].apply(this, [field, rule]);
    }
    if(failed) {
      this._addError(field, ruleName, rule);
      return;
    } 
  }
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
    return (field.value.length < length);
  },
  maxLength: function(field, length) {
    return (field.value.length > length);
  },
  phone: function(field, needed) {
    if(needed) { return phoneRegex.test(field.value) }
  },
  email: function(field, needed) {
    if(needed && field.value.length !== 0) { return !emailRegex.test(field.value) }
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