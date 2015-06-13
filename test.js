var config = require("storeset");

//config.clear();
//config.create("bob.json");

var bob = config.set("mike", 42);
var bob = config.set("mike.age", 42);
var bob = config.set("mike.tool", true);

var see = config.get("mike");

console.log('see', config.getJSON(2));