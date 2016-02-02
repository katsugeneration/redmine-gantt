var assert = require('assert');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;
var http = require('http');
var dispatcher = require('../dist/main/main_dispatcher.js');

var networkAction = require('../dist/main/network_action.js');
var uiAction = require('../dist/main/ui_action.js');
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

			networkAction.loadData('test', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ hostname: 'host', auth : 'name:password' }));
			assert(dispatch.calledWith({ actionType : 'data-load-start' }));

			request.restore();
		});

		it('loadData response get', function(){
			var spy = sinon.spy();
			networkAction.loadData('test', function(){ spy(); });
			response.emit('end');

			assert(spy.called);
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('loadData request error occurred', function(){
			networkAction.loadData('test', function(){});
			ret.emit('error');
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('writeData prestart', function(){
			requestStub.restore();
			var request = sinon.spy(http, 'request');

			networkAction.writeData('POST', 'test', 'data', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ hostname: 'host', auth : 'name:password', headers: {
				'Content-Type' : 'application/json',
				'Content-Length' : 6
			}}));

			request.restore();
		});

		it('writeData response get', function(){
			var spy = sinon.spy();
			networkAction.writeData('POST', 'test', 'data', function(){ spy(); });
			response.emit('end');

			assert(spy.called);
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('writeData request error occurred', function(){
			networkAction.writeData('POST', 'test', 'data', function(){});
			ret.emit('error');
			assert(dispatch.calledTwice);
			assert(dispatch.calledWith({ actionType : 'data-load-finish' }));
		});

		it('deleteData prestart', function(){
			requestStub.restore();
			var request = sinon.spy(http, 'request');

			networkAction.deleteData('test', function(){});
			assert(request.called);
			sinon.assert.calledWith(request, sinon.match({ method : 'DELETE', hostname: 'host', auth : 'name:password'}));

			request.restore();
		});

		it('deleteData response get', function(){
			var spy = sinon.spy();
			networkAction.deleteData('test', function(){ spy(); });

			assert(spy.called);
		});

		it('deleteData request error occurred', function(){
			networkAction.deleteData('test', function(){});
			ret.emit('error');
		});
	});

	describe('action success pattern', function(){
		var loadData, writeData, deleteData;
		var dispatch;
		var data;

		before(function(){
			loadData = sinon.stub(networkAction, 'loadData', function(path, callback){
				callback(data);
			});
			writeData = sinon.stub(networkAction, 'writeData', function(method, path, data, callback){
				callback();
			});
			deleteData = sinon.stub(networkAction, 'deleteData', function(path, callback){
				callback();
			});

			dispatch = sinon.spy(dispatcher, 'dispatch');
		});

		after(function(){
			loadData.restore();
			writeData.restore();
			deleteData.restore();
			dispatch.restore();
		});

		it('set projects', function(){
			data = '{"total_count": 20, "offset":0, "limit":25}';
			networkAction.loadProjects('TEST');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'projects-get' }));
		});

		it('update projects', function(){
			data = '{"total_count": 20, "offset":1, "limit":25}';
			networkAction.loadProjects('TEST');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'projects-update' }));
		});

		it('load users', function(){
			networkAction.loadUsers(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'users-get' }));
		});

		it('set issues', function(){
			data = '{"total_count": 20, "offset":0, "limit":25}';
			networkAction.loadIssues(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issues-get' }));
		});

		it('update issues', function(){
			data = '{"total_count": 20, "offset":1, "limit":25}';
			networkAction.loadIssues(0);

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issues-update' }));
		});

		it ('delete issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			networkAction.deleteIssue(issue);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-delete' }));
		});

		it('load issue statuses', function(){
			networkAction.loadIssueStatuses();

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-statuses-get' }));
		});

		it('load issue trackers', function(){
			networkAction.loadTrackers();

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'trackers-get' }));
		});

		it('update issue window state', function(){
			uiAction.updateIssueWindowState(true, 'Update', {});

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-window-state-update' }));
		});

		it ('post new issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			networkAction.postNewIssue(issue, 0);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'add-new-issue' }));
		});

		it ('update issue', function(){
			var issue = new Issue();
			issue.parentId = 0;

			networkAction.updateIssue(1, issue, 0);
			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'issue-update' }));
		});

		it('update selected tracker', function(){
			uiAction.updateSelectedTracker('Update');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'selected-tracker-update' }));
		});

		it('update selected status', function(){
			uiAction.updateSelectedStatus('Update');

			sinon.assert.calledWith(dispatch, sinon.match({ actionType : 'selected-status-update' }));
		});
	});
});
