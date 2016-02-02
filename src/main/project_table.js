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
			rowHeight : React.PropTypes.number,
			data : React.PropTypes.array.isRequired,
			updateIssueWindowState : React.PropTypes.func.isRequired,
			deleteIssue : React.PropTypes.func.isRequired,
			toggleProject : React.PropTypes.func
		},
		getDefaulProps : function()
		{
			return {
				style : {},
				rowHeight : 12,
				data : [],
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
			var items = [];
			var row = (this.state.selectedRows.length == 0) ? 0 : this.state.selectedRows[0] + 1;
			var _this = this;

			this.props.data.some(function(viewData){
				if (viewData.projectName != undefined)
				{
					items.push(
						<TableRow key={viewData.key} selected={row == 1} style={{height : _this.props.rowHeight}}>
							<TableRowColumn style={{height : _this.props.rowHeight}}>{viewData.projectExpand ? '-' : '+'}{viewData.projectName}</TableRowColumn>
							<TableRowColumn style={{height : _this.props.rowHeight}}/>
							<TableRowColumn style={{height : _this.props.rowHeight}}/>
							<TableRowColumn style={{height : _this.props.rowHeight}}/>
							<TableRowColumn style={{height : _this.props.rowHeight}}/>
						</TableRow>
					);
				}
				else
				{
					items.push(
						<TableRow key={viewData.key} selected={row == 1} style={{height : _this.props.rowHeight}}>
							<TableRowColumn style={{height : _this.props.rowHeight}}/>
							<TableRowColumn style={{height : _this.props.rowHeight}}>{viewData.subject}</TableRowColumn>
							<TableRowColumn style={{height : _this.props.rowHeight}}>{viewData.status}</TableRowColumn>
							<TableRowColumn style={{height : _this.props.rowHeight}}>{viewData.tracker}</TableRowColumn>
							<TableRowColumn style={{height : _this.props.rowHeight}}>{viewData.assignedUser}</TableRowColumn>
						</TableRow>
					);
				}
				row--;
			});

			this.setState({items : items});
		},
		_onCellClick : function(rowNumber, columnIndex)
		{
			var item = this.props.data[rowNumber];
			if (item.projectName != undefined && columnIndex == 1)
			{
				// item is a project
				this.props.toggleProject(item.id);
			}
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
			var object = this.props.data[row];
			if (object.projectName == undefined)
				type = 'Update';
			object = object.obj;

			// wait event end
			setTimeout(function(self){
				self.state.buttonType = type;
				self.state.buttonRelatedObject = object;
				self.state.selectedRows = selectedRows;
				self._onDataChanged();
			},100, this);
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
			// wait event end
			setTimeout(function(self){
				self._onDataChanged();
			},100, this);
		},
		componentDidUpdate : function()
		{
			this.props.children;
		},
		render : function()
		{
			return (
				<div style={this.props.style}>
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != 'Add'} label='Add' />
				<FlatButton onClick={this._onButtonClick} disabled={this.state.buttonType != 'Update'} label='Update' />
				<FlatButton onClick={this._onDeleteButtonClick} disabled={this.state.buttonType != 'Update'} label='Delete' />
				<Table onRowSelection={this._onRowSelection} onCellClick={this._onCellClick}>
					<TableHeader displaySelectAll={false} adjustForCheckbox={false}>
						<TableRow>
						<TableHeaderColumn tooltip='project'>Project</TableHeaderColumn>
						<TableHeaderColumn tooltip='subject'>Subject</TableHeaderColumn>
						<TableHeaderColumn tooltip='status'>Status</TableHeaderColumn>
						<TableHeaderColumn tooltip='task category'>Tracker</TableHeaderColumn>
						<TableHeaderColumn tooltip='assigned to user'>User</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody deselectOnlyClickaway={true} displayRowCheckbox={false}>
						{this.state.items}
					</TableBody>
				</Table>
				</div>
			);
		}
	});
})(this);
