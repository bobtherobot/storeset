## Overview
A simple way to store app settings and configs in your Node app. I thought this would be a quick find on nodejs, but everything was too basic, or too complicated... nothing in that "goldylocks" zone.

## Features
- Data stored as simple, human readable JSON files.
- Automatically saves config on exit (or crash).
- Automatically stores in CWD (current working directory).
- Can have multiple, seperate store files.
- Can specify store location.
- Manually modify store files.
- Pre-populate store files.
- Easy set / get
- Use "dot" notation for multi-dimentional objects/arrays.
- No dependencies (other than build-in node's FileSystem and Path).

##Get it

    npm install storeset


##Use it

```js

// 30 second setup.
var store = require("storeset");

// Works "out of the box" without any setup...
// - Automatically save data to "store.json" in the CWD.
// - You may also do a manual setup. See the "Create" section below.

// Setting values
store.set("sunny", true);
// Use dot notation for multi-dimensional objects and arrays
store.set("sally.sees", ["bob", "tom"]);

// Getting values:
var sunny = store.get("sunny"); // Returns TRUE
var sees0 = store.get("sally.sees.0"); // Returns the first index of the array.

```


## Create (optional)
By default things get set up automatically. However, you can configure storeset to use a specific store file and also configure the JSON formatting manually.

    store.create(file [, format]);


    file    :   A filename or path to file. If using just a filename,
                we'll automatically put it into CWD (current working directory).
                Again, this create function is optional.

    format  :   JSON formatting. Used for the JSON.stringify's "space" argument.
                The default is "\t" to make the resulting JSOn human-readable.
                You can use a number, such as 4 to use 4 spaces Or set to null
                to remove formatting for a smaller store file size.

> NOTE: You may also use setFormat to configure the format later.
> NOTE: There are a few configurable option variables within the storeset.js source file that you can adjust as well.


######Examples:
```js
store.create("store.json", null); // Produces non-formatted store file
store.create("store.json", 4);    // Formats human readable store file using 4 spaces
store.create("store.json");       // Defaults human readable store file using tabs
store.create();                   // Sets everything up using defauls.
                                  //    May make the first "set" faster as it will
                                  //    do preliminary setup
store.create(null, 4);            // Does a defualt set up, and sets the format option.
store.creaet("/system/path/to/store.json") // speifies the store file location
```


## Setting values
The idea is not unlike object traversal. But we're using strings because we're not smart enough to use watch, plus watches may be resource hogs (plus they leave a stupid white band on your tan arm, and evetually get all smelly too).

NOTE:   Advanced users may want to configure the "addressSeparator" differently, but must do so manually in this file because it affects all stores.

    store.create(address, value);

    address     : The address to store the information.
    value       : String, Object, Array, Boolean, Number... basically anything that JSON can store.

######Examples:
```js
store.set("sunny", false);
store.set("bob", {age:28, size:"large", glasses:true});
store.set("sally.sees", ["bob", "tom"]);
store.set("deep.address.to.something", 34);
store.set("deep.address.to.another", 42);
```


## Getting values
Pretty straight forward, behaves like any other varible or object, including "undefined" if not present.

    store.get([location, defaultValue])

	location        :  (optional) The path to the data you want
    defaultValue    :   (optional) If the value doesn't exist, you can provide a
                        default value to set. This is a shortcut for populating
                        a location with a value if it doesn't exist.

```js
// The shortcut:
var val = store.get("path", "something");

// ... for:
var val = store.get("path");
if( ! val ){
    // set() returns what you've just set.
    val = store.set("path", "something");
}
```

######Examples (based on our "set" examples above):
```js
var bob = store.get("bob"); // Returns object
var sally = store.get("sally"); // Returns object {sees : ["bob", "tom"] }
var sees = store.get("sally.sees"); // Returns array ["bob", "tom"]
var sees0 = store.get("sally.sees.0"); // Returns array "bob"
var something = store.get("deep.address.to.something"); // Returns 34
var all = store.get() // When no args, the entire store is returned.
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

######Examples
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
By default the data is saved when calling "set()". You can set the "saveOnSet" option to prevent this functionality (and perhaps minimize overhead for each "set" operation). But you'll have to do a save() manually to store the data.

    store.save();



## JSON Formatting
The store data can be human readable (or not).
NOTE:   You may also set this up during creation, or modify the default options wihtin this file.

    store.setFormat(format)

    format : A tab or number. Same as javascript JSON.stringify's "space" argument.
            - Using a "\t" will make the JSON human readable and indent with tabs.
            - Using a number will set the number of spaces for each indent level.
            - Using null (or undefined) will eliminate any formatting, thereby compacting the JSON data.

######Examples
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


