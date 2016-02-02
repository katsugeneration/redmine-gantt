var assert = require('assert');
var sinon = require('sinon');
var store = require('../../dist/main/main_store.js');
var Issue = require('../../dist/Data/issue.js').Issue;
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
			store.setProjects(projects, 'child');
			assert.equal(store.Projects()[0].name, 'child');
		});

		it('unset project when target contains the projects whose name', function(){
			store.setProjects(projects, 'undefined_name');
			assert.equal(store.Projects().length, 0);
		});

		it ('set project when target contains the parents project name', function(){
			store.setProjects(projects, 'projects');
			assert.equal(store.Projects()[1].name, 'child');
		});
	});

	describe('update projects', function(){
		beforeEach(function(){
			store.setProjects(projects, 'projects');
		});

		it('update project when project already contains', function(){
			store.updateProjects('{ "projects" : [{ "id" : 2, "name" : "update"}]}', 'update');
			assert.equal(store.Projects()[1].name, 'update');
		});

		it('not remove already projects', function(){
			store.updateProjects(projects, 'undefined');
			assert.equal(store.Projects().length, 2);
		});
	});

	describe('set users', function(){
		var users,
			user,
			data = '{"memberships" : [{"user" : {"id" : 1, "name" : "test"}}]}';

		beforeEach(function(){
			users = sinon.stub(store, 'User', function(){
				return user;
			});
		});

		afterEach(function(){
			store.setUsers('{"memberships" : []}', 1);
		});

		it('set users when user not contained in user list', function(){
			user = undefined;
			store.setUsers(data, 1);
			users.restore();

			assert.equal(store.User(1).name, 'test');
		});

		it('set users when user contained in user list', function(){
			user = { id : 1, name : 'test2' };
			store.setUsers(data, 1);
			users.restore();

			assert.equal(store.User(1), user);
		});
	});

	describe('set issues', function(){
		var data = '{ "issues" : [{ "id" : 1, "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}';

		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('issues contained in the project', function(){
			store.setIssues(data, 1);

			assert.equal(store.getProjectIssues(1).length, 1);
			assert.equal(store.getProjectIssues(1)[0].id, 1);
		});

		it('issues not contained in the project', function(){
			store.setIssues(data, 2);

			assert.equal(store.getProjectIssues(1).length, 0);
		});
	});

	describe('update issues', function(){
		var data = '{ "issues" : [{ "id" : 1, "subject" : "test2", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}';

		beforeEach(function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
		});

		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('issues contained in the project', function(){
			store.updateIssues(data, 1);

			assert.equal(store.getProjectIssues(1).length, 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test2');
		});

		it('issues not contained in the project', function(){
			store.setIssues(data, 2);

			assert.equal(store.getProjectIssues(1).length, 1);
		});
	});

	describe('delete issue', function(){
		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('when containing a issue', function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
			assert.equal(store.getProjectIssues(1).length, 1);
			store.deleteIssue(1);
			assert.equal(store.getProjectIssues(1).length, 0);
		});

		it('when containing issues', function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}, { "id" : 2, "subject" : "test2", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
			assert.equal(store.getProjectIssues(1).length, 2);
			store.deleteIssue(1);
			assert.equal(store.getProjectIssues(1).length, 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test2');
		});
	});



	describe('update issue', function(){
		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('when containing a issue', function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test');
			var issue = new Issue();
			issue.subject = 'test2';
			store.updateIssue(1, issue, 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test2');
		});
	});

	describe('add new issue', function(){
		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('when containing target peoject already', function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
			store.addNewIssue('{ "issue" : { "id" : 2, "subject" : "test2", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}}', 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test2');
		});

		it('when not containing target peoject', function(){
			store.addNewIssue('{ "issue" : { "id" : 2, "subject" : "test2", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}}', 99);
			assert.equal(store.getProjectIssues(99)[0].subject, 'test2');
		});
	});

	describe('get users', function(){
		beforeEach(function(){
			store.setUsers('{"memberships" : [{"user" : {"id" : 1, "name" : "test"}}]}', 1);
		});

		afterEach(function(){
			store.setUsers('{"memberships" : []}', 1);
		});

		it('users containd', function(){
			assert.equal(store.User(1).name, 'test');
		});

		it('users not containd', function(){
			assert.equal(store.User(2), undefined);
		});
	});

	describe('get issues', function(){
		afterEach(function(){
			store.setIssues('{"issues": []}', 1);
		});

		it('project not contains issues', function(){
			assert.equal(store.getProjectIssues(1).length, 0);
		});

		it('project contains issues', function(){
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 1);
			store.setIssues('{ "issues" : [{ "id" : 1, "subject" : "test2", "project" : { "id" : 1}, "tracker" : {}, "status" : {}}]}', 2);
			assert.equal(store.getProjectIssues(1).length, 1);
			assert.equal(store.getProjectIssues(1)[0].subject, 'test');
		});
	});
});
