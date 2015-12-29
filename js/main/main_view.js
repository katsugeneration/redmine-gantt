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
				<div>
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
					<ProjectListRow project={item}/>
					<IssueList target={item.id}/></li> );
				}
			);

			return ( <ul style={Object.assign(this.props.style, {"marginTop" : 0})}>{list}</ul> );
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
					{store.Trackers().get(this.state.issue.tracker.id).name},
					{this.state.issue.start_date},
					{this.state.issue.due_date},
					{(this.state.issue.assigned_to == undefined) ? "" : this.state.issue.assigned_to.name}
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
				return( <li key={item.id + '-' + item.updated_on} ><IssueListRow issue={item}/></li> );
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
			store.addListener('issues', this._onIssueChanged);
		},
		componentWillUnmount : function()
		{
			store.removeListener('issues', this._onIssueChanged);
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
		_onIssueChanged : function()
		{
			var data = store.Issues(1).map(function(item, index){
				var ganttData = new GanttData();
				ganttData.length = 10;
				return ganttData;
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
