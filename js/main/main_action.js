(function(exports){
	'use strict';

	const https = require('http');
	const dispatcher = require('./main_dispatcher.js');
	const ipcRenderer = require('electron').ipcRenderer;

	// get settings data from local file.
	var settings = JSON.parse(ipcRenderer.sendSync('synchronous-message', 'settings'));

	/**
	* get Data from Redmine's specific path. If Successed, do callback.
	**/
	var loadData = function(path, callback)
	{
		var _this = this;
		var req = https.request({
			hostname : settings.host,
			path : path,
			auth : settings.name + ":" + settings.password
		}, function(res){
			res.setEncoding('utf8');
			if (res.statusCode != 200) return;
			res.on('data', function (data){
				callback(data);
			});
		});

		req.end();
		req.on('error', function(e) {
			console.error(e);
		});
	};

	/**
	* load the projects whose name contains "target" from Redmine.
	**/
	exports.loadProjects = function(target)
	{
		if (target == "") return;
		loadData('/projects.json', function(data){
			dispatcher.projectsGetted(data, target);
		});
	};

	/**
	* load the users related with the project whose id is "id".
	**/
	exports.loadUsers = function(id)
	{
		loadData('/projects/' + id + '/memberships.json', function(data){
			dispatcher.usersGetted(data, id);
		});
	};

	/**
	* load the issues registered the project whose id is "id".
	**/
	exports.loadIssues =  function(id)
	{
		loadData('/issues.json?limit=100&project_id=' + id, function(data){
			dispatcher.issuesGetted(data, id);
		});
	};

	/**
	* load the trackers registered with the Redmine.
	**/
	exports.loadTrackers = function()
	{
		loadData('/trackers.json', function(data){
			dispatcher.trackersGetted(data);
		});
	};
})(this);
