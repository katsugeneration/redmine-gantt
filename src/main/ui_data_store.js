
'use strict';

const dispatcher = require('./main_dispatcher.js');
const EventEmitter = require('events').EventEmitter;

const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;
const ProjectViewData = require('../Data/view_data.js').ProjectViewData;
const IssueViewData = require('../Data/view_data.js').IssueViewData;

exports.__proto__ = EventEmitter.prototype;

var _loadStatus;
var _selectedTracker = -1;
var _selectedStatus = -1;
var _viewData = [];
var _issueWindowState = {
	isOpen : false,
	modalType : 'Add',
	modalObject : {}
};

var _store = {};
exports._onDataChanged = function()
{
	exports._updateViewData();
};

exports.setBaseStore = function(store)
{
	if (_store.removeListener != undefined)
	{
		_store.removeListener('projects', this._onDataChanged);
		_store.removeListener('users', this._onDataChanged);
		_store.removeListener('issues', this._onDataChanged);
	}

	_store = store;
	_store.addListener('projects', this._onDataChanged);
	_store.addListener('users', this._onDataChanged);
	_store.addListener('issues', this._onDataChanged);
};

exports.changeProjectToggle = function(projectId)
{
	var project = _store.getProject(projectId);
	project.expand = !project.expand;
	exports._updateViewData();
};

exports.updateIssueDate = function(key, value, type)
{
	var item = undefined;
	_viewData.some(function(data){
		if (data.key == key)
		{
			item = data;
			return true;
		}
	});
	if (item == undefined) return;


	var satrtDate = new ExtendsDate(item.startDate);
	var dueDate = new ExtendsDate(item.dueDate);
	if (type == 'start')
	{
		satrtDate.addDate(value);
		if (dueDate >=  satrtDate)
			item.startDate = satrtDate;
	}
	if (type == 'due')
	{
		dueDate.addDate(value);
		if (dueDate >=  satrtDate)
			item.dueDate = dueDate;
	}

	this.emit('view-data');
};

exports.updateSelectedTracker = function(tracker)
{
	_selectedTracker = tracker;
	exports._updateViewData();
};

exports.updateSelectedStatus = function(status)
{
	_selectedStatus = status;
	exports._updateViewData();
};

exports.setLoadStatus = function(nextStatus)
{
	_loadStatus = nextStatus;
	this.emit('load-status');
};

exports.setIssueWindowState = function(isOpen, modalType, modalObject)
{
	_issueWindowState.isOpen = isOpen;
	_issueWindowState.modalType = modalType;
	_issueWindowState.modalObject = modalObject;
	this.emit('issue-window-state');
};

exports._updateViewData = function()
{
	_viewData = [];

	_store.Projects().some(function(project){
		_viewData.push(
			new ProjectViewData({
				projectName : project.name,
				projectExpand : project.expand,
				startDate : new ExtendsDate(undefined),
				dueDate : new ExtendsDate(undefined),
				key : project.name,
				id : project.id,
				obj : project
			})
		);

		if (!project.expand) return false;

		var tracker = _store.Trackers().get(_selectedTracker);
		var issueStatus = _store.IssueStatuses().get(_selectedStatus);

		_viewData = _viewData.concat(_store.getProjectIssues(project.id).filter(function(item){
			if ((tracker == undefined || item.trackerId == _selectedTracker) &&
				(issueStatus == undefined || item.statusId == _selectedStatus)) return true;
			return false;
		}).map(function(issue){
			return new IssueViewData({
				subject : issue.subject,
				status : _store.IssueStatuses().get(issue.statusId).name,
				tracker : _store.Trackers().get(issue.trackerId).name,
				assignedUser : issue.assignedUser,
				startDate : new ExtendsDate(ExtendsDate.parse(issue.startDate)),
				dueDate : new ExtendsDate(ExtendsDate.parse(issue.dueDate)),
				color : (_store.User(issue.assignedId) != undefined) ? _store.User(issue.assignedId).color : '#9e9e9e',
				key : issue.id + '-' + issue.updated,
				id : issue.id,
				obj : issue
			});
		}));
	});

	this.emit('view-data');
};

exports.ViewData = function()
{
	return _viewData;
};

exports.LoadStatus = function()
{
	return _loadStatus;
};

exports.issueWindowState = function()
{
	return _issueWindowState;
};

dispatcher.register(function(action){
	switch(action.actionType)
	{
	case 'issue-window-state-update':
		exports.setIssueWindowState(action.isOpen, action.modalType, action.modalObject);
		break;

	case 'data-load-start':
		exports.setLoadStatus(true);
		break;

	case 'data-load-finish':
		exports.setLoadStatus(false);
		break;

	case 'selected-tracker-update':
		exports.updateSelectedTracker(action.tracker);
		break;

	case 'selected-status-update':
		exports.updateSelectedStatus(action.status);
		break;

	case 'change-project-toggle':
		exports.changeProjectToggle(action.id);
		break;

	case 'update-issue-date':
		exports.updateIssueDate(action.key, action.value, action.type);
		break;
	}
});
