
'use strict';

const dispatcher = require('./main_dispatcher.js');


exports.updateIssueWindowState = function(isOpen, modalType, modalObject)
{
	dispatcher.dispatch({
		actionType : 'issue-window-state-update',
		isOpen : isOpen,
		modalType : modalType,
		modalObject : modalObject
	});
};

exports.updateSelectedTracker = function(newValue)
{
	dispatcher.dispatch({
		actionType : 'selected-tracker-update',
		tracker : newValue
	});
};

exports.updateSelectedStatus = function(newValue)
{
	dispatcher.dispatch({
		actionType : 'selected-status-update',
		status : newValue
	});
};

exports.toggelProject = function(projectId)
{
	dispatcher.dispatch({
		actionType : 'change-project-toggle',
		id : projectId
	});
};

exports.updateIssueDate = function(issueKey, value, type)
{
	dispatcher.dispatch({
		actionType : 'update-issue-date',
		key : issueKey,
		value : value,
		type : type
	});
};
