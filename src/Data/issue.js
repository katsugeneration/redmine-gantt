(function(exports){
	'use strict';

	function Issue() {
		this.id = 0;
		this.projectId = 0;
		this.subject = '';
		this.trackerId = -1;
		this.statusId = -1;
		this.startDate = '';
		this.dueDate = '';
		this.assignedId = -1;
		this.assignedUser = '';
		this.updated = '';
	}

	Issue.prototype.create = function()
	{
		return new Issue();
	};

	Issue.prototype.toJSON = function()
	{
		return {
			'issue' : {
				'project_id' : this.projectId,
				'subject' : this.subject,
				'tracker_id' : this.trackerId,
				'status_id' : this.statusId,
				'start_date' : this.startDate,
				'due_date' : this.dueDate,
				'assigned_to_id' : this.assignedId
			}
		};
	};

	Issue.toIssueFromJSON = function(json)
	{
		var issue = new Issue();
		issue.id = json.id;
		issue.projectId = json.project.id;
		issue.subject = json.subject;
		issue.statusId = json.status.id;
		issue.trackerId = json.tracker.id;
		issue.startDate = json.start_date;
		issue.dueDate = json.due_date;
		issue.assignedId = (json.assigned_to == undefined) ? 0 : json.assigned_to.id;
		issue.assignedUser = (json.assigned_to == undefined) ? '' : json.assigned_to.name;
		issue.updated = json.updated_on;
		return issue;
	};

	Issue.copyTo = function(to, from)
	{
		to.id = from.id;
		to.projectId = from.projectId;
		to.subject = from.subject;
		to.trackerId = from.trackerId;
		to.statusId = from.statusId;
		to.startDate = from.startDate;
		to.dueDate = from.dueDate;
		to.assignedId = from.assignedId;
		to.assignedUser = from.assignedUser;
		to.updated = from.updated;
	};

	exports.Issue = Issue;
})(this);
