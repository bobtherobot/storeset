/*
storeset

Copyright(c) 2015 Michael Gieson
www.gieson.com

Documentation:
https://github.com/bobtherobot/storeset

MIT Licensed
*/

var fs = require("fs");
var path = require("path");

// -----------------------------------------
// Configuration
var defaultStoreFile = "store.json";
var format = "\t"; // JSON "space" setting (to indent / make human readable)
var addressSeparator = "."; // Prefer to use a "/" or maybe a ":" ?
var defaultData = {}; // Put any common stuff in here so all newly created stores will have the same data.
var saveOnSet = true; // When FALSE, you'll have to manually call save() to write the data to file.



// -----------------------------------------
// Setup
var dataFileName;
var dataFilePath;
var data = defaultData || {};
var didSetup = false;

function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (obj === null  || typeof obj != "object") {
		return obj;
	}

	// Handle Date
	if (obj instanceof Date) {
		return obj.getTime();
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone( obj[i] );
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if ( obj.hasOwnProperty(attr) ) {
				copy[attr] = clone( obj[attr] );
			}
		}
		return copy;
	}

	// Shouldn't get here, but may if obj is crazy.
	return null;
}

function create(filename, formatChar){

	// Fallback to default if filename not set
	dataFileName = filename || defaultStoreFile;

	// See if we've spcified a path.
	if(filename.indexOf("/") ){
		dataFilePath = filename;

	// Otherwise, use CWD
	} else {
		dataFilePath = path.resolve(process.cwd(), dataFileName);
	}

	// Assume we need to make the file
	var makeFile = true;

	// Make sure the file exists and data is parsable
	if(fs.existsSync(dataFilePath)){
		var datafile = fs.readFileSync(dataFilePath, "UTF-8");
		if(datafile){
			var tempFileData;

			// Ensure JSON is not corrupted, or non-parsable
			try{
				tempFileData = JSON.parse(datafile);
			} catch(e){
				// ignore
			}

			// OK, we're cool.
			if(tempFileData) {
				data = tempFileData;
				makeFile = false;
			}

		}

	}

	// Only make new file if we need to
	if(makeFile){
		fs.writeFileSync(dataFilePath, getJSON(), "UTF-8");
	}

	if(typeof formatChar != "undefined" ){
		format = formatChar;
	}

	didSetup = true;
}

function setFormat(char){
	format = char;
}


function save(){
	if(didSetup){
		fs.writeFileSync(dataFilePath, getJSON(), "UTF-8");
	} else {
		// Create will save the existing data object.
		create(defaultStoreFile);
	}
}

// --------------------
// Exit Hooks
// --------------------
// Save before exit... just in case of crash or early termination.
var exitCalled = false;
function exit(sigvar, signal) {
	if (exitCalled) {
		return;
	}

	exitCalled = true;

	save();

	if (sigvar === true) {
		process.exit(128 + signal);
	}
};

process.once('exit', exit);
process.once('SIGINT', exit.bind(null, true, 2));
process.once('SIGTERM', exit.bind(null, true, 15));

// --------------------

var set = function ( key, value ) {

	if( ! key ) {
		throw new Error("Can't save data. No location defined.");
	}

	// We must check that we're setup! Otherwise the new value will not make it in.
	if( ! didSetup ){
		create(defaultStoreFile);
	}

	// Convert location to an array we can itterate over
	var Apath = key.split(addressSeparator);

	// Remove the last item, since this is kinda like the variable we're setting.
	var last = Apath.pop();

	// Localize the data object
	var seg = data;


	var len = Apath.length;
	if(len) {
		for ( var i = 0; i < len; i++ ) {

			var segKey = Apath[ i ];

			var segData = seg[ segKey ];

			// Check if this segment exists, if not create it.
			//
			// Over-write static values, ( number, string, boolean, null )
			// Otherwise seg results in the static value, which we can't
			// write into. So we're going to blast existing static values.
			//
			// For example, if an entry already exists:
			//  {bob.car : 2002}
			//
			//  .. and we are setting:
			//  store.set("bob.car.year", 2010);
			//
			// ... and the new seg will become a static value of 2002
			// ... so when we get to the "year" segKey the interpreter will attempt to read:
			// ...      2002[year]
			// ... and then all heck breaks out and the new value will not stick.
			if( ! segData || typeof segData != "object"){
				segData = seg[ segKey ] = {};
			}
			seg = segData;
		}
	}

	// Now apply our last "variable" to data (remember seg is "by reference" the segment of the data)
	// We're cloning it so that there won't be any references to the data, in case the value is an object or array.
	// Which could cause out data object to be altered should the users object change prior to writing.
	seg[last] = clone(value);

	if(saveOnSet){
		save();
	}

	// NOTE: Not returning cloned value, so if it's an object/array
	// it is still malleable (linked by reference) on the end-users side.
	// But it since it was cloned into our data, the data value is locked-in.
	//
	// This allows user to continue using the returned value as normal,
	// and provides function-chaining capacity.
	return value;

}

var getJSON = function(formatted){
	var useDefaultFormat = false;
	var ftype = typeof formatted;
	var fval;

	// If not defined, use the default
	if( ftype == "undefined" ){
		fval = format;

	// Explicetely looking for FALSE. But still need to set fval when TRUE
	} else if( ftype == "boolean" ){
		if(formatted) {
			fval = format;
		} else {
			fval = null;
		}

	// Looks for specific settings (same as setFormat)
	} else if( ftype == "string" || ftype == "number" ){
		fval = formatted;
	}

	return JSON.stringify(data, null, fval);
}

var get = function ( key, defaultValue ) {

	// If no key specified, return the entire tree...
	// but only when a default is not trying to be established.
	if( ! key && ! defaultValue){
		return clone( data );
	}

	var Apath = key.split(addressSeparator);
	var last = Apath.pop();

	// Localize for faster itteration.
	var seg = data;
	var len = Apath.length;
	if(len){

		// Basic tree traversal
		for(var i=0;i<len;i++){
			seg = seg[ Apath[i] ];
		}
	}

	// Leave as undefined, since that's a good thing to return if not exist.
	var val;

	// Check if it exists
	if(seg[last]){
		val = clone( seg[last] );

	// Set the default value if using this option.
	// Make sure we have a key before attempting this !
	} else if (key && defaultValue) {
		val = clone( set ( key, defaultValue ) );
	}

	return val;

}

var clear = function () {
	data = {};
	save();
}

module.exports = {
	get : get,
	set : set,
	clear : clear,
	create : create,
	save : save,
	setFormat : setFormat,
	getJSON : getJSON
};