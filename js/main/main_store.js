(function(exports){
	'use strict';

	const view = require('./main_view.js');
	const EventEmitter = require('events').EventEmitter;

	exports.__proto__ = EventEmitter.prototype;

	var _projects = [];
	var _issues = new Map();
	var _users = new Map();
	var _trackers = new Map();

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

	exports.setUsers = function(data, projectId)
	{
		var usersInProject = [];
		var memberships = JSON.parse(data).memberships;
		memberships.some(function(membership, index){
			if(membership.user != undefined)
				usersInProject.push(membership.user);
		});

		_users.set(projectId, usersInProject);
		this.emit('users');
	};

	exports.setIssues = function(data, projectId)
	{
		_issues.set(projectId, JSON.parse(data).issues);
		this.emit('issues');
	};

	exports.updateIssues = function(data, projectId)
	{
		var issuesInProject = _issues.get(projectId);

		JSON.parse(data).issues.some(function(updated, index){
			issuesInProject.some(function(old, index){
				if(updated.id == old.id)
				{
					issuesInProject.push(updated);
					issuesInProject.pop(old);
					return true;
				}
			});
		});

		this.emit('issues');
	};

	exports.setTrackers = function(data)
	{
		var trackers = JSON.parse(data).trackers;

		trackers.some(function(tracker, index){
			_trackers.set(tracker.id, tracker);
		});

		this.emit('trackers');
	}

	exports.Projects = function()
	{
		return _projects;
	};

	exports.Users = function(projectId)
	{
		return (_users.get(projectId) == undefined) ? [] : _users.get(projectId);
	};

	exports.Issues = function(projectId)
	{
		return (_issues.get(projectId) == undefined) ? [] : _issues.get(projectId);
	};

	exports.Trackers = function()
	{
		return _trackers;
	};

})(this);
