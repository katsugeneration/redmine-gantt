(function(exports){
	'use strict';

	const https = require('https');
	const React = require('react');
	const reactDOM = require('react-dom');
	const settings = require("../settings.json");

	var IssueList = React.createClass({
		getInitialState: function()
		{
			return {
				items: []
			};
		},
		componentDidMount: function()
		{
			var _this = this;
			var req = https.request({
				hostname : settings.host,
				path : "/issues.json?project_id=" + _this.props.target,
				auth : settings.name + ":" + settings.password
			}, function(res){
				res.setEncoding('utf8');
				res.on('data', function (data){
					_this.setState({items : JSON.parse(data).issues});
				});
			});

			req.end();
			req.on('error', function(e) {
				console.error(e);
			});
		},
		render :function()
		{
			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={index}><a href='#'>{item.subject}</a></li> );
			});

			return ( <ol>{list}</ol> );
		}
	});

	var loadList = function(id){
		reactDOM.render(
			<IssueList target={id}/>,
			document.getElementById(id + '-issues')
		);
	};

	exports.loadList = loadList;
})(this);
