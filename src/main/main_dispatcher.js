(function(exports){
	'use strict';

	const store = require('./main_store.js');

	exports.projectsGetted = function(data, target)
	{
		store.setProjects(data, target);
	};

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

	exports.issueWindowStateUpdated = function(isOpen, modalType, modalObject)
	{
		store.setIssueWindowState(isOpen, modalType, modalObject);
	}
})(this);