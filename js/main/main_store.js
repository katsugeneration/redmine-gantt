(function(exports){
	'use strict';

	const view = require('./main_view.js');

	var projects = [];
	var updated = [];
	exports.setProjects = function(data, target)
	{
		projects = [];
		JSON.parse(data).projects.some(function(project, index){
			if (project.name.indexOf(target) == -1 &&
			undefined == projects.find(function(item, i, array){
				if (project.parent == undefined) return false;
				if (item.id == project.parent.id) return item;
				return false;
			})) return false;

			var proj = {};
			proj.__proto__ = project;
			proj.parent_id = (project.parent == undefined) ? 0 : project.parent.id;
			projects.push(proj);
		});

		updated.some(function(prop, index){
			prop();
		});
	};

	var issues = new Map();
	exports.setIssues = function(data, project_id)
	{
		issues.set(project_id, JSON.parse(data).issues);
		updated.some(function(prop, index){
			prop();
		});
	};

	exports.Projects = function()
	{
		return projects;
	};

	exports.Issues = function(project_id)
	{
		return issues.get(project_id);
	};

	exports.addListner = function(listner)
	{
		updated.push(listner);
	};

	exports.removeListner = function(listner)
	{
		updated.pop(listner);
	};

})(this);
