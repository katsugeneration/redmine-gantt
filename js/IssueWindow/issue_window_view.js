(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const Modal = require('react-modal');
	const action = require('./issue_window_action.js');
	const store = require('../main/main_store.js');
	const Issue = require('../Data/issue.js').Issue;

	exports.AddIssueWindow = React.createClass({
		getInitialState: function()
		{
			return {
				isOpen : false,
				issue : new Issue(),
				mainButtonLabel : "",
				mainButtonCallback : function(){},
				object : {}
			};
		},
		Open : function(type, object)
		{
			var issue = new Issue();
			var mainButtonLabel = "";
			var mainButtonCallback = function(){};

			if(type == "Add")
			{
				issue.projectId = object.id;
				issue.startDate = new Date(Date.now()).toDateString();
				issue.dueDate = new Date(Date.now()).toDateString();
				mainButtonLabel = "Create";
				mainButtonCallback = this._addNewIssue;
			}
			else if(type == "Update")
			{
				issue.projectId = object.project.id;
				issue.subject = object.subject;
				issue.trackerId = object.tracker.id;
				issue.startDate = object.start_date;
				issue.dueDate = object.due_date;
				issue.assignedUser = (object.assigned_to == undefined) ? 0 : object.assigned_to.id;
				mainButtonLabel = "Update";
				mainButtonCallback = this._updateIssue;
			}

			this.setState({
				isOpen : true,
				issue : issue,
				mainButtonLabel : mainButtonLabel,
				mainButtonCallback : mainButtonCallback,
				object : object
			});
		},
		_addNewIssue : function()
		{
			action.postNewIssue(this.state.issue.toJSON(), this.state.issue.projectId);
			this._onClose();
		},
		_updateIssue : function()
		{
			action.updateIssue(this.state.object.id, this.state.issue.toJSON(), this.state.issue.projectId);
			this._onClose();
		},
		_onClose : function()
		{
			this.setState({isOpen : false});
		},
		_startDateChanged : function(e)
		{
			this.state.issue.startDate = e.target.value;
			this.forceUpdate();
		},
		_startDateBlur : function(e)
		{
			if(!e.target.validity.valid)
				this.state.issue.startDate = e.target.max;
			this.forceUpdate();
		},
		_dueDateChanged : function(e)
		{
			this.state.issue.dueDate = e.target.value;
			this.forceUpdate();
		},
		_dueDateBlur : function(e)
		{
			if(!e.target.validity.valid)
				this.state.issue.dueDate = e.target.min;
			this.forceUpdate();
		},
		_onSubjectChanged: function(e)
		{
			this.state.issue.subject = e.target.value;
			this.forceUpdate();
		},
		_trackerChanged : function(e)
		{
			this.state.issue.tarckerid = e.target.value;
			this.forceUpdate();
		},
		_assignedUserChanged : function(e)
		{
			this.state.issue.assignedUser = e.target.value;
			this.forceUpdate();
		},
		render :function()
		{
			var trackerList = [];
			store.Trackers().forEach(function(value, key){
				trackerList.push( <option key={key} value={key}>{value.name}</option> );
			});

			var userList = [];
			userList.push( <option key="0" value="0"></option> );
			store.Users(this.state.issue.projectId).some(function(user, index){
				userList.push( <option key={user.id} value={user.id}>{user.name}</option> );
			});

			return (
				<Modal isOpen={this.state.isOpen} onRequestClose={this._onClose}>
					<div>{this.state.issue.projectId}</div>
					<div><input type="text" placeholder="subject" value={this.state.issue.subject} onChange={this._onSubjectChanged}></input></div>
					<div><label>tracker:<select value={this.state.issue.trackerId} onChange={this._trackerChanged}>{trackerList}</select></label></div>
					<div><label>start date:<input type="date" max={this.state.issue.dueDate} value={this.state.issue.startDate} required={true} onChange={this._startDateChanged} onBlur={this._startDateBlur}></input></label></div>
					<div><label>due date:<input type="date" min={this.state.issue.startDate} value={this.state.issue.dueDate} required={true} onChange={this._dueDateChanged} onBlur={this._dueDateBlur}></input></label></div>
					<div><label>assigned to:<select value={this.state.issue.assignedUser} onChange={this._assignedUserChanged}>{userList}</select></label></div>
					<div><button onClick={this.state.mainButtonCallback}>{this.state.mainButtonLabel}</button>
					<button onClick={this._onClose}>Cancel</button></div>
				</Modal>
		 	);
		}
	});

	Date.prototype.toDateString = function()
	{
		return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
	};
})(this);
