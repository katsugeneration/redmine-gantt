var assert = require('assert');
var store = require('../dist/main/main_store.js');

describe('project setting', function() {
	describe('set projects', function() {
		it('set project when target contains the projects whose name', function(){
			store.setProjects('{"projects" : [{"name" : "projects"}]}', "projects");
			assert.equal(store.Projects()[0].name, "projects");
		});
	});
});
