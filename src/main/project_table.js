(function(exports){
	'use strict';

	const React = require('react');

	const FlatButton = require('material-ui').FlatButton;

	const Table = require('material-ui').Table;
	const TableBody = require('material-ui').TableBody;
	const TableHeader = require('material-ui').TableHeader;
	const TableHeaderColumn = require('material-ui').TableHeaderColumn;
	const TableRow = require('material-ui').TableRow;
	const TableRowColumn = require('material-ui').TableRowColumn;

	exports.ProjectList = React.createClass({
		propTypes : {
			style : React.PropTypes.object,
			projects : React.PropTypes.array.isRequired,
			issues : React.PropTypes.func.isRequired,
			issueStatuses : React.PropTypes.instanceOf(Map).isRequired,
			trackers : React.PropTypes.instanceOf(Map).isRequired,
			updateIssueWindowState : React.PropTypes.func.isRequired,
			deleteIssue : React.PropTypes.func.isRequired,
			toggleProject : React.PropTypes.func
		},
		getDefaulProps : function()
		{
			return {
				style : {},
				projects : [],
				issues : () => {},
				issueStatuses : new Map(),
				trackers : new Map(),
				updateIssueWindowState : () => {},
				deleteIssue : () => {},
				toggleProject : () => {}
			};
		},
		getInitialState: function()
		{
			return {
				items : [],
				selectedRows : [],
				buttonType : 'None',
				buttonRelatedObject : {}
			};
		},
		_onDataChanged : function()
		{
			var data = [];
			var row = (this.state.selectedRows.length == 0) ? 0 : this.state.selectedRows[0] + 1;
			var _this = this;

			this.props.projects.some(function(project){
				data.push(
					<TableRow key={project.name} selected={row == 1} style={{heoght : 10}}>
						<TableRowColumn>{project.name}</TableRowColumn>
						<TableRowColumn>{project.expand ? '-' : '+'}</TableRowColumn>
					</TableRow>
				);
				row--;

				if (!project.expand) return false;

				data = data.concat(_this.props.issues(project.id).map(function(issue){
					var ret = (
						<TableRow key={issue.id + '-' + issue.updated} selected={row == 1} >
							<TableRowColumn>{issue.subject}</TableRowColumn>
							<TableRowColumn>{_this.props.issueStatuses.get(issue.statusId).name}</TableRowColumn>
							<TableRowColumn>{_this.props.trackers.get(issue.trackerId).name}</TableRowColumn>
							<TableRowColumn>{issue.assignedUser}</TableRowColumn>
						</TableRow>
					);
					row--;

					return ret;
				}));
			});

			this.setState({items : data});
		},
		_onCellClick : function(rowNumber, columnIndex)
		{
			var item = this._getRowItem(rowNumber);
			if (item.projectId == undefined && columnIndex == 2)
			{
				// item is a project
				this.props.toggleProject(item.id);
			}
		},
		_getRowItem : function(rowNumber)
		{
			rowNumber++;
			var _this = this,
				object = undefined;

			this.props.projects.some(function(project){
				if (rowNumber == 1)
				{
					object = project;
					return true;
				}
				rowNumber--;

				// no expand project's issues are not showed
				if (!project.expand) return false;

				if (rowNumber <= _this.props.issues(project.id).length)
				{
					object = _this.props.issues(project.id)[rowNumber - 1];
					return true;
				}
				rowNumber -= _this.props.issues(project.id).length;
			});

			return object;
		},
		_onRowSelection : function(selectedRows)
		{
			if (selectedRows.length == 0)
			{
				// for button click, set timer 100ms
				setTimeout(function(self){
					self.state.buttonType = 'None';
					self.state.buttonRelatedObject = {};
					self.state.selectedRows = [];
					self._onDataChanged();
				},100, this);
				return;
			}

			var row = selectedRows[0];
			var type = 'Add';
			var object = this._getRowItem(row);
			if (object.projectId != undefined) type = 'Update';

			this.state.buttonType = type;
			this.state.buttonRelatedObject = object;
			this.state.selectedRows = selectedRows;
			this._onDataChanged();
			return;
		},
		_onButtonClick : function()
		{
			this.props.updateIssueWindowState(true, this.state.buttonType, this.state.buttonRelatedObject);
		},
		_onDeleteButtonClick : function()
		{
			this.props.deleteIssue(this.state.buttonRelatedObject);
		},
		componentWillReceiveProps : function()
		{
			this._onDataChanged();
		},
		render : function()
		{
			return (
				<div style={this.props.style}>
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != 'Add'} label='Add' />
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != 'Update'} label='Update' />
				<FlatButton onClick={this._onDeleteButtonClick} disabled={this.state.buttonType != 'Update'} label='Delete' />
				<Table selectable={true} onRowSelection={this._onRowSelection} onCellClick={this._onCellClick}>
					<TableHeader >
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
