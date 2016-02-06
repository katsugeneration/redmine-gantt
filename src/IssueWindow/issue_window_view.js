(function(exports){
	'use strict';

	const React = require('react');
	const Modal = require('react-modal');
	const Issue = require('../Data/issue.js').Issue;
	const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

	const FlatButton = require('material-ui').FlatButton;
	const TextField = require('material-ui').TextField;
	const DatePicker = require('material-ui').DatePicker;
	const SelectField = require('material-ui').SelectField;
	const MenuItem = require('material-ui').MenuItem;

	exports.AddIssueWindow = React.createClass({
		propTypes : {
			store : React.PropTypes.obj,
			isOpen : React.PropTypes.bool,
			type : React.PropTypes.oneOf(['Add', 'Update']).isRequired,
			relatedObj : React.PropTypes.any.isRequired,
			onClosed : React.PropTypes.func.isRequired,
			addNewIssue : React.PropTypes.func.isRequired,
			updateIssue : React.PropTypes.func.isRequired

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
				mainButtonLabel : 'Add',
				mainButtonCallback : function(){}
			};
		},
		componentWillReceiveProps : function(nextProps)
		{
			var object = nextProps.relatedObj;
			var type = nextProps.type;
			var issue = new Issue();
			var mainButtonLabel = '';
			var mainButtonCallback = function(){};

			if(type == 'Add')
			{
				issue.projectId = object.id;
				issue.startDate = new ExtendsDate(ExtendsDate.now()).toRedmineFormatString();
				issue.dueDate = new ExtendsDate(ExtendsDate.now()).toRedmineFormatString();
				mainButtonLabel = 'Create';
				mainButtonCallback = this._addNewIssue;
			}
			else if(type == 'Update')
			{
				Issue.copyTo(issue, object);
				mainButtonLabel = 'Update';
				mainButtonCallback = this._updateIssue;
			}

			this.setState({
				isOpen : nextProps.isOpen,
				issue : issue,
				mainButtonLabel : mainButtonLabel,
				mainButtonCallback : mainButtonCallback
			});
		},
		_onClose : function()
		{
			this.props.onClosed();
		},
		_addNewIssue : function()
		{
			this.props.addNewIssue(this.state.issue, this.state.issue.projectId);
		},
		_updateIssue : function()
		{
			this.props.updateIssue(this.state.issue.id, this.state.issue, this.state.issue.projectId);
		},
		_startDateChanged : function(e, date)
		{
			this.state.issue.startDate = new ExtendsDate(date).toRedmineFormatString();
			this.forceUpdate();
		},
		_dueDateChanged : function(e, date)
		{
			this.state.issue.dueDate = new ExtendsDate(date).toRedmineFormatString();
			this.forceUpdate();
		},
		_onSubjectChanged: function(e)
		{
			this.state.issue.subject = e.target.value;
			this.forceUpdate();
		},
		_trackerChanged : function(e, index, value)
		{
			this.state.issue.trackerId = value;
			this.forceUpdate();
		},
		_statusChanged: function(e, index, value)
		{
			this.state.issue.statusId = value;
			this.forceUpdate();
		},
		_assignedIdChanged : function(e, index, value)
		{
			this.state.issue.assignedId = value;
			this.state.issue.assignedUser = this.props.store.User(value).name;
			this.forceUpdate();
		},
		_formatDate : function(date)
		{
			return new ExtendsDate(date).toRedmineFormatString();
		},
		render :function()
		{
			var trackerList = [];
			this.props.store.Trackers().forEach(function(value, key){
				trackerList.push( <MenuItem key={key} value={key} primaryText={value.name} /> );
			});

			var statusList = [];
			this.props.store.IssueStatuses().forEach(function(value, key){
				statusList.push( <MenuItem key={key} value={key} primaryText={value.name} /> );
			});

			var userList = [];
			userList.push( <MenuItem key={-1} value={-1} primaryText='No Assigned' /> );
			this.props.store.getProjectUsers(this.state.issue.projectId).some(function(user){
				userList.push( <MenuItem key={user.id} value={user.id} primaryText={user.name} /> );
			});

			var startDate = this.state.issue.startDate == undefined ? undefined : new Date(this.state.issue.startDate);
			var dueDate = this.state.issue.dueDate == undefined ? undefined : new Date(this.state.issue.dueDate);

			return (
				<Modal isOpen={this.state.isOpen} onRequestClose={this._onClose} style={{'content' : {'position' : 'absolute', 'width': '300', 'marginLeft' : 'auto', 'marginRight' : 'auto'}}}>
					<div><TextField placeholder='subject' value={this.state.issue.subject} onChange={this._onSubjectChanged} /></div>
					<div>tracker:<SelectField value={this.state.issue.trackerId} onChange={this._trackerChanged}>{trackerList}</SelectField></div>
					<div>status:   <SelectField value={this.state.issue.statusId} onChange={this._statusChanged}>{statusList}</SelectField></div>
					<div>start date:<DatePicker mode='landscape' formatDate={this._formatDate} maxDate={dueDate} value={startDate} onChange={this._startDateChanged} /></div>
					<div>due date:<DatePicker mode='landscape' formatDate={this._formatDate} minDate={startDate} value={dueDate} onChange={this._dueDateChanged} /></div>
					<div>assigned to:<SelectField value={this.state.issue.assignedId} onChange={this._assignedIdChanged}>{userList}</SelectField></div>
					<div><FlatButton onClick={this.state.mainButtonCallback} label={this.state.mainButtonLabel} secondary={true}/>
					<FlatButton onClick={this._onClose} label='Cancel' /></div>
				</Modal>
			);
		}
	});
})(this);
