(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const Modal = require('react-modal');
	const action = require('./issue_window_action.js');
	const store = require('../main/main_store.js');

	exports.AddIssueWindow = React.createClass({
		getInitialState: function()
		{
			return {
				isOpen : false,
				projectId : 0,
				subject : "",
				trackerId : 1,
				startDate : new Date(Date.now()),
				dueDate : new Date(Date.now()),
				assignedUser : 0,
				mainButtonLabel : "",
				mainButtonCallback : function(){},
				object : {}
			};
		},
		Open : function(type, object)
		{
			var projectId = 0;
			var subject = "";
			var trackerId = 1;
			var startDate = new Date(Date.now());
			var dueDate = new Date(Date.now());
			var assignedUser = 0;
			var mainButtonLabel = "";
			var mainButtonCallback = function(){};

			if(type == "Add")
			{
				projectId = object.id;
				mainButtonLabel = "Create";
				mainButtonCallback = this._addNewIssue;
			}
			else if(type == "Update")
			{
				projectId = object.project.id;
				subject = object.subject;
				trackerId = object.tracker.id;
				startDate = new Date(Date.parse(object.start_date));
				dueDate = new Date(Date.parse(object.due_date));
				assignedUser = (object.assigned_to == undefined) ? 0 : object.assigned_to.id;
				mainButtonLabel = "Update";
				mainButtonCallback = this._updateIssue;
			}

			this.setState({
				isOpen : true,
				projectId : projectId,
				subject : subject,
				tarckerId : trackerId,
				startDate : startDate,
				dueDate : dueDate,
				assignedUser : assignedUser,
				mainButtonLabel : mainButtonLabel,
				mainButtonCallback : mainButtonCallback,
				object : object
			});
		},
		_onClose: function()
		{
			this.setState({isOpen : false});
		},
		_onSubjectChanged: function(e)
		{
			this.setState({subject : e.target.value});
		},
		_addNewIssue : function()
		{
			action.postNewIssue({
				"issue" : {
					"project_id" : this.state.projectId,
					"subject" : this.state.subject,
					"tracker_id" : this.state.trackerId,
					"start_date" : this.state.startDate.getFullYear() + "-" + (this.state.startDate.getMonth() + 1) + "-" + this.state.startDate.getDate(),
					"due_date" : this.state.dueDate.getFullYear() + "-" + (this.state.dueDate.getMonth() + 1) + "-" + this.state.dueDate.getDate(),
					"assigned_to_id" : this.state.assignedUser
				}
			}, this.state.projectId);
			this._onClose();
		},
		_updateIssue : function()
		{
			action.updateIssue(this.state.object.id, {
				"issue" : {
					"project_id" : this.state.projectId,
					"subject" : this.state.subject,
					"tracker_id" : this.state.trackerId,
					"start_date" : this.state.startDate.getFullYear() + "-" + (this.state.startDate.getMonth() + 1) + "-" + this.state.startDate.getDate(),
					"due_date" : this.state.dueDate.getFullYear() + "-" + (this.state.dueDate.getMonth() + 1) + "-" + this.state.dueDate.getDate(),
					"assigned_to_id" : this.state.assignedUser
				}
			}, this.state.projectId);
			this._onClose();
		},
		_trackerChanged : function(e)
		{
			this.setState({trackerId : e.target.value});
		},
		_assignedUserChanged : function(e)
		{
			this.setState({assignedUser : e.target.value});
		},
		_dateChanged : function(e)
		{
			var date = {};
			if(e.target.id.indexOf("start") != -1)
				date = this.state.startDate;
			else if(e.target.id.indexOf("due") != -1)
				date = this.state.dueDate;
			else
				return;

			if(e.target.id.indexOf("year") != -1)
				date.setFullYear(e.target.value);
			else if(e.target.id.indexOf("month") != -1)
				date.setMonth(e.target.value - 1);
			else if(e.target.id.indexOf("date") != -1)
				date.setDate(e.target.value);
			else
				return;

			// due date cannot be smaller than start date.
			if(this.state.dueDate < this.state.startDate)
			{
				if(e.target.id.indexOf("start") != -1)
					this.state.dueDate.setTime(this.state.startDate.getTime());
				else if(e.target.id.indexOf("due") != -1)
					this.state.startDate.setTime(this.state.dueDate.getTime());
			}

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
			store.Users(this.state.projectId).some(function(user, index){
				userList.push( <option key={user.id} value={user.id}>{user.name}</option> );
			});

			return (
				<Modal isOpen={this.state.isOpen} onRequestClose={this._onClose}>
					<div>{this.state.projectId}</div>
					<div><input type="text" placeholder="subject" value={this.state.subject} onChange={this._onSubjectChanged}></input></div>
					<div><label>tracker:<select value={this.state.trackerId} onChange={this._trackerChanged}>{trackerList}</select></label></div>
					<div><label>start date:
						<input type="number" id="start-year" min="2000" max="2100" value={this.state.startDate.getFullYear()} onChange={this._dateChanged}></input>-
						<input type="number" id="start-month" min="1" max="12" value={this.state.startDate.getMonth() + 1} onChange={this._dateChanged}></input>-
						<input type="number" id="start-date" min="1" max={getLastDay(this.state.startDate)} value={this.state.startDate.getDate()} onChange={this._dateChanged}></input>
					</label></div>
					<div><label>due date:
						<input type="number" id="due-year" min="2000" max="2100" value={this.state.dueDate.getFullYear()} onChange={this._dateChanged}></input>-
						<input type="number" id="due-month" min="1" max="12" value={this.state.dueDate.getMonth() + 1} onChange={this._dateChanged}></input>-
						<input type="number" id="due-date" min="1" max={getLastDay(this.state.dueDate)} value={this.state.dueDate.getDate()} onChange={this._dateChanged}></input>
					</label></div>
					<div><label>assigned to:<select value={this.state.assignedUser} onChange={this._assignedUserChanged}>{userList}</select></label></div>
					<div><button onClick={this.state.mainButtonCallback}>{this.state.mainButtonLabel}</button>
					<button onClick={this._onClose}>Cancel</button></div>
				</Modal>
		 	);
		}
	});

	var getLastDay = function(date)
	{
		if (date == undefined) return 0;

		switch(date.getMonth() + 1)
		{
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				return 31;

			case 4:
			case 6:
			case 9:
			case 11:
				return 30;

			case 2:
			{
				var year = date.getFullYear();
				if(year % 4 == 0 && (year % 100 != 0 || year % 400 == 0 ))
					return 29;
				else
					return 28;
			}

			default:
				return 0;
		}
	};

})(this);
