(function(exports){
	'use strict';

	function Issue() {
		this.id = 0;
		this.projectId = 0;
		this.subject = "";
		this.trackerId = 1;
		this.startDate = "";
		this.dueDate = "";
		this.assignedId = 0;
		this.assignedUser = "";
		this.updated = "";
	};

	Issue.prototype.create = function()
	{
		return new Issue();
	};

	Issue.prototype.toJSON = function()
	{
		return {
			"issue" : {
				"project_id" : this.projectId,
				"subject" : this.subject,
				"tracker_id" : this.trackerId,
				"start_date" : this.startDate,
				"due_date" : this.dueDate,
				"assigned_to_id" : this.assignedId
			}
		};
	};

	Issue.toIssueFromJSON = function(json)
	{
		var issue = new Issue();
		issue.id = json.id;
		issue.projectId = json.project.id;
		issue.subject = json.subject;
		issue.trackerId = json.tracker.id;
		issue.startDate = json.start_date;
		issue.dueDate = json.due_date;
		issue.assignedId = (json.assigned_to == undefined) ? 0 : json.assigned_to.id;
		issue.assignedUser = (json.assigned_to == undefined) ? "" : json.assigned_to.name;
		issue.updated = json.updated_on;
		return issue;
	}

	exports.Issue = Issue;
})(this);
