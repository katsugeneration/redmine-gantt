(function(exports){
	'use strict';

	const store = require('./main_store.js');

	exports.projectsGetted = function(data, target)
	{
		store.setProjects(data, target);
	};

	exports.issuesGetted = function(data, project_id)
	{
		store.setIssues(data, project_id);
	};
})(this);
