var assert = require('assert');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;
var http = require('http');
var dispatcher = require('../dist/main/main_dispatcher.js');

var action = require('../dist/main/main_action.js');
var Issue = require('../dist/Data/issue.js').Issue;

describe('action test', function(){
	describe('base function test', function(){
		var requestStub,
			ret,
			response,
			dispatch;

		beforeEach(function(){
			dispatch = sinon.spy(dispatcher, 'dispatch');

			ret = new PassThrough(),
			response = new http.IncomingMessage();
			response.statusCode = 200;

			requestStub = sinon.stub(http, 'request', function(option, callback){
				callback(response);
				return ret;
			});
		});

		afterEach(function(){
			requestStub.restore();
			dispatch.restore();
		});

		it('loadData prestart', function(){
			requestStub.restore();
			var request = sinon.spy(http, 'request');

			action.loadData('test', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ hostname: 'host', auth : 'name:password' }));
			assert(dispatch.calledWith({ actionType : 'data-load-start' }));

			request.restore();
		});

		it('loadData response get', function(){
			var spy = sinon.spy();
			action.loadData('test', function(){ spy(); });
			response.emit('end');

			assert(spy.called);
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('loadData request error occurred', function(){
			action.loadData('test', function(){});
			ret.emit('error');
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('writeData prestart', function(){
			requestStub.restore();
			var request = sinon.spy(http, 'request');

			action.writeData('POST', 'test', 'data', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ hostname: 'host', auth : 'name:password', headers: {
				'Content-Type' : 'application/json',
				'Content-Length' : 6
			}}));

			request.restore();
		});

		it('writeData response get', function(){
			var spy = sinon.spy();
			action.writeData('POST', 'test', 'data', function(){ spy(); });
			response.emit('end');

			assert(spy.called);
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('writeData request error occurred', function(){
			action.writeData('POST', 'test', 'data', function(){});
			ret.emit('error');
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('deleteData prestart', function(){
			requestStub.restore();
			var request = sinon.spy(http, 'request');

			action.deleteData('test', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ method : 'DELETE', hostname: 'host', auth : 'name:password'}));

			request.restore();
		});

		it('deleteData response get', function(){
			var spy = sinon.spy();
			action.deleteData('test', function(){ spy(); });

			assert(spy.called);
		});

		it('deleteData request error occurred', function(){
			action.deleteData('test', function(){});
			ret.emit('error');
		});
	});

	describe('action success pattern', function(){
		var loadData, writeData, deleteData;
		var dispatch;
		var data;

		beforeEach(function(){
			loadData = sinon.stub(action, 'loadData', function(path, callback){
				callback(data);
			});
			writeData = sinon.stub(action, 'writeData', function(method, path, data, callback){
				callback();
			});
			deleteData = sinon.stub(action, 'deleteData', function(path, callback){
				callback();
			});

			dispatch = sinon.spy(dispatcher, 'dispatch');
		});

		afterEach(function(){
			loadData.restore();
			writeData.restore();
			deleteData.restore();
			dispatch.restore();
		});

		it('set projects', function(){
			data = '{"total_count": 20, "offset":0, "limit":25}';
			action.loadProjects('TEST');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'projects-get' }));
		});

		it('update projects', function(){
			data = '{"total_count": 20, "offset":1, "limit":25}';
			action.loadProjects('TEST');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'projects-update' }));
		});

		it('load users', function(){
			action.loadUsers(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'users-get' }));
		});

		it('set issues', function(){
			data = '{"total_count": 20, "offset":0, "limit":25}';
			action.loadIssues(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issues-get' }));
		});

		it('update issues', function(){
			data = '{"total_count": 20, "offset":1, "limit":25}';
			action.loadIssues(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issues-update' }));
		});

		it ('delete issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			action.deleteIssue(issue);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'delete-issue' }));
		});

		it('load issue statuses', function(){
			action.loadIssueStatuses();

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-statuses-get' }));
		});

		it('load issue trackers', function(){
			action.loadTrackers();

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'trackers-get' }));
		});

		it('update issue window state', function(){
			action.updateIssueWindowState(true, 'Update', {});

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-window-state-update' }));
		});

		it ('post new issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			action.postNewIssue(issue, 0);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'add-new-issue' }));
		});

		it ('update issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			action.updateIssue(1, issue, 0);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'update-issue' }));
		});

		it('update selected tracker', function(){
			action.updateSelectedTracker('Update');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'selected-tracker-update' }));
		});

		it('update selected status', function(){
			action.updateSelectedStatus('Update');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'selected-status-update' }));
		});
	});
});
