# hx-validator

Just write your requirements on DOM data- attributes, **hx-Validator** would handle the rest.


## Quick Start

Get the code and require it in your HTML:

    <script src="/your/path/to/hx-validator.js"></scirpt>     
   
Wrap input tag in a div with class **hxValidator-field** and write your requirements for this input in its data- attibutes:

    <div class="hxValidator-field">
        <input name="email" type="text" data-email="true"  data-required="true" id="email" value='' placeholder="EMail" />
    </div>

Tell hxValidator which form you want to validate by Id:

    <script> var formValidate = new hxValidator('hxValidator'); </script>

It's done!  


## License
 
 Copyright (c) 2014 zisasign. Licensed under the MIT license.
