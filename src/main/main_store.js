(function(exports){
	'use strict';

	const EventEmitter = require('events').EventEmitter;
	const Issue = require('../Data/issue.js').Issue;
	const Colors = require('material-ui').Styles.Colors;

	exports.__proto__ = EventEmitter.prototype;

	var _loadStatus;
	var _projects = [];
	var _issues = new Map();
	var _users = new Map();
	var _trackers = new Map();
	var _colors = [];
	var _issueWindowState = {
		isOpen : false,
		modalType : "Add",
		modalObject : {}
	};

	exports.setLoadStatus = function(nextStatus)
	{
		_loadStatus = nextStatus;
		this.emit('load-status');
	}

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
			{
				var user = exports.Users(membership.user.id);
				if (user == undefined)
				{
					user = membership.user;
					user.color = _getColor();
				}
				usersInProject.push(user);
			}
		});

		_users.set(projectId, usersInProject);
		this.emit('users');
	};

	exports.setIssues = function(data, projectId)
	{
		_issues.set(projectId, JSON.parse(data).issues.filter(function(item, index){
			if(item.project.id == projectId) return true;
		}).map(function(item, index){
			return Issue.toIssueFromJSON(item);
		}));
		this.emit('issues');
	};

	exports.updateIssues = function(data, projectId)
	{
		var issuesInProject = _issues.get(projectId);

		JSON.parse(data).issues.filter(function(item, index){
			 if(item.project.id == projectId) return true;
		}).map(function(item, index){
			return Issue.toIssueFromJSON(item);
		}).some(function(updated, index){
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
	};

	exports.setIssueWindowState = function(isOpen, modalType, modalObject)
	{
		_issueWindowState.isOpen = isOpen;
		_issueWindowState.modalType = modalType;
		_issueWindowState.modalObject = modalObject;
		this.emit('issue-window-state');
	}

	exports.LoadStatus = function()
	{
		return _loadStatus;
	}

	exports.Projects = function()
	{
		return _projects;
	};

	exports.GetProjectUsers = function(projectId)
	{
		return (_users.get(projectId) == undefined) ? [] : _users.get(projectId);
	};

	exports.Users = function(userId)
	{
		var ret = undefined;

		_users.forEach(function(users){
			users.some(function(user ,index){
				if (user.id == userId)
				{
					ret = user;
					return true;
				}
			});
		});

		return ret;
	}

	exports.Issues = function(projectId)
	{
		return (_issues.get(projectId) == undefined) ? [] : _issues.get(projectId);
	};

	exports.Trackers = function()
	{
		return _trackers;
	};

	exports.issueWindowState = function()
	{
		return _issueWindowState;
	};

	var colorNum = 0;
	var _getColor = function()
	{
		return _colors[colorNum++];
	};

	(function initColors(){
		_colors.push(Colors.red500);
		_colors.push(Colors.indigo500);
		_colors.push(Colors.teal500);
		_colors.push(Colors.yellow500);
		_colors.push(Colors.pink500);
		_colors.push(Colors.blue500);
		_colors.push(Colors.green500);
		_colors.push(Colors.amber500);
		_colors.push(Colors.purple500);
		_colors.push(Colors.loghtBlue500);
		_colors.push(Colors.lightGreen500);
		_colors.push(Colors.orange500);
		_colors.push(Colors.deeppurple500);
		_colors.push(Colors.cyan500);
		_colors.push(Colors.lime500);
		_colors.push(Colors.deepOrange);
	})();
})(this);
