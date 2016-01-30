'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const store = require('./main_store.js');
const action = require('./main_action.js');

const SearchField = require('./search_field.js').SearchField;
const AddIssueWindow = require('../IssueWindow/issue_window_view.js').AddIssueWindow;
const GanttChart = require('../Chart/gantt_chart.js').GanttChart;
const ProjectList = require('./project_table.js').ProjectList;
const UpdateDialog = require('./update_dialog.js');
const ItemsSelectField = require('./items_select_field.js');

const SelectField = require('material-ui').SelectField;
const MenuItem = require('material-ui').MenuItem;

var Main = React.createClass({
	getInitialState : function()
	{
		return{
			chartType : 'Week',
			chartDateWidth : 10,
			items : [],
			selectedTracker : -1,
			selectedStatus : -1,
			isIssuwWindowOpen : false,
			isUpdateDialogOpen : false,
			modalType : 'Add',
			modalObject : {}
		};
	},
	componentDidMount : function()
	{
		store.addListener('load-status', this._onLoadStatusChanged);
		store.addListener('projects', this._onProjectsChanged);
		store.addListener('users', this._onDataChanged);
		store.addListener('issues', this._onDataChanged);
		store.addListener('issue-window-state', this._onIssueWindowStateChanged);
		action.loadIssueStatuses();
		action.loadTrackers();
	},
	componentWillUnmount : function()
	{
		store.removeListener('load-status', this._onLoadStatusChanged);
		store.removeListener('projects', this._onProjectsChanged);
		store.removeListener('users', this._onDataChanged);
		store.removeListener('issues', this._onDataChanged);
		store.removeListener('issue-window-state', this._onIssueWindowStateChanged);
	},
	render : function()
	{
		return(
			<div style={{'padding' : 10}}>
				<SearchField search={action.loadProjects}/>
				<div><SelectField value={this.state.chartType} onChange={this._onchartTypeChanged} >
					<MenuItem value='Date' primaryText='Date' />
					<MenuItem value='Week' primaryText='Week' />
				</SelectField></div>
				<div><ItemsSelectField items={store.Trackers()} selectedValue={this.state.selectedTracker} onValueChanged={this._trackerChanged}/>
				<ItemsSelectField items={store.IssueStatuses()} selectedValue={this.state.selectedStatus} onValueChanged={this._issueStatusChanged}/></div>
				<ProjectList style={{float: 'left', 'width': 500, 'paddingTop' : 8}} projects={store.Projects()} issues={store.Issues} issueStatuses={store.IssueStatuses()} trackers={store.Trackers()} updateIssueWindowState={action.updateIssueWindowState} deleteIssue={action.deleteIssue} toggleProject={this._toggleProject}/>
				<GanttChart height={51} width={this.state.chartDateWidth} type={this.state.chartType} projects={store.Projects()} issues={store.Issues} users={store.Users} style={{overflow: 'scroll'}}/>
				<AddIssueWindow isOpen={this.state.isIssuwWindowOpen} type={this.state.modalType} relatedObj={this.state.modalObject} onClosed={this._issueWindowClosed}/>
				<UpdateDialog isOpen={this.state.isUpdateDialogOpen}/>
			</div>
		);
	},
	_onchartTypeChanged : function(event, index, value)
	{
		var width = 51;
		if (value == 'Week')
		{
			width = 10;
		}

		this.setState({chartType : value, chartDateWidth : width});
	},
	_onProjectsChanged : function()
	{
		store.Projects().some(function(project){
			action.loadUsers(project.id);
			action.loadIssues(project.id);
		});
		this._onDataChanged();
	},
	_onDataChanged : function()
	{
		this.forceUpdate();
	},
	_trackerChanged : function(event, index, value)
	{
		this.setState({ selectedTracker : value });
		action.updateSelectedTracker(value);
	},
	_issueStatusChanged : function(event, index, value)
	{
		this.setState({ selectedStatus : value });
		action.updateSelectedStatus(value);
	},
	_onLoadStatusChanged : function()
	{
		this.setState({isUpdateDialogOpen : store.LoadStatus()});
	},
	_onIssueWindowStateChanged : function()
	{
		var state = store.issueWindowState();
		this.setState({ isIssuwWindowOpen : state.isOpen, modalType : state.modalType, modalObject : state.modalObject });
	},
	_issueWindowClosed : function()
	{
		this.setState({ isIssuwWindowOpen : false });
	},
	_toggleProject : function(projectId)
	{
		store.Projects().some(function(project){
			if (project.id == projectId)
			{
				project.expand = !project.expand;
				return true;
			}
		});
		this._onDataChanged();
	}
});

reactDOM.render(<Main />, document.getElementById('content'));
