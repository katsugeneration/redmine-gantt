(function(exports){
	'use strict';

	const store = require('./main_store.js');

	exports.dataLoadStarted = function()
	{
		store.setLoadStatus(true);
	}

	exports.dataLoadFinished = function()
	{
		store.setLoadStatus(false);
	}

	exports.projectsGetted = function(data, target)
	{
		store.setProjects(data, target);
	};

	exports.projectsUpdated = function(data, target)
	{
		store.updateProjects(data, target);
	}

	exports.usersGetted = function(data, project_id)
	{
		store.setUsers(data, project_id);
	};

	exports.issuesGetted = function(data, project_id)
	{
		store.setIssues(data, project_id);
	};

	exports.issuesUpdated = function(data, project_id)
	{
		store.updateIssues(data, project_id);
	};

	exports.trackersGetted = function(data)
	{
		store.setTrackers(data);
	};

	exports.issueStatusesGetted = function(data)
	{
		store.setIssueStatuses(data);
	}

	exports.issueWindowStateUpdated = function(isOpen, modalType, modalObject)
	{
		store.setIssueWindowState(isOpen, modalType, modalObject);
	}
})(this);
