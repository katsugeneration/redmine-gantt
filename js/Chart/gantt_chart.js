(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const d3 = require('d3');

	exports.GanttChart = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(Date).isRequired,
			dueDate : React.PropTypes.instanceOf(Date).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			data : React.PropTypes.arrayOf(React.PropTypes.instanceOf(GanttData)).isRequired,
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date(),
				type : "Date",
				data : [],
				style : {}
			};
		},
		render : function()
		{
			var startDate = new Date(this.props.startDate.toString());
			var dueDate = new Date(this.props.dueDate.toString());

			if (dueDate == "Invalid Date") return(<div style={this.props.style}></div>);

			startDate.setDate(startDate.getDate() - startDate.getDay());
			dueDate.setDate(dueDate.getDate() + (13 - dueDate.getDay()) % 7);

			var chartWidth = (new Date(dueDate.getTime() - startDate.getTime()).getTotalDate() + 1) * this.props.width + 5;

			return(
				<div style={this.props.style}>
				<svg width={chartWidth} height={this.props.height * (this.props.data.length + 2)}>
				<MonthBar {...this.props}s startDate={startDate} dueDate={dueDate} ></MonthBar>
				<CalendarGrid {...this.props} startDate={startDate} dueDate={dueDate} length={this.props.data.length}></CalendarGrid>
				{this.props.data.map(function(item, index){
					var length = (item.dueDate == "Invalid Date") ? 0 : new Date(item.dueDate.getTime() - item.startDate.getTime()).getTotalDate() + 1;
					var start = new Date(item.startDate.getTime() - startDate.getTime()).getTotalDate();
					return <BarChart key={item.key} startPos={start * this.props.width} barHeight={this.props.height} barWidth={length * this.props.width} index={index + 2}/>
				}, this)}
				</svg>
				</div>
			);
		}
	});

	var MonthBar = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(Date).isRequired,
			dueDate : React.PropTypes.instanceOf(Date).isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date()
			};
		},
		render : function()
		{
			var monthBlock = [];
			var monthStartDate = this.props.startDate;

			while(this.props.dueDate > monthStartDate)
			{
				var nextMonthStartDate = new Date(monthStartDate.toString());
				nextMonthStartDate.setMonth(monthStartDate.getMonth() + 1, 1);
				if (this.props.dueDate <= nextMonthStartDate)
				{
					nextMonthStartDate = new Date(this.props.dueDate.toString());
					nextMonthStartDate.setDate(nextMonthStartDate.getDate() + 1);
				}

				var start =	new Date(monthStartDate.getTime() - this.props.startDate.getTime()).getTotalDate();
				var interval = new Date(nextMonthStartDate.getTime() - monthStartDate.getTime()).getTotalDate();
				monthBlock.push(<rect key={"rect-" + monthStartDate} x={this.props.width * start} width={this.props.width * interval} height={this.props.height} fill="white" stroke="black"></rect>)
				monthBlock.push(<text key={"text-" + monthStartDate} x={this.props.width * (start + interval / 2)} y={this.props.height - 5} textAnchor="middle" fill="black">{monthStartDate.getMonth() + 1}</text>);
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
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				barHeight : 0,
				barWidth : 0,
				index : 0
			};
		},
		render :function()
		{
			return(
				<g transform={"translate(0," + this.props.index * this.props.barHeight + ")"}>
				<rect x={this.props.startPos} width={this.props.barWidth} height={this.props.barHeight} fill="blue"></rect>
				</g>
			);
		}
	});

	var CalendarGrid = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(Date).isRequired,
			dueDate : React.PropTypes.instanceOf(Date).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			length : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date(),
				type : "Date",
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
				<g>{rowList}</g>
			);
		}
	});

	var CalendarGridRow = React.createClass({
		propTypes : {
			height : React.PropTypes.number.isRequired,
			width : React.PropTypes.number.isRequired,
			startDate : React.PropTypes.instanceOf(Date).isRequired,
			dueDate : React.PropTypes.instanceOf(Date).isRequired,
			type : React.PropTypes.oneOf(['Date', 'Week']).isRequired,
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date(),
				type : "Date",
				index : 0
			};
		},
		render : function()
		{
			var interval = 0;
			var width = 0;
			if (this.props.type == "Date")
			{
				interval = new Date(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalDate() + 1;
				width = this.props.width;
			}
			else
			{
				interval = new Date(this.props.dueDate.getTime() - this.props.startDate.getTime()).getTotalWeek();
				width = this.props.width * 7;
			}

			var dateBlock = [];

			for(var i = 0; i < interval ; i++)
			{
				var date = new Date(this.props.startDate.toString());

				if (this.props.type == "Date")
				{
					date.setTime(this.props.startDate.getTime() + i * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + "-" + date} x={width * i} width={width} height={this.props.height} fill="white" stroke="black"></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={"text-" + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor="middle" fill="black">{date.getDate()}</text>);
				}
				else
				{
					date.setTime(this.props.startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
					dateBlock.push(<rect key={this.props.index + "-" + date} x={width * i} width={width} height={this.props.height} fill="white" stroke="black"></rect>);
					if (this.props.index == 1)
						dateBlock.push(<text key={"text-" + date} x={width * (i + 1/2)} y={this.props.height - 5} textAnchor="middle" fill="black">{date.getWeek()}</text>);
				}
			}

			return(
				<g transform={"translate(0," + this.props.index * this.props.height + ")"}>
					{dateBlock}
				</g>
			);
		}
	});

	function GanttData()
	{
		this.key = "";
		this.startDate = new Date();
		this.dueDate = new Date();
	};

	Date.prototype.getTotalDate = function()
	{
		return Math.ceil(this.getTime() / (24 * 60 * 60 * 1000));
	}

	Date.prototype.getTotalWeek = function()
	{
		return Math.ceil(this.getTime() / (7 * 24 * 60 * 60 * 1000));
	}

	Date.prototype.getWeek = function()
	{
		var firstDay = new Date(this.toString());
		firstDay.setMonth(0, 1);
		firstDay.setDate((7 - firstDay.getDay()) % 7 + 1);

		return (new Date(this.getTime() - firstDay.getTime()).getTotalWeek() + 1);
	}

	exports.GanttData = GanttData;
})(this);
