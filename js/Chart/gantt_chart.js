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
			var width = 420,
			barHeight = 24;

			var x = d3.scale.linear()
			.domain([0, d3.max(this.props.data.map(function(item, index){return (item.dueDate == "Invalid Date") ? 0 : new Date(item.dueDate.getTime() - item.startDate.getTime()).getDate();}))])
			.range([0, width]);

			return(
				<div style={this.props.style}><svg width={width} height={barHeight * this.props.data.length}>
				{this.props.data.map(function(item, index){
					var length = (item.dueDate == "Invalid Date") ? 0 : new Date(item.dueDate.getTime() - item.startDate.getTime()).getDate();
					return <BarChart key={item.key} xScale={x} barHeight={barHeight} barLength={length} index={index}/>
				})}
				</svg></div>
			);
		}
	});

	var BarChart = React.createClass({
		propTypes : {
			xScale : React.PropTypes.func.isRequired,
			barHeight : React.PropTypes.number.isRequired,
			barLength : React.PropTypes.number.isRequired,
			index : React.PropTypes.number.isRequired
		},
		getDefaulProps : function()
		{
			return {
				xScale : function(d){},
				barHeight : 0,
				barLength : 0,
				index : 0
			};
		},
		render :function()
		{
			return(
				<g transform={"translate(0," + this.props.index * this.props.barHeight + ")"}>
				<rect width={this.props.xScale(this.props.barLength)} height={this.props.barHeight -1} fill="blue"></rect>
				<text x={this.props.xScale(this.props.barLength) - 10} y={this.props.barHeight / 2} dy=".35em" fill="white">{this.props.barLength}</text>
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

	exports.GanttData = GanttData;
})(this);
