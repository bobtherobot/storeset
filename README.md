## Overview
A simple way to store app settings and configs in your Node app. I thought this would be a quick find on nodejs, but everything was too basic, or too complicated... nothing in that "goldylocks" zone.

## Features
- No complicated setup
- No database
- No dependencies
- Easy set / get
- Data stored as human readable JSON files.
- Automatically stores in CWD (current working directory).
- Can have multiple, seperate store files.
- Can specify store location.
- Manually modify store files.
- Pre-populate store files.
- Use "dot" notation to set/get objects/arrays.



## Get it

    npm install storeset --save



## Use it

```js

// 30 second setup.
var store = require("storeset");

// Works "out of the box" without any setup --
// data automatically saved to "store.json" in the CWD.

// Setting values
store.set("sunny", true);

// Use dot notation for multi-dimensional objects and arrays
store.set("sally.sees", ["bob", "tom"]);

// Getting values:
var sunny = store.get("sunny"); // Returns TRUE
var sees0 = store.get("sally.sees.0"); // Returns the first index of the array.

```


## Create (optional)
By default data is store in the CWD (current working directory) via:

    var dataFilePath = path.resolve(process.cwd(), dataFileName);

Specify a different location for the store file and JSON formatting manually.

    store.create(file [, format]);

> Arguments
>
>         file    :   A filename or path to file. If using just a filename,
>                     we'll automatically put it into CWD (current working directory).
>                     Again, this create function is optional.
>
>         format  :   [optiona] JSON formatting. Used for the JSON.stringify's "space" argument.
>                     The default is "\t" to make the resulting JSOn human-readable.
>                     You can use a number, such as 4 to use 4 spaces Or set to null
>                     to remove formatting for a smaller store file size.
>
>
> Example:
>
> 	store.create(path.resolve(__dirname, dataFileName))
>



###### Notes
- You must call create() prior to calling get/set.
- Use setFormat to configure the format independent of create.
- There are a few configurable option variables within the storeset.js source file that you can adjust as well. Simply open the storeset.js file (located in the node_modules folder) and see the "Configuration" section.
- Only one "store" can exist at one time. Calling store.create() multiple times will screw things up. Instead, just set to different keys. e.g. store.set("part1", data1), store.set("part2", data2);



###### Examples:

```js
store.create("store.json", null); // Produces non-formatted store file
store.create("store.json", 4);    // Formats human readable store file using 4 spaces
store.create("store.json");       // Defaults human readable store file using tabs
store.create();                   // Sets everything up using defauls.
                                  //    May make the first "set" faster as it will
                                  //    do preliminary setup
store.create(null, 4);            // Does a defualt set up, and sets the format option.
store.create("/system/path/to/store.json") // speifies the store file location
```


## Setting values
For simple items, just use simple name / value. For objects and arrays, use the classic "dot" notation that you're familiar with -- the only difference is that it'll be a string.

    store.set(name, value);

        name        : (string) The name or object.name to store the information.
        value       : (mixed) Anything that JSON can store.

###### Examples:
```js
store.set("sunny", false);
store.set("bob", {age:28, size:"large", glasses:true});
store.set("sally.sees", ["bob", "tom"]);
store.set("deep.address.to.something", 34);
store.set("deep.address.to.another", 42);
```


## Getting values
Pretty straight forward, behaves like any other varible or object, including "undefined" if not present.

    store.get([name, defaultValue])

	   name            :   (optional) The name or object.path.name to the data you want
       defaultValue    :   (optional) If the value doesn't exist, you can provide a
                            default value to set. This is a shortcut for populating
                            a location with a value if it doesn't exist.

###### Examples (based on our "set" examples above):

```js
var bob = store.get("bob"); // Returns object
var sally = store.get("sally"); // Returns object {sees : ["bob", "tom"] }
var sees = store.get("sally.sees"); // Returns array ["bob", "tom"]
var sees0 = store.get("sally.sees.0"); // Returns array "bob"
var something = store.get("deep.address.to.something"); // Returns 34
var all = store.get() // When no args, the entire store is returned.

// The following:
var val = store.get("path", "something");

// ... is a shortcut for:
var val = store.get("path");
if( typeof val != "undefined" ){
    // set() returns what you've just set.
    val = store.set("path", "something");
}
```

## Getting all data
Ways to get all the data:
1. As a javascript object. Use the standard "get" without any arguments returns a javascript object.
```js
    var storeData = store.get(); // returns a javascript object
```
2. As a JSON string
```
    store.getJSON(format);

    format  : (optional) mixed. See also "setFormat()" and "JSON Formatting"
            undefined   :   e.g. not set, returns the default, same as TRUE.
            TRUE        :   Formatted according to the formatting established.
            FALSE | null:   Collapse and remove formatting.
            String      :   Apply specific formatting (e.g. "\t")
            Number      :   Number of spaces to use for indent (e.g. 2)
```

###### Examples
```js
var storeData = store.getJSON(); // Returns JSON string using default formatting.
var storeData = store.getJSON(true); // Returns JSON string using default formatting.
var storeData = store.getJSON(false); // Returns minified JSON string (no formatting).
var storeData = store.getJSON(null); // Returns minified JSON string (no formatting).
var storeData = store.getJSON("\t"); // Returns JSON string using tabs for indents.
var storeData = store.getJSON(4); // Returns JSON string using 4 spaces for indents.
```


## Clearing
Resetting and clearing the store will wipe all the data from the store

    store.clear();



## Saving
By default, the data is always saved when calling "set()".

If the variable "saveOnSet" within storeset.js is set to FALSE, automatic save will NOT happen after each set() call, which may minimize overhead for each "set" operation.

However you'll have to call save() manually in your app to store the data using:

    store.save();

There is also an additional configuration variable named "saveOnExit", which will save changes when the app closes. Note: saveOnExit is set to FALSE by default. To enable it you'll ahve to manually modify the storeset.js file.


## JSON Formatting
The store data can be human readable (or not).
NOTE:   You may also set this up during creation, or modify the default options wihtin this file.

```
    store.setFormat(format)

        format : A tab or number. Same as javascript JSON.stringify's "space" argument.
                - Using a "\t" will make the JSON human readable and indent with tabs.
                - Using a number will set the number of spaces for each indent level.
                - Using null (or undefined) will eliminate any formatting, thereby compacting the JSON data.
```

###### Examples
```js
store.setFormat("\t")   // Humanize with tab indents
store.setFormat(2)      // Humanize where each indent is 2 spaces
store.setFormat()       // Un-humanize and compact JSON
```

## Similar projects
- https://www.npmjs.com/package/config
- https://www.npmjs.com/package/nconf
- https://github.com/Pencroff/kea-config
- https://github.com/yeoman/configstore
- https://github.com/tomas/getset
- https://github.com/kr1zmo/object-getset

## Change Log

v0.1.10  - 2015-07-14 initial commit
v0.1.12  - 2017-11-05 auto save fix

