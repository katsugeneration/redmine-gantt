var assert = require('assert');
var sinon = require('sinon');
var store = require('../../dist/main/main_store.js');
var uiData = require('../../dist/main/ui_data_store.js');
var Issue = require('../../dist/Data/issue.js').Issue;
var ExtendsDate = require('../../dist/Extends/extend_date.js').ExtendsDate;

describe('ui data store test', function(){
	var projects = [];
	var trackers = new Map();
	var issueStatuses = new Map();
	var issues = [];
	var user = {};

	before(function(){
		sinon.stub(store, 'Projects', function(){
			return projects;
		});

		sinon.stub(store, 'Trackers', function(){
			return trackers;
		});

		sinon.stub(store, 'IssueStatuses', function(){
			return issueStatuses;
		});

		sinon.stub(store, 'getProjectIssues', function(){
			return issues;
		});

		sinon.stub(store, 'User', function(){
			return user;
		});

		uiData.setBaseStore(store);
	});

	beforeEach(function(){
		projects = [{id : 1, name : 'test', expand : true}, {id : 2, name : 'test2', expand : true}];
		trackers = new Map([[1, 'test'], [2, 'test2']]);
		issueStatuses = new Map([[1, 'test'], [2, 'test2']]);
		issues = [];
		user = {color : 'test'};

		uiData.updateSelectedTracker(1);
		uiData.updateSelectedStatus(1);
	});

	describe('update view data', function(){
		it('only projects', function(){
			issues = [];
			uiData._updateViewData();
			assert.equal(uiData.ViewData().length, 2);
		});

		it('projects and issues', function(){
			var issue = new Issue();
			issue.trackerId = 1;
			issue.statusId = 1;
			issues = [issue, issue];
			uiData._updateViewData();
			assert.equal(uiData.ViewData().length, 6);
		});

		it('projects and issues when one project is not expand', function(){
			var issue = new Issue();
			issue.trackerId = 1;
			issue.statusId = 1;
			issues = [issue, issue];
			projects = [{id : 1, name : 'test', expand : true}, {id : 2, name : 'test2', expand : false}];
			uiData._updateViewData();
			assert.equal(uiData.ViewData().length, 4);
		});

		it('when tracker filetr on', function(){
			var issue = new Issue();
			issue.trackerId = 1;
			issue.statusId = 1;
			issues = [issue, issue];
			uiData.updateSelectedTracker(2);
			uiData._updateViewData();
			assert.equal(uiData.ViewData().length, 2);
		});

		it('when status filetr on', function(){
			var issue = new Issue();
			issue.trackerId = 1;
			issue.statusId = 1;
			issues = [issue, issue];
			uiData.updateSelectedStatus(2);
			uiData._updateViewData();
			assert.equal(uiData.ViewData().length, 2);
		});
	});

	describe('update issue date', function(){
		beforeEach(function(){
			var issue = new Issue();
			issue.trackerId = 1;
			issue.statusId = 1;
			issue.id = 1;
			issue.dueDate = new ExtendsDate(2016, 0, 1);
			issue.startDate = new ExtendsDate(2016, 0, 1);
			issue.updated = 'test';
			issues = [issue];
			uiData._updateViewData();
		});

		it ('update start date success pattern', function(){
			uiData.updateIssueDate('1-test', -1, 'start');
			var date = uiData.ViewData()[1].startDate;
			assert.equal(date.getFullYear(), 2015);
			assert.equal(date.getMonth(), 11);
			assert.equal(date.getDate(), 31);
		});

		it ('update start date error pattern', function(){
			uiData.updateIssueDate('1-test', 1, 'start');
			var date = uiData.ViewData()[1].startDate;
			assert.equal(date.getFullYear(), 2016);
			assert.equal(date.getMonth(), 0);
			assert.equal(date.getDate(), 1);
		});

		it ('update start date success pattern', function(){
			uiData.updateIssueDate('1-test', 1, 'due');
			var date = uiData.ViewData()[1].dueDate;
			assert.equal(date.getFullYear(), 2016);
			assert.equal(date.getMonth(), 0);
			assert.equal(date.getDate(), 2);
		});

		it ('update start date error pattern', function(){
			uiData.updateIssueDate('1-test', -1, 'due');
			var date = uiData.ViewData()[1].dueDate;
			assert.equal(date.getFullYear(), 2016);
			assert.equal(date.getMonth(), 0);
			assert.equal(date.getDate(), 1);
		});
	});
});
