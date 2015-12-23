(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const action = require('./main_action.js');
	const store = require('./main_store.js');

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
				<input type="text" value={this.state.textValue} onChange={this._textChanged} onKeyPress={this._keyPressed}/>
				<button onClick={this._startSearch} >search</button>
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
			store.removeListner(this._onChange);
		},
		componentDidMount : function()
		{
			store.addListner(this._onChange);
		},
		_onChange: function() {
			if (this.props.children != undefined)
			{
				this.props.children.some(function(child, index){
					reactDOM.unmountComponentAtNode(child);
				});
			}

		    this.setState({ items: store.Projects() });
		},
		render : function()
		{
			var list = this.state.items.map(function(item ,index){
				return( <li key={index}>
					<div><a href='#'>{item.name}</a></div>
					<IssueList target={item.id}/></li> );
				}
			);

			return ( <ul className="projetcs">{list}</ul> );
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
			store.removeListner(this._onChange);
		},
		componentDidMount : function()
		{
			store.addListner(this._onChange);
			action.loadIsuues(this.props.target);
		},
		_onChange: function() {
		    this.setState({ items: store.Issues(this.props.target) });
		},
		render :function()
		{
			if (this.state.items == undefined) return (<ol></ol>);

			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={index}><a href='#'>{item.subject}</a></li> );
			});

			return ( <ol>{list}</ol> );
		}
	});

	reactDOM.render(<SearchField />, document.getElementById('search'));
	reactDOM.render(<ProjectList />, document.getElementById('content'));
})(this);
