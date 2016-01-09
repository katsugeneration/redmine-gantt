var assert = require('assert');
var store = require('../../dist/main/main_store.js');
var fs = require('fs');
var projects;

describe('project setting', function() {
	before(function(){
		try {
			// get projects test data
			projects = fs.readFileSync(__dirname + '/projects.json', 'utf8');
		} catch (e) {
			console.log(e.message);
			process.exit();
		}
	});

	describe('set projects', function() {
		it('set project when target contains the projects whose name', function(){
			store.setProjects(projects, "child");
			assert.equal(store.Projects()[0].name, "child");
		});

		it('unset project when target contains the projects whose name', function(){
			store.setProjects(projects, "undefined_name");
			assert.equal(store.Projects().length, 0);
		});

		it ('set project when target contains the parents project name', function(){
			store.setProjects(projects, "projects");
			assert.equal(store.Projects()[1].name, "child");
		})
	});

	describe('update projects', function(){
		beforeEach(function(){
			store.setProjects(projects, "projects");
		});

		it('update project when project already contains', function(){
			store.updateProjects('{ "projects" : [{ "id" : 2, "name" : "update"}]}', "update");
			assert.equal(store.Projects()[1].name, "update");
		});

		it('not remove already projects', function(){
			store.updateProjects(projects, "undefined");
			assert.equal(store.Projects().length, 2);
		});
	});
});
