
describe('Test 1', function() {

	
	it('clears and sets a:100', function() {

		var store = require("../storeset");
		store.clear();
		store.set("a", 100);

		expect(store.getJSON(false)).toEqual('{"a":100}');
	
	});

	it('checks JSON format', function(){
		var store = require("../storeset");
		store.clear();
		store.set("a", 100);

		expect(store.getJSON("\t")).toEqual(`{
	"a": 100
}`);
	});

	it('sets mike.age to 42', function() {

		var store = require("../storeset");
		store.set("mike.age", 42);

		expect(store.get("mike.age")).toEqual(42);
	
	});


	it('checks both mike.age and a exist', function() {

		var store = require("../storeset");

		expect( store.get("mike.age") ).toEqual(42);
		expect( store.get("a") ).toEqual(100);
	
	});

	it('checks clearing', function(){
		var store = require("../storeset");
		store.clear();

		expect(store.getJSON(false)).toEqual('{}');
	});

	it('checks array access', function(){
		var store = require("../storeset");
		store.set("arr", ["a", "b", "c", "d"]);

		expect(store.get("arr.2")).toEqual('c');
	});


	it('checks direct data manipulation', function(){
		var store = require("../storeset");
		store.clear();

		var local = store.getDataObject();
		local.bob = 200;

		store.save();

		expect(store.get("bob")).toEqual(200);
		
	});

	it('checks did save direct data manipulation', function(){
		var store = require("../storeset");
		expect(store.getJSON(false)).toEqual('{"bob":200}');
	});


});

