(function(exports){
	'use strict';

	const https = require('https');
	const dispatcher = require('./main_dispatcher.js');
	const settings = require("../../settings.json"); // seeting data

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
		loadData('/projects.json', function(data){ dispatcher.projectsGetted(data, target); });
	};

	/**
	* load the issues registered the project whose id is "id".
	**/
	exports.loadIsuues =  function(id)
	{
		loadData('/issues.json?project_id=' + id, function(data){ dispatcher.issuesGetted(data, id); });
	}
})(this);
