(function(exports){
	'use strict';

	function Issue() {
		this.projectId = 0;
		this.subject = "";
		this.trackerId = 1;
		this.startDate = "";
		this.dueDate = "";
		this.assignedUser = 0;
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
				"assigned_to_id" : this.assignedUser
			}
		};
	};

	exports.Issue = Issue;
})(this);
