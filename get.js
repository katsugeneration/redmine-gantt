'use strict';

const https = require('https');
const React = require('react');
const reactDOM = require('react-dom');

var renderList = function(){
	var IssueList = React.createClass({
		getInitialState: function() {
			return {
				items: []
			};
		},
		componentDidMount: function() {
			var _this = this;
			var req = https.request({
				hostname : "obscure-peak-7755.herokuapp.com",
				path : "/issues.json",
				auth : "katsuya:knight7G"
			},
			function(res){
				res.setEncoding('utf8');
				res.on('data', function (data){
					console.log(data);
					_this.setState({items : JSON.parse(data).issues});
				})
			})

			req.end();
			req.on('error', function(e) {
				console.error(e);
			});
		},
		render :function()
		{
			var list = this.state.items.map(function(item ,index){
				return( <li><a href='#'>{item.subject}</a></li> );
			});

			return ( <div>{list}</div> );
		}

	});

	reactDOM.render(
		<IssueList />,
		document.getElementById('content')
	);
}

renderList();
