(function(exports){
	'use strict';

	const React = require('react');

	const action = require('./main_action.js');
	const FlatButton = require('material-ui').FlatButton;
	const TextField = require('material-ui').TextField;

	exports.SearchField = React.createClass({
		getInitialState : function()
		{
			return {
				textValue: ''
			};
		},
		_textChanged : function(e)
		{
			this.setState({textValue : e.target.value});
		},
		_startSearch : function()
		{
			action.loadProjects(this.state.textValue);
		},
		_keyPressed : function(e)
		{
			if (e.which == 13) this._startSearch();
		},
		render : function()
		{
			return (
				<div>
				<TextField placeholder='Project Name' value={this.state.textValue} onChange={this._textChanged} onKeyPress={this._keyPressed}/>
				<FlatButton onClick={this._startSearch} secondary={true}>search</FlatButton>
				</div>
			);
		}
	});
})(this);
