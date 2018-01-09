/*

# storeset

A simple way to store app settings and configs in your Node app. I thought this would be a quick find on nodejs, but everything was too basic, or too complicated... nothing in that "goldylocks" zone.

The storeset.js file has some default properties you can fiddle with 

# License
Copyright(c) Michael Gieson
www.gieson.com

Documentation:
https://github.com/bobtherobot/storeset

MIT Licensed

*/

(function(name, def){
	if (typeof module != 'undefined') {
		module.exports = def();
	} else {
		this[name] = def(true);
	}
}('storeset', function(amBrowser){

	// Just in case?
	if (typeof window !== 'undefined') {
		amBrowser = true;
	}

	// -----------------------------------------
	// Configuration

	/**
	 * @property {string} defaultStoreFile=true	- The default filename for the underlying system storage. NOTE: For Browser usage, this will also be the primary key used for [localStorage](localStorage)
	 */
	var defaultStoreFile = "store.json";


	/**
	 * @property {boolean | string | number} format - JSON "space" setting (to indent / make human readable). When set, the JSON will become human readable. When TRUE, will default to using tabs. Otherwise, same as ( JSON.stringify's 3rd argument "space")[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify], where a numeric value will cause X number of spaces as tabs, or a string (usually a "\\tab" character) will be used for the tab spaces.
	 */
	var format = "\t";

	/**
	 * @property {string} addressSeparator="[" - The default xpath seperator. Prefer to use a "/" or maybe a ":" ?
	 */
	var addressSeparator = ".";

	/**
	 * @property {any} defaultData={}	- Put any common stuff in here so all newly created stores will have the same data.
	 */
	var defaultData = {};

	/**
	 * @property {boolean} saveOnSet=true	- When FALSE, you'll have to manually call save() to write the data to file.
	 */
	var saveOnSet = true;

	/**
	 * @property {boolean} saveOnExit=false	- When TRUE, save before exit or crash.
	 */
	var saveOnExit = false;

	var fs;
	var path;

	function initNode(){
		if( ! amBrowser ){
			fs = require("fs");
			path = require("path");
		}
	}


	// -----------------------------------------
	// Setup
	var dataFileName;
	var dataFilePath;
	var data;
	var didSetup = false;
	var localStorageId = defaultStoreFile.replace(/[^A-Za-z0-9]/g, ""); // do we really need to make a distinction between the two?

	function clone(obj) {
		var copy;

		var type = typeof obj;
		// Handle the 3 simple types, and null or undefined
		if (obj === null  || type != "object") {
			return obj;
		}

		// Handle Date
		if (type == "date") {
			return obj.getTime();
		}

		// Handle Array
		if ( Array.isArray(obj) ) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone( obj[i] );
			}
			return copy;
		}

		// Handle Object
		if (type == "object") {
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

		var gotData;

		if( amBrowser ){

			gotData = localStorage.getItem(localStorageId)

		} else {

			initNode();

			// See if we've spcified a path.
			if( ~dataFileName.indexOf(path.sep) ){
				dataFilePath = dataFileName;

			// Otherwise, use CWD
			} else {
				//dataFilePath = path.resolve(__dirname, dataFileName);
				dataFilePath = path.resolve(process.cwd(), dataFileName);
			}

			// Make sure the file exists and data is parsable
			if(fs.existsSync(dataFilePath)){
				gotData = fs.readFileSync(dataFilePath, "UTF-8");
			}

		}

		var parsedData;
		if(gotData){
			// Ensure JSON is not corrupted, or non-parsable
			try{
				parsedData = JSON.parse(gotData);
			} catch(e){
				// ignore
			}
		}

		if(typeof formatChar != "undefined" ){
			format = formatChar;
		}

		// MUST BE BEFORE save();
		didSetup = true;

		data = parsedData || defaultData;
		
		// Only make new file if we need to
		if(data != parsedData){
			save();
		}
	}

	/**
	 * Sets the kind of formattign applied to the underlying data storage JSON. 
	 * @method     setFormat
	 * @param      {boolean | string | number}       val    See [format](#format)
	 */
	function setFormat(val){
		format = parseFormat(val);
	}

	/**
	 * Determines the JSON format 
	 * @method     parseFormat
	 * @private
	 * @param      {boolean | string | number}       val    See [format](#format)
	 */
	function parseFormat(val){

		var ftype = typeof val;
		var fval;

		// If not defined, use the default
		if( ftype == "undefined" ){
			fval = null;

		// Explicetely looking for FALSE. But still need to set fval when TRUE
		} else if( ftype == "boolean" ){
			if(val) {
				ftype = "string";
				fval = "\t";
			} else {
				fval = null;
			}
		} 

		// Looks for specific settings (same as setFormat)
		if( ftype == "string" || ftype == "number" ){
			fval = val;
		}

		return fval;
	}


	function checkInit(){
		if( ! didSetup ){
			create(defaultStoreFile);
		}
	}

	// --------------------
	// Exit Hooks
	// --------------------
	// Save before exit... or crash or early termination.

	var exitCalled = false;
	var setSaveOnExitEstablished = false;

	function exit(sigvar, signal) {
		if (exitCalled) {
			return;
		}

		exitCalled = true;

		save();

		if (sigvar === true) {
			process.exit(128 + signal);
		}
	}

	var exit_bound_2 = exit.bind(null, true, 2);
	var exit_bound_15 = exit.bind(null, true, 15);

	function setSaveOnExit(val){
		saveOnExit = val;
		if(val){
			if( ! setSaveOnExitEstablished ){
				setSaveOnExitEstablished = true;
				process.once('exit', exit);
				process.once('SIGINT', exit_bound_2);
				process.once('SIGTERM', exit_bound_15);
			}
		} else {
			if( setSaveOnExitEstablished ){
				setSaveOnExitEstablished = false;
				// Don't see "off" in the documentation?
				//process.off('exit', exit);
				//process.off('SIGINT', exit_bound_2);
				//process.off('SIGTERM', exit_bound_15);
			}
		}
	}

	/**
	 * Set's up the default properties. Configure _storeset__ without having to manually do so within the storeset.js file.
	 * @method  configure
	 * @param	{object} params 							- The config object
	 * @param	{string} [params.defaultStoreFile] 			- Same as [defaultStoreFile](#defaultStoreFile).
	 * @param	{boolean | string | number} [params.format] - Same as [format](#format).
	 * @param	{string} [params.addressSeparator] 			- Same as [addressSeparator](#addressSeparator).
	 * @param	{object} [params.defaultData] 				- Same as [defaultData](#defaultData).
	 * @param	{boolean} [params.saveOnSet] 				- Same as [saveOnSet](#saveOnSet).
	 * @param	{boolean} [params.saveOnExit] 				- Same as [saveOnExit](#saveOnExit).
	 * @param {boolean} andSave - Will execute a [save](#save) immediately to freeze the new settings into the underlying store data.
	 */
	function configure(params, andSave){
		if(params.defaultStoreFile){
			defaultStoreFile = params.defaultStoreFile;
		}

		if(typeof params.format != 'undefined' ){
			format = params.format;
		}

		if(params.addressSeparator){
			addressSeparator = params.addressSeparator;
		}

		if(params.defaultData){
			defaultData = params.defaultData;
		}
		
		if(typeof params.saveOnSet != 'undefined' ){
			saveOnSet = params.saveOnSet;
		}

		if(typeof params.saveOnExit != 'undefined' ){
			saveOnExit = params.saveOnExit;
			setSaveOnExit(saveOnExit);
		}

		if(andSave){
			save();
		}
	}


	/**
	 * Sets the data at the provided key.
	 * @method     set
	 * @param      {string}    	key      - A string representation using a dot notation xpath. e.g. "path.to.here". For arrays, use a number for the index: "path.to.3"
	 * @param      {any}    	value    - The data to set.
	 * @param      {boolean}    andSave  - Will trigger a [save](#save) to update and write to the underlying data store. Overrides the default [saveOnSet](#saveOnSet).
	 * returns {any} - The data that was provided for the "value" argument.
	 */
	var set = function ( key, value, andSave ) {

		checkInit();

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
				//
				// NOTE: typeof null == "object", so we must check !segData
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

		// NOTE: Not returning cloned value, so if it's an object/array
		// it is still malleable (linked by reference) on the end-users side.
		// But it since it was cloned into our data, the data value is locked-in.
		//
		// This allows user to continue using the returned value as normal,
		// and provides function-chaining capacity.

		if(saveOnSet || andSave){
			save();
		}
		
		return value;

	}

	/**
	 * Gets the full data as a JSON string.
	 * @method     getJSON
	 * @param      {boolean | string | number}     [human]    - Overrides default [format](#format).
	 * @return     {string}  - The JSON string.
	 */
	var getJSON = function(human){
		checkInit();
		human = parseFormat(typeof human == 'undefined' ? format : human);
		return JSON.stringify(data, null, human);
	}

	/**
	 * Gets the data at specified ky.
	 * @method     get
	 * @param      {string}  	key          	- A string representation of a path to the data using a "dot" xpath.
	 * @param      {any}    	defaultValue    - Establishes a defualt value if the data doesn't exist.
	 * @return     {any}
	 */
	var get = function ( key, defaultValue ) {

		checkInit();

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
		if(seg && typeof seg[last] != 'undefined'){
			val = clone( seg[last] );

		// Set the default value if using this option.
		// Make sure we have a key before attempting this !
		} else if (key && defaultValue) {
			val = clone( set ( key, defaultValue ) );
		}

		return val;

	}

	/**
	 * Resets the data object to be a new blank, empty object and and  erases the file storage to represent the blank object.
	 * @method     clear
	 */
	var clear = function () {
		checkInit();

		// Empty data object without destroying data variable reference (incase user operating directly on data object via getDataObject)
		for (var prop in data){
		    if (data.hasOwnProperty(prop)){
		        delete data[prop];
		    }
		}

		if(amBrowser){
			localStorage.clear();
			localStorage.setItem(localStorageId, "");
		} else {
			fs.writeFileSync(dataFilePath, '{}', "UTF-8");
		}
	}


	/**
	 * Writes to the underlying data store.
	 * @method     save
	 */
	function save(){

		checkInit();
		
		var str;
		if(amBrowser){
			str = getJSON(false); // don't store newlines, tabs and formatting into localStorage, otherwise it breaks.
			localStorage.setItem(localStorageId, str);
		} else {
			str = getJSON();
			fs.writeFileSync(dataFilePath, str, "UTF-8");
		}
	}

	/**
	 * Provides a means to access the local data object directly. This data object is what we operate on to do all the get/set. This allows you to operate directly on the object without using get/set.
	 * @method     getDataObject
	 * @return     {object} - The local data object.
	 */
	function getDataObject(){
		checkInit();
		return data;
	}

	return {
		get 		: get,
		set 		: set,
		clear 		: clear,
		create 		: create,
		save 		: save,
		setFormat 	: setFormat,
		getJSON 	: getJSON,
		configure 	: configure,
		getDataObject : getDataObject
	};

}));









