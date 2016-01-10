'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const store = require('./main_store.js');

const SearchField = require('./search_field.js').SearchField;
const AddIssueWindow = require('../IssueWindow/issue_window_view.js').AddIssueWindow;
const GanttChart = require('../Chart/gantt_chart.js').GanttChart;
const ProjectList = require('./project_table.js').ProjectList;
const UpdateDialog = require('./update_dialog.js');

const GanttData = require('../Chart/gantt_chart.js').GanttData;
const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

const SelectField = require('material-ui').SelectField;
const MenuItem = require('material-ui').MenuItem;

var Main = React.createClass({
	getInitialState : function()
	{
		return{
			startDate : new ExtendsDate(),
			dueDate : new ExtendsDate(undefined),
			chartType : 'Week',
			chartDateWidth : 10,
			items : [],
			isIssuwWindowOpen : false,
			isUpdateDialogOpen : false,
			modalType : 'Add',
			modalObject : {}
		};
	},
	componentDidMount : function()
	{
		store.addListener('load-status', this._onLoadStatusChanged);
		store.addListener('projects', this._onDataChanged);
		store.addListener('users', this._onDataChanged);
		store.addListener('issues', this._onDataChanged);
		store.addListener('issue-window-state', this._onIssueWindowStateChanged);
	},
	componentWillUnmount : function()
	{
		store.removeListener('load-status', this._onLoadStatusChanged);
		store.removeListener('projects', this._onDataChanged);
		store.removeListener('users', this._onDataChanged);
		store.removeListener('issues', this._onDataChanged);
		store.removeListener('issue-window-state', this._onIssueWindowStateChanged);
	},
	render : function()
	{
		return(
			<div style={{'padding' : 10}}><SearchField />
			<div><SelectField value={this.state.chartType} onChange={this._onchartTypeChanged} >
			<MenuItem value='Date' primaryText='Date' />
			<MenuItem value='Week' primaryText='Week' />
			</SelectField></div>
			<ProjectList style={{float: 'left'}} />
			<GanttChart height={51} width={this.state.chartDateWidth} type={this.state.chartType} startDate={this.state.startDate} dueDate={this.state.dueDate} style={{overflow: 'scroll', paddingTop: 48}} data={this.state.items}/>
			<AddIssueWindow isOpen={this.state.isIssuwWindowOpen} type={this.state.modalType} relatedObj={this.state.modalObject} onClosed={this._issueWindowClosed}/>
			<UpdateDialog isOpen={this.state.isUpdateDialogOpen}/></div>
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
	_onDataChanged : function()
	{
		var data = [];
		var startDate = new ExtendsDate(8640000000000000);
		var dueDate = new ExtendsDate(Number.MIN_VALUE);

		store.Projects().some(function(project){
			var projectData = new GanttData();
			projectData.startDate = new ExtendsDate(ExtendsDate.now());
			projectData.dueDate = new ExtendsDate(undefined);
			projectData.key = project.name;
			data.push(projectData);

			data = data.concat(store.Issues(project.id).map(function(issue){
				var ganttData = new GanttData();
				ganttData.startDate = new ExtendsDate(ExtendsDate.parse(issue.startDate));
				ganttData.dueDate = new ExtendsDate(ExtendsDate.parse(issue.dueDate));
				if (store.Users(issue.assignedId) != undefined)
					ganttData.color = store.Users(issue.assignedId).color;

				if (startDate > ganttData.startDate) startDate = ganttData.startDate;
				if (dueDate < ganttData.dueDate) dueDate = ganttData.dueDate;

				ganttData.key = issue.id + '-' + issue.updated;
				return ganttData;
			}));
		});

		if (dueDate < startDate) dueDate = new ExtendsDate(undefined);
		this.setState({startDate : startDate, dueDate : dueDate, items : data});
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
	}
});

reactDOM.render(<Main />, document.getElementById('content'));
