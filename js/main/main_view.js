(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const action = require('./main_action.js');
	const store = require('./main_store.js');
	const Modal = require('react-modal');
	const AddIssueWindow = require('../IssueWindow/issue_window_view.js').AddIssueWindow;
	const GanttChart = require('../Chart/gantt_chart.js').GanttChart;
	const GanttData = require('../Chart/gantt_chart.js').GanttData;

	var isOpen = false;
	var modalType = "Add";
	var modalObj = {};

	var SearchField = React.createClass({
		getInitialState : function()
		{
			return {
				textValue: ""
			};
		},
		_textChanged : function(e)
		{
			this.setState({textValue : e.target.value});
		},
		_startSearch : function(e)
		{
			action.loadProjects(this.state.textValue);
		},
		_keyPressed : function(e)
		{
			if (e.which == 13) action.loadProjects(this.state.textValue);
		},
		render : function()
		{
			return (
				<div>
				<input type="text" placeholder="Project Name" value={this.state.textValue} onChange={this._textChanged} onKeyPress={this._keyPressed}/>
				<button onClick={this._startSearch} >search</button>
				</div>
			);
		}
	});

	var ProjectListRow = React.createClass({
		getInitialState: function()
		{
			return {
				project : {}
			};
		},
		componentWillMount : function()
		{
			this.setState({project : this.props.project});
		},
		_onClick : function(e)
		{
			isOpen = true;
			modalType = 'Add';
			modalObj = this.state.project;
			main.forceUpdate();
		},
		_startUpdate : function()
		{
			action.loadIssues(this.state.project.id);
		},
		render : function()
		{
			return(
				<div {...this.props}>
					<a href='#' onClick={this._onClick}>{this.state.project.name}</a>
					<button onClick={this._startUpdate} >update</button>
				</div>
			);
		}
	});

	var ProjectList =　React.createClass({
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
				items : []
			};
		},
		componentWillUnmount : function()
		{
			store.removeListener('projects', this._onChange);
		},
		componentDidMount : function()
		{
			store.addListener('projects', this._onChange);
			action.loadTrackers();
		},
		_onChange: function()
		{
		    this.setState({ items: store.Projects() });
		},
		render : function()
		{
			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={item.name}>
					<ProjectListRow project={item} style={{"height" : 24}}/>
					<IssueList target={item.id}/></li> );
				}
			);

			return ( <ul style={Object.assign(this.props.style, {"marginTop" : 48})}>{list}</ul> );
		}
	});

	var IssueListRow = React.createClass({
		getInitialState: function()
		{
			return {
				issue : {}
			};
		},
		componentWillMount : function()
		{
			this.setState({issue : this.props.issue});
		},
		_onClick : function(e)
		{
			isOpen = true;
			modalType = 'Update';
			modalObj = this.state.issue;
			main.forceUpdate();
		},
		render : function()
		{
			return(
				<div>
					<a href='#' onClick={this._onClick}>{this.state.issue.subject}</a>
					{store.Trackers().get(this.state.issue.trackerId).name},
					{this.state.issue.startDate},
					{this.state.issue.dueDate},
					{this.state.issue.assignedUser}
				</div>
			);
		}
	});

	var IssueList = React.createClass({
		getInitialState: function()
		{
			return {
				projectId : 0,
				items: []
			};
		},
		componentWillUnmount : function()
		{
			store.removeListener('issues', this._onChangeIssues);
			store.removeListener('users', this._onChangeUsers);
		},
		componentWillMount : function()
		{
			this.setState({projectId : this.props.target});
		},
		componentDidMount : function()
		{
			store.addListener('issues', this._onChangeIssues);
			store.addListener('users', this._onChangeUsers);
			action.loadUsers(this.state.projectId);
			action.loadIssues(this.state.projectId);
		},
		_onChangeUsers : function()
		{
		},
		_onChangeIssues: function()
		{
		    this.setState({ items: store.Issues(this.state.projectId) });
		},
		render :function()
		{
			if (this.state.items == undefined) return (<ol></ol>);

			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={item.id + '-' + item.updated} ><IssueListRow issue={item}/></li> );
			});

			return ( <ol>{list}</ol> );
		}
	});

	var Main = React.createClass({
		getInitialState : function()
		{
			return{
				items : []
			};
		},
		componentDidMount : function()
		{
			store.addListener('projects', this._onDataChanged);
			store.addListener('issues', this._onDataChanged);
		},
		componentWillUnmount : function()
		{
			store.removeListener('projects', this._onDataChanged);
			store.removeListener('issues', this._onDataChanged);
		},
		render : function()
		{
			return(
				<div><SearchField />
				<ProjectList style={{float: "left"}} />
				<GanttChart style={{overflow: "scroll"}} data={this.state.items}/>
				<AddIssueWindow isOpen={isOpen} type={modalType} relatedObj={modalObj} onClosed={this._issueWindowClosed}/></div>
			);
		},
		_onDataChanged : function()
		{
			var data = [];
			store.Projects().some(function(project, index){
				var projectData = new GanttData();
				projectData.startDate = new Date(Date.now());
				projectData.dueDate = new Date(Date.now());
				projectData.key = project.name;
				data.push(projectData);

				data = data.concat(store.Issues(project.id).map(function(issue, index){
					var ganttData = new GanttData();
					ganttData.startDate = new Date(Date.parse(issue.startDate));
					ganttData.dueDate = new Date(Date.parse(issue.dueDate));
					ganttData.key = issue.id + "-" + issue.updated;
					return ganttData;
				}));
			});

			this.setState({ items : data});
		},
		_issueWindowClosed : function()
		{
			isOpen = false;
		}
	});

	var main = reactDOM.render(<Main />, document.getElementById('content'));
})(this);
