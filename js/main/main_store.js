(function(exports){
	'use strict';

	const view = require('./main_view.js');
	const EventEmitter = require('events').EventEmitter;

	exports.__proto__ = EventEmitter.prototype;

	var _projects = [];
	exports.setProjects = function(data, target)
	{
		_projects = [];
		JSON.parse(data).projects.some(function(project, index){
			if (project.name.indexOf(target) == -1 &&
			undefined == _projects.find(function(item, i, array){
				if (project.parent == undefined) return false;
				if (item.id == project.parent.id) return item;
				return false;
			})) return false;

			var proj = {};
			proj.__proto__ = project;
			proj.parent_id = (project.parent == undefined) ? 0 : project.parent.id;
			_projects.push(proj);
		});

		this.emit('projects');
	};

	var _issues = new Map();
	exports.setIssues = function(data, project_id)
	{
		_issues.set(project_id, JSON.parse(data).issues);
		this.emit('issues');
	};

	exports.Projects = function()
	{
		return _projects;
	};

	exports.Issues = function(project_id)
	{
		return _issues.get(project_id);
	};

})(this);
