(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const Modal = require('react-modal');
	const action = require('./issue_window_action.js');

	 exports.AddIssueWindow = React.createClass({
		getInitialState: function()
		{
			return {
				isOpen : false,
				projectId : 0,
				subject : "",
				mainButtonLabel : "",
				mainButtonCallback : function(){},
				object : {}
			};
		},
		Open : function(type, object)
		{
			var projectId = 0;
			var subject = "";
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
				mainButtonLabel = "Update";
				mainButtonCallback = this._updateIssue;
			}

			this.setState({
				isOpen : true,
				projectId : projectId,
				subject : subject,
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
					"priority_id" : 2,
					"tracker_id" : 1,
					"start_date" : "2015-12-28",
					"due_date" : "2015-12-29",
				}
			}, this.state.projectId);
			this._onClose();
		},
		_updateIssue : function()
		{
			action.updateIssue(this.state.object.id, {
				"issue" : {
					"subject" : this.state.subject,
					"priority_id" : 2,
					"tracker_id" : 1,
					"start_date" : "2015-12-28",
					"due_date" : "2015-12-30",
				}
			}, this.state.projectId);
			this._onClose();
		},
		render :function()
		{
			return (
				<Modal isOpen={this.state.isOpen} onRequestClose={this._onClose}>
					<div>{this.state.projectId}</div>
					<input type="text" placeholder="subject" value={this.state.subject} onChange={this._onSubjectChanged}></input>
					<div><button onClick={this.state.mainButtonCallback}>{this.state.mainButtonLabel}</button>
					<button onClick={this._onClose}>Cancel</button></div>
				</Modal>
		 	);
		}
	});
})(this);
