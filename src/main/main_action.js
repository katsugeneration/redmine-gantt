(function(exports){
	'use strict';

	const dispatcher = require('./main_dispatcher.js');
	const ipcRenderer = require('electron').ipcRenderer;

	// get settings data from local file.
	var settings = JSON.parse(ipcRenderer.sendSync('settings'));
	const protocol = require(settings.protocol);

	/**
	* get Data from Redmine's specific path. If Successed, do callback.
	**/
	var loadData = function(path, callback)
	{
		var _this = this;
		var data = "";
		var req = protocol.request({
			hostname : settings.host,
			path : path,
			auth : settings.name + ":" + settings.password
		}, function(res){
			res.setEncoding('utf8');
			if (res.statusCode != 200) return;
			res.on('data', function (chunk){
				data += chunk;
			});
			res.on('end', function(){
				dispatcher.dataLoadFinished();
				callback(data);
			})
		});

		dispatcher.dataLoadStarted();

		req.end();
		req.on('error', function(e) {
			dispatcher.dataLoadFinished();
			console.error(e);
		});
	}

	/**
	* delete data method from Redmine.
	**/
	var deleteData = function(path, callback)
	{
		var _this = this;
		var data = "";
		var req = protocol.request({
			hostname : settings.host,
			path : path,
			method : 'DELETE',
			auth : settings.name + ":" + settings.password
		}, function(res){
			res.setEncoding('utf8');
			if (res.statusCode != 200) return;
			callback();
		});

		req.end();
		req.on('error', function(e) {
			console.error(e);
		});
	}

	/**
	* get Data from Redmine's specific path. If Successed, do callback.
	**/
	var writeData = function(method, path, data, callback)
	{
		var writeData = JSON.stringify(data);
		var req = protocol.request({
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

	/**
	* load the projects whose name contains "target" from Redmine.
	**/
	exports.loadProjects = function(target)
	{
		if (target == "") return;

		function recursion (offset, limit)
		{
			loadData('/projects.json?offset=' + offset + '&limit=' + limit, function(data){
				var obj = JSON.parse(data);
				if (obj.total_count > obj.offset + obj.limit) recursion(obj.offset + obj.limit, obj.limit);
				if (obj.offset == 0) dispatcher.projectsGetted(data, target);
				if (obj.offset != 0) dispatcher.projectsUpdated(data, target);
			});
		}

		recursion(0, 100);
	}

	/**
	* load the users related with the project whose id is "id".
	**/
	exports.loadUsers = function(id)
	{
		loadData('/projects/' + id + '/memberships.json', function(data){
			dispatcher.usersGetted(data, id);
		});
	}

	/**
	* load the issues registered the project whose id is "id".
	**/
	exports.loadIssues =  function(id)
	{
		function recursion (offset, limit)
		{
			loadData('/issues.json?offset=' + offset + '&limit=' + limit + '&project_id=' + id, function(data){
				var obj = JSON.parse(data);
				if (obj.total_count > obj.offset + obj.limit) recursion(obj.offset + obj.limit, obj.limit);
				if (obj.offset == 0) dispatcher.issuesGetted(data, id);
				if (obj.offset != 0) dispatcher.issuesUpdated(data, id);
			});
		}

		recursion(0, 100);
	}

	exports.deleteIssue = function(issue)
	{
		var _this = this;
		deleteData('/issues/' + issue.id + '.json', function(){
			_this.loadIssues(issue.projectId);
		});
	}

	/**
	* load the trackers registered with the Redmine.
	**/
	exports.loadTrackers = function()
	{
		loadData('/trackers.json', function(data){
			dispatcher.trackersGetted(data);
		});
	}

	exports.updateIssueWindowState = function(isOpen, modalType, modalObject)
	{
		dispatcher.issueWindowStateUpdated(isOpen, modalType, modalObject);
	}

	exports.postNewIssue = function(data, projectId)
	{
		writeData('POST', '/issues.json', data, function(){ exports.loadIssues(projectId) } );
	};

	exports.updateIssue = function(issueId, data, projectId)
	{
		writeData('PUT', '/issues/' + issueId + '.json', data, function(){ exports.loadIssues(projectId) } );
	};
})(this);
