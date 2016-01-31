(function(exports){
	'use strict';

	const React = require('react');
	const ExtendsDate = require('../Extends/extend_date.js').ExtendsDate;

	const DEFAULT_BARCHART_COLOR = '#9e9e9e';

	var dragType = 'None';
	var dragPos = 0;
	var dragIndex = -1;

	exports.GanttChart = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			projects : React.PropTypes.array.isRequired,
			issues : React.PropTypes.func.isRequired,
			users : React.PropTypes.func.isRequired,
			updateIssueDate : React.PropTypes.func,
			updateEnd : React.PropTypes.func,
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				type : 'Date',
				updateIssueDate : () => {},
				updateEnd : () => {},
				style : {}
			};
		},
		getInitialState: function()
		{
			return {
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate(),
				data : []
			};
		},
		componentWillReceiveProps : function(nextProps)
		{
			var data = []; // chart data
			var startDate = new ExtendsDate(8640000000000000); // chart start date
			var dueDate = new ExtendsDate(Number.MIN_VALUE); // chart end date

			nextProps.projects.some(function(project){
				// project is
				var projectData = new GanttData();
				projectData.startDate = new ExtendsDate(ExtendsDate.now());
				projectData.dueDate = new ExtendsDate(undefined);
				projectData.key = project.name;
				data.push(projectData);

				data = data.concat(nextProps.issues(project.id).map(function(issue){
					var ganttData = new GanttData();
					ganttData.startDate = new ExtendsDate(ExtendsDate.parse(issue.startDate));
					ganttData.dueDate = new ExtendsDate(ExtendsDate.parse(issue.dueDate));
					if (nextProps.users(issue.assignedId) != undefined)
						ganttData.color = nextProps.users(issue.assignedId).color;
					ganttData.key = issue.id + '-' + issue.updated;

					// update chart date
					if (startDate > ganttData.startDate) startDate = ganttData.startDate;
					if (dueDate < ganttData.dueDate) dueDate = ganttData.dueDate;

					return ganttData;
				}));
			});

			if (dueDate < startDate) dueDate = new ExtendsDate(undefined);
			this.setState({startDate : startDate, dueDate : dueDate, data : data});
		},
		render : function()
		{
			var startDate = new ExtendsDate(this.state.startDate.toString());
			var dueDate = new ExtendsDate(this.state.dueDate.toString());

			if (dueDate == 'Invalid Date') return(<div style={this.props.style}></div>);

			// start Sunday in start date's week
			startDate.addDate(-startDate.getDay());

			// end Saturday in due date's week
			dueDate.addDate((13 - dueDate.getDay()) % 7);

			var chartWidth = (new ExtendsDate(dueDate.getTime() - startDate.getTime()).getTotalDate() + 1) * this.props.width + 5;
			var barcharts = this.state.data.map(function(item, index){
				var length = (item.dueDate == 'Invalid Date') ? 0 : new ExtendsDate(item.dueDate.getTime() - item.startDate.getTime()).getTotalDate() + 1;
				var start = new ExtendsDate(item.startDate.getTime() - startDate.getTime()).getTotalDate();
				return ( <BarChart key={item.key} startPos={start * this.props.width} barHeight={this.props.height} barWidth={length * this.props.width} onDragStart={this._onDragStart} index={index + 2} color={item.color}/> );
			}, this);

			return(
				<div style={this.props.style}>
				<svg width={chartWidth} height={this.props.height * (this.state.data.length + 2)} onMouseMove={this._onMouseMove} onMouseUp={this._onMouseUp}>
				<CalendarGrid {...this.props} startDate={startDate} dueDate={dueDate} length={this.state.data.length}></CalendarGrid>
				{barcharts}
				</svg>
				</div>
			);
		},
		_onDragStart : function(index, pos, type)
		{
			dragIndex = index;
			dragPos = pos;
			dragType = type;
			document.body.style.cursor = type == 'Left' ? 'w-resize' : 'e-resize';
		},
		_onDragEnd : function()
		{
			var issue = this._getIndexItem(dragIndex - 2);

			dragIndex = -1;
			dragPos = 0;
			dragType = 'None';
			document.body.style.cursor = 'default';

			this.props.updateEnd(issue.id, issue, issue.projectId);
		},
		_onMouseMove : function(e)
		{
			if (dragType == 'None') return;

			var diff;
			var item = this._getIndexItem(dragIndex - 2);
			if (dragType == 'Left')
			{
				diff = dragPos - e.clientX;
				if (Math.abs(diff) < this.props.width) return;

				dragPos = e.clientX;
				this.props.updateIssueDate(item.id, Math.floor(-diff / this.props.width), 'start');
			}
			else if (dragType == 'Right')
			{
				diff = e.clientX - dragPos;
				if (Math.abs(diff) < this.props.width) return;

				dragPos = e.clientX;
				this.props.updateIssueDate(item.id, Math.floor(diff / this.props.width), 'due');
			}
		},
		_onMouseUp : function()
		{
			if (dragType == 'None') return;
			this._onDragEnd();
		},
		_getIndexItem : function(index)
		{
			index++;
			var _this = this,
				object = undefined;

			this.props.projects.some(function(project){
				if (index == 1)
				{
					object = project;
					return true;
				}
				index--;

				if (index <= _this.props.issues(project.id).length)
				{
					object = _this.props.issues(project.id)[index - 1];
					return true;
				}
				index -= _this.props.issues(project.id).length;
			});

			return object;
		}
	});

	var MonthBar = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate()
			};
		},
		render : function()
		{
			var monthBlock = [];
			var monthStartDate = this.props.startDate;

			while(this.props.dueDate > monthStartDate)
			{
				var nextMonthStartDate = new ExtendsDate(monthStartDate.toString());
				nextMonthStartDate.setMonth(monthStartDate.getMonth() + 1, 1);
				if (this.props.dueDate <= nextMonthStartDate)
				{
					nextMonthStartDate = new ExtendsDate(this.props.dueDate.toString());
					nextMonthStartDate.setDate(nextMonthStartDate.getDate() + 1);
				}

				var start =	new ExtendsDate(monthStartDate.getTime() - this.props.startDate.getTime()).getTotalDate();
				var interval = new ExtendsDate(nextMonthStartDate.getTime() - monthStartDate.getTime()).getTotalDate();
				monthBlock.push(<rect key={'rect-' + monthStartDate} x={this.props.width * start} width={this.props.width * interval} height={this.props.height} fill='white' stroke='black'></rect>);
				monthBlock.push(<text key={'text-' + monthStartDate} x={this.props.width * (start + interval / 2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{monthStartDate.getMonth() + 1}</text>);
				monthStartDate = nextMonthStartDate;
			}

			return(
				<g>{monthBlock}</g>
			);
		}
	});

	var BarChart = React.createClass({
		propTypes : {
			barHeight : React.PropTypes.number.isRequired,
			barWidth : React.PropTypes.number.isRequired,
			startPos : React.PropTypes.number.isRequired,
			onDragStart : React.PropTypes.func.isRequired,
			color : React.PropTypes.string,
			index : React.PropTypes.number.isRequired
		},
		getInitialState: function(){
			return {
				edgeWidth : 3
			};
		},
		getDefaulProps : function()
		{
			return {
				barHeight : 0,
				barWidth : 0,
				color : DEFAULT_BARCHART_COLOR,
				index : 0
			};
		},
		render :function()
		{
			return(
				<g transform={'translate(0,' + this.props.index * this.props.barHeight + ')'}>
					<rect x={this.props.startPos} width={this.props.barWidth} height={this.props.barHeight} fill={this.props.color}></rect>
					<rect className='Left' x={this.props.startPos} width={this.state.edgeWidth} height={this.props.barHeight} fill={this.props.color} style={{cursor : 'w-resize'}} onMouseDown={this._onMouseDown}/>
					<rect className='Right' x={this.props.startPos + this.props.barWidth - this.state.edgeWidth} width={this.state.edgeWidth} height={this.props.barHeight} fill={this.props.color} style={{cursor : 'e-resize'}} onMouseDown={this._onMouseDown}/>
				</g>
			);
		},
		_onMouseDown : function(e)
		{
			this.props.onDragStart(this.props.index, e.clientX, e.target.className.baseVal);
		}
	});

	var CalendarGrid = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			length : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate(),
				type : 'Date',
				length : 0
			};
		},
		render : function()
		{
			var rowList = [];

			for(var i = -1; i <this.props.length; i++)
			{
				rowList.push(<CalendarGridRow {...this.props} key={i} index={i + 2} ></CalendarGridRow>);
			}

			return(
				<g>
				<MonthBar {...this.props}></MonthBar>
				<g>{rowList}</g>
				</g>
			);
		}
	});

	var CalendarGridRow = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			dueDate : React.PropTypes.instanceOf(ExtendsDate).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new ExtendsDate(),
				dueDate : new ExtendsDate(),
				type : 'Week',
				index : 0
			};
		},
		render : function()
		{
			var interval = 0;
			var width = 0;
			if (this.props.type == 'Date')
			{
				interval = new ExtendsDate(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalDate() + 1;
				width = this.props.width;
			}
			else
			{
				interval = new ExtendsDate(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalWeek();
				width = this.props.width * 7;
			}

			var dateBlock = [];

			for(var i = 0; i < interval ; i++)
			{
				var date = new ExtendsDate(this.props.startDate.toString());

				if (this.props.type == 'Date')
				{
					date.setTime(this.props.startDate.getTime() + i * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + '-' + date} x={width * i} width={width} height={this.props.height} fill='white' stroke='black'></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={'text-' + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{date.getDate()}</text>);
				}
				else
				{
					date.setTime(this.props.startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + '-' + date} x={width * i} width={width} height={this.props.height} fill='white' stroke='black'></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={'text-' + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor='middle' fill='black'>{date.getWeek()}</text>);
				}
			}

			return(
				<g transform={'translate(0,' + this.props.index * this.props.height + ')'}>
					{dateBlock}
				</g>
			);
		}
	});

	function GanttData()
	{
		this.key = '';
		this.startDate = new ExtendsDate();
		this.dueDate = new ExtendsDate();
		this.color = DEFAULT_BARCHART_COLOR;
	}
})(this);
