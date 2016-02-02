(function(exports){
	'use strict';


	const dispatcher = require('./main_dispatcher.js');
	const EventEmitter = require('events').EventEmitter;
	const Issue = require('../Data/issue.js').Issue;
	const Colors = require('material-ui').Styles.Colors;

	exports.__proto__ = EventEmitter.prototype;

	var _projects = [];
	var _issues = new Map();
	var _users = new Map();
	var _statuses = new Map();
	var _trackers = new Map();
	var _colors = [];

	function setProjectVirtual(data, target, callback)
	{
		JSON.parse(data).projects.some(function(project){
			if (project.name.indexOf(target) == -1 &&
			undefined == _projects.find(function(item){
				if (project.parent == undefined) return false;
				if (item.id == project.parent.id) return item;
				return false;
			})) return false;

			if(callback !== undefined && typeof callback == 'function')
				callback(project);

			project.expand = true;
			project.parent_id = (project.parent == undefined) ? 0 : project.parent.id;
			_projects.push(project);
		});

		exports.emit('projects');
	}

	exports.setProjects = function(data, target)
	{
		_projects = [];
		setProjectVirtual(data, target);
	};

	exports.updateProjects = function(data, target)
	{
		setProjectVirtual(data, target, function(project){
			// update project when data contains same project
			_projects.some(function(item, index, array){
				if(item.id == project.id)
				{
					array.splice(index, 1);
					return true;
				}
			});
		});
	};

	exports.getProject = function(projectId)
	{
		var ret = undefined;
		_projects.some(function(item){
			if(item.id == projectId)
			{
				ret = item;
				return true;
			}
		});

		return ret;
	};

	exports.setUsers = function(data, projectId)
	{
		var usersInProject = [];
		var memberships = JSON.parse(data).memberships;
		memberships.some(function(membership){
			if(membership.user != undefined)
			{
				var user = exports.User(membership.user.id);
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

	function getProjectIssuesFromJSON(data, projectId)
	{
		return JSON.parse(data).issues.filter(function(item){
			if(item.project.id == projectId) return true;
		}).map(function(item){
			return Issue.toIssueFromJSON(item);
		});
	}

	exports.setIssues = function(data, projectId)
	{
		var issues = getProjectIssuesFromJSON(data, projectId);

		_issues.set(projectId, issues);
		this.emit('issues');
	};

	exports.updateIssues = function(data, projectId)
	{
		getProjectIssuesFromJSON(data, projectId).some(function(updated){
			_issues.get(projectId).some(function(old){
				if(updated.id == old.id)
				{
					Issue.copyTo(old, updated);
					return true;
				}
			});
		});

		this.emit('issues');
	};

	exports.deleteIssue = function(id)
	{
		var item = undefined;
		for(var issues of _issues.values())
		{
			issues.some(function(issue, index, array){
				if (issue.id == id)
				{
					array.splice(index, 1);
					item = issue;
					return true;
				}
			});
			if (item != undefined) break;
		}

		this.emit('issues');
	};

	exports.updateIssue = function(id, issue, projectId)
	{
		_issues.get(projectId).some(function(old){
			if(id == old.id)
			{
				Issue.copyTo(old, issue);
				return true;
			}
		});

		this.emit('issues');
	};

	exports.addNewIssue = function(data, projectId)
	{
		var issue = Issue.toIssueFromJSON(JSON.parse(data).issue);
		_issues.get(projectId).unshift(issue);

		this.emit('issues');
	};

	exports.setIssueStatuses = function(data)
	{
		var statuses = JSON.parse(data).issue_statuses;

		statuses.some(function(status){
			_statuses.set(status.id, status);
		});

		this.emit('issue-statuses');
	};

	exports.setTrackers = function(data)
	{
		var trackers = JSON.parse(data).trackers;

		trackers.some(function(tracker){
			_trackers.set(tracker.id, tracker);
		});

		this.emit('trackers');
	};

	exports.Projects = function()
	{
		return _projects;
	};

	exports.getProjectUsers = function(projectId)
	{
		return (_users.get(projectId) == undefined) ? [] : _users.get(projectId);
	};

	exports.User = function(userId)
	{
		var ret = undefined;

		_users.forEach(function(users){
			users.some(function(user){
				if (user.id == userId)
				{
					ret = user;
					return true;
				}
			});
			if (ret !== undefined) return ret;
		});

		return ret;
	};

	exports.getProjectIssues = function(projectId)
	{
		return (_issues.get(projectId) == undefined) ? [] : _issues.get(projectId);
	};

	exports.Issue = function(issueId)
	{
		var ret = undefined;

		_issues.forEach(function(issues){
			issues.some(function(issue){
				if (issue.id == issueId)
				{
					ret = issue;
					return true;
				}
			});
			if (ret !== undefined) return ret;
		});

		return ret;
	};

	exports.IssueStatuses = function()
	{
		return _statuses;
	};

	exports.Trackers = function()
	{
		return _trackers;
	};

	dispatcher.register(function(action){
		switch(action.actionType)
		{
		case 'projects-get':
			exports.setProjects(action.data, action.target);
			break;

		case 'projects-update':
			exports.updateProjects(action.data, action.target);
			break;

		case 'issues-get':
			exports.setIssues(action.data, action.id);
			break;

		case 'issues-update':
			exports.updateIssues(action.data, action.id);
			break;

		case 'issue-delete':
			exports.deleteIssue(action.id);
			break;

		case 'issue-update':
			exports.updateIssue(action.id, action.issue, action.projectId);
			break;

		case 'add-new-issue':
			exports.addNewIssue(action.data, action.projectId);
			break;

		case 'users-get':
			exports.setUsers(action.data, action.id);
			break;

		case 'issue-statuses-get':
			exports.setIssueStatuses(action.data);
			break;

		case 'trackers-get':
			exports.setTrackers(action.data);
			break;
		}
	});

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
