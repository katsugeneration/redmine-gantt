(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const action = require('./main_action.js');
	const store = require('./main_store.js');
	const Modal = require('react-modal');
	const AddIssueWindow = require('../IssueWindow/issue_window_view.js').AddIssueWindow;

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
			addNewIssueWindow.Open("Add", this.state.project);
		},
		_startUpdate : function()
		{
			action.loadIsuues(this.state.project.id);
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

			return ( <ul className="projetcs">{list}</ul> );
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
			addNewIssueWindow.Open("Update", this.state.issue);
		},
		render : function()
		{
			return( <div><a href='#' onClick={this._onClick}>{this.state.issue.subject}</a></div> );
		}
	});

	var IssueList = React.createClass({
		getInitialState: function()
		{
			return {
				items: []
			};
		},
		componentWillUnmount : function()
		{
			store.removeListener('issues', this._onChange);
		},
		componentDidMount : function()
		{
			store.addListener('issues', this._onChange);
			action.loadIsuues(this.props.target);
		},
		_onChange: function()
		{
		    this.setState({ items: store.Issues(this.props.target) });
		},
		render :function()
		{
			if (this.state.items == undefined) return (<ol></ol>);

			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={item.id}><IssueListRow issue={item}/></li> );
			});

			return ( <ol>{list}</ol> );
		}
	});

	var addNewIssueWindow = reactDOM.render(<AddIssueWindow></AddIssueWindow>, document.getElementById('modal'));
	reactDOM.render(<SearchField />, document.getElementById('search'));
	reactDOM.render(<ProjectList />, document.getElementById('content'));
})(this);
