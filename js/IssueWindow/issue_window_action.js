(function(exports){
	'use strict';

	const https = require('http');
	const ipcRenderer = require('electron').ipcRenderer;

	const mainAction = require('../main/main_action.js');

	// get settings data from local file.
	var settings = JSON.parse(ipcRenderer.sendSync('synchronous-message', 'settings'));

	/**
	* get Data from Redmine's specific path. If Successed, do callback.
	**/
	var writeData = function(method, path, data, callback)
	{
		var writeData = JSON.stringify(data);
		var req = https.request({
			hostname : settings.host,
			path : path,
			auth : settings.name + ":" + settings.password,
			method : method,
			headers: {
				'Content-Type' : 'application/json',
				'Content-Length' : encodeURIComponent(writeData).replace(/%../g,"x").length
			}
		}, function(res){
			res.setEncoding('utf8');
			if (res.statusCode == 200 || res.statusCode == 201)
				callback();
		});

		req.write(writeData);
		req.end();
		req.on('error', function(e) {
			console.error(e);
		});
	};

	exports.postNewIssue = function(data, projectId)
	{
		writeData('POST', '/issues.json', data, function(){ mainAction.loadIssues(projectId) } );
	};

	exports.updateIssue = function(issueId, data, projectId)
	{
		writeData('PUT', '/issues/' + issueId + '.json', data, function(){ mainAction.loadIssues(projectId) } );
	};
})(this);
