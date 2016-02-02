
'use strict';

const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

class ViewData
{
	constructor(args)
	{
		this.startDate = args.startDate || new ExtendsDate(undefined);
		this.dueDate = args.dueDate || new ExtendsDate(undefined);
		this.color = args.color || undefined;
		this.key = args.key || '';
		this.id = args.id || -1;
		this.obj = args.obj || {};
	}
}

class ProjectViewData extends ViewData
{
	constructor(args)
	{
		super(args);
		this.projectName = args.projectName || '';
		this.projectExpand = args.projectExpand || true;
	}
}

class IssueViewData extends ViewData
{
	constructor(args)
	{
		super(args);
		this.subject = args.subject || '';
		this.status = args.status || '';
		this.tracker = args.tracker || '';
		this.assignedUser = args.assignedUser || '';
	}
}

module.exports.ViewData = ViewData;
module.exports.ProjectViewData = ProjectViewData;
module.exports.IssueViewData = IssueViewData;
