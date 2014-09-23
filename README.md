# hx-validator.js

Just write the requirements on DOM data- attributes, **hx-Validator** would handle the validation stuff.

And it's pure JS.

## Features

* Pure javascript, no more libraries for dependency.
* Easy to use, only data- attributes and one line js.
* Easy to customize, you can change those classes names and styles at your ease.
* Easy to extend, you can write your own validating function for special inputs easily.

## Browser Compatibility

Tested in the following browsers/versions:

* Google Chrome 27+
* Internet Explorer 9.0+ (Sorry, IE8)
* Firefox 30+
* Safari 5.1+

Don't have much time and conditions on Compatibility test, and let me know if you got any information about this.


## Documentation

### Markup

    <!---- embed hxValidator -->
    <script type="text/javascript" src="/your/path/to/hx-validator.js"></scirpt>
    
    <form id="hxValidator">
      <!---- a input field wrap -->
      <div class="hxValidator-field">
        <input name="username" type="text" value='' placeholder="Username" data-your-requirements /><!---- write requirements here -->
        <span class='hints'>write hints text here </span>
        <span class="errors error-txt"></span><!---- erorr messages tag, leave it empty -->
      </div>
      <input name="submit" type="submit" value='Submit' />
    </form>

Basicly, an input field should have those things below:


1. A div tag with '.hxvalidator-field';
2. An input tag, with data- attibutes of requirements;
3. An hints tag, and your hints for the field, you can leave it empty;
4. An errors tags, leave it empty, error messages would be written in options.

That's all. 

And you can add other tags you like, like this [example] [demo].

### Support validate requirements:

#### required

format: `data-required="true"`

error message: `This field is required`

#### min-length

format: `data-min-length="{number required}"`

error message: `This field needs %s characters at least`

The `%s` would be replace with the `number required` you set when the error message shows.

#### max-length

format: `data-max-length="{number required}"`

error message: `This field needs %s characters at most`

The `%s` would be replace with the `number required` you set when the error message shows.

#### phone

format: `data-phone="true"`

error message: `Not a valid phone number`

You should change the `phoneRegex` for your local phone format from src. The default is Chinese phone format.

#### number

format: `data-number="true"`

error message: `Numbers only`

#### not all number

format: `data-not-all-number="true"`

error message: `Can't be all numbers`

#### match

format: `data-match="{name attribute}|"`

error message: `Does not match the %s field`

The `%s` would be replace with the target input field `name attribute` you set when the error message shows.

And the last `|` is required and you could add a `alias` for the target field after the `|`.

This validation is useful as password confirmation. For example,

    <div class="hxValidator-field">
      <input name="password" type="password" data-max-length="12" data-min-length="6" id="password" />
      <span class='hints'></span>
      <span class="errors error-txt"></span>
    </div>
    <div class="hxValidator-field">
      <input name="comfirm_password" type="password" data-match="password|密码" id="comfirm_password" />
      <span class='hints'></span>
      <span class="errors error-txt"></span>
    </div>

#### custom validation

You can easily extend hxValidator to a special requirment on your own.

You have to supply 3 elements:

1. A name for the validation；
2. A validate function with a 'field' parameter, and a option parameter for data- attribute's value;
3. A error message for this validation;

The validaton name should follow **lowerCamelCase format in JS**, and **lowercased joint with '-' in HTML**.

The `field` is the field's DOM and you can get the value of user inputs by calling `field.value`.

And the validate function should return `true` when the value meets the  requirement, `false` for failed.

That' all. Wrap those into the `options` passed to hxValidator.

Let's see a example:
    
    // You can not use those names as username
    var forbiddenNames = "admin Daisy" // Yeah, I don't like Daisy!
    
    // optional is the value of the data- attribute
    var forbiddenNameValidate = function (field, optional) {
        var inputValue = field.value;
        return (forbiddenNames.indexOf(inputValue) < 0);
    }
    
    var options = {
        messages: {forbiddenUsername: "This username is not allowed"},
        customCheckMethods: {
            forbiddenUsername: forbiddenNameValidate
        }
    }
    
    // init the validator
    new hxValidator("#register_form", options);
    
    // HTML
    <div class="hxValidator-field">
      <input name="username" type="text" data-forbidden-username="true" id="username" />
      <span class='hints'></span>
      <span class="errors error-txt"></span>
    </div>

This gives you flexibility at most. You could even write **Remote check** with your backend server for some special field.

Check [this example][demo2] Which check the uniqueness of username, email, and even a validation code. 

**P.S.:**    
Current version only supports text or password type of inputs, and will support checkbox in next few versions.


### Options

All those below you can customize.

#### wrapperClass

`default: ".hxValidator-field"`

Wrapper tag's class.

#### **errorsClass**

`default: ".errors"`

Errors tag's class.

#### **hintsClass**

`default: ".hints"`

Hints tag's class.

#### **messages**

`default:`
    
      messages: {
        required: "This field is required",
        minLength: "This field needs %s characters at least",
        maxLength: "This field needs %s characters at most",
        phone: "Not a valid phone number",
        email: "Not a valid Email address",
        number: "Numbers only",
        notAllNumber: "Can't be all numbers",
        match: "Does not match the %s field"
      }

Error messages.

#### **errorCallback**

`default: null`

You can define a callback function which would be called when a field failed the validation. 

**The function should have a paramter `field`, which is the field's DOM.**

#### **successCallback**

`default: null`

You can define a callback function which would be called when a field passed the validation.

**The function should have a paramter `field`, which is the field's DOM.**

#### **focusCallback** 

`default: null`

You can define a callback function which would be called when a field got focused.

**The function should have a paramter `field`, which is the field's DOM.**

Check [this example][demo2] Which use all thoese callbacks for styling with pass/failed icons. 


## Changelog
- 0.1.6 add bower install
- 0.1.0 release
- 0.0.10 add readme
- 0.0.9 rewrite with pure js
- 0.0.5 delay Remote validation check
- 0.0.2 add examples.html

## Todo

- add supports for checkbox and select
- add localization
- reorganize structure of options 

## One more thing

hxValidator.js was written in jQuery at first, but then rewrote in pure JS.

I kept the jQuery version file in the dist folder(but won't keep maintenance), use at your ease.


## License
 
 Copyright (c) 2014 zisasign. Licensed under the MIT license.
 
 [demo]: http://qiyuan-wang.github.io/hxValidator/
 [demo2]: http://www.huxiu.com/user/register.html