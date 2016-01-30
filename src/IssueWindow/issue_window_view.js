(function(exports){
	'use strict';

	const React = require('react');
	const Modal = require('react-modal');
	const action = require('../main/main_action.js');
	const store = require('../main/main_store.js');
	const Issue = require('../Data/issue.js').Issue;
	const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

	const FlatButton = require('material-ui').FlatButton;
	const TextField = require('material-ui').TextField;
	const DatePicker = require('material-ui').DatePicker;
	const SelectField = require('material-ui').SelectField;
	const MenuItem = require('material-ui').MenuItem;

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
				issue = object;
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
			this.forceUpdate();
		},
		_formatDate : function(date)
		{
			return new ExtendsDate(date).toRedmineFormatString();
		},
		render :function()
		{
			var trackerList = [];
			store.Trackers().forEach(function(value, key){
				trackerList.push( <MenuItem key={key} value={key} primaryText={value.name} /> );
			});

			var statusList = [];
			store.IssueStatuses().forEach(function(value, key){
				statusList.push( <MenuItem key={key} value={key} primaryText={value.name} /> );
			});

			var userList = [];
			userList.push( <MenuItem key={-1} value={-1} primaryText='No Assigned' /> );
			store.GetProjectUsers(this.state.issue.projectId).some(function(user){
				userList.push( <MenuItem key={user.id} value={user.id} primaryText={user.name} /> );
			});

			return (
				<Modal isOpen={this.state.isOpen} onRequestClose={this._onClose} style={{'content' : {'position' : 'absolute', 'width': '300', 'marginLeft' : 'auto', 'marginRight' : 'auto'}}}>
					<div><TextField placeholder='subject' value={this.state.issue.subject} onChange={this._onSubjectChanged} /></div>
					<div>tracker:<SelectField value={this.state.issue.trackerId} onChange={this._trackerChanged}>{trackerList}</SelectField></div>
					<div>status:   <SelectField value={this.state.issue.statusId} onChange={this._statusChanged}>{statusList}</SelectField></div>
					<div>start date:<DatePicker mode='landscape' formatDate={this._formatDate} maxDate={new Date(this.state.issue.dueDate)} value={new Date(this.state.issue.startDate)} onChange={this._startDateChanged} /></div>
					<div>due date:<DatePicker mode='landscape' formatDate={this._formatDate} minDate={new Date(this.state.issue.startDate)} value={new Date(this.state.issue.dueDate)} onChange={this._dueDateChanged} /></div>
					<div>assigned to:<SelectField value={this.state.issue.assignedId} onChange={this._assignedIdChanged}>{userList}</SelectField></div>
					<div><FlatButton onClick={this.state.mainButtonCallback} label={this.state.mainButtonLabel} secondary={true}/>
					<FlatButton onClick={this._onClose} label='Cancel' /></div>
				</Modal>
			);
		}
	});
})(this);
