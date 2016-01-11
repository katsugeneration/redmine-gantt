var assert = require('assert');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;
var http = require('http');

var action = require('../dist/main/main_action.js');

describe('action test', function(){
	beforeEach(function(){
		this.request = sinon.stub(http, 'request', function(option, callback){
			var response = new PassThrough();
			response.statusCode = 200;
			response.end();
			callback(response);
			return new PassThrough();
		});
	});

	afterEach(function(){
		http.request.restore();
	});

	it ('delete issue', function(){
		var loadIssue =	sinon.spy(action, 'loadIssues');

		action.deleteIssue(0);

		assert(loadIssue.called);
		action.loadIssues.restore();
	});
});
