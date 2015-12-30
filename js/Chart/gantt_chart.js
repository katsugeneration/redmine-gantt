(function(exports){
	'use strict';

	const React = require('react');
	const reactDOM = require('react-dom');
	const d3 = require('d3');

	exports.GanttChart = React.createClass({
		propTypes : {
			data : React.PropTypes.arrayOf(React.PropTypes.instanceOf(GanttData)).isRequired,
			style : React.PropTypes.object
		},
		getDefaulProps : function()
		{
			return {
				data : [],
				style : {}
			};
		},
		render : function()
		{
			var barWidth = 24,
			barHeight = 24;

			var startDate = new Date(2015, 12 - 1, 1, 0, 0, 0, 0),
			dueDate = new Date(2015, 12 - 1, 31, 0, 0, 0, 0);

			var chartWidth = new Date(dueDate.getTime() - startDate.getTime()).totalDate() * barWidth + 5;

			return(
				<div style={this.props.style}><svg width={chartWidth} height={barHeight * this.props.data.length}>
				<CalendarGrid height={barHeight} width={barHeight} startDate={startDate} dueDate={dueDate} length={this.props.data.length}></CalendarGrid>
				{this.props.data.map(function(item, index){
					var length = (item.dueDate == "Invalid Date") ? 0 : new Date(item.dueDate.getTime() - item.startDate.getTime()).totalDate();
					var start = new Date(item.startDate.getTime() - startDate.getTime()).totalDate();
					return <BarChart key={item.key} startPos={start * barWidth} barHeight={barHeight} barWidth={length * barWidth} index={index}/>
				})}
				</svg></div>
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
			length : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date(),
				length : 0
			};
		},
		render : function()
		{
			var rowList = [];
			for(var i = 0; i <this.props.length; i++)
			{
				rowList.push(<CalendarGridRow {...this.props} key={i} index={i} ></CalendarGridRow>);
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
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				height : 0,
				width : 0,
				startDate : new Date(),
				dueDate : new Date(),
				index : 0
			};
		},
		render : function()
		{
			var interval = new Date(this.props.dueDate.getTime() - this.props.startDate.getTime()).totalDate();
			var dateBlock = [];

			for(var i = 0; i < interval ; i++)
			{
				var date = new Date(this.props.startDate.toString());
				date.setTime(this.props.startDate.getTime() + i * 24 * 60 * 60 * 1000);
				dateBlock.push(<rect key={this.props.index + "-" + date} x={this.props.width * i} width={this.props.width} height={this.props.height} fill="white" stroke="black"></rect>);
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

	Date.prototype.totalDate = function()
	{
		return Math.floor(this.getTime() / (24 * 60 * 60 * 1000));
	}

	exports.GanttData = GanttData;
})(this);
