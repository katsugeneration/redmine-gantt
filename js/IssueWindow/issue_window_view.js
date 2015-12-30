(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const Modal = require('react-modal');
	const action = require('./issue_window_action.js');
	const store = require('../main/main_store.js');
	const Issue = require('../Data/issue.js').Issue;

	exports.AddIssueWindow = React.createClass({
		propTypes : {
			isOpen : React.PropTypes.bool,
			type : React.PropTypes.oneOf(['Add', 'Update']).isRequired,
			relatedObj : React.PropTypes.any.isRequired,
			onClosed : React.PropTypes.func
		},
		getDefaulProps : function()
		{
			return {
				isOpen : false,
				type : 'Add',
				relatedObj : {},
				onClosed : function(){}
			};
		},
		getInitialState: function()
		{
			return {
				isOpen : false,
				issue : new Issue(),
				mainButtonLabel : "",
				mainButtonCallback : function(){}
			};
		},
		componentWillReceiveProps : function(nextProps)
		{
			var object = nextProps.relatedObj;
			var type = nextProps.type;
			var issue = new Issue();
			var mainButtonLabel = "";
			var mainButtonCallback = function(){};

			if(type == "Add")
			{
				issue.projectId = object.id;
				issue.startDate = new Date(Date.now()).toRedmineFormatString();
				issue.dueDate = new Date(Date.now()).toRedmineFormatString();
				mainButtonLabel = "Create";
				mainButtonCallback = this._addNewIssue;
			}
			else if(type == "Update")
			{
				issue = object;
				mainButtonLabel = "Update";
				mainButtonCallback = this._updateIssue;
			}

			this.setState({
				isOpen : nextProps.isOpen,
				issue : issue,
				mainButtonLabel : mainButtonLabel,
				mainButtonCallback : mainButtonCallback
			});
		},
		_addNewIssue : function()
		{
			action.postNewIssue(this.state.issue.toJSON(), this.state.issue.projectId);
			this._onClose();
		},
		_updateIssue : function()
		{
			action.updateIssue(this.props.relatedObj.id, this.state.issue.toJSON(), this.state.issue.projectId);
			this._onClose();
		},
		_onClose : function()
		{
			this.setState({isOpen : false});
			this.props.onClosed();
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
		_assignedIdChanged : function(e)
		{
			this.state.issue.assignedId = e.target.value;
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
					<div><label>assigned to:<select value={this.state.issue.assignedId} onChange={this._assignedIdChanged}>{userList}</select></label></div>
					<div><button onClick={this.state.mainButtonCallback}>{this.state.mainButtonLabel}</button>
					<button onClick={this._onClose}>Cancel</button></div>
				</Modal>
		 	);
		}
	});

	Date.prototype.toRedmineFormatString = function()
	{
		return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
	};
})(this);
