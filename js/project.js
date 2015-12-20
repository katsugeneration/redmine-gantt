(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const List = require("./list.js").List;
	const get = require('./get.js');

	var Project =
	{
		create : function()
		{
			var project = Object.create(Project.prototype);
			return project;
		},
		name : "",
		idintifier : "",
		id : 0,
		paretn_id : 0,
		prototype : {}
	};

	var ProjectList =　React.createClass({
		mixins : [List],
		getInitialState: function()
		{
			return {
				items : [],
				path : "/projects.json"
			};
		},
		loadData : function(data)
		{
			var _this = this;
			var projects = [];
			JSON.parse(data).projects.some(function(project, index){
				if (project.name.indexOf(_this.props.target) == -1 &&
				undefined == projects.find(function(item, i, array){
					if (project.parent == undefined) return false;
					if (item.id == project.parent.id) return item;
					return false;
				})) return false;
				var proj = Project.create();
				proj.name = project.name;
				proj.identifier = project.identifier;
				proj.id = project.id;
				proj.parent_id = (project.parent == undefined) ? 0 : project.parent.id;
				projects.push(proj);
			});

			this.setState({items : projects});
		},
		render : function()
		{
			var _this = this;
			var list = this.state.items.map(function(item ,index){
				return( <li key={index}>
					<div><a href='#'>{item.name}</a></div>
					<div id={item.id+"-issues"}></div></li> );
				}
			);

			return ( <ul className="projetcs">{list}</ul> );
		},
		componentDidUpdate : function()
		{
			this.state.items.some(function(item, index){
				get.loadList(item.id);
			});
		}
	});

	var loadList = function(){
		var dom = reactDOM.render(
			<ProjectList target={document.getElementsByName('searchText')[0].value}/>,
			document.getElementById('content')
		);
		dom.getData();
	};

	exports.Project = Project;
	exports.loadList = loadList;
})(this);
