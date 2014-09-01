# hx-validator.js

Just write your requirements on DOM data- attributes, **hx-Validator** would handle the rest.

And it's pure js.

## Features

* Pure javacript, no more libraries for dependency.
* Easy to use, only data- attributes and one line js.
* Easy to customize, you can specialize those classes names and styles.
* Easy to extend, you can write your own validating function for special inputs easily.
* Supports validating inputs value with:
    - required
    - max-length
    - min-length
    - phone format
    - email format
    - not-all-number format
    - matching another input value(password confirmation, for example)
    - **your own validating format**
* Current version only supports text or password type of inputs, and will support checkbox in next few versions.

### Browser Compatibility

Tested in the following browsers/versions:

* Google Chrome 4.0+
* Internet Explorer 9.0+
* Firefox 3.5+
* Safari 4.0+

Don't have much time and conditions on Compatibility test, and let me know if you got any information about this.


## Documentation

### Quick Start

So, let's write a register form for your brand-new, coolest website.

First, insert hx-Validator in your HTML:

    <script type="text/javascript" src="/your/path/to/hx-validator.js"></scirpt>
    <!---- and you could wrap hxValidator default css in -->
    <link rel="stylesheet" href="/your/path/to/hxValidator/style.css"></link>

Okay, a account need a username, a password and a confirmation for the password. We would give them some requirements: **min-length**, **max-length**, **required**, and **confirmation must equal** blah blah.

    <form id="hxValidator">
      <fieldset>
        <div class="hxValidator-field">
          <input name="username" type="text" data-required="true" data-min-length="3" data-max-length="8" value='' placeholder="Username" />
          <span class="errors error-txt"></span>
        </div>
        <div class="hxValidator-field">
          <input name="password" type="password" data-required="true" data-min-length="6" data-max-length="10"  placeholder="Password" />
          <span class="errors error-txt"></span>
        </div>
        <div class="hxValidator-field">
          <input name="comfirm_password" type="password" data-required="true" data-match="password|" placeholder="Confirmation" />
          <span class="errors error-txt"></span>
        </div>
        <div>
          <input name="submit" type="submit" value='Submit' />
        </div>
      </fieldset>
    </form>

What have we done? We just:

1. **wrap every inputs in a div with class "hxValidator-field"**
2. **insert a "error-txt" span tag**
3. **write all requirements in data- attributes**.

Does it work? Give it a try. Tell hxValidator which form you want to validate by Id:

    <script> var formValidate = new hxValidator('hxValidator'); </script>

([You can try this little demo here.][demo1])  


So, I'll reveal the result: It works! An error message would be inserted into the "error-txt" span tag if your inputs doesn't meet the requirements of the field.

### An advanced example

Previous example maybe too simple, right? Let's have a complicated one!

You may need a label for the field, a hint to explain the requirements, and icons to indicate whether pass or fail.

The snippet of code below shows a field meets all those needs:

     <div class="hxValidator-field">
       <label for="username"><i class="icon-gl2 icon-white-user" title="Username"></i></label>
       <input name="username" type="text" data-min-length="3" data-max-length="10" data-required="true" data-username-unique-remote="true"  value='' placeholder="Username" />
       <span class='hints'>3-10 characters, numbers and underscores.</span>
       <i class="icon-gl2 icon"></i>
       <span class="errors error-txt"></span>
     </div>

You would notice there is a bizzare requirement, `data-username-unique-remote`. Yeah, it is a custom validating format. And it checks whether the username you inputs has registered yet. Following code shows the secret:

    <script>
      function remoteCheckFunc(field) {
        // check username uniqueness
        // with backend server
        ...
      }
      
      var options = {
        messages: {
          usernameUniqueRemote: "The username is unavailiable."
        },
        customCheckMethods: {
          usernameUniqueRemote: remoteCheckFunc
        }
      }
    
      var formValidate = new hxValidator('hxValidator', options);
    </script>
    
The custom validating format needs an error message and a check function. `options` gives all the information.

That'all, no magic.

([You can try this more complicated demo here.][demo2])  


## Options



## License
 
 Copyright (c) 2014 zisasign. Licensed under the MIT license.
 
 [demo1]: http://
 [demo2]: http://
