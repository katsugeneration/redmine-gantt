(function(exports){
	'use strict';

	const React = require('react');
	const action = require('./main_action.js');
	const store = require('./main_store.js');

	const SelectField = require('material-ui').SelectField;
	const MenuItem = require('material-ui').MenuItem;
	const FlatButton = require('material-ui').FlatButton;

	const Table = require('material-ui').Table;
	const TableBody = require('material-ui').TableBody;
	const TableHeader = require('material-ui').TableHeader;
	const TableHeaderColumn = require('material-ui').TableHeaderColumn;
	const TableRow = require('material-ui').TableRow;
	const TableRowColumn = require('material-ui').TableRowColumn;

	exports.ProjectList =　React.createClass({
		propTypes : {
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				style : {}
			};
		},
		getInitialState: function()
		{
			return {
				items : [],
				selectedRows : [],
				buttonType : "None",
				buttonRelatedObject : {},
			};
		},
		componentWillUnmount : function()
		{
			store.removeListener('projects', this._onProjectsChanged);
			store.removeListener('issues', this._onDataChanged);
		},
		componentDidMount : function()
		{
			store.addListener('projects', this._onProjectsChanged);
			store.addListener('issues', this._onDataChanged);
			action.loadIssueStatuses();
			action.loadTrackers();
		},
		_onProjectsChanged : function()
		{
			store.Projects().some(function(project, index){
				action.loadUsers(project.id);
				action.loadIssues(project.id);
			});
			this._onDataChanged();
		},
		_onDataChanged : function()
		{
			var data = [];
			var row = (this.state.selectedRows.length == 0) ? 0 : this.state.selectedRows[0] + 1;

			store.Projects().some(function(project, index){
				data.push(
					<TableRow key={project.name} selected={row == 1}>
						<TableRowColumn>{project.name}</TableRowColumn>
						<TableRowColumn></TableRowColumn>
					</TableRow>
				);
				row--;

				data = data.concat(store.Issues(project.id).map(function(issue, index){
					var ret = (
						<TableRow key={issue.id + '-' + issue.updated} selected={row == 1} >
							<TableRowColumn>{issue.subject}</TableRowColumn>
							<TableRowColumn>{store.IssueStatuses().get(issue.statusId).name}</TableRowColumn>
							<TableRowColumn>{store.Trackers().get(issue.trackerId).name}</TableRowColumn>
							<TableRowColumn>{issue.assignedUser}</TableRowColumn>
						</TableRow>
					);
					row--;

					return ret;
				}));
			});

			this.setState({items : data});
		},
		_onRowSelection : function(selectedRows)
		{
			if (selectedRows.length == 0)
			{
				// for button click, set timer 100ms
				setTimeout(function(self){
					self.state.buttonType = "None";
					self.state.buttonRelatedObject = {};
					self.state.selectedRows = [];
					self._onDataChanged();
				},100, this);
				return;
			}

			var row = selectedRows[0] + 1;
			var type = "";
			var object = {};

			store.Projects().some(function(project, index){
				if (row == 1)
				{
					type = "Add";
					object = project;
					return true;
				}

				row--;
				if (row < store.Issues(project.id).length)
				{
					type = "Update";
					object = store.Issues(project.id)[row - 1];
					return true;
				}

				row -= store.Issues(project.id).length;
			});

			this.state.buttonType = type;
			this.state.buttonRelatedObject = object;
			this.state.selectedRows = selectedRows;
			this._onDataChanged();
			return;
		},
		_onButtonClick : function()
		{
			action.updateIssueWindowState(true, this.state.buttonType, this.state.buttonRelatedObject);
		},
		_onDeleteButtonClick : function()
		{
			action.deleteIssue(this.state.buttonRelatedObject);
		},
		render : function()
		{
			return (
				<div style={Object.assign(this.props.style, {"width": 500, "paddingTop" : 8})}>
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != "Add"} label="Add" />
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != "Update"} label="Update" />
				<FlatButton onClick={this._onDeleteButtonClick} disabled={this.state.buttonType != "Update"} label="Delete" />
				<Table selectable={true} onRowSelection={this._onRowSelection}>
					<TableHeader>
						<TableRow>
						<TableHeaderColumn tooltip='subject'>Subject</TableHeaderColumn>
						<TableHeaderColumn tooltip='status'>Status</TableHeaderColumn>
						<TableHeaderColumn tooltip='task category'>Tracker</TableHeaderColumn>
						<TableHeaderColumn tooltip='assigned to user'>User</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody deselectOnlyClickaway={true}>
						{this.state.items}
					</TableBody>
				</Table>
				</div>
			);
		}
	});
})(this);
